import { Router } from "express";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import { eq, like, or } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { getSessionUser } from "./auth.js";

const router = Router();

function serializeUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...safe } = u;
  return {
    ...safe,
    createdAt: safe.createdAt.toISOString(),
    updatedAt: safe.updatedAt?.toISOString(),
    lastLoginAt: safe.lastLoginAt?.toISOString() ?? null,
  };
}

router.get("/players", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { search } = req.query;
  let players;
  if (search && typeof search === "string") {
    players = await db.select().from(usersTable)
      .where(like(usersTable.username, `%${search}%`));
  } else {
    players = await db.select().from(usersTable);
  }
  res.json(players.map(serializeUser));
});

router.get("/players/:userId", async (req, res): Promise<void> => {
  const currentUserId = getSessionUser(req);
  if (!currentUserId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

const statusUpdateSchema = z.object({
  status: z.enum(["active", "disabled", "banned"]),
});

router.patch("/players/:userId/status", async (req, res): Promise<void> => {
  const currentUserId = getSessionUser(req);
  if (!currentUserId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.update(usersTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(usersTable.id, req.params.userId))
    .returning();

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

const topupSchema = z.object({
  userId: z.string(),
  amount: z.number().min(1),
  paymentMethod: z.enum(["cash", "gcash", "maya", "card", "manualAdjustment"]),
  adminNote: z.string().nullable().optional(),
});

router.post("/wallet/topup", async (req, res): Promise<void> => {
  const adminId = getSessionUser(req);
  if (!adminId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = topupSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const previousBalance = user.walletBalance;
  const newBalance = previousBalance + parsed.data.amount;

  await db.update(usersTable).set({ walletBalance: newBalance, updatedAt: new Date() })
    .where(eq(usersTable.id, parsed.data.userId));

  const [txn] = await db.insert(walletTransactionsTable).values({
    id: crypto.randomUUID(),
    userId: parsed.data.userId,
    username: user.username,
    type: "topUp",
    amount: parsed.data.amount,
    previousBalance,
    newBalance,
    paymentMethod: parsed.data.paymentMethod,
    processedBy: adminId,
    adminNote: parsed.data.adminNote ?? null,
  }).returning();

  res.json({
    id: txn.id,
    userId: txn.userId,
    username: txn.username ?? null,
    type: txn.type,
    amount: txn.amount,
    previousBalance: txn.previousBalance,
    newBalance: txn.newBalance,
    paymentMethod: txn.paymentMethod ?? null,
    sessionId: txn.sessionId ?? null,
    orderId: txn.orderId ?? null,
    processedBy: txn.processedBy ?? null,
    adminNote: txn.adminNote ?? null,
    createdAt: txn.createdAt.toISOString(),
  });
});

router.get("/wallet/transactions", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const txns = await db.select().from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId))
    .orderBy(walletTransactionsTable.createdAt);

  res.json(txns.reverse().map(t => ({
    id: t.id,
    userId: t.userId,
    username: t.username ?? null,
    type: t.type,
    amount: t.amount,
    previousBalance: t.previousBalance,
    newBalance: t.newBalance,
    paymentMethod: t.paymentMethod ?? null,
    sessionId: t.sessionId ?? null,
    orderId: t.orderId ?? null,
    processedBy: t.processedBy ?? null,
    adminNote: t.adminNote ?? null,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.get("/players/:userId/transactions", async (req, res): Promise<void> => {
  const currentUserId = getSessionUser(req);
  if (!currentUserId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const txns = await db.select().from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, req.params.userId))
    .orderBy(walletTransactionsTable.createdAt);

  res.json(txns.reverse().map(t => ({
    id: t.id,
    userId: t.userId,
    username: t.username ?? null,
    type: t.type,
    amount: t.amount,
    previousBalance: t.previousBalance,
    newBalance: t.newBalance,
    paymentMethod: t.paymentMethod ?? null,
    sessionId: t.sessionId ?? null,
    orderId: t.orderId ?? null,
    processedBy: t.processedBy ?? null,
    adminNote: t.adminNote ?? null,
    createdAt: t.createdAt.toISOString(),
  })));
});

export default router;
