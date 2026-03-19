import { GooglePlayProvider } from "./google-play";
import { registerReviewSourceProvider } from "./registry";
import { RedditProvider } from "./reddit";

let bootstrapped = false;

export function bootstrapReviewProviders(): void {
  if (bootstrapped) return;
  registerReviewSourceProvider(new GooglePlayProvider());
  bootstrapped = true;
}

/** Optional bootstrap for future sources (not enabled by default). */
export function enableRedditProvider(): void {
  registerReviewSourceProvider(new RedditProvider());
}

