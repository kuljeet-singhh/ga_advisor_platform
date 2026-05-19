import { geminiConfig } from "../config/gemini.config.js";
import {
  RECOMMENDATION_SYSTEM_PROMPT,
  parseRecommendationJson,
  isParseRetryError,
} from "./recommendation-parse.js";

async function callGeminiGenerateContent(userContent, strictJsonOnly = false) {
  if (!geminiConfig.apiKey) {
    const err = new Error("GEMINI_API_KEY is not set");
    err.status = 503;
    throw err;
  }

  const systemText =
    RECOMMENDATION_SYSTEM_PROMPT +
    (strictJsonOnly ? "\nReturn JSON only. No prose before or after." : "");

  const model = encodeURIComponent(geminiConfig.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiConfig.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.error?.message ||
      data.error?.status ||
      (typeof data.error === "string" ? data.error : null) ||
      res.statusText ||
      "gemini_api_error";

    if (res.status === 429 || /quota|rate.?limit/i.test(String(msg))) {
      const err = new Error(
        "Gemini API quota exceeded. Try GEMINI_MODEL=gemini-2.5-flash-lite, wait for reset, or set LLM_PROVIDER=claude."
      );
      err.status = 429;
      err.code = "LLM_QUOTA_EXCEEDED";
      throw err;
    }

    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty Gemini response");
  }
  return text;
}

export async function analyseSnapshotWithGemini(gaJson) {
  const payload = typeof gaJson === "string" ? gaJson : JSON.stringify(gaJson);
  const userMessage = `GA4 runReport data (last 30 days):\n\n${payload}`;

  try {
    const text = await callGeminiGenerateContent(userMessage, false);
    return parseRecommendationJson(text);
  } catch (firstErr) {
    if (firstErr?.code === "LLM_QUOTA_EXCEEDED") {
      throw firstErr;
    }
    if (isParseRetryError(firstErr)) {
      const text = await callGeminiGenerateContent(
        `${userMessage}\n\nRespond with valid JSON only.`,
        true
      );
      return parseRecommendationJson(text);
    }
    throw firstErr;
  }
}
