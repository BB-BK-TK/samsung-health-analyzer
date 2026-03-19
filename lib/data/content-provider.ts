/**
 * Phase 5: Single access point for content and presets.
 * Currently reads from in-memory TS modules; can be swapped for Supabase later.
 * See DB_SCHEMA_PROPOSAL.md and types/db-schema.ts.
 */

import { getSignContent, PERIOD_TONE } from "@/lib/interpretation/astrology-content";
import type { SignInterpretationContent } from "@/lib/interpretation/astrology-content";
import { getElementMeaning, getDayMasterDomainTendency } from "@/lib/interpretation/saju-content";
import type { ElementMeaning } from "@/lib/interpretation/saju-content";
import { getElementPairing, getModalityNote } from "@/lib/interpretation/compatibility-content";
import type { ReadingStyleKey } from "@/types/ai-types";

const NO_STYLE_KEY = "none" as const;
export type StyleOption = ReadingStyleKey | typeof NO_STYLE_KEY;

/** Style presets: single source for form and display. Replace with DB query later. */
export const STYLE_PRESETS: { value: StyleOption; label: string; description?: string }[] = [
  { value: NO_STYLE_KEY, label: "원문", description: "기준 해석 그대로" },
  { value: "warm_healing", label: "따뜻·치유" },
  { value: "best_friend", label: "친구처럼" },
  { value: "mystical_poetic", label: "신비·시적" },
  { value: "elegant_premium", label: "우아·프리미엄" },
  { value: "direct_practical", label: "직설·실용" },
];

export { NO_STYLE_KEY };

export function getSignInterpretation(signKey: string): SignInterpretationContent | null {
  return getSignContent(signKey);
}

export function getPeriodTone(periodKey: string): { intro: string; suffix: string } | undefined {
  return PERIOD_TONE[periodKey];
}

export function getStylePresets(): { value: StyleOption; label: string; description?: string }[] {
  return STYLE_PRESETS;
}

export function getSajuElementMeaning(elementKey: string): ElementMeaning | null {
  return getElementMeaning(elementKey);
}

export function getDayMasterTendency(ilgan: string): { relationships: string; work: string; money: string; health: string } | null {
  return getDayMasterDomainTendency(ilgan);
}

export function getCompatibilityPairing(element1: string, element2: string) {
  return getElementPairing(element1, element2);
}

export function getCompatibilityModalityNote(modality1: string, modality2: string): string {
  return getModalityNote(modality1, modality2);
}
