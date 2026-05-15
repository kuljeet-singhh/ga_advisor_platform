import { claudeConfig } from "../config/claude.config.js";

const SYSTEM_PROMPT = `You are a senior analytics consultant. Analyze the provided GA4 report JSON and respond with ONLY valid JSON (no markdown fences) matching this schema:
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

function stripMarkdownFences(text) {
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return s.trim();
}

function parseRecommendationJson(text) {
  const raw = stripMarkdownFences(text);
  const parsed = JSON.parse(raw);
  if (typeof parsed.healthScore !== "number") {
    throw new Error("Invalid Claude response: healthScore missing");
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

async function callClaudeMessages(userContent, strictJsonOnly = false) {
  if (!claudeConfig.apiKey) {
    const err = new Error("ANTHROPIC_API_KEY is not set");
    err.status = 503;
    throw err;
  }
  const system =
    SYSTEM_PROMPT +
    (strictJsonOnly ? "\nReturn JSON only. No prose before or after." : "");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": claudeConfig.apiKey,
      "anthropic-version": claudeConfig.apiVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: claudeConfig.model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "claude_api_error";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const text = data.content?.[0]?.text;
  if (!text) {
    throw new Error("Empty Claude response");
  }
  return text;
}

export async function analyseSnapshot(gaJson) {
  const payload = typeof gaJson === "string" ? gaJson : JSON.stringify(gaJson);
  const userMessage = `GA4 runReport data (last 30 days):\n\n${payload}`;

  try {
    const text = await callClaudeMessages(userMessage, false);
    return parseRecommendationJson(text);
  } catch (firstErr) {
    if (firstErr instanceof SyntaxError || firstErr.message?.includes("Invalid Claude")) {
      const text = await callClaudeMessages(
        `${userMessage}\n\nRespond with valid JSON only.`,
        true
      );
      return parseRecommendationJson(text);
    }
    throw firstErr;
  }
}
