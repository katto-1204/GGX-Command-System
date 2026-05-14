import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const queueStatusEnum = pgEnum("queue_status", ["waitingApproval", "approved", "waiting", "assigned", "cancelled", "removed", "noShow", "completed"]);

export const queueEntriesTable = pgTable("queue_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  status: queueStatusEnum("status").notNull().default("waitingApproval"),
  position: integer("position").notNull().default(0),
  requestedTier: text("requested_tier"),
  preferredPcId: text("preferred_pc_id"),
  estimatedWaitMinutes: integer("estimated_wait_minutes"),
  confidencePercent: integer("confidence_percent"),
  approvedBy: text("approved_by"),
  assignedPcId: text("assigned_pc_id"),
  sessionId: text("session_id"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  noShowAt: timestamp("no_show_at", { withTimezone: true }),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQueueEntrySchema = createInsertSchema(queueEntriesTable).omit({ joinedAt: true });
export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;
export type QueueEntry = typeof queueEntriesTable.$inferSelect;
