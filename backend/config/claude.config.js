export const claudeConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
  apiVersion: process.env.ANTHROPIC_API_VERSION || "2023-06-01",
};
