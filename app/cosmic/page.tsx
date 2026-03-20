"use client";

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { StarBackground } from "@/components/star-background";
import { BirthInfoForm, type BirthInfo } from "@/components/birth-info-form";
import { ResultTabs } from "@/components/result-tabs";
import { LoadingScreen } from "@/components/loading-screen";
import { HeroSummary, DomainCards, WhyThisResult, MetadataTags } from "@/components/result";
import { AstrologyCard } from "@/components/astrology-card";
import { SajuCard } from "@/components/saju-card";
import { FiveElementsChart } from "@/components/five-elements-chart";
import { IntegratedInsightCard } from "@/components/integrated-insight-card";
import { MicroActionCard } from "@/components/micro-action-card";
import { NO_STYLE_KEY, type StyleOption } from "@/components/style-selector";
import { getStylePresets } from "@/lib/data";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/glass-card";
import { SajuCalculator } from "@/lib/saju-db";
import { AstrologyCalculator } from "@/lib/astrology-db";
import { runCalculations } from "@/lib/calculation-layer";
import { runInterpretation } from "@/lib/interpretation-layer";
import { buildResultViewModel, getViewModelSliceForPeriod } from "@/lib/presentation-layer";
import type { ResultViewModel } from "@/types/result-schema";
import type { AstrologyPeriodKey } from "@/types/result-schema";
import type { SynthesisOutput } from "@/types/ai-types";
import type { ReadingStyleKey } from "@/types/ai-types";

