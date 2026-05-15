import { query } from "../config/db.js";

export function getMockRecommendationPayload() {
  return {
    recommendation: {
      healthScore: 72,
      summary: "Sample analysis — run sync for live data.",
      issues: [
        {
          page: "/checkout",
          metric: "bounceRate",
          currentValue: "68%",
          benchmark: "45%",
          issue: "High exit rate on checkout",
          rootCause: "Possible friction in payment step",
          recommendation: "Simplify checkout fields and add trust badges near payment.",
          impact: "high",
          estimatedImprovement: "10–15% conversion lift",
        },
        {
          page: "/blog",
          metric: "sessions",
          currentValue: "low",
          benchmark: "site average",
          issue: "Blog traffic underperforming",
          rootCause: "Limited internal linking from high-traffic pages",
          recommendation: "Add contextual links from top landing pages to key blog posts.",
          impact: "medium",
          estimatedImprovement: "5–8% more engaged sessions",
        },
      ],
      generatedAt: new Date().toISOString(),
    },
    snapshot: { fetchedAt: null },
    mock: true,
  };
}

export async function getLatestRecommendationForConnection(connectionId) {
  const result = await query(
    `SELECT r.id, r.health_score, r.summary, r.issues, r.generated_at,
            s.fetched_at AS snapshot_fetched_at
     FROM recommendations r
     JOIN ga_snapshots s ON s.id = r.snapshot_id
     WHERE r.connection_id = $1
     ORDER BY r.generated_at DESC
     LIMIT 1`,
    [connectionId]
  );
  return result.rows[0] ?? null;
}

export async function insertRecommendation({
  snapshotId,
  connectionId,
  healthScore,
  summary,
  issues,
}) {
  const result = await query(
    `INSERT INTO recommendations (snapshot_id, connection_id, health_score, summary, issues)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, snapshot_id, connection_id, health_score, summary, issues, generated_at`,
    [snapshotId, connectionId, healthScore, summary, JSON.stringify(issues ?? [])]
  );
  return result.rows[0];
}

export function formatRecommendationResponse(row) {
  const issues = Array.isArray(row.issues)
    ? row.issues
    : typeof row.issues === "string"
      ? JSON.parse(row.issues)
      : [];
  return {
    recommendation: {
      id: row.id,
      healthScore: row.health_score,
      summary: row.summary,
      issues,
      generatedAt: row.generated_at,
    },
    snapshot: {
      fetchedAt: row.snapshot_fetched_at ?? null,
    },
    mock: false,
  };
}

export function shouldUseMockRecommendations() {
  return process.env.MOCK_RECOMMENDATIONS === "1";
}
