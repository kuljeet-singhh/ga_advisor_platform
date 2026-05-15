export function syncConnection(_req, res) {
  res.status(501).json({ error: "Sync not implemented" });
}

export function latestRecommendations(_req, res) {
  res.status(404).json({ error: "No recommendations yet" });
}

export function dailyCron(_req, res) {
  res.status(501).json({ error: "Cron batch not implemented" });
}
