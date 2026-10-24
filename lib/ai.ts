import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Central AI provider built on the Vercel AI SDK.
 *
 * Uses an OpenAI-compatible endpoint, so it works with Groq, OpenCode,
 * OpenRouter, Ollama, LM Studio, vLLM, etc. — just change the env vars:
 *
 *   AI_BASE_URL  - OpenAI-compatible API base URL
 *   AI_API_KEY   - API key for that endpoint (falls back to GROQ_API_KEY)
 *   AI_MODEL     - chat model id
 *   AI_URL_MODEL - (optional) model used when content contains URLs
 *
 * Defaults keep the previous Groq behavior.
 */

export const aiProvider = createOpenAICompatible({
  name: process.env.AI_PROVIDER_NAME ?? "default",
  baseURL: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
  apiKey: process.env.AI_API_KEY ?? process.env.GROQ_API_KEY,
});

export const AI_MODEL = process.env.AI_MODEL ?? "llama-3.3-70b-versatile";
export const AI_URL_MODEL = process.env.AI_URL_MODEL ?? "compound-beta";

/** True when an AI API key is configured (either AI_API_KEY or legacy GROQ_API_KEY). */
export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY ?? process.env.GROQ_API_KEY);
}

/** Resolve the model id to use for a generation. */
export function getModel(urlBased = false): string {
  return urlBased ? AI_URL_MODEL : AI_MODEL;
}
