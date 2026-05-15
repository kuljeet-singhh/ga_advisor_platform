function headerName(header) {
  return header?.name ?? "";
}

export function parseGa4RunReport(gaData) {
  if (!gaData || typeof gaData !== "object") {
    return { columns: [], rows: [] };
  }

  const dimensionHeaders = (gaData.dimensionHeaders ?? []).map(headerName);
  const metricHeaders = (gaData.metricHeaders ?? []).map(headerName);
  const columns = [...dimensionHeaders, ...metricHeaders];

  if (!columns.length) {
    return { columns: [], rows: [] };
  }

  const rawRows = gaData.rows ?? [];
  const rows = rawRows.map((row) => {
    const out = {};
    const dimValues = row.dimensionValues ?? [];
    const metricValues = row.metricValues ?? [];

    dimensionHeaders.forEach((col, i) => {
      out[col] = dimValues[i]?.value ?? "";
    });
    metricHeaders.forEach((col, i) => {
      const raw = metricValues[i]?.value ?? "";
      const num = Number(raw);
      out[col] = raw !== "" && Number.isFinite(num) ? num : raw;
    });
    return out;
  });

  return { columns, rows };
}

export function formatSnapshotApiPayload(snapshotRow) {
  const gaData =
    typeof snapshotRow.data === "string" ? JSON.parse(snapshotRow.data) : snapshotRow.data;
  const { columns, rows } = parseGa4RunReport(gaData);

  return {
    snapshot: {
      id: snapshotRow.id,
      fetchedAt: snapshotRow.fetched_at,
      dateRangeStart: snapshotRow.date_range_start,
      dateRangeEnd: snapshotRow.date_range_end,
    },
    columns,
    rows,
    rowCount: rows.length,
  };
}
