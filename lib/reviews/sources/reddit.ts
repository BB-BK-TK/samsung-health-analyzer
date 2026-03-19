import type { ReviewFetchOptions, ReviewSourceAppRef, SourceReview } from "../types";
import type { ReviewSourceProvider } from "./base";

/**
 * Stub provider for future expansion.
 * Intentionally not registered by default.
 */
export class RedditProvider implements ReviewSourceProvider {
  readonly id = "reddit" as const;

  async fetchReviews(_app: ReviewSourceAppRef, _options: ReviewFetchOptions): Promise<SourceReview[]> {
    throw new Error("Reddit provider not implemented yet");
  }
}

