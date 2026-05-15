import { Router } from "express";
import * as gaController from "../controllers/ga.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ensureDbUser } from "../middleware/dbUser.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(ensureDbUser);

router.get("/properties", gaController.listProperties);
router.post("/connections", gaController.saveConnection);

export default router;
