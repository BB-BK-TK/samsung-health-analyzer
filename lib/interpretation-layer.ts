/**
 * Phase 2 + Phase 3 — Layer 2: Interpretation.
 * Consumes raw calculation output. Produces interpretationFacts, interpretedSummary, domainCards.
 * Phase 3: Delegates to rule-based interpretation modules (astrology, saju, compatibility).
 */

import type { AstrologyPeriodKey } from "@/types/result-schema";
import type { CalculationResult } from "./calculation-layer";
import { interpretAstrologyPeriod } from "./interpretation/astrology-interpreter";
import { interpretSaju } from "./interpretation/saju-interpreter";

export type { AstrologyRichInterpretation as AstrologyInterpreted } from "./interpretation/astrology-interpreter";
export type { SajuRichInterpretation as SajuInterpreted } from "./interpretation/saju-interpreter";

/**
 * Build interpretation from raw calculation result.
 * Uses Phase 3 rule-based interpreters for richer, separated content.
 */
export function runInterpretation(calculation: CalculationResult): {
  astrology: Record<AstrologyPeriodKey, import("./interpretation/astrology-interpreter").AstrologyRichInterpretation | null>;
  saju: import("./interpretation/saju-interpreter").SajuRichInterpretation;
} {
  const astrology = {
    daily: calculation.astrology.byPeriod.daily ? interpretAstrologyPeriod(calculation.astrology.byPeriod.daily) : null,
    weekly: calculation.astrology.byPeriod.weekly ? interpretAstrologyPeriod(calculation.astrology.byPeriod.weekly) : null,
    monthly: calculation.astrology.byPeriod.monthly ? interpretAstrologyPeriod(calculation.astrology.byPeriod.monthly) : null,
    yearly: calculation.astrology.byPeriod.yearly ? interpretAstrologyPeriod(calculation.astrology.byPeriod.yearly) : null,
    lifetime: calculation.astrology.byPeriod.lifetime ? interpretAstrologyPeriod(calculation.astrology.byPeriod.lifetime) : null,
  };
  const saju = interpretSaju(calculation.saju);
  return { astrology, saju };
}
