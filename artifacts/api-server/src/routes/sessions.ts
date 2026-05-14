import { Router, type Response } from "express";
import { db, sessionsTable, pcsTable, usersTable, queueEntriesTable, walletTransactionsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSessionUser } from "./auth.js";

const router = Router();

function getPcRatePerHour(tier: string) {
  return tier === "vip" ? 50 : 25;
}

function getSessionCost(durationMinutes: number, ratePerHour: number) {
  return (durationMinutes / 60) * ratePerHour;
}

function getSessionCostForSeconds(durationSeconds: number, ratePerHour: number) {
  return (durationSeconds / 3600) * ratePerHour;
}

function getDurationSeconds(s: typeof sessionsTable.$inferSelect) {
  if (s.durationSeconds > 0) return s.durationSeconds;
  const fromTimestamps = Math.max(0, Math.floor((s.endsAt.getTime() - s.startedAt.getTime()) / 1000));
  return fromTimestamps || Math.max(0, s.durationMinutes * 60 + s.extendedMinutes * 60);
}

function getElapsedSeconds(s: typeof sessionsTable.$inferSelect, now = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - s.startedAt.getTime()) / 1000));
}

function getAllocatedAmount(s: typeof sessionsTable.$inferSelect) {
  if (s.allocatedAmount > 0) return s.allocatedAmount;
  if (s.maxCost > 0) return s.maxCost;
  return getSessionCostForSeconds(getDurationSeconds(s), s.ratePerHour);
}

function serializeSession(s: typeof sessionsTable.$inferSelect, pcLabel?: string | null) {
  const durationSeconds = getDurationSeconds(s);
  const elapsedSeconds = getElapsedSeconds(s);
  const remainingSeconds = ["active", "extended", "locked"].includes(s.status)
    ? Math.max(0, durationSeconds - elapsedSeconds)
    : null;
  const allocatedAmount = getAllocatedAmount(s);
  const liveCostSoFar = ["active", "extended", "locked"].includes(s.status)
    ? Math.min(getSessionCostForSeconds(elapsedSeconds, s.ratePerHour), allocatedAmount)
    : (s.finalCost ?? s.costSoFar);

  return {
    id: s.id,
    userId: s.userId,
    username: s.username,
    pcId: s.pcId,
    sessionCode: s.sessionCode,
    pcLabel: pcLabel ?? null,
    status: s.status,
    sessionType: s.sessionType,
    ratePerHour: s.ratePerHour,
    allocatedAmount,
    maxCost: allocatedAmount,
    walletBalanceAtStart: s.walletBalanceAtStart,
    durationMinutes: s.durationMinutes,
    durationSeconds,
    extendedMinutes: s.extendedMinutes,
    startedAt: s.startedAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    remainingSeconds,
    elapsedSeconds,
    costSoFar: liveCostSoFar,
    finalCost: s.finalCost ?? null,
    paymentSource: s.paymentSource,
    queueId: s.queueId ?? null,
    isLocked: s.isLocked,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/sessions", async (req, res): Promise<void> => {
  try {
    const { status } = req.query;
    let sessions;
    if (status && typeof status === "string") {
      sessions = await db.select().from(sessionsTable)
        .where(eq(sessionsTable.status, status as any))
        .orderBy(sessionsTable.startedAt);
    } else {
      sessions = await db.select().from(sessionsTable).orderBy(sessionsTable.startedAt);
    }

    const withLabels = await Promise.all(sessions.slice(-100).reverse().map(async (s) => {
      const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, s.pcId)).limit(1);
      return serializeSession(s, pc?.label);
    }));

    res.json(withLabels);
  } catch (err: any) {
    console.error("[api] Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions", details: err.message });
  }
});

router.get("/sessions/my", async (req, res): Promise<void> => {
  try {
    const userId = getSessionUser(req);
    if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

    const [session] = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.userId, userId),
        inArray(sessionsTable.status, ["active", "extended", "locked"])
      )).limit(1);

    if (!session) { res.json(null); return; }

    if (["active", "extended", "locked"].includes(session.status) && getDurationSeconds(session) - getElapsedSeconds(session) <= 0) {
      const completed = await completeSessionRecord(session, "system");
      const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, completed.pcId)).limit(1);
      res.json(serializeSession(completed, pc?.label));
      return;
    }

    const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, session.pcId)).limit(1);
    res.json(serializeSession(session, pc?.label));
  } catch (err: any) {
    console.error("[api] Error fetching my session:", err);
    res.status(500).json({ error: "Failed to fetch session", details: err.message });
  }
});

