"use client";

import { cn } from "@/lib/utils";

interface KeyMessageCardProps {
  message: string;
  date: string;
}

export function KeyMessageCard({ message, date }: KeyMessageCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] p-8 text-center overflow-hidden",
        "bg-glass-bg border border-glass-border",
        "backdrop-blur-xl"
      )}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139, 127, 212, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Moon symbols */}
        <div className="flex items-center justify-center gap-4 mb-6 text-xl text-accent-gold/60">
          <span>☽</span>
          <span className="text-text-primary">✦</span>
          <span>☾</span>
        </div>

        {/* Message — Phase 1: fallback so we never show blank */}
        <p
          className="text-xl md:text-2xl font-light leading-relaxed text-text-primary mb-6"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {`"${message || "오늘 하루 좋은 에너지가 함께하길."}"`}
        </p>

        {/* Date */}
        <p className="text-sm text-text-secondary">{date}</p>
      </div>
    </div>
  );
}
