import type { ReviewFetchOptions, ReviewSourceAppRef, SourceReview } from "../types";

export interface ReviewSourceProvider {
  readonly id: ReviewSourceAppRef["source"];

  /**
   * Fetch reviews from the source.
   * Implementations may over-fetch to satisfy date filtering.
   */
  fetchReviews(app: ReviewSourceAppRef, options: ReviewFetchOptions): Promise<SourceReview[]>;
}

