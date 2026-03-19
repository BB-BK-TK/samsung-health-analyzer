// Full astrology DB + engines. Phase 1: complete sign metadata, compatibility, lifetime, differentiated category copy.

// ============================================================
// Western Astrology Database (별자리 운세 DB)
// ============================================================

const SIGN_NAMES_KO = [
  "염소자리", "물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리",
  "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리",
];

// Phase 1: Complete metadata for all 12 signs (element, modality, brief personality).
const SIGN_METADATA = {
  염소자리: { element: "흙", modality: "변동", personality: "책임감 있고 끈기 있으며 현실적인 목표 지향형." },
  물병자리: { element: "공기", modality: "고정", personality: "독창적이고 인도주의적이며 미래지향적." },
  물고기자리: { element: "물", modality: "변동", personality: "직관적이고 공감 능력이 뛰어나며 감성적." },
  양자리: { element: "불", modality: "활동", personality: "용감하고 선구적이며 에너지가 넘치는 리더형." },
  황소자리: { element: "흙", modality: "고정", personality: "안정적이고 인내심이 있으며 감각을 중시." },
  쌍둥이자리: { element: "공기", modality: "변동", personality: "호기심 많고 유연하며 소통 능력이 뛰어남." },
  게자리: { element: "물", modality: "활동", personality: "보호 본능이 강하고 감정이 풍부한 가정형." },
  사자자리: { element: "불", modality: "고정", personality: "당당하고 창의적이며 자신감이 넘침." },
  처녀자리: { element: "흙", modality: "변동", personality: "분석적이고 꼼꼼하며 실용적인 완벽주의." },
  천칭자리: { element: "공기", modality: "고정", personality: "조화와 균형을 추구하며 사교적이고 예술적." },
  전갈자리: { element: "물", modality: "고정", personality: "강렬하고 통찰력 있으며 깊은 집중력." },
  사수자리: { element: "불", modality: "변동", personality: "낙관적이고 탐구심이 많으며 자유를 추구." },
};

// Month 1-12, day 1-31 → index 0-11 (Capricorn through Sagittarius)
function signIndexForDate(month, day) {
  const d = month * 100 + day;
  if (d >= 1222 || d <= 119) return 0;
  if (d >= 120 && d <= 218) return 1;
  if (d >= 219 && d <= 320) return 2;
  if (d >= 321 && d <= 419) return 3;
  if (d >= 420 && d <= 520) return 4;
  if (d >= 521 && d <= 620) return 5;
  if (d >= 621 && d <= 722) return 6;
  if (d >= 723 && d <= 822) return 7;
  if (d >= 823 && d <= 922) return 8;
  if (d >= 923 && d <= 1022) return 9;
  if (d >= 1023 && d <= 1121) return 10;
  return 11;
}

const AstrologyDB = {
  signs: {
    data: Object.fromEntries(
      SIGN_NAMES_KO.map((name) => [
        name,
        { name, ...SIGN_METADATA[name] },
      ])
    ),
    getSign(month, day) {
      return SIGN_NAMES_KO[signIndexForDate(month, day)];
    },
  },
};

