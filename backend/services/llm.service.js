import { llmProvider } from "../config/llm.config.js";
import { analyseSnapshotWithClaude } from "./claude.service.js";
import { analyseSnapshotWithGemini } from "./gemini.service.js";

export async function analyseSnapshot(gaJson) {
  if (llmProvider === "gemini") {
    return analyseSnapshotWithGemini(gaJson);
  }
  return analyseSnapshotWithClaude(gaJson);
}
