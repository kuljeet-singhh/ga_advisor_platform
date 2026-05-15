import { getPool } from "../config/db.js";
import { upsertUserByGoogleId } from "../services/user.service.js";

export async function ensureDbUser(req, res, next) {
  if (!getPool()) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    const row = await upsertUserByGoogleId({
      googleId: req.userId,
      email: req.authEmail,
      name: null,
    });
    req.dbUser = row;
    req.dbUserId = row.id;
    next();
  } catch (e) {
    next(e);
  }
}
