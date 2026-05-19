export const RECOMMENDATION_SYSTEM_PROMPT = `You are a senior analytics consultant. Analyze the provided GA4 report JSON and respond with ONLY valid JSON (no markdown fences) matching this schema:
{
  "healthScore": <integer 0-100>,
  "summary": "<one paragraph>",
  "issues": [
    {
      "page": "",
      "metric": "",
      "currentValue": "",
      "benchmark": "",
      "issue": "",
      "rootCause": "",
      "recommendation": "",
      "impact": "high | medium | low",
      "estimatedImprovement": ""
    }
  ]
}
Scoring: 80-100 healthy, 60-79 needs attention, below 60 critical. Include 2-5 actionable issues based on the data.`;

export function stripMarkdownFences(text) {
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return s.trim();
}

export function parseRecommendationJson(text) {
  const raw = stripMarkdownFences(text);
  const parsed = JSON.parse(raw);
  if (typeof parsed.healthScore !== "number") {
    throw new Error("Invalid LLM response: healthScore missing");
  }
  if (!Array.isArray(parsed.issues)) {
    parsed.issues = [];
  }
  return {
    healthScore: Math.round(Math.max(0, Math.min(100, parsed.healthScore))),
    summary: String(parsed.summary ?? ""),
    issues: parsed.issues,
  };
}

export function isParseRetryError(err) {
  return (
    err instanceof SyntaxError ||
    (err instanceof Error && err.message?.includes("Invalid LLM"))
  );
}
