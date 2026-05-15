import { listGa4PropertiesForPicker } from "../services/ga.service.js";
import { upsertConnectionForUser } from "../services/connection.service.js";

export async function listProperties(req, res, next) {
  try {
    const token = req.bearerAccessToken;
    if (!token) {
      return res.status(401).json({ error: "Google access token required (sign in with Google)" });
    }
    const properties = await listGa4PropertiesForPicker(token);
    res.json({ properties });
  } catch (e) {
    next(e);
  }
}

export async function saveConnection(req, res, next) {
  try {
    const token = req.bearerAccessToken;
    if (!token) {
      return res.status(401).json({ error: "Google access token required" });
    }
    const { propertyId, propertyName, accessTokenExpiresAtMs } = req.body || {};
    if (!propertyId || typeof propertyId !== "string") {
      return res.status(400).json({ error: "propertyId is required" });
    }
    const name =
      typeof propertyName === "string" && propertyName.trim() ? propertyName.trim() : propertyId;

    const row = await upsertConnectionForUser({
      userId: req.dbUserId,
      propertyId: propertyId.trim(),
      propertyName: name,
      accessTokenPlain: token,
      refreshTokenPlain: null,
      accessTokenExpiresAtMs,
    });

    res.status(201).json({
      connection: {
        id: row.id,
        propertyId: row.property_id,
        propertyName: row.property_name,
        tokenExpiresAt: row.token_expires_at,
        connectedAt: row.connected_at,
      },
    });
  } catch (e) {
    next(e);
  }
}
