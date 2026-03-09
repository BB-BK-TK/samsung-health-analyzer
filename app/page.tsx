"use client";

import { useState } from "react";
import { StarBackground } from "@/components/star-background";
import { BirthInfoForm, type BirthInfo } from "@/components/birth-info-form";
import { KeyMessageCard } from "@/components/key-message-card";
import { AstrologyCard } from "@/components/astrology-card";
import { SajuCard } from "@/components/saju-card";
import { FiveElementsChart } from "@/components/five-elements-chart";
import { IntegratedInsightCard } from "@/components/integrated-insight-card";
import { MicroActionCard } from "@/components/micro-action-card";
import { ResultTabs } from "@/components/result-tabs";
import { LoadingScreen } from "@/components/loading-screen";
import { cn } from "@/lib/utils";
import { westernZodiacLabelKo, westernZodiacSignForDate } from "@/lib/western-zodiac";

type FortuneData = {
  keyMessage: string;
  astrology: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planets: { name: string; symbol: string; sign: string; house: number }[];
    insights: string[];
  };
  saju: {
    pillars: { type: string; korean: string; hanja: string; animal: string }[];
    dayMaster: { hanja: string; korean: string; meaning: string };
    strengths: string[];
    cautions: string[];
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    analysis: {
      excess: { element: string; meaning: string } | null;
      deficient: { element: string; meaning: string } | null;
    };
  };
  integrated: { commonTheme: string; cautionSignal: string; dailyGuideline: string };
  microActions: { id: string; text: string; tag: string }[];
};

type AztroResponse = {
  current_date: string;
  date_range: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
};

type BaziResponse = {
  day_master?: { stem?: string; info?: { element?: string; polarity?: string; name?: string } };
  pillars?: { label?: "year" | "month" | "day" | "hour"; gan_zhi?: string; gan?: string; zhi?: string }[];
  elements?: { points?: { Wood?: number; Fire?: number; Earth?: number; Metal?: number; Water?: number } };
};

function branchAnimalEmoji(zhi?: string) {
  switch (zhi) {
    case "子":
      return "🐀";
    case "丑":
      return "🐂";
    case "寅":
      return "🐅";
    case "卯":
      return "🐇";
    case "辰":
      return "🐉";
    case "巳":
      return "🐍";
    case "午":
      return "🐎";
    case "未":
      return "🐐";
    case "申":
      return "🐒";
    case "酉":
      return "🐓";
    case "戌":
      return "🐕";
    case "亥":
      return "🐖";
    default:
      return "✦";
  }
}

function toFiveScale(points: Record<string, number>) {
  const values = Object.values(points);
  const max = Math.max(...values, 1);
  const scale = (v: number) => Math.max(0, Math.min(5, Math.round((v / max) * 5)));
  return {
    wood: scale(points.Wood ?? 0),
    fire: scale(points.Fire ?? 0),
    earth: scale(points.Earth ?? 0),
    metal: scale(points.Metal ?? 0),
    water: scale(points.Water ?? 0),
  };
}

