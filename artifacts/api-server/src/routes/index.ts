import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import pcsRouter from "./pcs";
import queueRouter from "./queue";
import sessionsRouter from "./sessions";
import promosRouter from "./promos";
import feedbackRouter from "./feedback";
import playersRouter from "./players";
import menuRouter from "./menu";
import dashboardRouter from "./dashboard";

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

export default router;
