"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { StarBackground } from "@/components/star-background";
import { TimeFilter, type TimeRangeValue } from "@/components/reviews/time-filter";
import { SentimentBreakdown } from "@/components/reviews/sentiment-breakdown";
import { TopicList } from "@/components/reviews/topic-list";
import type { RangeSummary } from "@/lib/reviews";
import { subDays } from "date-fns";

const DEFAULT_APP_ID = "com.sec.android.app.shealth";

export default function ReviewsDashboardPage() {
  const [appId, setAppId] = useState(DEFAULT_APP_ID);
  const [range, setRange] = useState<TimeRangeValue>(() => {
    const endDate = new Date();
    return { preset: "30d", startDate: subDays(endDate, 30), endDate };
  });

  const [summary, setSummary] = useState<RangeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      source: "google_play" as const,
      appId,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
    }),
    [appId, range]
  );

  const refreshSummary = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? json.hint ?? "Failed to load summary");
      }
      setSummary(json.data as RangeSummary);
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  const runIngest = useCallback(async () => {
    setError(null);
    setBusyMessage("Ingesting reviews from Google Play…");
    try {
      const res = await fetch("/api/reviews/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, limit: 400, language: "en", country: "us", appName: "Samsung Health" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? json.hint ?? "Ingest failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusyMessage(null);
      void refreshSummary();
    }
  }, [payload, refreshSummary]);

  const runAnalyze = useCallback(async () => {
    setError(null);
    setBusyMessage("Analyzing reviews with LLM…");
    try {
      const res = await fetch("/api/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, limit: 600 }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? json.hint ?? "Analyze failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusyMessage(null);
      void refreshSummary();
    }
  }, [payload, refreshSummary]);

  return (
    <div className="min-h-screen bg-background relative">
      <StarBackground />
      <div className="relative z-10 max-w-[900px] mx-auto px-5 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium text-text-primary">Samsung Health Review Intelligence</h1>
          <p className="text-sm text-text-secondary">
            Pull Google Play reviews, analyze sentiment/topics, and summarize feedback by time range.
          </p>
        </header>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm bg-caution/10 border border-caution/20 text-text-secondary">
            {error}
          </div>
        )}
        {busyMessage && (
          <div className="px-4 py-3 rounded-xl text-sm bg-secondary/60 border border-glass-border text-text-secondary">
            {busyMessage}
          </div>
        )}

        <GlassCard>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <label className="flex-1 flex flex-col gap-1 text-sm text-text-secondary">
                Google Play package id
                <input
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-glass-border bg-secondary/40 text-text-primary"
                  placeholder="com.sec.android.app.shealth"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={runIngest}
                  disabled={!!busyMessage}
                  className="h-10 px-4 rounded-lg border border-glass-border bg-secondary text-text-primary hover:bg-glass-bg disabled:opacity-50"
                >
                  Ingest
                </button>
                <button
                  type="button"
                  onClick={runAnalyze}
                  disabled={!!busyMessage}
                  className="h-10 px-4 rounded-lg border border-glass-border bg-accent-purple/20 text-text-primary hover:bg-accent-purple/30 disabled:opacity-50"
                >
                  Analyze
                </button>
                <button
                  type="button"
                  onClick={refreshSummary}
                  disabled={loading || !!busyMessage}
                  className="h-10 px-4 rounded-lg border border-glass-border bg-transparent text-text-secondary hover:bg-secondary/60 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            <TimeFilter value={range} onChange={setRange} />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard>
            <div className="space-y-2">
              <div className="text-sm text-text-secondary">Overall rating</div>
              <div className="text-3xl font-semibold text-text-primary">
                {summary?.averageRating ? summary.averageRating.toFixed(2) : "—"}
              </div>
              <div className="text-xs text-text-muted">{summary?.totalReviews ?? 0} reviews in range</div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {(["1", "2", "3", "4", "5"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-glass-border bg-secondary/40 p-2 text-center">
                    <div className="text-xs text-text-muted">{k}★</div>
                    <div className="text-sm text-text-primary">{summary?.ratingHistogram?.[k] ?? 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-2">
              <div className="text-sm text-text-secondary">Sentiment</div>
              {summary ? <SentimentBreakdown summary={summary} /> : <p className="text-sm text-text-muted">—</p>}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-2">
              <div className="text-sm text-text-secondary">Top topics</div>
              {summary ? <TopicList summary={summary} /> : <p className="text-sm text-text-muted">—</p>}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="space-y-2">
            <div className="text-sm text-text-secondary">How to use</div>
            <ul className="text-sm text-text-muted list-disc pl-5 space-y-1">
              <li>Pick a time range (preset or custom).</li>
              <li>Click Ingest to fetch recent Google Play reviews into your DB.</li>
              <li>Click Analyze to run LLM sentiment + tags (topics) and store results.</li>
              <li>Refresh to update KPI cards.</li>
            </ul>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

