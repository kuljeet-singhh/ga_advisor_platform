import { getConnectionByUserId } from "../services/connection.service.js";
import {
  getLatestRecommendationForConnection,
  getMockRecommendationPayload,
  formatRecommendationResponse,
} from "../services/recommendation.service.js";
import { runSyncForConnection } from "../services/analyse.service.js";

export async function latestRecommendations(req, res, next) {
  try {
    const connection = await getConnectionByUserId(req.dbUserId);
    if (!connection) {
      return res.status(404).json({ error: "No GA4 property connected" });
    }

    const row = await getLatestRecommendationForConnection(connection.id);
    if (row) {
      return res.json(formatRecommendationResponse(row));
    }

    return res.json(getMockRecommendationPayload());
  } catch (e) {
    next(e);
  }
}

export async function syncConnection(req, res, next) {
  try {
    const { connectionId } = req.params;
    if (!connectionId) {
      return res.status(400).json({ error: "connectionId is required" });
    }

    const result = await runSyncForConnection({
      connectionId,
      userId: req.dbUserId,
      bearerAccessToken: req.bearerAccessToken,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export function dailyCron(_req, res) {
  res.status(501).json({ error: "Cron batch not implemented" });
}
