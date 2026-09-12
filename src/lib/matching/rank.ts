import type { ScoredCandidate } from "./types";

/**
 * RANKING
 * --------------------------------------------------------------------------
 * Deterministic order: score desc, then fairness (fewest recent offers),
 * then rating desc, then driver id asc so identical inputs always rank the
 * same way — important for preview parity and reproducible tests.
 */

export function rankCandidates(scored: ScoredCandidate[]): ScoredCandidate[] {
  return [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const fairnessDelta = a.candidate.recentOffers - b.candidate.recentOffers;
    if (fairnessDelta !== 0) return fairnessDelta;
    const ratingDelta = b.candidate.profile.rating - a.candidate.profile.rating;
    if (ratingDelta !== 0) return ratingDelta;
    return a.candidate.driverId.localeCompare(b.candidate.driverId);
  });
}

/** First ranked candidate not in `excludedDriverIds` (e.g. already rejected). */
export function selectNextCandidate(
  candidates: ScoredCandidate[],
  excludedDriverIds: Iterable<string>,
): ScoredCandidate | null {
  const excluded = new Set(excludedDriverIds);
  for (const candidate of candidates) {
    if (!excluded.has(candidate.candidate.driverId)) return candidate;
  }
  return null;
}
