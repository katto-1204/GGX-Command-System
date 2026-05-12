import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import { logger } from "../lib/logger";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "quepon_salt_2024").digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function serializeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...safe } = user;
  return {
    ...safe,
    createdAt: safe.createdAt.toISOString(),
    updatedAt: safe.updatedAt?.toISOString(),
    lastLoginAt: safe.lastLoginAt?.toISOString() ?? null,
  };
}

declare module "express" {
  interface Request {
    session?: { userId: string };
  }
}

// Simple in-memory session store (replace with Redis in production)
export const sessionStore = new Map<string, { userId: string; expiresAt: number }>();

export function getSessionUser(req: import("express").Request): string | null {
  // Support both x-session-token and Authorization: Bearer <token>
  let token = req.headers["x-session-token"] as string | undefined;
  if (!token) {
    const authHeader = req.headers["authorization"] as string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(token);
    return null;
  }
  return session.userId;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password, displayName, phone } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const id = generateId();
  const [user] = await db.insert(usersTable).values({
    id,
    username,
    passwordHash: hashPassword(password),
    displayName: displayName ?? null,
    phone: phone ?? null,
    role: "player",
    status: "active",
    walletBalance: 0,
    totalSpent: 0,
    totalPlayTimeMinutes: 0,
    sessionCount: 0,
  }).returning();

  const token = generateId();
  sessionStore.set(token, { userId: id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  req.log.info({ userId: id }, "User registered");
  res.status(201).json({ user: serializeUser(user), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { username, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  if (user.status !== "active") {
    res.status(401).json({ error: "Account is disabled" });
    return;
  }

  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));

  const token = generateId();
  sessionStore.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  req.log.info({ userId: user.id }, "User logged in");
  res.json({ user: serializeUser(user), token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.headers["x-session-token"] as string | undefined;
  if (token) sessionStore.delete(token);
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(user));
});

export default router;
