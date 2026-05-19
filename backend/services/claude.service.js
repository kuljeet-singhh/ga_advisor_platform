import { claudeConfig } from "../config/claude.config.js";
import {
  RECOMMENDATION_SYSTEM_PROMPT,
  parseRecommendationJson,
  isParseRetryError,
} from "./recommendation-parse.js";

async function callClaudeMessages(userContent, strictJsonOnly = false) {
  if (!claudeConfig.apiKey) {
    const err = new Error("ANTHROPIC_API_KEY is not set");
    err.status = 503;
    throw err;
  }
  const system =
    RECOMMENDATION_SYSTEM_PROMPT +
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

export async function analyseSnapshotWithClaude(gaJson) {
  const payload = typeof gaJson === "string" ? gaJson : JSON.stringify(gaJson);
  const userMessage = `GA4 runReport data (last 30 days):\n\n${payload}`;

  try {
    const text = await callClaudeMessages(userMessage, false);
    return parseRecommendationJson(text);
  } catch (firstErr) {
    if (isParseRetryError(firstErr)) {
      const text = await callClaudeMessages(
        `${userMessage}\n\nRespond with valid JSON only.`,
        true
      );
      return parseRecommendationJson(text);
    }
    throw firstErr;
  }
}
