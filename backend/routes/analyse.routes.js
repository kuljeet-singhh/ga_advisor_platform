import { Router } from "express";
import * as analyseController from "../controllers/analyse.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ensureDbUser } from "../middleware/dbUser.middleware.js";

const router = Router();

router.post(
  "/sync/:connectionId",
  requireAuth,
  ensureDbUser,
  analyseController.syncConnection
);
router.get(
  "/recommendations/latest",
  requireAuth,
  ensureDbUser,
  analyseController.latestRecommendations
);
router.post("/cron/daily-sync", analyseController.dailyCron);

export default router;
