import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import pcsRouter from "./pcs.js";
import queueRouter from "./queue.js";
import sessionsRouter from "./sessions.js";
import promosRouter from "./promos.js";
import feedbackRouter from "./feedback.js";
import playersRouter from "./players.js";
import menuRouter from "./menu.js";
import dashboardRouter from "./dashboard.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pcsRouter);
router.use(queueRouter);
router.use(sessionsRouter);
router.use(promosRouter);
router.use(feedbackRouter);
router.use(playersRouter);
router.use(menuRouter);
router.use(dashboardRouter);
router.use(settingsRouter);

export default router;
