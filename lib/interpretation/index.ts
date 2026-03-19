/**
 * Phase 3: Interpretation engine — rule-based content and interpreters.
 * Content is in *-content.ts; logic is in *-interpreter.ts.
 * Easy to move content to DB later.
 */

export { getSignContent, SIGN_INTERPRETATION, PERIOD_TONE } from "./astrology-content";
export type { SignKey, SignInterpretationContent } from "./astrology-content";

export { interpretAstrologyPeriod } from "./astrology-interpreter";
export type { AstrologyRichInterpretation } from "./astrology-interpreter";

export { interpretCompatibility } from "./compatibility-interpreter";

export { getElementPairing, getModalityNote } from "./compatibility-content";
export type { ElementKey as CompatElementKey, ModalityKey } from "./compatibility-content";

export { getElementMeaning, getDayMasterDomainTendency, ELEMENT_MEANINGS, DAY_MASTER_DOMAIN_TENDENCY } from "./saju-content";
export type { ElementKey as SajuElementKey, ElementMeaning } from "./saju-content";

export { interpretSaju } from "./saju-interpreter";
export type { SajuRichInterpretation } from "./saju-interpreter";
