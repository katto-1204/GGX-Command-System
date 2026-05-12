import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promoTagEnum = pgEnum("promo_tag", ["discount", "announcement", "event", "loyalty", "maintenance", "pricing"]);

export const promosTable = pgTable("promos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tag: promoTagEnum("tag").notNull().default("announcement"),
  isActive: boolean("is_active").notNull().default(true),
  displayPriority: integer("display_priority").notNull().default(1),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPromoSchema = createInsertSchema(promosTable).omit({ createdAt: true, updatedAt: true });
export type InsertPromo = z.infer<typeof insertPromoSchema>;
export type Promo = typeof promosTable.$inferSelect;