const TAB_TO_PERIOD: Record<string, AstrologyPeriodKey> = {
  today: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

type AnalysisSectionKey = "holistic" | "astrology" | "saju";
const ANALYSIS_UNLOCK_ORDER: AnalysisSectionKey[] = ["holistic", "astrology", "saju"];

export default function CosmicFivePage() {
  const [view, setView] = useState<"input" | "loading" | "result">("input");
  const [activeTab, setActiveTab] = useState("today");
  const [resultViewModel, setResultViewModel] = useState<ResultViewModel | null>(null);
  const [lastBirthInfo, setLastBirthInfo] = useState<BirthInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(NO_STYLE_KEY);
  const [styleResultCache, setStyleResultCache] = useState<Record<string, SynthesisOutput>>({});
  const [styleLoading, setStyleLoading] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [unlockedSections, setUnlockedSections] = useState<Record<AnalysisSectionKey, boolean>>({
    holistic: false,
    astrology: false,
    saju: false,
  });
  const isSubmitting = view === "loading";
  const astrologyCalculator = new AstrologyCalculator();
  const sajuCalculator = new SajuCalculator();

  const handleSubmit = async (birthInfo: BirthInfo) => {
    setLastBirthInfo(birthInfo);
    setView("loading");
    setErrorMessage(null);
    try {
      // Layer 1: Calculation only
      const calculation = runCalculations(
        birthInfo.birthDate,
        birthInfo.birthTime || "12:00",
        astrologyCalculator,
        sajuCalculator
      );
      // Layer 2: Interpretation
      const interpretation = runInterpretation(calculation);
      // Layer 3: Presentation / view-model
      const viewModel = buildResultViewModel(calculation, interpretation, {
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        activePeriod: "daily",
      });
      setResultViewModel(viewModel);
      setSelectedStyle(birthInfo.toneStyle);
      setStyleResultCache({});
      setStyleError(null);
      setUnlockedSections({ holistic: false, astrology: false, saju: false });
      setView("result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setErrorMessage(msg);
      setView("input");
    }
  };

  const handleBack = () => setView("input");
  const handleRegenerate = () => {
    if (lastBirthInfo) void handleSubmit(lastBirthInfo);
  };

  const unlockSection = useCallback((key: AnalysisSectionKey) => {
    setUnlockedSections((prev) => {
      const idx = ANALYSIS_UNLOCK_ORDER.indexOf(key);
      const requiredPrev = idx > 0 ? ANALYSIS_UNLOCK_ORDER[idx - 1] : null;
      if (requiredPrev && !prev[requiredPrev]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  const unlockAllSections = useCallback(() => {
    setUnlockedSections({ holistic: true, astrology: true, saju: true });
  }, []);

  const period = TAB_TO_PERIOD[activeTab] ?? "daily";
  const slice = useMemo(() => {
    if (!resultViewModel) return null;
    return getViewModelSliceForPeriod(resultViewModel, period);
  }, [resultViewModel, period]);

  const styleCacheKey = selectedStyle !== NO_STYLE_KEY ? `${period}:${selectedStyle}` : "";
  const displayStyleResult: SynthesisOutput | null = styleCacheKey ? styleResultCache[styleCacheKey] ?? null : null;

  const fetchStyleRewrite = useCallback(
    async (style: ReadingStyleKey) => {
      if (!resultViewModel || !slice) return;
      const key = `${period}:${style}`;
      setStyleError(null);
      setStyleLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "style",
            payload: {
              promptVersion: "v1",
              style,
              interpretation: {
                heroQuote: slice.heroSummary.message,
                integratedTheme: resultViewModel.styleReadyText.integratedTheme,
                cautionSignal: resultViewModel.styleReadyText.cautionSignal,
                dailyGuideline: resultViewModel.styleReadyText.dailyGuideline,
                lifetimeTheme: resultViewModel.styleReadyText.lifetimeTheme ?? "",
              },
            },
          }),
        });
        const json = await res.json();
        if (json.ok && json.data) {
          setStyleResultCache((prev) => ({ ...prev, [key]: json.data }));
        } else {
          let msg = json.message ?? "스타일 변환에 실패했습니다.";
          if (res.status === 503) msg = "AI를 사용할 수 없습니다. 원문을 표시합니다.";
          else if (res.status === 429 || json.error === "RATE_LIMIT") msg = "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
          setStyleError(msg);
        }
      } catch (e) {
        setStyleError(e instanceof Error ? e.message : "네트워크 오류. 원문을 표시합니다.");
      } finally {
        setStyleLoading(false);
      }
    },
    [resultViewModel, slice, period]
  );

  useEffect(() => {
    if (selectedStyle === NO_STYLE_KEY || !resultViewModel || !slice) return;
    const key = `${period}:${selectedStyle}`;
    if (styleResultCache[key]) return;
    void fetchStyleRewrite(selectedStyle as ReadingStyleKey);
  }, [period, selectedStyle, resultViewModel, slice, styleResultCache, fetchStyleRewrite]);

  const handleStyleRetry = useCallback(() => {
    if (selectedStyle !== NO_STYLE_KEY) void fetchStyleRewrite(selectedStyle);
  }, [selectedStyle, fetchStyleRewrite]);

  const heroDisplay = useMemo(() => {
    if (!slice) return null;
    if (displayStyleResult) {
      return {
        ...slice.heroSummary,
        message: displayStyleResult.heroQuote,
        subtitle: displayStyleResult.lifetimeTheme || slice.heroSummary.subtitle,
      };
    }
    return slice.heroSummary;
  }, [slice, displayStyleResult]);

  const integratedDisplay = useMemo(() => {
    if (!resultViewModel) return null;
    const base = {
      commonTheme: resultViewModel.styleReadyText.integratedTheme,
      cautionSignal: resultViewModel.styleReadyText.cautionSignal,
      dailyGuideline: resultViewModel.styleReadyText.dailyGuideline,
      lifetimeTheme: resultViewModel.styleReadyText.lifetimeTheme,
    };
    if (displayStyleResult) {
      return {
        commonTheme: displayStyleResult.integratedTheme,
        cautionSignal: displayStyleResult.cautionSignal,
        dailyGuideline: displayStyleResult.dailyGuideline,
        lifetimeTheme: displayStyleResult.lifetimeTheme ?? base.lifetimeTheme,
      };
    }
    return base;
  }, [resultViewModel, displayStyleResult]);

  return (
    <div className="min-h-screen bg-background relative">
      <StarBackground />
      <div className="relative z-10 max-w-[480px] mx-auto px-5 py-8">
        <header className="text-center mb-8">
          {view === "result" && (
            <button
              onClick={handleBack}
              className="absolute left-5 top-8 text-text-muted hover:text-text-secondary transition-colors"
            >
              ← 뒤로
            </button>
          )}
          <div className="flex flex-col items-center gap-3 mb-2">
            <Image
              src="/cosmic5-logo.png"
              alt="Cosmic 5"
              width={240}
              height={72}
              className="h-14 w-auto max-w-[min(100%,280px)] object-contain object-center"
              priority
            />
            <h1
              className="text-3xl font-light tracking-tight text-text-primary"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              Cosmic 五
            </h1>
          </div>
          <p className="text-sm text-text-secondary">별과 오행이 읽어주는 오늘의 방향</p>
        </header>

        {view === "input" && (
          <div className="space-y-4">
            {errorMessage && (
              <div className={cn("px-4 py-3 rounded-xl text-sm", "bg-caution/10 border border-caution/20 text-text-secondary")}>
                {errorMessage}
              </div>
            )}
            <BirthInfoForm onSubmit={handleSubmit} isLoading={isSubmitting} />
          </div>
        )}

        {view === "loading" && <LoadingScreen />}

        {view === "result" && resultViewModel && slice && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <button
              type="button"
              onClick={unlockAllSections}
              className={cn(
                "w-full h-[44px] rounded-xl text-sm font-medium",
                "bg-secondary border border-glass-border text-text-secondary",
                "hover:bg-glass-bg hover:text-text-primary hover:border-glass-border-hover transition-all duration-200"
              )}
            >
              전체 분석 한 번에 열기
            </button>

            {/* Hero: main message */}
            <section className="space-y-4">
              {styleError && (
                <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-caution/10 border border-caution/20 text-sm text-text-secondary">
                  <span>{styleError}</span>
                  <button
                    type="button"
                    onClick={handleStyleRetry}
                    className="text-accent-purple hover:underline whitespace-nowrap font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {styleLoading && selectedStyle !== NO_STYLE_KEY && (
                <p className="text-sm text-text-muted text-center">선택한 표현 스타일로 변환 중입니다.</p>
              )}
              <HeroSummary data={heroDisplay ?? slice.heroSummary} />
            </section>

            {/* Identity & chart snapshot */}
            <section className="space-y-3">
              <p className="text-xs text-text-muted text-center">
                {resultViewModel.astrology.sunSign} · 일간 {resultViewModel.saju.rawCalculation.ilgan} · {resultViewModel.metadataTags.find(t => t.label === "기간")?.value ?? "오늘"}
                {selectedStyle !== NO_STYLE_KEY && (
                  <> · 표현 스타일: {getStylePresets().find(p => p.value === selectedStyle)?.label ?? selectedStyle}</>
                )}
              </p>
              <MetadataTags tags={resultViewModel.metadataTags} />
            </section>

            <AnalysisUnlockCard
              title="통합 해석"
              description="핵심 메시지, 생활 영역별 흐름, 그리고 오늘의 실천 가이드를 확인합니다."
              isUnlocked={unlockedSections.holistic}
              onUnlock={() => unlockSection("holistic")}
              canUnlock={true}
            >
              <section className="space-y-4">
                <IntegratedInsightCard
                  data={
                    integratedDisplay ?? {
                      commonTheme: resultViewModel.styleReadyText.integratedTheme,
                      cautionSignal: resultViewModel.styleReadyText.cautionSignal,
                      dailyGuideline: resultViewModel.styleReadyText.dailyGuideline,
                      lifetimeTheme: resultViewModel.styleReadyText.lifetimeTheme,
                    }
                  }
                />
                <DomainCards cards={slice.domainCards} />
                <WhyThisResult basedOn={resultViewModel.whyThisResult.basedOn} sections={resultViewModel.whyThisResult.sections} />
                <MicroActionCard actions={resultViewModel.microActions} />
              </section>
            </AnalysisUnlockCard>

            <AnalysisUnlockCard
              title="Astrology 분석"
              description="별자리 기반 성향, 행성 정보, 기간별 흐름과 관계/커리어/재물/건강 포인트를 확인합니다."
              isUnlocked={unlockedSections.astrology}
              onUnlock={() => unlockSection("astrology")}
              canUnlock={unlockedSections.holistic}
              lockHint="먼저 통합 해석을 열어 주세요."
            >
              <section className="space-y-4">
                <AstrologyCard
                  data={{
                    sunSign: resultViewModel.astrology.sunSign,
                    moonSign: resultViewModel.astrology.moonSign,
                    risingSign: resultViewModel.astrology.risingSign,
                    planets: resultViewModel.astrology.planets,
                    insights: resultViewModel.astrology.byPeriod[period]?.interpretationFacts
                      ? [
                          resultViewModel.astrology.byPeriod[period]!.interpretationFacts.energy,
                          `연애: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.loveStatus} (${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.loveScore}/5)`,
                          `커리어: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.careerStatus} (${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.careerScore}/5)`,
                          `재물: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.moneyStatus} (${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.moneyScore}/5)`,
                          `건강: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.healthStatus} (${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.healthScore}/5, ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.bodyPart})`,
                          `행운 색: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.luckyColor}, 숫자: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.luckyNumber}, 시간대: ${resultViewModel.astrology.byPeriod[period]!.interpretationFacts.luckyTime}`,
                        ]
                      : ["오늘의 흐름을 편하게 받아들이세요."],
                    personality: resultViewModel.astrology.byPeriod[period]?.personality,
                    strengths: resultViewModel.astrology.byPeriod[period]?.strengths,
                    cautions: resultViewModel.astrology.byPeriod[period]?.cautions,
                  }}
                />
              </section>
            </AnalysisUnlockCard>

            <AnalysisUnlockCard
              title="Saju 분석"
              description="사주 일간, 오행 분포, 균형 상태와 실천 조언을 확인합니다."
              isUnlocked={unlockedSections.saju}
              onUnlock={() => unlockSection("saju")}
              canUnlock={unlockedSections.astrology}
              lockHint="먼저 Astrology 분석을 열어 주세요."
            >
              <section className="space-y-4">
                <SajuCard
                  data={{
                    pillars: resultViewModel.saju.rawCalculation.pillars,
                    dayMaster: resultViewModel.saju.rawCalculation.dayMaster,
                    strengths: [
                      `당신의 일간은 ${resultViewModel.saju.rawCalculation.ilgan}으로, ${resultViewModel.saju.interpretationFacts.dayMasterPersonality}`,
                      `장점: ${resultViewModel.saju.interpretationFacts.dayMasterStrengths}`,
                    ],
                    cautions: [`주의 포인트: ${resultViewModel.saju.interpretationFacts.dayMasterCautions}`],
                    internalBalanceSummary: resultViewModel.saju.interpretationFacts.internalBalanceSummary,
                    practicalAdvice: resultViewModel.saju.interpretationFacts.practicalAdvice,
                  }}
                />
                <FiveElementsChart data={resultViewModel.fiveElements} />
                {!lastBirthInfo?.birthTime && (
                  <p className="text-xs text-text-muted text-center">
                    출생시간을 입력하면 일간·사주가 더 정확히 반영됩니다.
                  </p>
                )}
              </section>
            </AnalysisUnlockCard>

            <button
              onClick={handleRegenerate}
              className={cn(
                "w-full h-[52px] rounded-xl font-medium text-sm",
                "bg-transparent border border-glass-border text-text-secondary",
                "transition-all duration-200 hover:bg-glass-bg hover:border-glass-border-hover flex items-center justify-center gap-2"
              )}
            >
              <span>↻</span> 다시 보기
            </button>
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-xs text-text-muted">✦ Cosmic 五 · 별과 오행의 조화</p>
        </footer>
      </div>
    </div>
  );
}

function AnalysisUnlockCard({
  title,
  description,
  isUnlocked,
  onUnlock,
  canUnlock,
  lockHint,
  children,
}: {
  title: string;
  description: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  canUnlock: boolean;
  lockHint?: string;
  children: ReactNode;
}) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-medium text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full border",
            isUnlocked
              ? "bg-accent-teal/10 border-accent-teal/30 text-accent-teal"
              : "bg-secondary/60 border-glass-border text-text-muted"
          )}
        >
          {isUnlocked ? "열림" : "잠김"}
        </span>
      </div>

      {!isUnlocked ? (
        <button
          type="button"
          disabled={!canUnlock}
          onClick={onUnlock}
          className={cn(
            "w-full h-[44px] rounded-xl text-sm font-medium",
            "bg-secondary border border-glass-border text-text-primary",
            "hover:bg-glass-bg hover:border-glass-border-hover transition-all duration-200",
            !canUnlock && "opacity-50 cursor-not-allowed hover:bg-secondary hover:border-glass-border"
          )}
        >
          {canUnlock ? "분석 열기" : "이전 분석을 먼저 열어 주세요"}
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">{children}</div>
      )}
      {!isUnlocked && !canUnlock && lockHint && (
        <p className="text-xs text-text-muted mt-2">{lockHint}</p>
      )}
    </GlassCard>
  );
}