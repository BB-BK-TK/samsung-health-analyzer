/**
 * Phase 4: AI layer types.
 * Structured inputs/outputs for synthesis and style rewrite.
 * All payloads are JSON-serializable for prompts and API.
 */

/** v1 supported styles. Display labels live in the style selector. */
export type ReadingStyleKey =
  | "warm_healing"
  | "best_friend"
  | "mystical_poetic"
  | "elegant_premium"
  | "direct_practical";

/** No style applied — show interpreted (rule-based) result as-is. */
export const NO_STYLE_KEY = "none" as const;

/** Structured reading data sent to synthesis. Do not include birth date/time in prompts for privacy; only derived facts. */
export interface SynthesisInput {
  /** Prompt version for reproducibility */
  promptVersion: string;
  /** Period: daily, weekly, monthly, yearly, lifetime */
  period: string;
  /** Sign name (e.g. 물병자리) */
  sign: string;
  /** Element + modality (e.g. 공기·고정) */
  signMeta: string;
  /** One-line energy/summary from engine */
  energySummary: string;
  /** Domain summaries: love, career, money, health (short strings) */
  domains: {
    love: string;
    career: string;
    money: string;
    health: string;
  };
  /** Saju: day master short description */
  dayMasterSummary: string;
  /** Saju: element balance note (e.g. dominant/deficient) */
  elementBalanceNote: string;
  /** Lucky: color, number, time (optional) */
  lucky?: { color: string; number: number; time: string };
}

/** Expected JSON output from synthesis. Must stay consistent with reading data. */
export interface SynthesisOutput {
  heroQuote: string;
  integratedTheme: string;
  cautionSignal: string;
  dailyGuideline: string;
  lifetimeTheme?: string;
}

/** Input for style rewrite: approved interpretation (from synthesis or rule-based). */
export interface StyleRewriteInput {
  /** Prompt version */
  promptVersion: string;
  style: ReadingStyleKey;
  /** Current text to rewrite — do not invent new facts */
  interpretation: SynthesisOutput;
}

/** Same shape as SynthesisOutput; content rewritten in the selected style. */
export type StyleRewriteOutput = SynthesisOutput;

/** API request body. */
export type AIApiRequest =
  | { action: "synthesis"; payload: SynthesisInput }
  | { action: "style"; payload: StyleRewriteInput };

/** API success response. */
export interface AIApiResponse {
  ok: true;
  data: SynthesisOutput | StyleRewriteOutput;
  /** Which prompt version was used */
  promptVersion: string;
}

/** API error response. */
export interface AIApiErrorResponse {
  ok: false;
  error: "AI_UNAVAILABLE" | "PARSE_ERROR" | "GUARDRAIL_VIOLATION" | "RATE_LIMIT" | string;
  message?: string;
}
