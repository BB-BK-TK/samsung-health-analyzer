"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";
import type { WhyThisResultSection } from "@/types/result-schema";

interface WhyThisResultProps {
  basedOn: string;
  sections: WhyThisResultSection[];
  className?: string;
}

export function WhyThisResult({ basedOn, sections, className }: WhyThisResultProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <GlassCard className={cn("", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between gap-2 py-2"
      >
        <span className="text-sm font-medium text-text-primary">이 해석의 근거</span>
        <span className="text-text-muted text-lg leading-none">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="pt-4 space-y-4 border-t border-glass-border mt-2">
          <p className="text-xs text-text-muted">{basedOn}</p>
          {sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-xs font-medium text-text-secondary mb-1">{section.title}</h4>
              <p className="text-sm text-text-muted leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
