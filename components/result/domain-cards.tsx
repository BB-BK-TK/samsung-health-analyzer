"use client";

import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";
import type { DomainCardViewModel } from "@/types/result-schema";

interface DomainCardsProps {
  cards: DomainCardViewModel[];
  className?: string;
}

const variantStyles = {
  purple: "bg-accent-purple/10 border-accent-purple/20",
  teal: "bg-accent-teal/10 border-accent-teal/20",
  gold: "bg-accent-gold/20 border-accent-gold/30",
};

export function DomainCards({ cards, className }: DomainCardsProps) {
  if (!cards?.length) return null;
  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
        생활 영역별 해석
      </h2>
      <div className="grid gap-3">
        {cards.map((card) => (
          <GlassCard key={card.id} className={cn("p-4", variantStyles[card.variant ?? "purple"])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-1">{card.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{card.summary}</p>
                {card.keyPoint && (
                  <p className="text-xs text-text-muted mt-2">→ {card.keyPoint}</p>
                )}
              </div>
              {card.score != null && (
                <span className="text-xs text-accent-gold font-mono flex-shrink-0">
                  {card.score}/5
                </span>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
