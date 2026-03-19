import gplay from "google-play-scraper";

import type { ReviewFetchOptions, ReviewSourceAppRef, SourceReview } from "../types";
import type { ReviewSourceProvider } from "./base";

function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export class GooglePlayProvider implements ReviewSourceProvider {
  readonly id = "google_play" as const;

  async fetchReviews(app: ReviewSourceAppRef, options: ReviewFetchOptions): Promise<SourceReview[]> {
    if (!app.appId?.trim()) throw new Error("appId required");
    if (app.source !== "google_play") throw new Error(`GooglePlayProvider cannot handle source=${app.source}`);

    const limit = Math.max(1, Math.min(options.limit ?? 200, 2000));
    const lang = options.language ?? "en";
    const country = options.country ?? "us";

    const startMs = options.startDate ? options.startDate.getTime() : null;
    const endMs = options.endDate ? options.endDate.getTime() : null;

    const out: SourceReview[] = [];
    let nextPaginationToken: unknown = undefined;

    // Pull newest-first and stop once we are past the startDate.
    while (out.length < limit) {
      const batchSize = Math.min(200, limit - out.length);
      const res = (await gplay.reviews({
        appId: app.appId,
        sort: gplay.sort.NEWEST,
        num: batchSize,
        lang,
        country,
        paginate: nextPaginationToken as unknown as string | undefined,
      })) as unknown as { data?: unknown[]; nextPaginationToken?: unknown };

      const reviews = (res?.data ?? []) as unknown[];
      nextPaginationToken = res?.nextPaginationToken;

      if (!reviews.length) break;

      for (const r of reviews) {
        const obj = (r ?? {}) as Record<string, unknown>;
        const reviewedAt = coerceDate(obj.date) ?? new Date();
        const ms = reviewedAt.getTime();

        if (endMs !== null && ms > endMs) continue;
        if (startMs !== null && ms < startMs) {
          // Since we are fetching NEWEST first, once we're below startDate we can stop early.
          nextPaginationToken = null;
          break;
        }

        const sourceReviewId = String(obj.id ?? obj.reviewId ?? `${app.appId}:${ms}:${out.length}`);
        const score = typeof obj.score === "number" ? obj.score : typeof obj.rating === "number" ? obj.rating : undefined;
        out.push({
          source: "google_play",
          sourceReviewId,
          rating: score,
          text: typeof obj.text === "string" ? obj.text : undefined,
          title: typeof obj.title === "string" ? obj.title : undefined,
          authorName: typeof obj.userName === "string" ? obj.userName : undefined,
          reviewedAt,
          language: typeof obj.lang === "string" ? obj.lang : options.language ?? undefined,
          raw: obj,
        });

        if (out.length >= limit) break;
      }

      if (!nextPaginationToken) break;
    }

    return out;
  }
}

