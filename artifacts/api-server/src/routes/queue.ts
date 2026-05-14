import { Router } from "express";
import { db, queueEntriesTable, usersTable, pcsTable, sessionsTable } from "@workspace/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getSessionUser } from "./auth.js";

const router = Router();

function serializeEntry(e: typeof queueEntriesTable.$inferSelect) {
  return {
    id: e.id,
    userId: e.userId,
    username: e.username,
    displayName: e.displayName ?? null,
    status: e.status,
    position: e.position,
    requestedTier: e.requestedTier ?? null,
    preferredPcId: e.preferredPcId ?? null,
    estimatedWaitMinutes: e.estimatedWaitMinutes ?? null,
    approvedBy: e.approvedBy ?? null,
    assignedPcId: e.assignedPcId ?? null,
    sessionId: e.sessionId ?? null,
    joinedAt: e.joinedAt.toISOString(),
    approvedAt: e.approvedAt?.toISOString() ?? null,
    assignedAt: e.assignedAt?.toISOString() ?? null,
    notes: e.notes ?? null,
  };
}

router.get("/queue", async (req, res): Promise<void> => {
  try {
    const entries = await db.select().from(queueEntriesTable)
      .where(inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting", "assigned"]))
      .orderBy(queueEntriesTable.position);
    res.json(entries.map(serializeEntry));
  } catch (err: any) {
    console.error("[api] Error fetching queue:", err);
    res.status(500).json({ error: "Failed to fetch queue", details: err.message });
  }
});

router.get("/queue/my", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  try {
    const [entry] = await db.select().from(queueEntriesTable)
      .where(and(
        eq(queueEntriesTable.userId, userId),
        inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting", "assigned"])
      )).limit(1);

    if (!entry) { res.status(404).json({ error: "Not in queue" }); return; }
    res.json(serializeEntry(entry));
  } catch (err: any) {
    console.error("[api] Error fetching personal queue:", err);
    res.status(500).json({ error: "Failed to fetch personal queue", details: err.message });
  }
});

const joinQueueSchema = z.object({
  requestedTier: z.string().optional(),
  preferredPcId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

router.post("/queue", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = joinQueueSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  try {
    // Check already in queue
    const existing = await db.select().from(queueEntriesTable)
      .where(and(
        eq(queueEntriesTable.userId, userId),
        inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting"])
      )).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "You are already in the queue" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(401).json({ error: "User not found" }); return; }

    const activeEntries = await db.select().from(queueEntriesTable)
      .where(inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting"]));
    
    const availablePcs = await db.select().from(pcsTable).where(eq(pcsTable.status, "available"));

    const position = activeEntries.length + 1;
    const estimatedWait = activeEntries.length * 30;

    // Auto-approve if there are available PCs
    const status = availablePcs.length > 0 ? "approved" : "waitingApproval";

    const [entry] = await db.insert(queueEntriesTable).values({
      id: crypto.randomUUID(),
      userId,
      username: user.username,
      displayName: user.displayName ?? null,
      status,
      position,
      requestedTier: parsed.data.requestedTier ?? null,
      preferredPcId: parsed.data.preferredPcId ?? null,
      estimatedWaitMinutes: estimatedWait,
      notes: parsed.data.notes ?? null,
      approvedAt: status === "approved" ? new Date() : null,
    }).returning();

    res.status(201).json(serializeEntry(entry));
  } catch (err: any) {
    console.error("[api] Error joining queue:", err);
    res.status(500).json({ error: "Failed to join queue", details: err.message });
  }
});

router.patch("/queue/:queueId/approve", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  try {
    const [entry] = await db.update(queueEntriesTable)
      .set({ status: "approved", approvedBy: userId, approvedAt: new Date() })
      .where(eq(queueEntriesTable.id, queueId))
      .returning();

    if (!entry) { res.status(404).json({ error: "Queue entry not found" }); return; }
    res.json(serializeEntry(entry));
  } catch (err: any) {
    console.error("[api] Error approving queue entry:", err);
    res.status(500).json({ error: "Failed to approve queue entry", details: err.message });
  }
});

