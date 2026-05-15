import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, authController.me);
router.post("/google/callback", authController.googleCallbackPlaceholder);

export default router;
