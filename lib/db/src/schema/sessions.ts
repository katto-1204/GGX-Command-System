import { pgTable, text, integer, real, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionStatusEnum = pgEnum("session_status", ["pending", "active", "locked", "extended", "completed", "cancelled", "abandoned"]);

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  pcId: text("pc_id").notNull(),
  sessionCode: text("session_code"),
  status: sessionStatusEnum("status").notNull().default("active"),
  ratePerHour: real("rate_per_hour").notNull().default(30),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  extendedMinutes: integer("extended_minutes").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  costSoFar: real("cost_so_far").notNull().default(0),
  finalCost: real("final_cost"),
  paymentSource: text("payment_source").notNull().default("wallet"),
  queueId: text("queue_id"),
  startedBy: text("started_by"),
  endedBy: text("ended_by"),
  isLocked: boolean("is_locked").notNull().default(false),
  lockReason: text("lock_reason"),
  warningsSent: jsonb("warnings_sent").default({ tenMinute: false, fiveMinute: false, expired: false }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ createdAt: true, updatedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
