import { Router } from "express";
import { db, queueEntriesTable, usersTable, pcsTable, sessionsTable } from "@workspace/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
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

const ACTIVE_STATUSES = ["waitingApproval", "approved", "waiting"] as const;

router.get("/queue", async (req, res): Promise<void> => {
  const entries = await db.select().from(queueEntriesTable)
    .where(inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting", "assigned"]))
    .orderBy(queueEntriesTable.position);
  res.json(entries.map(serializeEntry));
});

router.get("/queue/my", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [entry] = await db.select().from(queueEntriesTable)
    .where(and(
      eq(queueEntriesTable.userId, userId),
      inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting", "assigned"])
    )).limit(1);

  if (!entry) { res.status(404).json({ error: "Not in queue" }); return; }
  res.json(serializeEntry(entry));
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
  
  const availablePcs = await db.select().from(pcsTable).where(eq(pcsTable.id, "available" as any)); // Status 'available'
  // Correcting the query to actual status 'available'
  const availablePcsActual = await db.select().from(pcsTable).where(eq(pcsTable.status, "available"));

  const position = activeEntries.length + 1;
  const estimatedWait = activeEntries.length * 30;

  // Auto-approve if there are available PCs
  const status = availablePcsActual.length > 0 ? "approved" : "waitingApproval";

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
});

router.patch("/queue/:queueId/approve", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  const [entry] = await db.update(queueEntriesTable)
    .set({ status: "approved", approvedBy: userId, approvedAt: new Date() })
    .where(eq(queueEntriesTable.id, queueId))
    .returning();

  if (!entry) { res.status(404).json({ error: "Queue entry not found" }); return; }
  res.json(serializeEntry(entry));
});

router.patch("/queue/:queueId/remove", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  const [entry] = await db.update(queueEntriesTable)
    .set({ status: "removed", cancelledAt: new Date() })
    .where(eq(queueEntriesTable.id, queueId))
    .returning();

  if (!entry) { res.status(404).json({ error: "Queue entry not found" }); return; }
  res.json(serializeEntry(entry));
});

const assignSchema = z.object({
  pcId: z.string(),
  durationMinutes: z.number().optional(),
});

router.patch("/queue/:queueId/assign", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { queueId } = req.params;
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [entry] = await db.select().from(queueEntriesTable).where(eq(queueEntriesTable.id, queueId)).limit(1);
  if (!entry) { res.status(404).json({ error: "Queue entry not found" }); return; }

  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, parsed.data.pcId)).limit(1);
  if (!pc) { res.status(404).json({ error: "PC not found" }); return; }

  const durationMinutes = parsed.data.durationMinutes ?? 60;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  const sessionId = crypto.randomUUID();

  // Create session
  const [session] = await db.insert(sessionsTable).values({
    id: sessionId,
    userId: entry.userId,
    username: entry.username,
    pcId: parsed.data.pcId,
    status: "active",
    ratePerHour: 30,
    durationMinutes,
    extendedMinutes: 0,
    startedAt: now,
    endsAt,
    costSoFar: 0,
    paymentSource: "wallet",
    queueId,
    startedBy: userId,
    isLocked: false,
  }).returning();

  // Update queue entry
  await db.update(queueEntriesTable).set({
    status: "assigned",
    assignedPcId: parsed.data.pcId,
    sessionId,
    assignedAt: now,
  }).where(eq(queueEntriesTable.id, queueId));

  // Update PC
  await db.update(pcsTable).set({
    status: "inUse",
    currentSessionId: sessionId,
    currentUserId: entry.userId,
    updatedAt: now,
  }).where(eq(pcsTable.id, parsed.data.pcId));

  // Update user session count
  await db.update(usersTable).set({
    sessionCount: db.select({ count: usersTable.sessionCount }).from(usersTable).where(eq(usersTable.id, entry.userId)).limit(1) as any,
  }).where(eq(usersTable.id, entry.userId));

  res.json({
    ...session,
    pcLabel: pc.label,
    remainingSeconds: durationMinutes * 60,
    startedAt: session.startedAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    endedAt: null,
    finalCost: null,
    createdAt: session.createdAt.toISOString(),
  });
});

export default router;
