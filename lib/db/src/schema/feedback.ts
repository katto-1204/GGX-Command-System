import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedbackCategoryEnum = pgEnum("feedback_category", ["issue", "suggestion", "general", "complaint", "featureRequest"]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["open", "reviewing", "resolved", "closed", "escalated"]);

export const feedbackTable = pgTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  username: text("username"),
  category: feedbackCategoryEnum("category").notNull().default("general"),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  relatedPcId: text("related_pc_id"),
  relatedSessionId: text("related_session_id"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: feedbackStatusEnum("status").notNull().default("open"),
  assignedTo: text("assigned_to"),
  resolvedBy: text("resolved_by"),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({ createdAt: true, updatedAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;
