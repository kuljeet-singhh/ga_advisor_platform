const ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";
const DATA_BASE = "https://analyticsdata.googleapis.com/v1beta";

const RUN_REPORT_BODY = {
  dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
  dimensions: [
    { name: "pagePath" },
    { name: "deviceCategory" },
    { name: "sessionDefaultChannelGroup" },
    { name: "country" },
  ],
  metrics: [
    { name: "sessions" },
    { name: "bounceRate" },
    { name: "averageSessionDuration" },
    { name: "conversions" },
    { name: "screenPageViews" },
    { name: "newUsers" },
    { name: "totalUsers" },
  ],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 25,
};

export async function listGa4PropertiesForPicker(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const out = [];
  let pageToken = "";

  for (;;) {
    const url = new URL(`${ADMIN_BASE}/accountSummaries`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error?.message || data.message || res.statusText || "admin_api_error";
      const err = new Error(msg);
      err.status = res.status;
      err.details = data;
      throw err;
    }

    const summaries = data.accountSummaries || [];
    for (const sum of summaries) {
      const props = sum.propertySummaries || [];
      for (const ps of props) {
        const resource = ps.property || "";
        const id = resource.startsWith("properties/") ? resource.slice("properties/".length) : resource;
        if (!id) continue;
        out.push({
          id,
          propertyId: id,
          displayName: ps.displayName || id,
          name: ps.displayName || id,
          accountDisplayName: sum.displayName || null,
        });
      }
    }

    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
  }

  return out;
}

export async function runGa4Report(propertyId, accessToken) {
  const url = `${DATA_BASE}/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(RUN_REPORT_BODY),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText || "ga_data_api_error";
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}
