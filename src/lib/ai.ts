// Claude Agent SDK helpers for KidsVax
// All AI features use server-side agents via Next.js API routes

export const AI_MODEL = "claude-sonnet-4-6";
export const AI_MODEL_LIGHT = "claude-haiku-4-5";

export const DEFAULT_AGENT_OPTIONS = {
  maxTurns: 10,
  maxBudgetUsd: 0.5,
  permissionMode: "bypassPermissions" as const,
};
