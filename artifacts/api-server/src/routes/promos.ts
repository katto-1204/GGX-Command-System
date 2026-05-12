import { Router } from "express";
import { db, promosTable, announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { getSessionUser } from "./auth";

const router = Router();

function serializePromo(p: typeof promosTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    tag: p.tag,
    isActive: p.isActive,
    displayPriority: p.displayPriority,
    startsAt: p.startsAt?.toISOString() ?? null,
    endsAt: p.endsAt?.toISOString() ?? null,
    createdBy: p.createdBy ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

function serializeAnnouncement(a: typeof announcementsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    type: a.type,
    isActive: a.isActive,
    priority: a.priority,
    expiresAt: a.expiresAt?.toISOString() ?? null,
    createdBy: a.createdBy ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

const promoInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  tag: z.string(),
  isActive: z.boolean().optional(),
  displayPriority: z.number().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

const announcementInputSchema = z.object({
  title: z.string(),
  body: z.string(),
  type: z.string(),
  isActive: z.boolean().optional(),
  priority: z.string().optional(),
  expiresAt: z.string().nullable().optional(),
});

// Promos
router.get("/promos", async (req, res): Promise<void> => {
  const promos = await db.select().from(promosTable).orderBy(promosTable.displayPriority);
  res.json(promos.map(serializePromo));
});

router.post("/promos", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const parsed = promoInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [promo] = await db.insert(promosTable).values({
    id: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    tag: parsed.data.tag as any,
    isActive: parsed.data.isActive ?? true,
    displayPriority: parsed.data.displayPriority ?? 1,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    createdBy: userId,
  }).returning();

  res.status(201).json(serializePromo(promo));
});

router.patch("/promos/:promoId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { promoId } = req.params;
  const parsed = promoInputSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [promo] = await db.update(promosTable).set({
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
    updatedAt: new Date(),
  } as any).where(eq(promosTable.id, promoId)).returning();

  if (!promo) { res.status(404).json({ error: "Promo not found" }); return; }
  res.json(serializePromo(promo));
});

router.delete("/promos/:promoId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  await db.delete(promosTable).where(eq(promosTable.id, req.params.promoId));
  res.status(204).send();
});

// Announcements
router.get("/announcements", async (req, res): Promise<void> => {
  const announcements = await db.select().from(announcementsTable)
    .where(eq(announcementsTable.isActive, true))
    .orderBy(announcementsTable.createdAt);
  res.json(announcements.map(serializeAnnouncement));
});

router.post("/announcements", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const parsed = announcementInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [ann] = await db.insert(announcementsTable).values({
    id: crypto.randomUUID(),
    title: parsed.data.title,
    body: parsed.data.body,
    type: parsed.data.type as any,
    isActive: parsed.data.isActive ?? true,
    priority: (parsed.data.priority ?? "normal") as any,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    createdBy: userId,
  }).returning();

  res.status(201).json(serializeAnnouncement(ann));
});

router.patch("/announcements/:announcementId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { announcementId } = req.params;
  const parsed = announcementInputSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [ann] = await db.update(announcementsTable).set({
    ...parsed.data,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    updatedAt: new Date(),
  } as any).where(eq(announcementsTable.id, announcementId)).returning();

  if (!ann) { res.status(404).json({ error: "Announcement not found" }); return; }
  res.json(serializeAnnouncement(ann));
});

router.delete("/announcements/:announcementId", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  await db.delete(announcementsTable).where(eq(announcementsTable.id, req.params.announcementId));
  res.status(204).send();
});

export default router;
