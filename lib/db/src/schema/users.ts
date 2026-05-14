import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["player", "admin", "superAdmin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "disabled", "banned"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  birthDate: timestamp("birth_date", { withTimezone: true }),
  sex: text("sex"),
  displayName: text("display_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("player"),
  status: userStatusEnum("status").notNull().default("active"),
  walletBalance: real("wallet_balance").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  totalPlayTimeMinutes: integer("total_play_time_minutes").notNull().default(0),
  sessionCount: integer("session_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
