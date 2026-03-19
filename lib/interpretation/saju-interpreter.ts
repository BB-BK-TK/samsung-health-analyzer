/**
 * Phase 3: Rule-based saju interpreter.
 * Consumes raw saju output; produces day master interpretation, element balance, dominant/deficient meaning, internal balance summary, practical advice, domain-specific reading.
 */

import type { SajuDomainCard, SajuInterpretationFacts } from "@/types/result-schema";
import type { SajuRawOutput } from "@/lib/calculation-layer";
import { getElementMeaning, getDayMasterDomainTendency } from "./saju-content";

export interface SajuRichInterpretation {
  interpretationFacts: SajuInterpretationFacts;
  interpretedSummary: string;
  domainCards: SajuDomainCard[];
}

export function interpretSaju(raw: SajuRawOutput): SajuRichInterpretation {
  const ilgan = raw.ilganInfo;
  const dominant = raw.excess?.element ?? null;
  const weak = raw.deficient?.element ?? null;

  const dayMasterPersonality = raw.dayMaster.meaning || "";
  const dayMasterStrengths = ilgan?.장점 ?? "다양한 강점";
  const dayMasterCautions = ilgan?.단점 ?? "무리하지 않기";

  const dominantMeaning = dominant ? getElementMeaning(dominant)?.dominantMeaning ?? raw.excess?.meaning ?? "" : "";
  const deficientMeaning = weak ? getElementMeaning(weak)?.deficientMeaning ?? raw.deficient?.meaning ?? "" : "";
  const elementBalanceNote =
    !dominant && !weak
      ? "오행이 고르게 분포되어 있어요. 균형을 유지하는 습관이 좋습니다."
      : [raw.excess?.meaning, raw.deficient?.meaning].filter(Boolean).join(" ") || "균형을 유지하세요.";

  const internalBalanceSummary =
    dominant && weak
      ? `${dominant} 기운이 강하고 ${weak} 기운이 부족한 편입니다. ${dominantMeaning} ${deficientMeaning}`
      : dominant
        ? `${dominant} 기운이 두드러집니다. ${dominantMeaning}`
        : weak
          ? `${weak} 기운을 보강하면 좋습니다. ${deficientMeaning}`
          : "오행이 고르게 분포되어 있어 안정적입니다. 현재 흐름을 유지하세요.";

  const tendency = getDayMasterDomainTendency(raw.ilgan);
  const relationshipsReading = tendency?.relationships ?? "일간 성향에 맞는 관계는 서로 존중하고 대화를 나누는 것입니다.";
  const workReading = tendency?.work ?? "일간의 강점을 살린 업무 선택이 성과로 이어집니다.";
  const moneyReading = tendency?.money ?? "계획적 지출과 비상금 확보를 우선으로 하세요.";
  const healthReading = tendency?.health ?? "규칙적인 수면과 식사, 적당한 활동이 기본입니다.";

  const practicalAdvice =
    dominant && weak
      ? `강한 ${dominant} 기운은 조절하고, 부족한 ${weak} 기운은 작은 습관으로 보강해 보세요.`
      : dominant
        ? `${dominant} 기운이 강하니 과한 부분은 절제하고 휴식을 챙기세요.`
        : weak
          ? `${weak} 기운을 보강하는 활동(색상, 방위, 습관)을 조금씩 도입해 보세요.`
          : "현재 균형을 유지하면서 무리하지 않는 것이 좋습니다.";

  const interpretationFacts: SajuInterpretationFacts = {
    dayMasterPersonality,
    dayMasterStrengths,
    dayMasterCautions,
    dominantElement: dominant,
    weakElement: weak,
    elementBalanceNote,
    relationshipsReading,
    workReading,
    moneyReading,
    healthReading,
    internalBalanceSummary,
    practicalAdvice,
  };

  const interpretedSummary = `일간 ${raw.ilgan}(${raw.dayMaster.hanja}), ${ilgan?.상징 ?? "독특한"} 타입. ${dayMasterPersonality} 오행은 ${internalBalanceSummary}`;

  const domainCards: SajuDomainCard[] = [
    { id: "character", domain: "character", title: "일간 성향", summary: dayMasterPersonality, keyPoint: raw.ilgan },
    { id: "strengths", domain: "strengths", title: "강점", summary: dayMasterStrengths },
    { id: "cautions", domain: "cautions", title: "주의", summary: dayMasterCautions },
    { id: "advice", domain: "advice", title: "실천 조언", summary: practicalAdvice, keyPoint: elementBalanceNote },
    { id: "relationships", domain: "relationships", title: "관계·연애", summary: relationshipsReading },
    { id: "work", domain: "work", title: "일·커리어", summary: workReading },
    { id: "money", domain: "money", title: "재물", summary: moneyReading },
    { id: "health", domain: "health", title: "건강·에너지", summary: healthReading },
  ];

  return {
    interpretationFacts,
    interpretedSummary,
    domainCards,
  };
}
