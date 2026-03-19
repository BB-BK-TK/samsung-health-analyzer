"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  badge?: {
    label: string;
    variant: "purple" | "teal" | "gold";
  };
}

export function GlassCard({ children, className, badge }: GlassCardProps) {
  const badgeColors = {
    purple: "bg-accent-purple/20 text-accent-purple",
    teal: "bg-accent-teal/20 text-accent-teal",
    gold: "bg-accent-gold/20 text-accent-gold",
  };

  return (
    <div
      className={cn(
        "relative rounded-[20px] p-6 transition-all duration-300",
        "bg-glass-bg border border-glass-border",
        "backdrop-blur-xl",
        "hover:border-glass-highlight hover:shadow-[0_0_40px_rgba(139,127,212,0.1)]",
        className
      )}
    >
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4",
            badgeColors[badge.variant]
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {badge.label}
        </div>
      )}
      {children}
    </div>
  );
}
