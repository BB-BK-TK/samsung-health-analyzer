/**
 * Phase 3: Structured saju interpretation content.
 * Element meanings, dominant/deficient interpretation, domain templates.
 * DB-ready structure.
 */

export type ElementKey = "목" | "화" | "토" | "금" | "수";

export interface ElementMeaning {
  label: string;
  dominantMeaning: string;
  deficientMeaning: string;
  balanceNote: string;
}

export const ELEMENT_MEANINGS: Record<ElementKey, ElementMeaning> = {
  목: {
    label: "목",
    dominantMeaning: "성장·창의·확장의 기운이 강합니다. 새로운 시작과 도전에 유리하나, 산만해지기 쉬우니 우선순위를 정하세요.",
    deficientMeaning: "목 기운을 보강하면 결단력과 추진력이 도움이 됩니다. 작은 결정부터 연습하고, 푸른색·동쪽·봄 이미지를 활용해 보세요.",
    balanceNote: "목이 많으면 화가 도움 되고, 목이 부족하면 수가 목을 키웁니다.",
  },
  화: {
    label: "화",
    dominantMeaning: "열정·표현·활동의 기운이 강합니다. 밝고 적극적이나, 과열되면 피로와 다툼이 생기므로 휴식과 절제가 필요합니다.",
    deficientMeaning: "화 기운을 보강하면 표현력과 동기가 올라갑니다. 따뜻한 색·남쪽·명확한 목표를 두고, 작은 성취를 인정하세요.",
    balanceNote: "화가 많으면 토가 조절하고, 화가 부족하면 목이 화를 돋웁니다.",
  },
  토: {
    label: "토",
    dominantMeaning: "안정·포용·중재의 기운이 강합니다. 믿음직하나, 경직되거나 걱정이 많아질 수 있으니 유연함을 챙기세요.",
    deficientMeaning: "토 기운을 보강하면 안정감과 집중력이 좋아집니다. 황색·중앙·규칙적인 습관, 따뜻한 음식이 도움이 됩니다.",
    balanceNote: "토가 많으면 금이 정리하고, 토가 부족하면 화가 토를 돋웁니다.",
  },
  금: {
    label: "금",
    dominantMeaning: "정리·결단·규칙의 기운이 강합니다. 냉철하고 실행력이 있으나, 융통성이 줄 수 있으니 여유를 두세요.",
    deficientMeaning: "금 기운을 보강하면 정리력과 결단이 좋아집니다. 흰색·서쪽·정돈·규칙을 정하는 것이 도움이 됩니다.",
    balanceNote: "금이 많으면 수가 조절하고, 금이 부족하면 토가 금을 돋웁니다.",
  },
  수: {
    label: "수",
    dominantMeaning: "지혜·유연·직관의 기운이 강합니다. 적응력이 좋으나, 흐름에만 의지하면 무기력해질 수 있으니 작은 목표를 두세요.",
    deficientMeaning: "수 기운을 보강하면 직관과 회복이 좋아집니다. 검정·북쪽·물·휴식이 도움이 됩니다.",
    balanceNote: "수가 많으면 목이 배출하고, 수가 부족하면 금이 수를 돋웁니다.",
  },
};

