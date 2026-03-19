/**
 * Phase 3: Compatibility interpretation content and rules.
 * Rule-based: element + modality → attraction, communication, caution patterns.
 * Content is structured for extension (e.g. move to DB).
 */

export type ElementKey = "불" | "흙" | "공기" | "물";
export type ModalityKey = "활동" | "고정" | "변동";

/** Element pairing: same = 이해하기 쉬움, complementary = 보완 (불-공기, 흙-물), other = 차이. */
export const ELEMENT_PAIRING: Record<string, { scoreDelta: number; attraction: string; communication: string; caution: string }> = {
  same: { scoreDelta: 1, attraction: "원소가 같아 서로의 가치관과 감각이 비슷해 이해하기 쉽습니다.", communication: "말하지 않아도 통하는 부분이 많습니다.", caution: "비슷한 약점이 겹칠 수 있으니 서로의 한계를 인정하세요." },
  fire_air: { scoreDelta: 0.5, attraction: "불과 공기는 서로를 북돋우는 조합입니다. 아이디어와 실행력이 맞닿습니다.", communication: "대화가 활발하고 새로운 것에 대한 호기심이 맞습니다.", caution: "감정보다 논리로 치닫기 쉬우니 감정 표현도 챙기세요." },
  earth_water: { scoreDelta: 0.5, attraction: "흙과 물은 안정과 감정이 만나는 조합입니다. 서로를 지켜주려는 마음이 있습니다.", communication: "말보다 분위기와 행동으로 소통하는 경우가 많습니다.", caution: "감정을 숨기거나 쌓기 쉬우니 말로 풀어내는 습관이 좋습니다." },
  other: { scoreDelta: 0, attraction: "원소가 달라 가치관과 리듬이 다를 수 있습니다. 차이를 배움의 기회로 두면 좋습니다.", communication: "서로의 표현 방식이 다를 수 있으니 확인과 경청이 중요합니다.", caution: "오해가 쌓이기 전에 자주 대화하고 기대치를 맞춰 보세요." },
};

/** Modality pairing: same = 리듬 맞음, different = 보완 or 충돌. */
export const MODALITY_NOTE: Record<string, string> = {
  same: "에너지 방식이 비슷해 일의 속도와 목표 설정이 잘 맞을 수 있습니다.",
  different: "리듬이 다를 수 있으니 서로의 페이스와 우선순위를 존중하는 것이 좋습니다.",
};

export function getElementPairing(
  element1: string,
  element2: string
): { scoreDelta: number; attraction: string; communication: string; caution: string } {
  if (element1 === element2) return ELEMENT_PAIRING.same;
  const set = new Set([element1, element2]);
  if (set.has("불") && set.has("공기")) return ELEMENT_PAIRING.fire_air;
  if (set.has("흙") && set.has("물")) return ELEMENT_PAIRING.earth_water;
  return ELEMENT_PAIRING.other;
}

export function getModalityNote(modality1: string, modality2: string): string {
  return modality1 === modality2 ? MODALITY_NOTE.same : MODALITY_NOTE.different;
}