// Phase 1: Differentiated copy per category so love/career/money/health feel distinct.
const LOVE_STATUS = ["연인과 조화로움", "새 만남의 기운", "소통이 중요", "깊어지는 관계", "차분한 관찰"];
const CAREER_STATUS = ["추진력 상승", "협업에 유리", "결정 시기", "성과가 보임", "인맥 활용"];
const MONEY_STATUS = ["소비 절제가 유리", "계획적 지출", "작은 수입 기회", "저축 적기", "투자 신중"];
const HEALTH_STATUS = ["전반적으로 양호", "피로 누적 주의", "수면 리듬 유지", "활동량 조절", "스트레스 관리"];
const BODY_PARTS = ["머리", "목", "어깨", "등", "손", "배", "다리"];
const LUCKY_COLORS = ["빨강", "파랑", "초록", "노랑", "보라", "흰색", "검정", "금색"];
const LUCKY_TIMES = ["아침", "오전", "점심", "오후", "저녁", "밤"];
const ENERGY_WORDS = ["활기", "침착", "열정", "신중", "도전", "협력", "직관", "균형"];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const AstrologyReadings = {
  generateDaily(sign, date = new Date()) {
    const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate() + sign.length;
    return buildReading(sign, seed, "오늘");
  },
  generateWeekly(sign, weekStart = new Date()) {
    const start = new Date(weekStart);
    start.setDate(start.getDate() - start.getDay());
    const seed =
      start.getFullYear() * 10000 + start.getMonth() * 100 + start.getDate() + sign.length + 1000;
    return buildReading(sign, seed, "이번 주");
  },
  generateMonthly(sign, year, month) {
    const seed = year * 100 + month + sign.length + 2000;
    return buildReading(sign, seed, "이번 달");
  },
  generateYearly(sign, year) {
    const seed = year + sign.length + 3000;
    return buildReading(sign, seed, "올해");
  },
  // Phase 1: Real v1 lifetime reading from sign + birth year (no placeholder).
  generateLifetime(sign, birthDate) {
    const meta = AstrologyDB.signs.data[sign] || {};
    const year = birthDate.getFullYear();
    const seed = year + sign.length + 5000;
    const theme = seededRandom(seed) < 0.33 ? "도전과 성장" : seededRandom(seed + 1) < 0.5 ? "조화와 관계" : "자기실현";
    const summary = `${sign}의 당신은 ${meta.personality || "독특한 성향"}을 바탕으로, 인생 전반에 걸쳐 ${theme}의 테마가 반복될 가능성이 있습니다. ${meta.element || "흙"}의 기운으로 안정을 추구하되, 중요한 순간에는 직관을 믿어보세요.`;
    const energy = meta.modality === "활동" ? "적극적" : meta.modality === "고정" ? "끈기" : "적응";
    return { summary, energy };
  },
};

// Phase 1: Each category uses its own status pool and scoring so results differ meaningfully.
function buildReading(sign, seed, periodLabel) {
  const energy = ENERGY_WORDS[Math.floor(seededRandom(seed) * ENERGY_WORDS.length)];
  const loveStatus = LOVE_STATUS[Math.floor(seededRandom(seed + 1) * LOVE_STATUS.length)];
  const careerStatus = CAREER_STATUS[Math.floor(seededRandom(seed + 2) * CAREER_STATUS.length)];
  const moneyStatus = MONEY_STATUS[Math.floor(seededRandom(seed + 3) * MONEY_STATUS.length)];
  const healthStatus = HEALTH_STATUS[Math.floor(seededRandom(seed + 4) * HEALTH_STATUS.length)];
  const loveScore = 1 + Math.floor(seededRandom(seed + 5) * 5);
  const careerScore = 1 + Math.floor(seededRandom(seed + 6) * 5);
  const moneyScore = 1 + Math.floor(seededRandom(seed + 7) * 5);
  const healthScore = 1 + Math.floor(seededRandom(seed + 8) * 5);
  const bodyPart = BODY_PARTS[Math.floor(seededRandom(seed + 9) * BODY_PARTS.length)];
  const color = LUCKY_COLORS[Math.floor(seededRandom(seed + 10) * LUCKY_COLORS.length)];
  const number = 1 + Math.floor(seededRandom(seed + 11) * 9);
  const time = LUCKY_TIMES[Math.floor(seededRandom(seed + 12) * LUCKY_TIMES.length)];
  const summary =
    periodLabel === "오늘"
      ? `${sign} 오늘은 ${energy}한 하루가 예상됩니다. ${loveStatus}, ${careerStatus} 흐름을 참고하세요.`
      : `${sign} ${periodLabel}는 ${energy}한 흐름이 예상됩니다. ${loveStatus}, ${careerStatus}을/를 염두에 두세요.`;
  return {
    signKo: sign,
    overall: { summary, energy },
    love: { status: loveStatus, score: Math.min(5, Math.max(1, loveScore)) },
    career: { status: careerStatus, score: Math.min(5, Math.max(1, careerScore)) },
    money: { status: moneyStatus, score: Math.min(5, Math.max(1, moneyScore)) },
    health: { status: healthStatus, score: Math.min(5, Math.max(1, healthScore)), bodyPart },
    lucky: { color, number, time },
  };
}

