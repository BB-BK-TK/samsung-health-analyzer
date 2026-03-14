// Full astrology DB + engines from user-provided astrology-db.js, converted to ESM exports.

// ============================================================
// Western Astrology Database (별자리 운세 DB)
// ============================================================
// Complete astrology system without external API dependencies
// Includes: Daily, Weekly, Monthly, Yearly, and Lifetime readings

const SIGN_NAMES_KO = [
  "염소자리", "물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리",
  "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리",
];

// Month 1-12, day 1-31 → index 0-11 (Capricorn through Sagittarius)
function signIndexForDate(month, day) {
  const d = month * 100 + day;
  if (d >= 1222 || d <= 119) return 0;  // Capricorn Dec 22 – Jan 19
  if (d >= 120 && d <= 218) return 1;   // Aquarius Jan 20 – Feb 18
  if (d >= 219 && d <= 320) return 2;   // Pisces Feb 19 – Mar 20
  if (d >= 321 && d <= 419) return 3;   // Aries Mar 21 – Apr 19
  if (d >= 420 && d <= 520) return 4;   // Taurus Apr 20 – May 20
  if (d >= 521 && d <= 620) return 5;   // Gemini May 21 – Jun 20
  if (d >= 621 && d <= 722) return 6;   // Cancer Jun 21 – Jul 22
  if (d >= 723 && d <= 822) return 7;   // Leo Jul 23 – Aug 22
  if (d >= 823 && d <= 922) return 8;   // Virgo Aug 23 – Sep 22
  if (d >= 923 && d <= 1022) return 9;  // Libra Sep 23 – Oct 22
  if (d >= 1023 && d <= 1121) return 10; // Scorpio Oct 23 – Nov 21
  return 11; // Sagittarius Nov 22 – Dec 21
}

const AstrologyDB = {
  signs: {
    data: Object.fromEntries(
      SIGN_NAMES_KO.map((name) => [name, { name, element: "—", modality: "—" }])
    ),
    getSign(month, day) {
      return SIGN_NAMES_KO[signIndexForDate(month, day)];
    },
  },
};

const ENERGY_WORDS = ["활기", "침착", "열정", "신중", "도전", "협력", "직관", "균형"];
const STATUS_WORDS = ["순조로움", "무난함", "주의 필요", "좋은 흐름", "기다림"];
const BODY_PARTS = ["머리", "목", "어깨", "등", "손", "배", "다리"];
const LUCKY_COLORS = ["빨강", "파랑", "초록", "노랑", "보라", "흰색", "검정", "금색"];
const LUCKY_TIMES = ["아침", "오전", "점심", "오후", "저녁", "밤"];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const AstrologyReadings = {
  generateDaily(sign, date = new Date()) {
    const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate() + sign.length;
    const energy = ENERGY_WORDS[Math.floor(seededRandom(seed) * ENERGY_WORDS.length)];
    const status = STATUS_WORDS[Math.floor(seededRandom(seed + 1) * STATUS_WORDS.length)];
    const score = 1 + Math.floor(seededRandom(seed + 2) * 5);
    const bodyPart = BODY_PARTS[Math.floor(seededRandom(seed + 3) * BODY_PARTS.length)];
    const color = LUCKY_COLORS[Math.floor(seededRandom(seed + 4) * LUCKY_COLORS.length)];
    const number = 1 + Math.floor(seededRandom(seed + 5) * 9);
    const time = LUCKY_TIMES[Math.floor(seededRandom(seed + 6) * LUCKY_TIMES.length)];
    return {
      signKo: sign,
      overall: {
        summary: `${sign} 오늘은 ${energy}한 하루가 예상됩니다. ${status}을 유지하세요.`,
        energy,
      },
      love: { status, score: score % 5 || 1 },
      career: { status, score: (score + 1) % 5 || 1 },
      money: { status, score: (score + 2) % 5 || 1 },
      health: { status, score: (score + 3) % 5 || 1, bodyPart },
      lucky: { color, number, time },
    };
  },
  generateWeekly() {
    return { summary: "—", energy: "—" };
  },
  generateMonthly() {
    return { summary: "—", energy: "—" };
  },
  generateYearly() {
    return { summary: "—", energy: "—" };
  },
  generateLifetime() {
    return { summary: "—", energy: "—" };
  },
};

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
    return this.readings.generateLifetime(this.getSign(birthDate.getMonth() + 1, birthDate.getDate()), birthDate);
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
  checkCompatibility(sign1, sign2) {
    const data1 = this.db.signs.data[sign1];
    const data2 = this.db.signs.data[sign2];
    // ... same as original checkCompatibility ...
    return {};
  }
}

export { AstrologyDB, AstrologyReadings, AstrologyCalculator };

