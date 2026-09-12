import { haversine } from "../sa-places";
import { resolveConfig } from "./config";
import { estimateEtaMinutes, evaluateEligibility } from "./eligibility";
import { scoreCandidate, scoreFactors } from "./scoring";
import { rankCandidates } from "./rank";
import type {
  DriverCandidate,
  MatchingConfig,
  MatchingRequest,
  MatchingResult,
  RejectedCandidate,
  ScoredCandidate,
} from "./types";

/**
 * MATCH ORCHESTRATION
 * --------------------------------------------------------------------------
 * Pipeline: candidate pool -> eligibility filter -> ETA + distance -> factor
 * scoring -> weighted total -> rank -> take top `candidateLimit`.
 *
 * The final assignment decision is NEVER made here: this module only produces
 * a ranked shortlist. The server-authoritative dispatch layer turns the
 * shortlist into offers and defends against double-assignment.
 */

export function matchDrivers(
  candidates: DriverCandidate[],
  request: MatchingRequest,
  config: MatchingConfig = resolveConfig(),
): MatchingResult {
  const eligible: ScoredCandidate[] = [];
  const rejected: RejectedCandidate[] = [];

  for (const candidate of candidates) {
    const verdict = evaluateEligibility(candidate, request, config);
    if (!verdict.eligible) {
      rejected.push({ candidate, reasons: verdict.reasons });
      continue;
    }

    const distanceKm = haversine(request.pickup, {
      lat: candidate.lat,
      lng: candidate.lng,
    });
    const etaMin = estimateEtaMinutes(candidate, request.pickup, config);
    const factorScores = scoreFactors(candidate, request, config, etaMin);
    const score = scoreCandidate(candidate, request, config, etaMin);

    eligible.push({ candidate, distanceKm, etaMin, factorScores, score });
  }

  const all = rankCandidates(eligible);
  const selected = all.slice(0, config.candidateLimit);
  return {
    all,
    selected,
    rejected,
    best: selected[0] ?? null,
  };
}
