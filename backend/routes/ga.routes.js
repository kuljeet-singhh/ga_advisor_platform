import { Router } from "express";
import * as gaController from "../controllers/ga.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ensureDbUser } from "../middleware/dbUser.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/properties", gaController.listProperties);
router.get("/connection", ensureDbUser, gaController.getConnection);
router.post("/connections", ensureDbUser, gaController.saveConnection);

export default router;
