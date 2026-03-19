"use client";

import type { RangeSummary, SentimentLabel } from "@/lib/reviews";

function pct(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

const LABELS: Record<SentimentLabel, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export function SentimentBreakdown({ summary }: { summary: RangeSummary }) {
  const total = summary.sentimentHistogram.positive + summary.sentimentHistogram.neutral + summary.sentimentHistogram.negative;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(LABELS) as SentimentLabel[]).map((k) => (
          <div key={k} className="rounded-xl border border-glass-border bg-secondary/40 p-3">
            <div className="text-xs text-text-muted">{LABELS[k]}</div>
            <div className="text-lg font-medium text-text-primary">{summary.sentimentHistogram[k]}</div>
            <div className="text-xs text-text-secondary">{pct(summary.sentimentHistogram[k], total)}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        Sentiment is based on analyzed reviews (run “Analyze” to populate).
      </p>
    </div>
  );
}

