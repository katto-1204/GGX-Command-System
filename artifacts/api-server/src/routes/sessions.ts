import { Router } from "express";
import { db, sessionsTable, pcsTable, usersTable, queueEntriesTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSessionUser } from "./auth";

const router = Router();

function serializeSession(s: typeof sessionsTable.$inferSelect, pcLabel?: string | null) {
  const remainingSeconds = s.status === "active"
    ? Math.max(0, Math.floor((s.endsAt.getTime() - Date.now()) / 1000))
    : null;

  return {
    id: s.id,
    userId: s.userId,
    username: s.username,
    pcId: s.pcId,
    pcLabel: pcLabel ?? null,
    status: s.status,
    ratePerHour: s.ratePerHour,
    durationMinutes: s.durationMinutes,
    extendedMinutes: s.extendedMinutes,
    startedAt: s.startedAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    remainingSeconds,
    costSoFar: s.costSoFar,
    finalCost: s.finalCost ?? null,
    paymentSource: s.paymentSource,
    queueId: s.queueId ?? null,
    isLocked: s.isLocked,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/sessions", async (req, res): Promise<void> => {
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
});

router.get("/sessions/my", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [session] = await db.select().from(sessionsTable)
    .where(and(
      eq(sessionsTable.userId, userId),
      inArray(sessionsTable.status, ["active", "extended", "locked"])
    )).limit(1);

  if (!session) { res.status(404).json({ error: "No active session" }); return; }

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, session.pcId)).limit(1);
  res.json(serializeSession(session, pc?.label));
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

  const newEndsAt = new Date(session.endsAt.getTime() + parsed.data.additionalMinutes * 60 * 1000);
  const [updated] = await db.update(sessionsTable).set({
    endsAt: newEndsAt,
    extendedMinutes: session.extendedMinutes + parsed.data.additionalMinutes,
    status: "extended",
    updatedAt: new Date(),
  }).where(eq(sessionsTable.id, sessionId)).returning();

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, updated.pcId)).limit(1);
  res.json(serializeSession(updated, pc?.label));
});

router.patch("/sessions/:sessionId/end", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { sessionId } = req.params;
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  const now = new Date();
  const minutesUsed = Math.ceil((now.getTime() - session.startedAt.getTime()) / 60000);
  const finalCost = (minutesUsed / 60) * session.ratePerHour;

  const [updated] = await db.update(sessionsTable).set({
    status: "completed",
    endedAt: now,
    finalCost,
    endedBy: userId,
    updatedAt: now,
  }).where(eq(sessionsTable.id, sessionId)).returning();

  // Free the PC
  await db.update(pcsTable).set({
    status: "available",
    currentSessionId: null,
    currentUserId: null,
    updatedAt: now,
  }).where(eq(pcsTable.id, session.pcId));

  // Update user stats
  const [playerRow] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  if (playerRow) {
    await db.update(usersTable).set({
      totalSpent: (playerRow.totalSpent ?? 0) + finalCost,
      totalPlayTimeMinutes: (playerRow.totalPlayTimeMinutes ?? 0) + minutesUsed,
    }).where(eq(usersTable.id, session.userId));
  }

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, updated.pcId)).limit(1);
  res.json(serializeSession(updated, pc?.label));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const schema = z.object({
    pcId: z.string(),
    durationMinutes: z.number().min(15).max(1440),
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

  const durationMinutes = parsed.data.durationMinutes;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  const sessionId = crypto.randomUUID();

  // Create session
  const [session] = await db.insert(sessionsTable).values({
    id: sessionId,
    userId: userId,
    username: user.username,
    pcId: parsed.data.pcId,
    status: "active",
    ratePerHour: 30, // Default rate
    durationMinutes,
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
});

router.post("/sessions/checkin", async (req, res): Promise<void> => {
  const { sessionCode } = req.body;
  if (!sessionCode) { res.status(400).json({ error: "sessionCode is required" }); return; }

  const code = (sessionCode as string).trim().toUpperCase();

  // Try to find an active session where the session ID starts with the code or matches
  const sessions = await db.select().from(sessionsTable)
    .where(inArray(sessionsTable.status, ["active", "extended"]));

  const session = sessions.find(s =>
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
