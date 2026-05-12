import { pgTable, text, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", ["pending", "accepted", "preparing", "served", "cancelled", "rejected"]);

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  sessionId: text("session_id"),
  pcId: text("pc_id"),
  status: orderStatusEnum("status").notNull().default("pending"),
  items: jsonb("items").notNull(),
  totalAmount: real("total_amount").notNull(),
  paymentSource: text("payment_source").notNull().default("wallet"),
  acceptedBy: text("accepted_by"),
  servedBy: text("served_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  servedAt: timestamp("served_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
