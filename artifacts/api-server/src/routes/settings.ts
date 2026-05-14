import { Router } from "express";
import { getSessionUser } from "./auth";

const router = Router();

const defaultSettings = {
  shopName: "GGX Gaming Center",
  standardRatePerHour: 25,
  vipRatePerHour: 50,
  overnightRate: 99,
  studentDiscount: 20,
  openTime: "08:00",
  closeTime: "02:00",
  maxSessionHours: 12,
  allowAnonymousFeedback: true,
  maintenanceMode: false,
};

let shopSettings = { ...defaultSettings };

router.get("/settings", async (req, res): Promise<void> => {
  res.json(shopSettings);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const userId = getSessionUser(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  shopSettings = { ...shopSettings, ...req.body };
  res.json(shopSettings);
});

export default router;
