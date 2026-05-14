import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import { logger } from "../lib/logger";

const router = Router();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required.");
}

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
  fullName: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.string().optional(),
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

type SessionTokenPayload = {
  userId: string;
  exp: number;
};

function createSessionToken(userId: string): string {
  const payload: SessionTokenPayload = {
    userId,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): string | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionTokenPayload;
    if (!payload?.userId || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET!).update(encodedPayload).digest("base64url");
}

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
  return verifySessionToken(token);
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password, displayName, phone, fullName, birthDate, sex } = parsed.data;

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
    fullName: fullName ?? null,
    birthDate: birthDate ? new Date(birthDate) : null,
    sex: sex ?? null,
    role: "player",
    status: "active",
    walletBalance: 0,
    totalSpent: 0,
    totalPlayTimeMinutes: 0,
    sessionCount: 0,
  }).returning();

  const token = createSessionToken(id);

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

  const token = createSessionToken(user.id);

  req.log.info({ userId: user.id }, "User logged in");
  res.json({ user: serializeUser(user), token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
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
