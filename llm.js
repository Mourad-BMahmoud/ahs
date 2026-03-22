import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const DEFAULTS = {
  anthropic: "claude-sonnet-4-6-20250320",
  openai: "gpt-4o",
  openrouter: "anthropic/claude-sonnet-4-6",
};

/**
 * Call the configured LLM provider.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<string>} The assistant's text response
 */
export async function callLLM(systemPrompt, userMessage, maxTokens = 16000) {
  const provider = (process.env.AHS_PROVIDER || "").toLowerCase();
  const apiKey = process.env.AHS_API_KEY;
  const model = process.env.AHS_MODEL || DEFAULTS[provider];

  if (!apiKey) {
    throw new Error(
      "AHS_API_KEY is not set. Add it to your .env file or export it."
    );
  }

  if (!provider || !DEFAULTS[provider]) {
    throw new Error(
      `AHS_PROVIDER must be one of: anthropic, openai, openrouter. Got: "${provider}"`
    );
  }

  if (!model) {
    throw new Error(
      `No model configured. Set AHS_MODEL in .env or use a known provider.`
    );
  }

  if (provider === "anthropic") {
    return callAnthropic(apiKey, model, systemPrompt, userMessage, maxTokens);
  }

  // openai and openrouter both use the OpenAI SDK
  const baseURL =
    provider === "openrouter"
      ? "https://openrouter.ai/api/v1"
      : undefined;

  return callOpenAI(apiKey, model, baseURL, systemPrompt, userMessage, maxTokens);
}

async function callAnthropic(apiKey, model, systemPrompt, userMessage, maxTokens) {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!text) {
    throw new Error("Anthropic returned an empty response.");
  }
  return text;
}

async function callOpenAI(apiKey, model, baseURL, systemPrompt, userMessage, maxTokens) {
  const opts = { apiKey };
  if (baseURL) opts.baseURL = baseURL;

  const client = new OpenAI(opts);
  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI-compatible API returned an empty response.");
  }
  return text;
}
