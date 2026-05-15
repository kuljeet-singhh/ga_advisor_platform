const ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";

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
