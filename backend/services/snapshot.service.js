import { query } from "../config/db.js";
import { runGa4Report, runGa4ReportForConnection } from "./ga.service.js";
import { formatSnapshotApiPayload } from "../utils/gaReportParser.js";
import { getConnectionByUserId } from "./connection.service.js";

function getDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function fetchAndStoreSnapshot({ connectionId, propertyId, connection, accessToken }) {
  const gaData = connection?.refresh_token_encrypted
    ? await runGa4ReportForConnection(propertyId, connection)
    : await runGa4Report(propertyId, accessToken);
  const { startDate, endDate } = getDateRange();

  const result = await query(
    `INSERT INTO ga_snapshots (connection_id, data, date_range_start, date_range_end)
     VALUES ($1, $2::jsonb, $3::date, $4::date)
     RETURNING id, connection_id, fetched_at, date_range_start, date_range_end`,
    [connectionId, JSON.stringify(gaData), startDate, endDate]
  );
  return { ...result.rows[0], data: gaData };
}

export async function getLatestSnapshotForConnection(connectionId) {
  const result = await query(
    `SELECT id, connection_id, data, fetched_at, date_range_start, date_range_end
     FROM ga_snapshots
     WHERE connection_id = $1
     ORDER BY fetched_at DESC
     LIMIT 1`,
    [connectionId]
  );
  return result.rows[0] ?? null;
}

export async function getLatestSnapshotPayloadForUser(userId) {
  const connection = await getConnectionByUserId(userId);
  if (!connection) return null;

  const snapshot = await getLatestSnapshotForConnection(connection.id);
  if (!snapshot) return null;

  return formatSnapshotApiPayload(snapshot);
}
