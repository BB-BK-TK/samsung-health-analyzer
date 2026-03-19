"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface IntegratedInsightData {
  commonTheme: string;
  cautionSignal: string;
  dailyGuideline: string;
  /** Phase 1: optional lifetime theme from astrology engine */
  lifetimeTheme?: string;
}

interface IntegratedInsightCardProps {
  data: IntegratedInsightData;
}

export function IntegratedInsightCard({ data }: IntegratedInsightCardProps) {
  return (
    <GlassCard badge={{ label: "통합 인사이트", variant: "gold" }}>
      {/* Common Theme */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3">공통 테마</h3>
        <div
          className={cn(
            "p-4 rounded-xl",
            "bg-accent-purple/10 border border-accent-purple/20"
          )}
        >
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.commonTheme || "오늘의 에너지를 살려보세요."}
          </p>
        </div>
      </div>

      {/* Caution Signal */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3">주의할 점</h3>
        <div
          className={cn(
            "p-4 rounded-xl",
            "bg-caution/10 border border-caution/20"
          )}
        >
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.cautionSignal || "무리하지 않는 것이 좋아요."}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-glass-border mb-6" />

      {/* Daily Guideline — always show; fallback if empty */}
      <div className="mb-6">
        <h3 className="text-sm text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-teal">📍</span> 오늘의 선택 기준
        </h3>
        <p
          className="text-base text-text-primary text-center py-4 leading-relaxed"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {`"${data.dailyGuideline || "오늘 하루를 편하게 흐름에 맡겨 보세요."}"`}
        </p>
      </div>

      {/* Phase 1: Lifetime theme when available */}
      {data.lifetimeTheme && (
        <>
          <div className="h-px bg-glass-border mb-6" />
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">인생 테마</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {data.lifetimeTheme}
            </p>
          </div>
        </>
      )}
    </GlassCard>
  );
}
