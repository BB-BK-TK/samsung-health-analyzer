"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface SajuData {
  pillars: {
    type: string;
    korean: string;
    hanja: string;
    animal: string;
  }[];
  dayMaster: {
    hanja: string;
    korean: string;
    meaning: string;
  };
  strengths: string[];
  cautions: string[];
  /** Phase 3: balance summary and practical advice */
  internalBalanceSummary?: string;
  practicalAdvice?: string;
}

interface SajuCardProps {
  data: SajuData;
}

export function SajuCard({ data }: SajuCardProps) {
  return (
    <GlassCard badge={{ label: "四柱 Saju", variant: "teal" }}>
      {/* Four Pillars */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {data.pillars.map((pillar) => (
          <div
            key={pillar.type}
            className={cn(
              "flex flex-col items-center py-4 px-2 rounded-xl",
              "bg-secondary/50"
            )}
          >
            <span className="text-xs text-text-muted mb-2">{pillar.type}</span>
            <span className="text-lg text-accent-teal mb-1">{pillar.hanja || "—"}</span>
            <span className="text-xs text-text-secondary mb-2">
              {pillar.korean || "—"}
            </span>
            <span className="text-lg">{pillar.animal ?? "—"}</span>
          </div>
        ))}
      </div>

      {/* Day Master */}
      <div className="bg-secondary/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-text-primary">
          <span className="text-accent-gold">일간:</span>{" "}
          <span className="text-accent-teal">{data.dayMaster.hanja || "—"}</span>{" "}
          {data.dayMaster.korean && (
            <span className="text-text-secondary">({data.dayMaster.korean}) </span>
          )}
          {data.dayMaster.meaning ? `- ${data.dayMaster.meaning}` : ""}
        </p>
      </div>

      {/* Phase 3: internal balance and practical advice */}
      {data.internalBalanceSummary && (
        <div className="mb-4 p-4 rounded-xl bg-secondary/20">
          <h3 className="text-sm text-text-primary mb-2">오행 균형</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{data.internalBalanceSummary}</p>
        </div>
      )}
      {data.practicalAdvice && (
        <div className="mb-4 p-4 rounded-xl bg-accent-teal/5 border border-accent-teal/20">
          <h3 className="text-sm text-text-primary mb-2">실천 조언</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{data.practicalAdvice}</p>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-glass-border mb-6" />

      {/* Strengths — Phase 1: fallback when empty */}
      <div className="mb-4">
        <h3 className="text-sm text-text-primary mb-3 flex items-center gap-2">
          <span>💪</span> 강점
        </h3>
        <div className="space-y-2">
          {(data.strengths?.length ? data.strengths : ["당신만의 강점을 살려보세요."]).map((strength, index) => (
            <p
              key={index}
              className="text-sm text-text-secondary flex items-start gap-2"
            >
              <span className="text-positive mt-0.5">•</span>
              {strength}
            </p>
          ))}
        </div>
      </div>

      {/* Cautions — Phase 1: fallback when empty */}
      <div>
        <h3 className="text-sm text-text-primary mb-3 flex items-center gap-2">
          <span>⚠️</span> 주의
        </h3>
        <div className="space-y-2">
          {(data.cautions?.length ? data.cautions : ["무리하지 않는 것이 좋아요."]).map((caution, index) => (
            <p
              key={index}
              className="text-sm text-text-secondary flex items-start gap-2"
            >
              <span className="text-caution mt-0.5">•</span>
              {caution}
            </p>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
