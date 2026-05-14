import { Router } from "express";
import { db, pcsTable, queueEntriesTable, sessionsTable, feedbackTable, ordersTable } from "@workspace/db";
import { eq, inArray, and, gte } from "drizzle-orm";
import { getSessionUser } from "./auth.js";


const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [pcs, queue, activeSessions, openFeedback, pendingOrders] = await Promise.all([
    db.select().from(pcsTable),
    db.select().from(queueEntriesTable).where(
      inArray(queueEntriesTable.status, ["waitingApproval", "approved", "waiting"])
    ),
    db.select().from(sessionsTable).where(
      inArray(sessionsTable.status, ["active", "extended"])
    ),
    db.select().from(feedbackTable).where(
      inArray(feedbackTable.status, ["open", "reviewing"])
    ),
    db.select().from(ordersTable).where(
      inArray(ordersTable.status, ["pending", "accepted", "preparing"])
    ),
  ]);

  const totalPcs = pcs.length;
  const availablePcs = pcs.filter(p => p.status === "available").length;
  const inUsePcs = pcs.filter(p => p.status === "inUse").length;
  const maintenancePcs = pcs.filter(p => p.status === "maintenance").length;

  // Today's revenue estimate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = await db.select().from(sessionsTable)
    .where(and(
      inArray(sessionsTable.status, ["completed", "active", "extended"]),
      gte(sessionsTable.startedAt, today)
    ));
  const totalRevenueTodayCents = todaySessions.reduce((sum, s) => sum + (s.finalCost ?? s.costSoFar ?? 0), 0);

  res.json({
    totalPcs,
    availablePcs,
    inUsePcs,
    maintenancePcs,
    queueCount: queue.length,
    activeSessions: activeSessions.length,
    openFeedbackCount: openFeedback.length,
    pendingOrdersCount: pendingOrders.length,
    totalRevenueTodayCents,
  });
});

router.get("/dashboard/pc-summary", async (req, res): Promise<void> => {
  const pcs = await db.select().from(pcsTable);
  res.json({
    available: pcs.filter(p => p.status === "available").length,
    inUse: pcs.filter(p => p.status === "inUse").length,
    maintenance: pcs.filter(p => p.status === "maintenance").length,
    reserved: pcs.filter(p => p.status === "reserved").length,
    offline: pcs.filter(p => p.status === "offline").length,
    total: pcs.length,
  });
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [recentSessions, recentFeedback] = await Promise.all([
    db.select().from(sessionsTable).orderBy(sessionsTable.createdAt).limit(10),
    db.select().from(feedbackTable).orderBy(feedbackTable.createdAt).limit(5),
  ]);

  const activity = [
    ...recentSessions.reverse().map(s => ({
      id: s.id,
      type: s.status === "active" ? "sessionStarted" : "sessionEnded",
      message: s.status === "active"
        ? `${s.username} started session on ${s.pcId}`
        : `${s.username} ended session on ${s.pcId}`,
      username: s.username,
      pcLabel: s.pcId,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentFeedback.reverse().map(f => ({
      id: f.id,
      type: "feedbackSubmitted",
      message: f.isAnonymous ? `Anonymous feedback: ${f.category}` : `${f.username} submitted ${f.category} feedback`,
      username: f.username ?? null,
      pcLabel: f.relatedPcId ?? null,
      createdAt: f.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);

  res.json(activity);
});

router.get("/dashboard/reports", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [allSessions, allPcs] = await Promise.all([
    db.select().from(sessionsTable).where(
      inArray(sessionsTable.status, ["completed", "active", "extended"])
    ),
    db.select().from(pcsTable),
  ]);

  const totalRevenueCents = allSessions.reduce((sum, s) => sum + (s.finalCost ?? s.costSoFar ?? 0), 0);
  const totalMinutes = allSessions.reduce((sum, s) => {
    if (!s.startedAt || !s.endedAt) return sum + (s.durationMinutes ?? 0);
    return sum + Math.ceil((s.endedAt.getTime() - s.startedAt.getTime()) / 60000);
  }, 0);
  const sessionCount = allSessions.length;
  const totalPcHours = totalMinutes / 60;
  const avgSessionMinutes = sessionCount > 0 ? totalMinutes / sessionCount : 0;

  const tiers = ["standard", "vip"];
  const revenueByTier = tiers.map(tier => {
    const tierSessions = allSessions.filter(s => {
      const pc = allPcs.find(p => p.id === s.pcId);
      return pc?.tier === tier;
    });
    return {
      tier,
      revenueCents: tierSessions.reduce((sum, s) => sum + (s.finalCost ?? s.costSoFar ?? 0), 0),
      sessions: tierSessions.length,
    };
  });

  const utilizationByTier = tiers.map(tier => {
    const tierPcs = allPcs.filter(p => p.tier === tier);
    const inUse = tierPcs.filter(p => p.status === "inUse").length;
    const total = tierPcs.length;
    return { tier, total, inUse, pct: total > 0 ? Math.round((inUse / total) * 100) : 0 };
  });

  // Peak hours from today's sessions
  const peakHours = Array.from({ length: 24 }, (_, hour) => {
    const count = allSessions.filter(s => {
      const h = new Date(s.startedAt).getHours();
      return h === hour;
    }).length;
    return { hour, count };
  });

  res.json({ totalRevenueCents, sessionCount, totalPcHours, avgSessionMinutes, revenueByTier, utilizationByTier, peakHours });
});

export default router;
