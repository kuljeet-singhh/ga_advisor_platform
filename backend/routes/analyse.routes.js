import { Router } from "express";
import * as analyseController from "../controllers/analyse.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/sync/:connectionId", requireAuth, analyseController.syncConnection);
router.get("/recommendations/latest", requireAuth, analyseController.latestRecommendations);
router.post("/cron/daily-sync", analyseController.dailyCron);

export default router;
