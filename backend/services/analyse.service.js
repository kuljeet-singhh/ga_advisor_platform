import { getConnectionByIdForUser } from "./connection.service.js";
import { resolveAccessTokenForSync } from "./token.service.js";
import { fetchAndStoreSnapshot } from "./snapshot.service.js";
import { formatSnapshotApiPayload } from "../utils/gaReportParser.js";
import { analyseSnapshot } from "./claude.service.js";
import {
  insertRecommendation,
  formatRecommendationResponse,
} from "./recommendation.service.js";

export async function runGaSyncForConnection({ connectionId, userId, bearerAccessToken }) {
  const connection = await getConnectionByIdForUser(connectionId, userId);
  if (!connection) {
    const err = new Error("Connection not found");
    err.status = 404;
    throw err;
  }

  const accessToken = resolveAccessTokenForSync(connection, bearerAccessToken);
  const snapshot = await fetchAndStoreSnapshot({
    connectionId: connection.id,
    propertyId: connection.property_id,
    accessToken,
  });

  return formatSnapshotApiPayload(snapshot);
}

export async function runSyncForConnection({ connectionId, userId, bearerAccessToken }) {
  const connection = await getConnectionByIdForUser(connectionId, userId);
  if (!connection) {
    const err = new Error("Connection not found");
    err.status = 404;
    throw err;
  }

  const accessToken = resolveAccessTokenForSync(connection, bearerAccessToken);
  const snapshot = await fetchAndStoreSnapshot({
    connectionId: connection.id,
    propertyId: connection.property_id,
    accessToken,
  });

  const analysis = await analyseSnapshot(snapshot.data ?? snapshot);

  const row = await insertRecommendation({
    snapshotId: snapshot.id,
    connectionId: connection.id,
    healthScore: analysis.healthScore,
    summary: analysis.summary,
    issues: analysis.issues,
  });

  return {
    ...formatRecommendationResponse({
      ...row,
      snapshot_fetched_at: snapshot.fetched_at,
    }),
    connection: {
      id: connection.id,
      propertyId: connection.property_id,
      propertyName: connection.property_name,
    },
  };
}
