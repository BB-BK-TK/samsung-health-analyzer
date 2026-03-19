/**
 * Phase 3: Rule-based astrology interpreter.
 * Consumes raw period data + sign content; produces rich interpretation (personality, strengths, cautions, domain guidance, period tone).
 */

import type { AstrologyPeriodKey, AstrologyDomainCard, AstrologyInterpretationFacts } from "@/types/result-schema";
import type { AstrologyRawPerPeriod } from "@/lib/calculation-layer";
import { getSignContent } from "./astrology-content";
import { PERIOD_TONE } from "./astrology-content";

export interface AstrologyRichInterpretation {
  period: AstrologyPeriodKey;
  interpretationFacts: AstrologyInterpretationFacts;
  interpretedSummary: string;
  domainCards: AstrologyDomainCard[];
  /** Phase 3: per-sign content */
  personality: string;
  strengths: string[];
  cautions: string[];
  periodToneIntro: string;
  periodToneSuffix: string;
}

export function interpretAstrologyPeriod(raw: AstrologyRawPerPeriod): AstrologyRichInterpretation {
  const content = getSignContent(raw.signKo);
  const tone = PERIOD_TONE[raw.period] ?? { intro: "오늘은", suffix: " 흐름을 참고하세요." };

  const personality = content?.personality ?? raw.signInfo?.personality ?? `${raw.signKo}의 성향이 반영된 기운입니다.`;
  const strengths = content?.strengths ?? [];
  const cautions = content?.cautions ?? [];

  const facts: AstrologyInterpretationFacts = {
    energy: raw.energy,
    loveScore: raw.love.score,
    careerScore: raw.career.score,
    moneyScore: raw.money.score,
    healthScore: raw.health.score,
    loveStatus: raw.love.status,
    careerStatus: raw.career.status,
    moneyStatus: raw.money.status,
    healthStatus: raw.health.status,
    bodyPart: raw.health.bodyPart,
    luckyColor: raw.lucky.color,
    luckyNumber: raw.lucky.number,
    luckyTime: raw.lucky.time,
  };

  const loveGuidance = content?.domainGuidance.love ?? raw.love.status;
  const careerGuidance = content?.domainGuidance.career ?? raw.career.status;
  const moneyGuidance = content?.domainGuidance.money ?? raw.money.status;
  const healthGuidance = content?.domainGuidance.health ?? `${raw.health.status}. ${raw.health.bodyPart} 케어를 권합니다.`;

  const domainCards: AstrologyDomainCard[] = [
    { id: "love", domain: "love", title: "연애", score: raw.love.score, summary: `${raw.love.status} (${raw.love.score}/5). ${loveGuidance}`, keyPoint: loveGuidance },
    { id: "career", domain: "career", title: "커리어", score: raw.career.score, summary: `${raw.career.status} (${raw.career.score}/5). ${careerGuidance}`, keyPoint: careerGuidance },
    { id: "money", domain: "money", title: "재물", score: raw.money.score, summary: `${raw.money.status} (${raw.money.score}/5). ${moneyGuidance}`, keyPoint: moneyGuidance },
    { id: "health", domain: "health", title: "건강", score: raw.health.score, summary: `${raw.health.status} (${raw.health.score}/5). ${healthGuidance}`, keyPoint: raw.health.bodyPart },
  ];

  const intro = tone.intro ? `${raw.signKo} ${tone.intro}` : `${raw.signKo}`;
  const interpretedSummary = raw.period === "lifetime"
    ? raw.summary
    : `${intro} ${raw.energy}한 흐름이 예상됩니다. 연애는 ${raw.love.status}, 커리어는 ${raw.career.status}.${tone.suffix}`;

  return {
    period: raw.period,
    interpretationFacts: facts,
    interpretedSummary,
    domainCards,
    personality,
    strengths,
    cautions,
    periodToneIntro: tone.intro,
    periodToneSuffix: tone.suffix,
  };
}
