import { query } from "../config/db.js";
import { runGa4Report } from "./ga.service.js";

function getDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function fetchAndStoreSnapshot({ connectionId, propertyId, accessToken }) {
  const gaData = await runGa4Report(propertyId, accessToken);
  const { startDate, endDate } = getDateRange();

  const result = await query(
    `INSERT INTO ga_snapshots (connection_id, data, date_range_start, date_range_end)
     VALUES ($1, $2::jsonb, $3::date, $4::date)
     RETURNING id, connection_id, fetched_at, date_range_start, date_range_end`,
    [connectionId, JSON.stringify(gaData), startDate, endDate]
  );
  return { ...result.rows[0], data: gaData };
}
