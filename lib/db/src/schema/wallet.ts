import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["topUp", "sessionCharge", "orderCharge", "refund", "adjustment"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "gcash", "maya", "card", "wallet", "manualAdjustment"]);

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username"),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  previousBalance: real("previous_balance").notNull(),
  newBalance: real("new_balance").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  sessionId: text("session_id"),
  orderId: text("order_id"),
  processedBy: text("processed_by"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable).omit({ createdAt: true });
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