router.get("/sessions/:sessionId", async (req, res): Promise<void> => {
  const { sessionId } = req.params;
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, session.pcId)).limit(1);
  res.json(serializeSession(session, pc?.label));
});

const extendSchema = z.object({
  additionalMinutes: z.number().min(15),
});

router.patch("/sessions/:sessionId/extend", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { sessionId } = req.params;
  const parsed = extendSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  const availableBalance = user?.walletBalance ?? 0;
  const requestedAmount = getSessionCost(parsed.data.additionalMinutes, session.ratePerHour);

  if (availableBalance <= 0 || requestedAmount > availableBalance) {
    res.status(400).json({
      message: "Insufficient wallet balance",
      error: "Insufficient wallet balance",
      availableBalance,
      requestedAmount,
    });
    return;
  }

  const newEndsAt = new Date(session.endsAt.getTime() + parsed.data.additionalMinutes * 60 * 1000);
  const updatedDurationSeconds = getDurationSeconds(session) + parsed.data.additionalMinutes * 60;
  const updatedAllocatedAmount = getAllocatedAmount(session) + requestedAmount;
  const [updated] = await db.update(sessionsTable).set({
    endsAt: newEndsAt,
    durationSeconds: updatedDurationSeconds,
    extendedMinutes: session.extendedMinutes + parsed.data.additionalMinutes,
    allocatedAmount: updatedAllocatedAmount,
    maxCost: updatedAllocatedAmount,
    status: "extended",
    updatedAt: new Date(),
  }).where(eq(sessionsTable.id, sessionId)).returning();

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, updated.pcId)).limit(1);
  res.json(serializeSession(updated, pc?.label));
});

async function completeSessionRecord(
  session: typeof sessionsTable.$inferSelect,
  endedByUserId: string,
) {
  const now = new Date();
  const elapsedSeconds = getElapsedSeconds(session, now);
  const durationSeconds = getDurationSeconds(session);
  const billableSeconds = Math.min(elapsedSeconds, durationSeconds);
  const minutesUsed = Math.max(1, Math.ceil(billableSeconds / 60));
  const rawFinalCost = getSessionCostForSeconds(billableSeconds, session.ratePerHour);
  const allocatedAmount = getAllocatedAmount(session);
  const [playerRow] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  const previousBalance = playerRow?.walletBalance ?? 0;
  const finalCost = Math.min(rawFinalCost, previousBalance, allocatedAmount);
  const newBalance = Math.max(0, previousBalance - finalCost);

  const [updated] = await db.update(sessionsTable).set({
    status: "completed",
    endedAt: now,
    finalCost,
    endedBy: endedByUserId,
    updatedAt: now,
  }).where(eq(sessionsTable.id, session.id)).returning();

  await db.update(pcsTable).set({
    status: "available",
    currentSessionId: null,
    currentUserId: null,
    updatedAt: now,
  }).where(eq(pcsTable.id, session.pcId));

  if (playerRow) {
    await db.update(usersTable).set({
      walletBalance: newBalance,
      totalSpent: (playerRow.totalSpent ?? 0) + finalCost,
      totalPlayTimeMinutes: (playerRow.totalPlayTimeMinutes ?? 0) + minutesUsed,
    }).where(eq(usersTable.id, session.userId));

    if (finalCost > 0) {
      await db.insert(walletTransactionsTable).values({
        id: crypto.randomUUID(),
        userId: session.userId,
        username: session.username,
        type: "sessionCharge",
        amount: finalCost,
        previousBalance,
        newBalance,
        paymentMethod: "wallet",
        sessionId: session.id,
        processedBy: endedByUserId,
        adminNote: "Session ended",
      });
    }
  }

  return updated;
}

async function endSessionRecord(
  session: typeof sessionsTable.$inferSelect,
  endedByUserId: string,
  res: Response,
) {
  const updated = await completeSessionRecord(session, endedByUserId);
  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, updated.pcId)).limit(1);
  res.json(serializeSession(updated, pc?.label));
}

router.patch("/sessions/:sessionId/end", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { sessionId } = req.params;
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  await endSessionRecord(session, userId, res);
});

router.post("/sessions/end-active", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [session] = await db.select().from(sessionsTable)
    .where(and(
      eq(sessionsTable.userId, userId),
      inArray(sessionsTable.status, ["active", "extended", "locked"])
    ))
    .limit(1);

  if (!session) { res.status(404).json({ error: "No active session found" }); return; }

  await endSessionRecord(session, userId, res);
});

