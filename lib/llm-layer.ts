/**
 * Phase 2 + Phase 4 — Layer 4: LLM / style.
 * Phase 4 implementation lives in lib/ai/ and POST /api/ai.
 * This file keeps the original interface for compatibility; the app uses the API route and StyleSelector.
 */

import type { ResultViewModel } from "@/types/result-schema";

export interface LLMStyleInput {
  styleReadyText: ResultViewModel["styleReadyText"];
  /** Optional: tone/style preference from user (e.g. warm_healing, direct_practical). */
  toneStyle?: string;
  /** Optional: interests to emphasize. */
  interests?: string[];
}

export interface LLMStyleOutput {
  heroQuote?: string;
  integratedTheme?: string;
  cautionSignal?: string;
  dailyGuideline?: string;
  lifetimeTheme?: string;
}

/**
 * Client-side: call the Phase 4 API for style rewrite. Use when you have styleReadyText and a style key.
 * Prefer using the StyleSelector component and /api/ai from the page.
 */
export async function rewriteWithLLM(input: LLMStyleInput): Promise<LLMStyleOutput> {
  const style = input.toneStyle as string | undefined;
  if (!style) return {};
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "style",
        payload: {
          promptVersion: "v1",
          style,
          interpretation: {
            heroQuote: input.styleReadyText.heroQuote,
            integratedTheme: input.styleReadyText.integratedTheme,
            cautionSignal: input.styleReadyText.cautionSignal,
            dailyGuideline: input.styleReadyText.dailyGuideline,
            lifetimeTheme: input.styleReadyText.lifetimeTheme ?? "",
          },
        },
      }),
    });
    const json = await res.json();
    if (json.ok && json.data) return json.data;
  } catch {
    // fallback: no overwrites
  }
  return {};
}
