import { Router } from "express";
import { db, menuItemsTable, ordersTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { getSessionUser } from "./auth";

const router = Router();

function serializeMenuItem(m: typeof menuItemsTable.$inferSelect) {
  return {
    id: m.id,
    name: m.name,
    description: m.description ?? null,
    category: m.category,
    price: m.price,
    imageUrl: m.imageUrl ?? null,
    isAvailable: m.isAvailable,
    displayOrder: m.displayOrder,
    createdAt: m.createdAt.toISOString(),
  };
}

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    userId: o.userId,
    username: o.username,
    sessionId: o.sessionId ?? null,
    pcId: o.pcId ?? null,
    status: o.status,
    items: o.items as any[],
    totalAmount: o.totalAmount,
    paymentSource: o.paymentSource,
    acceptedBy: o.acceptedBy ?? null,
    servedBy: o.servedBy ?? null,
    createdAt: o.createdAt.toISOString(),
    acceptedAt: o.acceptedAt?.toISOString() ?? null,
    servedAt: o.servedAt?.toISOString() ?? null,
    cancelledAt: o.cancelledAt?.toISOString() ?? null,
  };
}

const menuItemInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.enum(["drinks", "snacks", "meals", "services", "others"]),
  price: z.number(),
  isAvailable: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

router.get("/menu", async (req, res): Promise<void> => {
  const items = await db.select().from(menuItemsTable).orderBy(menuItemsTable.displayOrder);
  res.json(items.map(serializeMenuItem));
});

router.post("/menu", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const parsed = menuItemInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [item] = await db.insert(menuItemsTable).values({
    id: crypto.randomUUID(),
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category: parsed.data.category,
    price: parsed.data.price,
    isAvailable: parsed.data.isAvailable ?? true,
    displayOrder: parsed.data.displayOrder ?? 1,
  }).returning();

  res.status(201).json(serializeMenuItem(item));
});

router.patch("/menu/:itemId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { itemId } = req.params;
  const parsed = menuItemInputSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [item] = await db.update(menuItemsTable).set({ ...parsed.data, updatedAt: new Date() } as any)
    .where(eq(menuItemsTable.id, itemId)).returning();
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  res.json(serializeMenuItem(item));
});

router.delete("/menu/:itemId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, req.params.itemId));
  res.status(204).send();
});

// Orders
const orderInputSchema = z.object({
  sessionId: z.string().nullable().optional(),
  pcId: z.string().nullable().optional(),
  items: z.array(z.object({ itemId: z.string(), quantity: z.number() })),
});

router.get("/orders", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.reverse().map(serializeOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = orderInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  // Resolve items
  const enrichedItems = await Promise.all(parsed.data.items.map(async (item) => {
    const [menuItem] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, item.itemId)).limit(1);
    if (!menuItem) throw new Error(`Item ${item.itemId} not found`);
    return {
      itemId: item.itemId,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price,
      subtotal: menuItem.price * item.quantity,
    };
  }));

  const totalAmount = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const [order] = await db.insert(ordersTable).values({
    id: crypto.randomUUID(),
    userId,
    username: user.username,
    sessionId: parsed.data.sessionId ?? null,
    pcId: parsed.data.pcId ?? null,
    status: "pending",
    items: enrichedItems,
    totalAmount,
    paymentSource: "wallet",
  }).returning();

  res.status(201).json(serializeOrder(order));
});

const orderStatusSchema = z.object({
  status: z.enum(["accepted", "preparing", "served", "cancelled", "rejected"]),
});

router.patch("/orders/:orderId/status", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { orderId } = req.params;
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const now = new Date();
  const updateData: any = { status: parsed.data.status };
  if (parsed.data.status === "accepted") { updateData.acceptedBy = userId; updateData.acceptedAt = now; }
  if (parsed.data.status === "served") { updateData.servedBy = userId; updateData.servedAt = now; }
  if (parsed.data.status === "cancelled" || parsed.data.status === "rejected") { updateData.cancelledAt = now; }

  const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, orderId)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(serializeOrder(order));
});

export default router;
