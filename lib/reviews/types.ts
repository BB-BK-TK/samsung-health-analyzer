export type ReviewSourceId = "google_play" | "reddit";

export interface ReviewSourceAppRef {
  /** e.g. com.sec.android.app.shealth */
  appId: string;
  /** Human readable name. */
  appName?: string;
  source: ReviewSourceId;
}

export interface ReviewFetchOptions {
  /** Inclusive lower bound. */
  startDate?: Date;
  /** Inclusive upper bound. */
  endDate?: Date;
  /** Max number of reviews to return. */
  limit?: number;
  /** Locale for source query, when supported. */
  language?: string; // e.g. "en", "ko"
  /** Region/country code for source query, when supported. */
  country?: string; // e.g. "us", "kr"
}

export interface SourceReview {
  source: ReviewSourceId;
  /** Stable id from the source. */
  sourceReviewId: string;
  /** Review rating, usually 1-5. */
  rating?: number;
  text?: string;
  title?: string;
  authorName?: string;
  /** Source-provided date/time. */
  reviewedAt: Date;
  /** Source language if available. */
  language?: string;
  /** Original raw payload for auditing/debugging. */
  raw: unknown;
}

export interface NormalizedReview {
  source: ReviewSourceId;
  sourceReviewId: string;
  appId: string;
  rating: number | null;
  text: string;
  title: string | null;
  language: string | null;
  authorName: string | null;
  reviewedAt: string; // ISO
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface ReviewSentiment {
  label: SentimentLabel;
  confidence: number; // 0..1
}

export interface ReviewAnalysisResult {
  sentiment: ReviewSentiment;
  /** Small set of concise tags, e.g. ["sync", "battery", "steps"] */
  tags: string[];
  /** Optional higher-level category bucket. */
  category?: string | null;
  /** Optional urgency indicator for PM triage. */
  urgency?: "low" | "medium" | "high" | null;
}

export interface TopicCluster {
  topic: string;
  count: number;
  share: number; // 0..1
  exampleReviews: Array<Pick<NormalizedReview, "sourceReviewId" | "rating" | "text" | "reviewedAt">>;
}

export interface RangeSummary {
  appId: string;
  source: ReviewSourceId;
  startDate: string; // ISO date or datetime
  endDate: string; // ISO date or datetime
  totalReviews: number;
  averageRating: number | null;
  ratingHistogram: Record<"1" | "2" | "3" | "4" | "5", number>;
  sentimentHistogram: Record<SentimentLabel, number>;
  topTopics: TopicCluster[];
}

