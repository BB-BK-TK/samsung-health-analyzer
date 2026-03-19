"use client";

import { cn } from "@/lib/utils";
import type { HeroSummaryViewModel } from "@/types/result-schema";

interface HeroSummaryProps {
  data: HeroSummaryViewModel;
  className?: string;
}

export function HeroSummary({ data, className }: HeroSummaryProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] p-8 text-center overflow-hidden",
        "bg-glass-bg border border-glass-border",
        "backdrop-blur-xl",
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139, 127, 212, 0.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">
        <p
          className="text-xl md:text-2xl font-light leading-relaxed text-text-primary mb-3"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {data.message || "오늘 하루 좋은 에너지가 함께하길."}
        </p>
        {data.subtitle && (
          <p className="text-sm text-text-secondary mb-2">{data.subtitle}</p>
        )}
        <p className="text-xs text-text-muted">{data.dateLabel}</p>
      </div>
    </div>
  );
}