router.patch("/queue/:queueId/remove", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  try {
    const [entry] = await db.update(queueEntriesTable)
      .set({ status: "removed", updatedAt: new Date() })
      .where(eq(queueEntriesTable.id, queueId))
      .returning();

    if (!entry) { res.status(404).json({ error: "Queue entry not found" }); return; }
    res.json(serializeEntry(entry));
  } catch (err: any) {
    console.error("[api] Error removing queue entry:", err);
    res.status(500).json({ error: "Failed to remove queue entry", details: err.message });
  }
});

const assignSchema = z.object({
  pcId: z.string(),
  durationMinutes: z.number().int().min(15).optional(),
});


router.patch("/queue/:queueId/assign", async (req, res): Promise<void> => {
  const adminId = getSessionUser(req);
  if (!adminId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  try {
    const result = await db.transaction(async (tx) => {
      const [entry] = await tx.select().from(queueEntriesTable).where(eq(queueEntriesTable.id, queueId)).limit(1);
      if (!entry) throw new Error("Queue entry not found");

      const [pc] = await tx.select().from(pcsTable).where(eq(pcsTable.id, parsed.data.pcId)).limit(1);
      if (!pc) throw new Error("PC not found");
      if (pc.status !== "available") throw new Error("PC is not available");

      const now = new Date();
      const sessionId = randomUUID();
      const durationMinutes = parsed.data.durationMinutes ?? 60;
      const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

      // 1. Create session
      const [session] = await tx.insert(sessionsTable).values({
        id: sessionId,
        userId: entry.userId,
        username: entry.username,
        pcId: parsed.data.pcId,
        sessionCode: `GGX-${pc.label}+${entry.username}`.toUpperCase().replace(/\s+/g, ''),
        status: "active",
        sessionType: "limited",
        ratePerHour: 30,
        allocatedAmount: (durationMinutes / 60) * 30,
        walletBalanceAtStart: 1000,
        durationMinutes,
        durationSeconds: durationMinutes * 60,
        extendedMinutes: 0,
        startedAt: now,
        endsAt,
        costSoFar: 0,
        paymentSource: "prepaid",
        startedBy: adminId,
        queueId: entry.id,
        isLocked: false,
      }).returning();

      if (!session) throw new Error("Failed to create session record");

      // 2. Update queue entry
      await tx.update(queueEntriesTable).set({
        status: "assigned",
        assignedPcId: parsed.data.pcId,
        sessionId,
        assignedAt: now,
        updatedAt: now,
      }).where(eq(queueEntriesTable.id, queueId));

      // 3. Update PC
      await tx.update(pcsTable).set({
        status: "inUse",
        currentSessionId: sessionId,
        currentUserId: entry.userId,
        updatedAt: now,
      }).where(eq(pcsTable.id, parsed.data.pcId));

      // 4. Update user session count
      const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, entry.userId)).limit(1);
      if (user) {
        await tx.update(usersTable).set({
          sessionCount: (user.sessionCount ?? 0) + 1,
          updatedAt: now,
        }).where(eq(usersTable.id, entry.userId));
      }

      return { session, pc, durationMinutes };
    });

    // Safe date serialization
    const startedAt = result.session.startedAt ? new Date(result.session.startedAt).toISOString() : new Date().toISOString();
    const endsAt = result.session.endsAt ? new Date(result.session.endsAt).toISOString() : new Date().toISOString();

    res.json({
      success: true,
      session: {
        id: result.session.id,
        code: result.session.sessionCode,
        pcLabel: result.pc.label,
        remainingSeconds: result.durationMinutes * 60,
        startedAt,
        endsAt,
      }
    });
  } catch (err: any) {
    console.error("[api] Error during assignment transaction:", err);
    
    // Check if it's one of our expected errors
    const knownErrors = ["Queue entry not found", "PC not found", "PC is not available"];
    if (knownErrors.includes(err.message)) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined 
      });
    }
  }
});

export default router;