export default function CosmicFivePage() {
  const [view, setView] = useState<"input" | "loading" | "result">("input");
  const [activeTab, setActiveTab] = useState("today");
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [lastBirthInfo, setLastBirthInfo] = useState<BirthInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmitting = view === "loading";

  const handleSubmit = async (birthInfo: BirthInfo) => {
    setLastBirthInfo(birthInfo);
    setView("loading");
    setErrorMessage(null);

    try {
      const [, mStr, dStr] = birthInfo.birthDate.split("-");
      const month = Number(mStr);
      const day = Number(dStr);
      const zodiacSign = westernZodiacSignForDate(month, day);
      const zodiacKo = westernZodiacLabelKo(zodiacSign);

      const horoscopeResp = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sign: zodiacSign, day: "today" }),
      });
      if (!horoscopeResp.ok) throw new Error("Horoscope API error");
      const horoscope = (await horoscopeResp.json()) as AztroResponse;

      const sajuResp = await fetch("/api/saju", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          birthDate: birthInfo.birthDate,
          birthTime: birthInfo.birthTime,
          city: birthInfo.birthPlace,
        }),
      });

      let bazi: BaziResponse | null = null;
      if (sajuResp.ok) {
        bazi = (await sajuResp.json()) as BaziResponse;
      }

      const pillars =
        bazi?.pillars?.map((p) => {
          const type =
            p.label === "year"
              ? "년주"
              : p.label === "month"
                ? "월주"
                : p.label === "day"
                  ? "일주"
                  : "시주";
          const hanja = p.gan_zhi ?? `${p.gan ?? ""}${p.zhi ?? ""}`;
          return { type, korean: "", hanja, animal: branchAnimalEmoji(p.zhi ?? hanja?.slice(1, 2)) };
        }) ?? [];

      const dmStem = bazi?.day_master?.stem ?? "—";
      const dmInfo = bazi?.day_master?.info;
      const dmMeaning = dmInfo?.name
        ? `${dmInfo.name}${dmInfo.element ? ` · ${dmInfo.element}` : ""}${dmInfo.polarity ? ` · ${dmInfo.polarity}` : ""}`
        : "사주 분석을 활성화하면 일간 정보를 보여줘요.";

      const elementPoints = bazi?.elements?.points ?? null;
      const fiveScaled = elementPoints
        ? toFiveScale({
            Wood: elementPoints.Wood ?? 0,
            Fire: elementPoints.Fire ?? 0,
            Earth: elementPoints.Earth ?? 0,
            Metal: elementPoints.Metal ?? 0,
            Water: elementPoints.Water ?? 0,
          })
        : { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

      const strengths =
        elementPoints
          ? [`오행 분포가 계산되었습니다.`, `강한 기운을 활용해 오늘의 흐름을 잡아보세요.`]
          : [`사주 API 키를 설정하면 네 기둥(년/월/일/시)을 계산해 드려요.`, `현재는 점성술(오늘 운세)만 표시 중입니다.`];
      const cautions =
        elementPoints
          ? [`과하거나 부족한 기운이 있다면 균형을 의식해 보세요.`]
          : [`배포 환경에 \`FREEASTRO_API_KEY\`를 추가하면 사주 분석이 활성화됩니다.`];

      const keyMessage = horoscope.description.split(".")[0]?.trim() || horoscope.description;
      const fortune: FortuneData = {
        keyMessage,
        astrology: {
          sunSign: zodiacKo,
          moonSign: "—",
          risingSign: "—",
          planets: [],
          insights: [
            horoscope.description,
            `Mood: ${horoscope.mood} · Color: ${horoscope.color}`,
            `Lucky: ${horoscope.lucky_time} · ${horoscope.lucky_number} · Compatibility: ${horoscope.compatibility}`,
          ],
        },
        saju: {
          pillars: pillars.length
            ? pillars
            : [
                { type: "년주", korean: "", hanja: "—", animal: "✦" },
                { type: "월주", korean: "", hanja: "—", animal: "✦" },
                { type: "일주", korean: "", hanja: "—", animal: "✦" },
                { type: "시주", korean: "", hanja: "—", animal: "✦" },
              ],
          dayMaster: { hanja: dmStem, korean: "", meaning: dmMeaning },
          strengths,
          cautions,
        },
        fiveElements: {
          ...fiveScaled,
          analysis: {
            excess: null,
            deficient: elementPoints ? { element: "수(水)", meaning: "균형을 위해 휴식/수분/유연함을 챙겨보세요" } : null,
          },
        },
        integrated: {
          commonTheme: `오늘의 키워드: ${horoscope.mood} · ${horoscope.color}`,
          cautionSignal: `호환: ${horoscope.compatibility} — 관계에서 속도 조절`,
          dailyGuideline: keyMessage,
        },
        microActions: [
          { id: "1", text: "오늘의 핵심 목표 1개만 정하고 끝내기", tag: "커리어" },
          { id: "2", text: "짧게 산책하며 리듬 회복하기", tag: "건강" },
          { id: "3", text: "감정이 올라오면 10초 멈추고 한 번 더 생각하기", tag: "멘탈" },
        ],
      };

      setFortuneData(fortune);
      setView("result");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      setView("input");
    }
  };

  const handleBack = () => {
    setView("input");
  };

  const handleRegenerate = () => {
    if (lastBirthInfo) {
      void handleSubmit(lastBirthInfo);
    }
  };

  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
    };
    return today.toLocaleDateString("ko-KR", options);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarBackground />

      <div className="relative z-10 max-w-[480px] mx-auto px-5 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          {view === "result" && (
            <button
              onClick={handleBack}
              className="absolute left-5 top-8 text-text-muted hover:text-text-secondary transition-colors"
            >
              ← 뒤로
            </button>
          )}
          <h1
            className="text-3xl font-light tracking-tight text-text-primary mb-2"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Cosmic 五
          </h1>
          <p className="text-sm text-text-secondary">
            별과 오행이 읽어주는 오늘의 방향
          </p>
        </header>

        {/* Content */}
        {view === "input" && (
          <div className="space-y-4">
            {errorMessage && (
              <div
                className={cn(
                  "px-4 py-3 rounded-xl text-sm",
                  "bg-caution/10 border border-caution/20 text-text-secondary"
                )}
              >
                {errorMessage}
              </div>
            )}
            <BirthInfoForm onSubmit={handleSubmit} isLoading={isSubmitting} />
          </div>
        )}

        {view === "loading" && <LoadingScreen />}

        {view === "result" && fortuneData && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Tabs */}
            <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Key Message */}
            <KeyMessageCard
              message={fortuneData.keyMessage}
              date={formatDate()}
            />

            {/* Astrology Card */}
            <AstrologyCard data={fortuneData.astrology} />

            {/* Saju Card */}
            <SajuCard data={fortuneData.saju} />

            {/* Five Elements Chart */}
            <FiveElementsChart data={fortuneData.fiveElements} />

            {/* Integrated Insight */}
            <IntegratedInsightCard data={fortuneData.integrated} />

            {/* Micro Actions */}
            <MicroActionCard actions={fortuneData.microActions} />

            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              className={cn(
                "w-full h-[52px] rounded-xl font-medium text-sm",
                "bg-transparent border border-glass-border",
                "text-text-secondary",
                "transition-all duration-200",
                "hover:bg-glass-bg flex items-center justify-center gap-2"
              )}
            >
              <span>↻</span> 다른 해석 보기
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-text-muted">
            ✦ Cosmic 五 · 별과 오행의 조화
          </p>
        </footer>
      </div>
    </div>
  );
}
