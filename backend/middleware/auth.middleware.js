import { verifyGoogleAccessToken } from "../utils/googleAuth.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.slice(7).trim();
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await verifyGoogleAccessToken(accessToken);
    if (user) {
      req.userId = user.sub;
      req.authEmail = user.email;
      req.bearerAccessToken = accessToken;
      return next();
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (process.env.NODE_ENV !== "production") {
    const userId = req.headers["x-user-id"];
    if (userId) {
      req.userId = String(userId);
      req.bearerAccessToken = undefined;
      return next();
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
}

export const requireUser = requireAuth;
