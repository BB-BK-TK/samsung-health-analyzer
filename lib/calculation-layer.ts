/**
 * Phase 2 — Layer 1: Calculation.
 * Runs only the raw calculators. No presentation text or UI shaping.
 * Returns normalized raw outputs for the interpretation layer.
 */

import type { AstrologyPeriodKey } from "@/types/result-schema";
import { AstrologyCalculator } from "./astrology-db";
import { SajuCalculator } from "./saju-db";

export interface AstrologyRawPerPeriod {
  signKo: string;
  period: AstrologyPeriodKey;
  periodLabel: string;
  dateRange: { from: string; to: string };
  energy: string;
  love: { score: number; status: string };
  career: { score: number; status: string };
  money: { score: number; status: string };
  health: { score: number; status: string; bodyPart: string };
  lucky: { color: string; number: number; time: string };
  summary: string;
  signInfo?: { element: string; modality: string; personality: string };
}

export interface SajuRawOutput {
  pillars: { type: string; korean: string; hanja: string; animal: string }[];
  dayMaster: { hanja: string; korean: string; meaning: string };
  elementsPercent: Record<string, number>;
  excess: { element: string; meaning: string } | null;
  deficient: { element: string; meaning: string } | null;
  ilgan: string;
  ilganInfo?: { 상징: string; 장점: string; 단점: string; 성격: string };
  zodiacAnimal: string;
}

export interface CalculationResult {
  astrology: {
    byPeriod: Record<AstrologyPeriodKey, AstrologyRawPerPeriod | null>;
    signKo: string;
    signInfo: { element: string; modality: string; personality: string } | null;
    compatibility: { score: number; summary: string; strengths: string[]; challenges: string[] } | null;
    lifetime: { summary: string; energy: string } | null;
  };
  saju: SajuRawOutput;
}

function dateRangeForPeriod(period: AstrologyPeriodKey, now: Date): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (period === "daily") return { from: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, to: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`, to: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}` };
  }
  if (period === "monthly") return { from: `${y}-${String(m).padStart(2, "0")}-01`, to: `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}` };
  if (period === "yearly") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: "", to: "" };
}

function mapEngineReadingToRaw(
  reading: { signKo: string; overall: { summary: string; energy: string }; love: { status: string; score: number }; career: { status: string; score: number }; money: { status: string; score: number }; health: { status: string; score: number; bodyPart: string }; lucky: { color: string; number: number; time: string } },
  period: AstrologyPeriodKey,
  periodLabel: string,
  now: Date,
  signInfo: { element: string; modality: string; personality: string } | null
): AstrologyRawPerPeriod {
  return {
    signKo: reading.signKo,
    period,
    periodLabel,
    dateRange: dateRangeForPeriod(period, now),
    energy: reading.overall.energy,
    love: { score: reading.love.score, status: reading.love.status },
    career: { score: reading.career.score, status: reading.career.status },
    money: { score: reading.money.score, status: reading.money.status },
    health: { score: reading.health.score, status: reading.health.status, bodyPart: reading.health.bodyPart },
    lucky: { ...reading.lucky },
    summary: reading.overall.summary,
    signInfo: signInfo ?? undefined,
  };
}

/**
 * Run all calculations. No UI or interpretation — raw only.
 */
export function runCalculations(
  birthDate: string,
  birthTime: string,
  astrologyCalc: AstrologyCalculator,
  sajuCalc: SajuCalculator
): CalculationResult {
  const [yStr, mStr, dStr] = birthDate.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const birthDateObj = new Date(year, month - 1, day);
  const now = new Date();
  const hourStr = (birthTime || "12:00").split(":")[0];
  const hourNum = Number(hourStr) || 12;

  const sign = astrologyCalc.getSign(month, day);
  const db = (astrologyCalc as { db?: { signs?: { data?: Record<string, { element?: string; modality?: string; personality?: string }> } } }).db;
  const signInfo = db?.signs?.data?.[sign] ? { element: db.signs.data[sign].element ?? "", modality: db.signs.data[sign].modality ?? "", personality: db.signs.data[sign].personality ?? "" } : null;

  const daily = astrologyCalc.getDaily(sign, now);
  const weekly = astrologyCalc.getWeekly(sign, now);
  const monthly = astrologyCalc.getMonthly(sign, now.getFullYear(), now.getMonth() + 1);
  const yearly = astrologyCalc.getYearly(sign, now.getFullYear());
  const lifetime = astrologyCalc.getLifetime(birthDateObj);

  const byPeriod: Record<AstrologyPeriodKey, AstrologyRawPerPeriod | null> = {
    daily: mapEngineReadingToRaw(daily, "daily", "오늘", now, signInfo),
    weekly: mapEngineReadingToRaw(weekly, "weekly", "이번 주", now, signInfo),
    monthly: mapEngineReadingToRaw(monthly, "monthly", "이번 달", now, signInfo),
    yearly: mapEngineReadingToRaw(yearly, "yearly", "올해", now, signInfo),
    lifetime: null,
  };
  if (lifetime) {
    byPeriod.lifetime = {
      signKo: sign,
      period: "lifetime",
      periodLabel: "인생",
      dateRange: { from: "", to: "" },
      energy: lifetime.energy,
      love: { score: 3, status: "—" },
      career: { score: 3, status: "—" },
      money: { score: 3, status: "—" },
      health: { score: 3, status: "—", bodyPart: "—" },
      lucky: { color: "—", number: 0, time: "—" },
      summary: lifetime.summary,
      signInfo: signInfo ?? undefined,
    };
  }

  const saju = sajuCalc.calculate(year, month, day, hourNum);
  const pillarsDisplay = sajuCalc.getPillarDisplay(saju);
  const dayMasterDisplay = sajuCalc.getDayMasterDisplay(saju);
  const analysis = sajuCalc.getElementsAnalysis(saju.elements?.퍼센트);
  const percent = (saju.elements?.퍼센트 || {}) as Record<string, number>;

  const zodiacEmoji: Record<string, string> = { 쥐: "🐀", 소: "🐂", 호랑이: "🐅", 토끼: "🐇", 용: "🐉", 뱀: "🐍", 말: "🐎", 양: "🐐", 원숭이: "🐒", 닭: "🐓", 개: "🐕", 돼지: "🐖" };
  const pillars = pillarsDisplay.map((p, i) => ({ ...p, animal: i === 0 ? (zodiacEmoji[saju.띠] || p.animal) : p.animal }));

  return {
    astrology: {
      byPeriod,
      signKo: sign,
      signInfo,
      compatibility: null,
      lifetime: lifetime ? { summary: lifetime.summary, energy: lifetime.energy } : null,
    },
    saju: {
      pillars,
      dayMaster: dayMasterDisplay,
      elementsPercent: percent,
      excess: analysis.excess,
      deficient: analysis.deficient,
      ilgan: saju.일간,
      ilganInfo: saju.일간정보 as unknown as { 상징: string; 장점: string; 단점: string; 성격: string },
      zodiacAnimal: saju.띠,
    },
  };
}
