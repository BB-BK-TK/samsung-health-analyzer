/**
 * Phase 2 — Layer 3: Presentation / View-model.
 * Builds the unified ResultViewModel for the UI from calculation + interpretation.
 * styleReadyText is the slot for future LLM overwrite (Layer 4).
 */

import type { AstrologyPeriodKey, ResultViewModel, HeroSummaryViewModel, DomainCardViewModel, WhyThisResultSection, MetadataTagViewModel } from "@/types/result-schema";
import type { CalculationResult } from "./calculation-layer";
import type { AstrologyInterpreted, SajuInterpreted } from "./interpretation-layer";

export interface InterpretationResult {
  astrology: Record<AstrologyPeriodKey, AstrologyInterpreted | null>;
  saju: SajuInterpreted;
}

const SIGN_ORDER_KO = [
  "염소자리",
  "물병자리",
  "물고기자리",
  "양자리",
  "황소자리",
  "쌍둥이자리",
  "게자리",
  "사자자리",
  "처녀자리",
  "천칭자리",
  "전갈자리",
  "사수자리",
];

function parseBirthDateParts(birthDate: string): { year: number; month: number; day: number } | null {
  const parts = birthDate.split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseBirthHour(birthTime?: string): number | null {
  if (!birthTime) return null;
  const [h] = birthTime.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

function signByIndex(index: number): string {
  const normalized = ((index % 12) + 12) % 12;
  return SIGN_ORDER_KO[normalized];
}

/**
 * Lightweight v1 approximation without ephemeris.
 * - Moon: uses day-of-year + birth hour to give a date-dependent moon sign.
 * - Rising: requires birth hour (2-hour cadence).
 */
function estimateMoonAndRising(
  sunSignKo: string,
  birthDate: string,
  birthTime?: string
): { moonSign: string; risingSign: string } {
  const sunIndex = SIGN_ORDER_KO.indexOf(sunSignKo);
  if (sunIndex < 0) return { moonSign: "정보 부족", risingSign: birthTime ? "정보 부족" : "출생시간 필요" };

  const parts = parseBirthDateParts(birthDate);
  const hour = parseBirthHour(birthTime);
  if (!parts) return { moonSign: "정보 부족", risingSign: birthTime ? "정보 부족" : "출생시간 필요" };

  const dateObj = new Date(parts.year, parts.month - 1, parts.day);
  const startOfYear = new Date(parts.year, 0, 1);
  const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Moon roughly moves ~13deg/day -> ~1 sign per ~2.3 days.
  const moonShift = Math.floor((dayOfYear * 13 + (hour ?? 12)) / 30);
  const moonSign = signByIndex(sunIndex + moonShift);

  if (hour == null) {
    return { moonSign, risingSign: "출생시간 필요" };
  }

  // Ascendant approximation: 12 signs over 24 hours (2-hour blocks), starting from Aries-like point at 06:00.
  const risingShift = Math.floor((((hour + 18) % 24) / 2));
  const risingSign = signByIndex(risingShift + 3);
  return { moonSign, risingSign };
}

function formatDateByTab(period: AstrologyPeriodKey, now: Date): string {
  if (period === "daily") return now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일–${end.getDate()}일`;
  }
  if (period === "monthly") return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  if (period === "yearly") return `${now.getFullYear()}년`;
  return "";
}

/**
 * Build full view-model for UI. Consumes calculation + interpretation.
 */
export function buildResultViewModel(
  calculation: CalculationResult,
  interpretation: InterpretationResult,
  options: { birthDate: string; birthTime?: string; activePeriod?: AstrologyPeriodKey }
): ResultViewModel {
  const now = new Date();
  const period = (options.activePeriod ?? "daily") as AstrologyPeriodKey;
  const astroPeriod = interpretation.astrology[period];
  const rawPeriod = calculation.astrology.byPeriod[period];

  const heroQuote = astroPeriod?.interpretedSummary ?? rawPeriod?.summary ?? "오늘 하루 좋은 에너지가 함께하길.";
  const energyLabel = astroPeriod?.interpretationFacts.energy ?? rawPeriod?.energy ?? "";
  const loveStatus = astroPeriod?.interpretationFacts.loveStatus ?? rawPeriod?.love.status ?? "";
  const dateLabel = period !== "lifetime" ? formatDateByTab(period, now) : "";

  const domainCards: DomainCardViewModel[] = [];
  if (astroPeriod?.domainCards) {
    for (const c of astroPeriod.domainCards) {
      domainCards.push({
        id: c.id,
        domain: c.domain,
        title: c.title,
        score: c.score,
        summary: c.summary,
        keyPoint: c.keyPoint,
        variant: "purple",
      });
    }
  }
  for (const c of interpretation.saju.domainCards) {
    domainCards.push({
      id: `saju-${c.id}`,
      domain: c.domain,
      title: c.title,
      summary: c.summary,
      keyPoint: c.keyPoint,
      variant: "teal",
    });
  }

  const whySections: WhyThisResultSection[] = [];
  if (rawPeriod) {
    whySections.push({
      title: "별자리 기반",
      content: `${calculation.astrology.signKo} (${calculation.astrology.signInfo?.element ?? ""}·${calculation.astrology.signInfo?.modality ?? ""}). ${period === "daily" ? "오늘" : period === "weekly" ? "이번 주" : period === "monthly" ? "이번 달" : "올해"} 기운을 반영한 해석입니다.`,
      source: "astrology",
    });
  }
  const sajuFacts = interpretation.saju.interpretationFacts;
  const balanceSummary = sajuFacts.internalBalanceSummary ?? "";
  whySections.push({
    title: "사주 기반",
    content: balanceSummary
      ? `일간 ${calculation.saju.ilgan}, 사주팔자와 오행 분포를 반영했습니다. ${balanceSummary}`
      : `일간 ${calculation.saju.ilgan}, 사주팔자와 오행 분포를 반영했습니다. ${sajuFacts.dominantElement ? `강한 오행: ${sajuFacts.dominantElement}. ` : ""}${sajuFacts.weakElement ? `보강하면 좋은 오행: ${sajuFacts.weakElement}.` : ""}`,
    source: "saju",
  });

  const metadataTags: MetadataTagViewModel[] = [
    { label: "기간", value: rawPeriod?.periodLabel ?? period, source: "astrology" },
    { label: "별자리", value: calculation.astrology.signKo, source: "astrology" },
    { label: "생년월일", value: options.birthDate, source: "saju" },
  ];
  if (dateLabel) metadataTags.push({ label: "날짜", value: dateLabel, source: "astrology" });

  const fiveElements = {
    wood: calculation.saju.elementsPercent?.목 ?? 0,
    fire: calculation.saju.elementsPercent?.화 ?? 0,
    earth: calculation.saju.elementsPercent?.토 ?? 0,
    metal: calculation.saju.elementsPercent?.금 ?? 0,
    water: calculation.saju.elementsPercent?.수 ?? 0,
    analysis: {
      excess: calculation.saju.excess,
      deficient: calculation.saju.deficient,
    },
  };

  const planets = [
    { name: "태양", symbol: "☉", sign: calculation.astrology.signKo, house: 1 },
  ];
  const estimated = estimateMoonAndRising(
    calculation.astrology.signKo,
    options.birthDate,
    options.birthTime
  );
  if (estimated.moonSign && estimated.moonSign !== "정보 부족") {
    planets.push({ name: "달", symbol: "☽", sign: estimated.moonSign, house: 4 });
  }

  const styleReadyText = {
    heroQuote,
    integratedTheme: `키워드: ${energyLabel}`,
    cautionSignal: `관계: ${loveStatus}`,
    dailyGuideline: heroQuote,
    lifetimeTheme: calculation.astrology.lifetime?.summary,
  };

  const microActions = [
    { id: "1", text: "오늘의 핵심 목표 1개만 정하고 끝내기", tag: "커리어" },
    { id: "2", text: "짧게 산책하며 리듬 회복하기", tag: "건강" },
    { id: "3", text: "감정이 올라오면 10초 멈추고 한 번 더 생각하기", tag: "멘탈" },
  ];

  const heroSummary: HeroSummaryViewModel = {
    message: styleReadyText.heroQuote,
    dateLabel: period === "lifetime" ? "인생 테마" : dateLabel,
    period,
    subtitle: period === "daily" ? styleReadyText.lifetimeTheme : undefined,
  };

  const astrologyByPeriod = Object.fromEntries(
    (["daily", "weekly", "monthly", "yearly", "lifetime"] as const).map((p) => {
      const interp = interpretation.astrology[p];
      const raw = calculation.astrology.byPeriod[p];
      if (!raw) return [p, null];
      const rich = interp as { personality?: string; strengths?: string[]; cautions?: string[] } | undefined;
      const vm = {
        rawCalculation: {
          signKo: raw.signKo,
          period: raw.period,
          periodLabel: raw.periodLabel,
          dateRange: raw.dateRange,
          energyKey: raw.energy,
          love: { score: raw.love.score, statusKey: raw.love.status },
          career: { score: raw.career.score, statusKey: raw.career.status },
          money: { score: raw.money.score, statusKey: raw.money.status },
          health: { score: raw.health.score, statusKey: raw.health.status, bodyPartKey: raw.health.bodyPart },
          lucky: { colorKey: raw.lucky.color, number: raw.lucky.number, timeKey: raw.lucky.time },
          signInfo: raw.signInfo,
        },
        interpretationFacts: interp?.interpretationFacts ?? ({} as any),
        interpretedSummary: interp?.interpretedSummary ?? raw.summary,
        domainCards: interp?.domainCards ?? [],
        personality: rich?.personality,
        strengths: rich?.strengths,
        cautions: rich?.cautions,
        styleReadyText: { heroQuote: raw.summary, energyLabel: raw.energy, domainLabels: {} },
        metadata: { period: raw.period, periodLabel: raw.periodLabel, sign: raw.signKo, dateLabel: formatDateByTab(raw.period, now), source: "astrology" as const },
      };
      return [p, vm];
    })
  ) as ResultViewModel["astrology"]["byPeriod"];

  return {
    heroSummary,
    domainCards,
    whyThisResult: {
      sections: whySections,
      basedOn: `${calculation.astrology.signKo} · 일간 ${calculation.saju.ilgan} · ${rawPeriod?.periodLabel ?? period}`,
    },
    metadataTags,
    astrology: {
      byPeriod: astrologyByPeriod,
      compatibility: calculation.astrology.compatibility,
      sunSign: calculation.astrology.signKo,
      moonSign: estimated.moonSign,
      risingSign: estimated.risingSign,
      planets,
    },
    saju: {
      rawCalculation: {
        pillars: calculation.saju.pillars,
        dayMaster: calculation.saju.dayMaster,
        elementsPercent: calculation.saju.elementsPercent,
        excessElement: calculation.saju.excess,
        deficientElement: calculation.saju.deficient,
        ilgan: calculation.saju.ilgan,
        ilganInfo: calculation.saju.ilganInfo,
        zodiacAnimal: calculation.saju.zodiacAnimal,
      },
      interpretationFacts: interpretation.saju.interpretationFacts,
      interpretedSummary: interpretation.saju.interpretedSummary,
      domainCards: interpretation.saju.domainCards,
      styleReadyText: { dayMasterLabel: calculation.saju.ilgan, themeLabel: "", adviceIntro: "" },
      metadata: { birthDate: options.birthDate, birthTime: options.birthTime, source: "saju" },
    },
    fiveElements,
    microActions,
    styleReadyText,
  };
}

/** Get hero + domain cards for a specific period (for tab switching). */
export function getViewModelSliceForPeriod(
  viewModel: ResultViewModel,
  period: AstrologyPeriodKey
): { heroSummary: ResultViewModel["heroSummary"]; domainCards: DomainCardViewModel[] } {
  const astro = viewModel.astrology.byPeriod[period];
  const dateLabel = period !== "lifetime" ? formatDateByTab(period, new Date()) : "인생 테마";
  const heroSummary: HeroSummaryViewModel = {
    message: astro?.interpretedSummary ?? viewModel.styleReadyText.heroQuote,
    dateLabel,
    period,
    subtitle: period === "daily" ? viewModel.styleReadyText.lifetimeTheme : undefined,
  };
  const domainCards: DomainCardViewModel[] = [];
  if (astro?.domainCards) {
    for (const c of astro.domainCards) {
      domainCards.push({
        id: c.id,
        domain: c.domain,
        title: c.title,
        score: c.score,
        summary: c.summary,
        keyPoint: c.keyPoint,
        variant: "purple",
      });
    }
  }
  viewModel.saju.domainCards.forEach((c) => {
    domainCards.push({
      id: `saju-${c.id}`,
      domain: c.domain,
      title: c.title,
      summary: c.summary,
      keyPoint: c.keyPoint,
      variant: "teal",
    });
  });
  return { heroSummary, domainCards };
}
