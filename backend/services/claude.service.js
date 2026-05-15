import { claudeConfig } from "../config/claude.config.js";

export async function analyseSnapshot(_gaJson) {
  if (!claudeConfig.apiKey) {
    return { skipped: true, reason: "ANTHROPIC_API_KEY not set" };
  }
  return { skipped: true, reason: "Not implemented" };
}
