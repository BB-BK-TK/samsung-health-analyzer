/**
 * Phase 4: Versioned prompt templates for synthesis and style rewrite.
 * Edit here to change behavior; version field allows A/B and rollback.
 */

export const PROMPT_VERSION = "v1";

const GUARDRAILS = `
규칙 (반드시 지켜야 함):
- 제공된 해석 데이터와 모순되는 내용을 만들지 마세요.
- 출생 정보(생년월일·시간)를 지어내거나 특정 인물을 지목하지 마세요.
- "반드시", "확실히", "100%" 등 절대적 확신 표현을 쓰지 마세요.
- 의료·법률·생명 관련 구체적 조언(예: 약 복용, 투자 권유)을 하지 마세요.
- 모든 출력은 한국어로만 작성하세요.`;

/** Build synthesis system + user prompt. Input is structured; output must be valid JSON. */
export function buildSynthesisPrompt(input: {
  period: string;
  sign: string;
  signMeta: string;
  energySummary: string;
  domains: { love: string; career: string; money: string; health: string };
  dayMasterSummary: string;
  elementBalanceNote: string;
  lucky?: { color: string; number: number; time: string };
}): { system: string; user: string } {
  const system = `You are a helpful assistant that turns structured astrology/saju reading data into a coherent, supportive interpretation in Korean.
${GUARDRAILS}
You must output a single JSON object with exactly these keys (all strings, Korean): heroQuote, integratedTheme, cautionSignal, dailyGuideline, lifetimeTheme (optional).
Do not add keys. Do not output markdown or code fences — only the JSON object.`;

  const user = `다음 구조화된 운세 데이터를 바탕으로, 일관되고 도움이 되는 해석 문장을 만들어 주세요. 데이터에 없는 내용을 만들지 마세요.

- 기간: ${input.period}
- 별자리: ${input.sign} (${input.signMeta})
- 에너지 요약: ${input.energySummary}
- 연애: ${input.domains.love}
- 커리어: ${input.domains.career}
- 재물: ${input.domains.money}
- 건강: ${input.domains.health}
- 사주 일간 요약: ${input.dayMasterSummary}
- 오행 균형: ${input.elementBalanceNote}
${input.lucky ? `- 행운: 색 ${input.lucky.color}, 숫자 ${input.lucky.number}, 시간대 ${input.lucky.time}` : ""}

위 데이터만 사용해서 다음 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.
{"heroQuote":"...","integratedTheme":"...","cautionSignal":"...","dailyGuideline":"...","lifetimeTheme":"..."}`;

  return { system, user };
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  warm_healing: "따뜻하고 치유적인 말투. 위로와 공감을 담아 부드럽게 전달하세요. 희망을 주되 과장하지 마세요.",
  best_friend: "친한 친구가 말하듯 편하고 캐주얼한 말투. 존댓말보다는 친근한 반말/존댓말 혼용. 이모티콘은 쓰지 마세요.",
  mystical_poetic: "신비롭고 시적인 표현. 은유와 리듬을 살리되, 데이터 내용은 바꾸지 마세요.",
  elegant_premium: "우아하고 프리미엄한 말투. 짧고 정제된 문장. 품격 있게 전달하세요.",
  direct_practical: "직설적이고 실용적인 말투. 핵심만 짧게. 불필요한 수식어 없이 행동에 도움이 되게.",
};

/** Build style-rewrite system + user prompt. */
export function buildStyleRewritePrompt(input: {
  style: string;
  interpretation: {
    heroQuote: string;
    integratedTheme: string;
    cautionSignal: string;
    dailyGuideline: string;
    lifetimeTheme?: string;
  };
}): { system: string; user: string } {
  const styleDesc = STYLE_DESCRIPTIONS[input.style] ?? "자연스러운 말투로 유지하세요.";
  const system = `You rewrite an existing Korean fortune interpretation in a specific style. You must NOT change the meaning or add new facts. Only change tone and wording.
${GUARDRAILS}
Output a single JSON object with exactly these keys (all strings, Korean): heroQuote, integratedTheme, cautionSignal, dailyGuideline, lifetimeTheme (optional). No other keys. No markdown — only the JSON object.`;

  const user = `다음 해석 문장을 "${input.style}" 스타일로 다시 써 주세요. 의미와 사실은 그대로 두고, 말투와 표현만 바꾸세요.
스타일 설명: ${styleDesc}

현재 해석:
- heroQuote: ${input.interpretation.heroQuote}
- integratedTheme: ${input.interpretation.integratedTheme}
- cautionSignal: ${input.interpretation.cautionSignal}
- dailyGuideline: ${input.interpretation.dailyGuideline}
- lifetimeTheme: ${input.interpretation.lifetimeTheme ?? "(없음)"}

동일한 키로 JSON만 출력하세요. 새 사실을 만들지 마세요.`;

  return { system, user };
}
