import type { ReviewSourceId } from "../types";
import type { ReviewSourceProvider } from "./base";

const providers = new Map<ReviewSourceId, ReviewSourceProvider>();

export function registerReviewSourceProvider(provider: ReviewSourceProvider): void {
  providers.set(provider.id, provider);
}

export function getReviewSourceProvider(id: ReviewSourceId): ReviewSourceProvider {
  const p = providers.get(id);
  if (!p) throw new Error(`Unknown review source provider: ${id}`);
  return p;
}

export function listReviewSourceProviders(): ReviewSourceId[] {
  return Array.from(providers.keys());
}