// Phase 1: Rule-based compatibility. Returns a consistent structure (score 1–5, summary, strengths, challenges).
function computeCompatibility(sign1, sign2) {
  const data1 = AstrologyDB.signs.data[sign1];
  const data2 = AstrologyDB.signs.data[sign2];
  if (!data1 || !data2) {
    return { score: 3, summary: "정보가 부족해 궁합을 판단하기 어렵습니다.", strengths: [], challenges: [] };
  }
  const sameElement = data1.element === data2.element;
  const sameModality = data1.modality === data2.modality;
  const fireAir = (data1.element === "불" && data2.element === "공기") || (data1.element === "공기" && data2.element === "불");
  const earthWater = (data1.element === "흙" && data2.element === "물") || (data1.element === "물" && data2.element === "흙");
  let score = 3;
  const strengths = [];
  const challenges = [];
  if (sameElement) {
    score += 1;
    strengths.push(`${data1.element} 원소로 서로 이해하기 쉬운 조합입니다.`);
  } else if (fireAir || earthWater) {
    score += 0.5;
    strengths.push("원소가 보완되어 균형 있는 관계가 될 수 있습니다.");
  } else {
    challenges.push("원소 차이로 가치관이 다를 수 있어 대화가 중요합니다.");
  }
  if (sameModality) {
    strengths.push("에너지 방식이 비슷해 일의 속도가 잘 맞을 수 있습니다.");
  } else {
    challenges.push("리듬이 다를 수 있으니 서로의 페이스를 존중하세요.");
  }
  const summary = score >= 4
    ? `${sign1}와(과) ${sign2}는 궁합이 좋은 편입니다. ${strengths[0] || "서로 보완할 수 있는 관계입니다."}`
    : score <= 2
      ? `${sign1}와(과) ${sign2}는 차이가 있어 이해와 노력이 필요합니다. ${challenges[0] || "소통을 늘려보세요."}`
      : `${sign1}와(과) ${sign2}는 무난한 궁합입니다. ${strengths[0] || "서로 배려하면 좋은 관계가 됩니다."}`;
  return {
    score: Math.min(5, Math.max(1, Math.round(score))),
    summary,
    strengths: strengths.length ? strengths : ["서로 다른 강점으로 보완할 수 있습니다."],
    challenges: challenges.length ? challenges : ["작은 배려가 관계를 돈독하게 합니다."],
  };
}

class AstrologyCalculator {
  constructor() {
    this.db = AstrologyDB;
    this.readings = AstrologyReadings;
  }
  getSign(month, day) {
    return this.db.signs.getSign(month, day);
  }
  getDaily(sign, date = new Date()) {
    return this.readings.generateDaily(sign, date);
  }
  getWeekly(sign, weekStart = new Date()) {
    return this.readings.generateWeekly(sign, weekStart);
  }
  getMonthly(sign, year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
    return this.readings.generateMonthly(sign, year, month);
  }
  getYearly(sign, year = new Date().getFullYear()) {
    return this.readings.generateYearly(sign, year);
  }
  getLifetime(birthDate) {
    const sign = this.getSign(birthDate.getMonth() + 1, birthDate.getDate());
    return this.readings.generateLifetime(sign, birthDate);
  }
  getFullReading(birthDate) {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const sign = this.getSign(month, day);
    const now = new Date();
    return {
      sign,
      signInfo: this.db.signs.data[sign],
      daily: this.getDaily(sign, now),
      weekly: this.getWeekly(sign, now),
      monthly: this.getMonthly(sign, now.getFullYear(), now.getMonth() + 1),
      yearly: this.getYearly(sign, now.getFullYear()),
      lifetime: this.getLifetime(birthDate),
    };
  }
  // Phase 1: Real compatibility result structure (rule-based v1).
  checkCompatibility(sign1, sign2) {
    return computeCompatibility(sign1, sign2);
  }
}

export { AstrologyDB, AstrologyReadings, AstrologyCalculator };
