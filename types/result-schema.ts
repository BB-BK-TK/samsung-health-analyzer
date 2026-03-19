/**
 * Phase 2: Result pipeline types.
 * Layers: calculation (raw) → interpretation (facts/summary) → presentation (view-model).
 * styleReadyText is the slot for future LLM rewriting.
 */

// ============== Astrology ==============

export type AstrologyPeriodKey = "daily" | "weekly" | "monthly" | "yearly" | "lifetime";

export interface AstrologyRawCalculation {
  signKo: string;
  period: AstrologyPeriodKey;
  periodLabel: string;
  dateRange: { from: string; to: string };
  energyKey: string;
  love: { score: number; statusKey: string };
  career: { score: number; statusKey: string };
  money: { score: number; statusKey: string };
  health: { score: number; statusKey: string; bodyPartKey: string };
  lucky: { colorKey: string; number: number; timeKey: string };
  signInfo?: { element: string; modality: string; personality: string };
}

export interface AstrologyInterpretationFacts {
  energy: string;
  loveScore: number;
  careerScore: number;
  moneyScore: number;
  healthScore: number;
  loveStatus: string;
  careerStatus: string;
  moneyStatus: string;
  healthStatus: string;
  bodyPart: string;
  luckyColor: string;
  luckyNumber: number;
  luckyTime: string;
}

export interface AstrologyDomainCard {
  id: string;
  domain: "love" | "career" | "money" | "health";
  title: string;
  score: number;
  summary: string;
  keyPoint?: string;
}

export interface AstrologyReadingViewModel {
  rawCalculation: AstrologyRawCalculation;
  interpretationFacts: AstrologyInterpretationFacts;
  interpretedSummary: string;
  domainCards: AstrologyDomainCard[];
  /** Phase 3: per-sign interpretation (from interpretation engine) */
  personality?: string;
  strengths?: string[];
  cautions?: string[];
  styleReadyText: {
    heroQuote: string;
    energyLabel: string;
    domainLabels: Record<string, string>;
  };
  metadata: {
    period: AstrologyPeriodKey;
    periodLabel: string;
    sign: string;
    dateLabel: string;
    source: "astrology";
  };
}

export interface AstrologyCompatibilityResult {
  score: number;
  summary: string;
  strengths: string[];
  challenges: string[];
  /** Phase 3: rule-based explanation */
  attractionPattern?: string;
  communicationPattern?: string;
  cautionAreas?: string[];
}

// ============== Saju ==============

export interface SajuPillarRaw {
  type: string;
  stem: number;
  branch: number;
  ganji: string;
  korean: string;
  hanja: string;
  animal: string;
}

export interface SajuRawCalculation {
  pillars: { type: string; korean: string; hanja: string; animal: string }[];
  dayMaster: { stem?: number; hanja: string; korean: string; meaning: string };
  elementsPercent: Record<string, number>;
  excessElement: { element: string; meaning: string } | null;
  deficientElement: { element: string; meaning: string } | null;
  ilgan: string;
  ilganInfo?: { 상징: string; 장점: string; 단점: string; 성격: string };
  zodiacAnimal: string;
}

export interface SajuInterpretationFacts {
  dayMasterPersonality: string;
  dayMasterStrengths: string;
  dayMasterCautions: string;
  dominantElement: string | null;
  weakElement: string | null;
  elementBalanceNote: string;
  /** Phase 3: domain-specific reading */
  relationshipsReading?: string;
  workReading?: string;
  moneyReading?: string;
  healthReading?: string;
  internalBalanceSummary?: string;
  practicalAdvice?: string;
}

export interface SajuDomainCard {
  id: string;
  domain: "character" | "strengths" | "cautions" | "advice" | "relationships" | "work" | "money" | "health";
  title: string;
  summary: string;
  keyPoint?: string;
}

export interface SajuReadingViewModel {
  rawCalculation: SajuRawCalculation;
  interpretationFacts: SajuInterpretationFacts;
  interpretedSummary: string;
  domainCards: SajuDomainCard[];
  styleReadyText: {
    dayMasterLabel: string;
    themeLabel: string;
    adviceIntro: string;
  };
  metadata: {
    birthDate: string;
    birthTime?: string;
    source: "saju";
  };
}

// ============== Unified result (for UI) ==============

export interface HeroSummaryViewModel {
  message: string;
  dateLabel: string;
  period: AstrologyPeriodKey;
  /** Optional: e.g. lifetime theme one-liner */
  subtitle?: string;
}

export interface DomainCardViewModel {
  id: string;
  domain: string;
  title: string;
  score?: number;
  summary: string;
  keyPoint?: string;
  variant?: "purple" | "teal" | "gold";
}

export interface WhyThisResultSection {
  title: string;
  content: string;
  source: "astrology" | "saju";
}

export interface MetadataTagViewModel {
  label: string;
  value: string;
  source?: "astrology" | "saju";
}

/** Full result after interpretation + presentation. UI consumes this. */
export interface ResultViewModel {
  heroSummary: HeroSummaryViewModel;
  domainCards: DomainCardViewModel[];
  whyThisResult: {
    sections: WhyThisResultSection[];
    /** Short "based on" line */
    basedOn: string;
  };
  metadataTags: MetadataTagViewModel[];
  astrology: {
    byPeriod: Record<AstrologyPeriodKey, AstrologyReadingViewModel | null>;
    compatibility: AstrologyCompatibilityResult | null;
    /** Big three for display */
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planets: { name: string; symbol: string; sign: string; house: number }[];
  };
  saju: SajuReadingViewModel;
  /** Five-element chart data (normalized for chart component) */
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    analysis: {
      excess: { element: string; meaning: string } | null;
      deficient: { element: string; meaning: string } | null;
    };
  };
  /** Actions for micro-action card; can be derived from domainCards later */
  microActions: { id: string; text: string; tag: string }[];
  /** Future: LLM can overwrite these without changing structure */
  styleReadyText: {
    heroQuote: string;
    integratedTheme: string;
    cautionSignal: string;
    dailyGuideline: string;
    lifetimeTheme?: string;
  };
}
