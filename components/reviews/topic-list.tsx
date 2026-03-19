"use client";

import type { RangeSummary } from "@/lib/reviews";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function TopicList({ summary }: { summary: RangeSummary }) {
  return (
    <div className="space-y-3">
      {summary.topTopics.length === 0 ? (
        <p className="text-sm text-text-muted">No topics yet. Run “Analyze” to generate tags/topics.</p>
      ) : (
        <div className="space-y-2">
          {summary.topTopics.map((t) => (
            <div key={t.topic} className="rounded-xl border border-glass-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-text-primary">{t.topic}</div>
                <div className="text-xs text-text-secondary">
                  {t.count} · {pct(t.share)}
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
                <div className="h-2 bg-accent-purple/70" style={{ width: `${Math.min(100, Math.round(t.share * 100))}%` }} />
              </div>
              {t.exampleReviews?.[0]?.text && (
                <p className="mt-2 text-xs text-text-muted line-clamp-3">“{t.exampleReviews[0].text}”</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