/** Day master (일간) type → domain tendency. 한글 키 = saju-db 천간 목록. */
export const DAY_MASTER_DOMAIN_TENDENCY: Record<string, { relationships: string; work: string; money: string; health: string }> = {
  갑: { relationships: "리더십이 있어 관계를 이끄는 편입니다. 상대의 의견도 경청하면 균형이 좋아집니다.", work: "목표를 정하면 끝까지 추진하는 편입니다. 팀원과 역할을 나누는 것이 효율적입니다.", money: "도전적 수익보다 안정적 축적에 강합니다. 중장기 계획이 맞습니다.", health: "활동량이 많아질 수 있으니 허리·무릎을 챙기고 휴식을 고정하세요." },
  을: { relationships: "부드럽게 맞춰주는 편입니다. 자신의 선을 지키는 연습이 관계에 도움이 됩니다.", work: "협조와 인내로 성과를 냅니다. 세부와 꼼꼼함을 살리세요.", money: "꾸준한 소득과 절제된 지출이 맞습니다. 충동 구매 전 한 번 멈추세요.", health: "스트레스가 몸에 쌓이기 쉬우니 호흡·산책으로 풀어내세요." },
  병: { relationships: "밝고 솔직한 매력이 있습니다. 상대의 칭찬과 인정이 관계를 돕습니다.", work: "표현력과 추진력이 강점입니다. 한 가지에 깊이 파고들면 성과가 납니다.", money: "쓰는 만큼 벌고 싶어질 수 있습니다. 고정 저축을 먼저 두세요.", health: "심장·눈·피로를 챙기세요. 과로 전에 휴식이 필요합니다." },
  정: { relationships: "따뜻하고 세심한 배려를 합니다. 감정 기복이 있을 수 있으니 휴식이 중요합니다.", work: "예술·디자인·돌봄 분야에 적합합니다. 완벽을 추구하다 지치지 않도록 하세요.", money: "감성 지출이 늘어날 수 있습니다. 필수 비용을 제외한 나머지를 저축하세요.", health: "수면과 감정 관리가 핵심입니다. 규칙적인 취침이 도움이 됩니다." },
  무: { relationships: "듬직하고 믿음직합니다. 표현을 조금 더 해주면 상대가 안심합니다.", work: "중재와 책임 역할에 강합니다. 큰 목표를 단계로 나누세요.", money: "안정적 수입과 저축에 강합니다. 투자는 보수적으로 가져가도 좋습니다.", health: "소화·비위를 챙기세요. 규칙적인 식사가 중요합니다." },
  기: { relationships: "꼼꼼하고 배려심이 있습니다. 걱정을 말로 나누면 관계가 가벼워집니다.", work: "계획과 실행이 잡혀 있습니다. 한 번에 하나씩 완수하는 습관이 좋습니다.", money: "절약과 계획에 강합니다. 여유 비용을 조금 두면 심리가 좋아집니다.", health: "소화·신경을 챙기세요. 걱정이 많아지면 호흡과 산책으로 풀어내세요." },
  경: { relationships: "의리 있고 원칙적입니다. 감정 표현을 조금 더 하면 친밀감이 올라갑니다.", work: "정의감과 실행력이 강점입니다. 유연한 협상도 챙기세요.", money: "정리된 재정 관리에 강합니다. 비상금을 먼저 확보하세요.", health: "호흡기·피부를 챙기세요. 규칙적인 운동이 도움이 됩니다." },
  신: { relationships: "섬세하고 예리합니다. 비판보다 공감을 먼저 하면 관계가 부드러워집니다.", work: "정교함과 분석력이 강점입니다. 완벽 추구의 한계를 두는 것이 좋습니다.", money: "꼼꼼한 관리에 강합니다. 소액이라도 투자 경험을 쌓아 보세요.", health: "신경·호흡을 챙기세요. 충분한 수면이 필수입니다." },
  임: { relationships: "포용력과 지혜가 있습니다. 감정을 숨기지 않고 나누면 관계가 깊어집니다.", work: "큰 그림과 전략에 강합니다. 세부 실행은 도움을 받으면 좋습니다.", money: "흐름에 맞는 수입과 지출이 있습니다. 고정 비용을 줄이면 여유가 생깁니다.", health: "신장·관절·휴식을 챙기세요. 무리하지 않는 것이 중요합니다." },
  계: { relationships: "영리하고 감성적입니다. 비밀을 지나치게 하지 않고 적당히 나누면 신뢰가 쌓입니다.", work: "직관과 창의가 강점입니다. 마감과 우선순위를 정하면 성과가 납니다.", money: "변동이 있을 수 있으니 비상금을 두고, 고정 지출을 줄이세요.", health: "감정과 수면을 챙기세요. 습기·추위를 피하는 것이 좋습니다." },
};

export function getElementMeaning(element: string): ElementMeaning | null {
  return ELEMENT_MEANINGS[element as ElementKey] ?? null;
}

export function getDayMasterDomainTendency(ilgan: string): { relationships: string; work: string; money: string; health: string } | null {
  return DAY_MASTER_DOMAIN_TENDENCY[ilgan] ?? null;
}