router.post("/sessions", async (req, res): Promise<void> => {
  try {
    const userId = getSessionUser(req);
    if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

    const schema = z.object({
      pcId: z.string(),
      sessionType: z.enum(["open_time", "limit_amount", "limited"]).optional(),
      durationMinutes: z.number().min(1).max(1440).optional(),
      durationSeconds: z.number().int().min(1).max(86400).optional(),
      allocatedAmount: z.number().min(0.01).optional(),
      maxCost: z.number().min(0.01).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, parsed.data.pcId)).limit(1);
    if (!pc) { res.status(404).json({ error: "PC not found" }); return; }
    if (pc.status !== "available") { res.status(400).json({ error: "PC is not available" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    // Check already active session
    const [existing] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.userId, userId), inArray(sessionsTable.status, ["active", "extended", "locked"])))
      .limit(1);
    if (existing) { res.status(400).json({ error: "You already have an active session" }); return; }

    const sessionType = parsed.data.sessionType ?? "limited";
    const ratePerHour = getPcRatePerHour(pc.tier);
    const availableBalance = user.walletBalance ?? 0;
    const requestedAmount = sessionType === "open_time"
      ? availableBalance
      : parsed.data.allocatedAmount ?? parsed.data.maxCost ?? (
        parsed.data.durationSeconds != null
          ? getSessionCostForSeconds(parsed.data.durationSeconds, ratePerHour)
          : getSessionCost(parsed.data.durationMinutes ?? 60, ratePerHour)
      );
    const durationSeconds = parsed.data.durationSeconds
      ?? Math.floor((requestedAmount / ratePerHour) * 3600);
    const durationMinutes = Math.ceil(durationSeconds / 60);
    const cappedRequestedAmount = Math.min(requestedAmount, availableBalance);

    if (availableBalance <= 0 || requestedAmount > availableBalance) {
      res.status(400).json({
        message: `Insufficient wallet balance. You can only use up to ${availableBalance.toFixed(2)}.`,
        error: `Insufficient wallet balance. You can only use up to ${availableBalance.toFixed(2)}.`,
        availableBalance,
        requestedAmount,
      });
      return;
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + durationSeconds * 1000);
    const sessionId = crypto.randomUUID();
    const sessionCode = `GGX-${pc.label}+${user.username}`.toUpperCase().replace(/\s+/g, '');

    // Create session
    const [session] = await db.insert(sessionsTable).values({
      id: sessionId,
      userId: userId,
      username: user.username,
      pcId: parsed.data.pcId,
      sessionCode,
      status: "active",
      sessionType,
      ratePerHour,
      allocatedAmount: cappedRequestedAmount,
      maxCost: cappedRequestedAmount,
      walletBalanceAtStart: availableBalance,
      durationMinutes,
      durationSeconds,
      extendedMinutes: 0,
      startedAt: now,
      endsAt,
      costSoFar: 0,
      paymentSource: "wallet",
      startedBy: userId,
      isLocked: false,
    }).returning();

    // Update PC
    await db.update(pcsTable).set({
      status: "inUse",
      currentSessionId: sessionId,
      currentUserId: userId,
      updatedAt: now,
    }).where(eq(pcsTable.id, parsed.data.pcId));

    // Update user session count
    await db.update(usersTable).set({
      sessionCount: (user.sessionCount ?? 0) + 1,
    }).where(eq(usersTable.id, userId));

    res.status(201).json(serializeSession(session, pc.label));
  } catch (err: any) {
    console.error("[api] Error creating session:", err);
    res.status(500).json({ error: "Failed to create session", details: err.message });
  }
});

router.post("/sessions/checkin", async (req, res): Promise<void> => {
  const { sessionCode } = req.body;
  if (!sessionCode) { res.status(400).json({ error: "sessionCode is required" }); return; }

  const code = (sessionCode as string).trim().toUpperCase();

  // Try to find an active session where the session ID starts with the code or matches
  const sessions = await db.select().from(sessionsTable)
    .where(inArray(sessionsTable.status, ["active", "extended"]));

  const session = sessions.find(s =>
    (s.sessionCode && s.sessionCode.toUpperCase() === code) ||
    s.id.toUpperCase().startsWith(code) ||
    s.id.toUpperCase().replace(/-/g, "").startsWith(code.replace(/-/g, ""))
  );

  if (!session) {
    res.json({ found: false, status: "notFound", sessionId: null, pcLabel: null, username: null, message: "No active session found with that code." });
    return;
  }

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, session.pcId)).limit(1);

  res.json({
    found: true,
    status: session.status,
    sessionId: session.id,
    pcLabel: pc?.label ?? null,
    username: session.username,
    message: `Session confirmed on ${pc?.label ?? session.pcId}. Show QR at the front desk.`,
  });
});

export default router;
