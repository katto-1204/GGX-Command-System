import { pgTable, text, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pcStatusEnum = pgEnum("pc_status", ["available", "inUse", "maintenance", "reserved", "cleaning", "offline"]);
export const pcTierEnum = pgEnum("pc_tier", ["standard", "premium", "vip"]);

export const pcsTable = pgTable("pcs", {
  id: text("id").primaryKey(),
  number: integer("number").notNull().unique(),
  label: text("label").notNull(),
  status: pcStatusEnum("status").notNull().default("available"),
  tier: pcTierEnum("tier").notNull().default("standard"),
  specs: jsonb("specs"),
  currentSessionId: text("current_session_id"),
  currentUserId: text("current_user_id"),
  location: text("location").notNull().default("Main Area"),
  isKioskEnabled: boolean("is_kiosk_enabled").notNull().default(true),
  maintenanceNote: text("maintenance_note"),
  lastMaintenanceAt: timestamp("last_maintenance_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPcSchema = createInsertSchema(pcsTable).omit({ createdAt: true, updatedAt: true });
export type InsertPc = z.infer<typeof insertPcSchema>;
export type Pc = typeof pcsTable.$inferSelect;
