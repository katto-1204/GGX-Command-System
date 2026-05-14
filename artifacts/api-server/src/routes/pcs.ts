import { Router } from "express";
import { db, pcsTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionUser } from "./auth";

const router = Router();

function serializePc(pc: typeof pcsTable.$inferSelect, remainingSeconds?: number | null, currentUsername?: string | null, currentSessionCode?: string | null) {
  return {
    id: pc.id,
    number: pc.number,
    label: pc.label,
    status: pc.status,
    tier: pc.tier,
    specs: pc.specs,
    currentSessionId: pc.currentSessionId ?? null,
    currentUserId: pc.currentUserId ?? null,
    currentUsername: currentUsername ?? null,
    currentSessionCode: currentSessionCode ?? null,
    remainingSeconds: remainingSeconds ?? null,
    location: pc.location,
    maintenanceNote: pc.maintenanceNote ?? null,
    createdAt: pc.createdAt.toISOString(),
    updatedAt: pc.updatedAt.toISOString(),
  };
}

async function getPcsWithRemainingTime() {
  const pcs = await db.select().from(pcsTable).orderBy(pcsTable.number);
  const now = Date.now();

  const enriched = await Promise.all(pcs.map(async (pc) => {
    if (pc.currentSessionId) {
      const [session] = await db.select().from(sessionsTable)
        .where(eq(sessionsTable.id, pc.currentSessionId)).limit(1);
      if (session && session.status === "active") {
        const remaining = Math.max(0, Math.floor((session.endsAt.getTime() - now) / 1000));
        return serializePc(pc, remaining, session.username, session.sessionCode ?? null);
      }
    }
    return serializePc(pc, null, null, null);
  }));

  return enriched;
}

router.get("/pcs", async (req, res): Promise<void> => {
  const pcs = await getPcsWithRemainingTime();
  res.json(pcs);
});

router.get("/pcs/:pcId", async (req, res): Promise<void> => {
  const { pcId } = req.params;
  const [pc] = await db.select().from(pcsTable).where(eq(pcsTable.id, pcId)).limit(1);
  if (!pc) { res.status(404).json({ error: "PC not found" }); return; }

  let remaining: number | null = null;
  let currentUsername: string | null = null;
  let currentSessionCode: string | null = null;
  if (pc.currentSessionId) {
    const [session] = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.id, pc.currentSessionId)).limit(1);
    if (session && session.status === "active") {
      remaining = Math.max(0, Math.floor((session.endsAt.getTime() - Date.now()) / 1000));
      currentUsername = session.username;
      currentSessionCode = session.sessionCode ?? null;
    }
  }

  res.json(serializePc(pc, remaining, currentUsername, currentSessionCode));
});

const statusUpdateSchema = z.object({
  status: z.enum(["available", "inUse", "maintenance", "reserved", "cleaning", "offline"]),
  maintenanceNote: z.string().nullable().optional(),
});

router.patch("/pcs/:pcId/status", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { pcId } = req.params;
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [pc] = await db.update(pcsTable)
    .set({ status: parsed.data.status, maintenanceNote: parsed.data.maintenanceNote ?? null, updatedAt: new Date() })
    .where(eq(pcsTable.id, pcId))
    .returning();

  if (!pc) { res.status(404).json({ error: "PC not found" }); return; }
  res.json(serializePc(pc, null, null));
});

export default router;
