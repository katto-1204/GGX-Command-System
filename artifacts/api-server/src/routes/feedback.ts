import { Router } from "express";
import { db, feedbackTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { getSessionUser } from "./auth";

const router = Router();

function serializeFeedback(f: typeof feedbackTable.$inferSelect) {
  return {
    id: f.id,
    userId: f.userId ?? null,
    username: f.username ?? null,
    category: f.category,
    message: f.message,
    relatedPcId: f.relatedPcId ?? null,
    relatedSessionId: f.relatedSessionId ?? null,
    isAnonymous: f.isAnonymous,
    status: f.status,
    assignedTo: f.assignedTo ?? null,
    resolvedBy: f.resolvedBy ?? null,
    resolutionNote: f.resolutionNote ?? null,
    createdAt: f.createdAt.toISOString(),
    resolvedAt: f.resolvedAt?.toISOString() ?? null,
  };
}

const feedbackInputSchema = z.object({
  category: z.enum(["issue", "suggestion", "general", "complaint", "featureRequest"]),
  message: z.string().min(1),
  relatedPcId: z.string().nullable().optional(),
  relatedSessionId: z.string().nullable().optional(),
  isAnonymous: z.boolean().optional(),
});

const resolveSchema = z.object({
  status: z.enum(["reviewing", "resolved", "closed", "escalated"]),
  resolutionNote: z.string().nullable().optional(),
});

router.get("/feedback", async (req, res): Promise<void> => {
  const { status } = req.query;
  let items;
  if (status && typeof status === "string") {
    items = await db.select().from(feedbackTable)
      .where(eq(feedbackTable.status, status as any))
      .orderBy(feedbackTable.createdAt);
  } else {
    items = await db.select().from(feedbackTable).orderBy(feedbackTable.createdAt);
  }
  res.json(items.map(serializeFeedback).reverse());
});

router.post("/feedback", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  const parsed = feedbackInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  let username: string | null = null;
  if (userId && !parsed.data.isAnonymous) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    username = user?.username ?? null;
  }

  const [item] = await db.insert(feedbackTable).values({
    id: crypto.randomUUID(),
    userId: parsed.data.isAnonymous ? null : (userId ?? null),
    username: parsed.data.isAnonymous ? null : username,
    category: parsed.data.category,
    message: parsed.data.message,
    relatedPcId: parsed.data.relatedPcId ?? null,
    relatedSessionId: parsed.data.relatedSessionId ?? null,
    isAnonymous: parsed.data.isAnonymous ?? false,
    status: "open",
  }).returning();

  res.status(201).json(serializeFeedback(item));
});

router.patch("/feedback/:feedbackId/resolve", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { feedbackId } = req.params;
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [item] = await db.update(feedbackTable).set({
    status: parsed.data.status,
    resolvedBy: userId,
    resolutionNote: parsed.data.resolutionNote ?? null,
    resolvedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(feedbackTable.id, feedbackId)).returning();

  if (!item) { res.status(404).json({ error: "Feedback not found" }); return; }
  res.json(serializeFeedback(item));
});

export default router;
