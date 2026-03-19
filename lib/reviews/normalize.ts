import type { NormalizedReview, ReviewSourceAppRef, SourceReview } from "./types";

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeSourceReview(app: ReviewSourceAppRef, r: SourceReview): NormalizedReview {
  const rating = typeof r.rating === "number" && Number.isFinite(r.rating) ? r.rating : null;
  return {
    source: r.source,
    sourceReviewId: r.sourceReviewId,
    appId: app.appId,
    rating,
    text: normalizeText(r.text),
    title: r.title?.trim() ? r.title.trim() : null,
    language: r.language?.trim() ? r.language.trim() : null,
    authorName: r.authorName?.trim() ? r.authorName.trim() : null,
    reviewedAt: r.reviewedAt.toISOString(),
  };
}

