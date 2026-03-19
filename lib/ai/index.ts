/**
 * Phase 4: AI layer — synthesis and style rewrite.
 * Builds prompts and parses LLM output. Used by API route.
 */

import type { SynthesisInput, SynthesisOutput, StyleRewriteInput, StyleRewriteOutput } from "@/types/ai-types";
import { buildSynthesisPrompt, buildStyleRewritePrompt, PROMPT_VERSION } from "./prompts";
import { chatCompletion } from "./llm";

/** Parse JSON from LLM response; strip markdown code blocks if present. */
function parseJsonResponse<T>(raw: string): T | null {
  let text = raw.trim();
  const codeBlock = /^```(?:json)?\s*([\s\S]*?)```$/;
  const m = text.match(codeBlock);
  if (m) text = m[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Validate synthesis/output shape. */
function validateSynthesisOutput(obj: unknown): obj is SynthesisOutput {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.heroQuote === "string" &&
    typeof o.integratedTheme === "string" &&
    typeof o.cautionSignal === "string" &&
    typeof o.dailyGuideline === "string"
  );
}

/**
 * Run synthesis: structured reading data → coherent interpretation (JSON).
 * Returns null if LLM unavailable or parse fails.
 */
export async function runSynthesis(
  input: SynthesisInput,
  apiKey?: string
): Promise<{ data: SynthesisOutput; promptVersion: string } | null> {
  const { system, user } = buildSynthesisPrompt({
    period: input.period,
    sign: input.sign,
    signMeta: input.signMeta,
    energySummary: input.energySummary,
    domains: input.domains,
    dayMasterSummary: input.dayMasterSummary,
    elementBalanceNote: input.elementBalanceNote,
    lucky: input.lucky,
  });

  const result = await chatCompletion(
    [{ role: "system", content: system }, { role: "user", content: user }],
    { apiKey }
  );
  if (!result) return null;

  const parsed = parseJsonResponse<SynthesisOutput>(result.content);
  if (!parsed || !validateSynthesisOutput(parsed)) return null;

  return {
    data: {
      heroQuote: parsed.heroQuote,
      integratedTheme: parsed.integratedTheme,
      cautionSignal: parsed.cautionSignal,
      dailyGuideline: parsed.dailyGuideline,
      lifetimeTheme: parsed.lifetimeTheme,
    },
    promptVersion: PROMPT_VERSION,
  };
}

/**
 * Run style rewrite: approved interpretation + style key → rewritten text (JSON).
 */
export async function runStyleRewrite(
  input: StyleRewriteInput,
  apiKey?: string
): Promise<{ data: StyleRewriteOutput; promptVersion: string } | null> {
  const { system, user } = buildStyleRewritePrompt({
    style: input.style,
    interpretation: input.interpretation,
  });

  const result = await chatCompletion(
    [{ role: "system", content: system }, { role: "user", content: user }],
    { apiKey }
  );
  if (!result) return null;

  const parsed = parseJsonResponse<StyleRewriteOutput>(result.content);
  if (!parsed || !validateSynthesisOutput(parsed)) return null;

  return {
    data: {
      heroQuote: parsed.heroQuote,
      integratedTheme: parsed.integratedTheme,
      cautionSignal: parsed.cautionSignal,
      dailyGuideline: parsed.dailyGuideline,
      lifetimeTheme: parsed.lifetimeTheme,
    },
    promptVersion: PROMPT_VERSION,
  };
}

export { PROMPT_VERSION, buildSynthesisPrompt, buildStyleRewritePrompt } from "./prompts";
