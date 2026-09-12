import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_PRICING_RULES, resolvePricingRules } from "./config";
import { calculateFare, verifyQuote } from "./engine";
import { PricingRuleStore } from "./rule-store";
import type {
  FareQuote,
  PriceAuthorization,
  PriceTripInput,
  PricingPreview,
  PricingRules,
} from "./types";

/**
 * PRICING SERVER FUNCTIONS (AUTHORITATIVE)
 * --------------------------------------------------------------------------
 * The only client-reachable surface of the pricing layer. On the server these
 * run against an authoritative in-memory rules repository; on the client the
 * compiler replaces each with an RPC fetcher.
 *
 * The client NEVER supplies a price that is trusted. A quote is signed and
 * expiring; when a booking is created the server re-derives the fare from its
 * own rules, compares it to the quoted price, and only authorises a booking
 * whose price still matches and has not expired (see `authorizeBookingPrice`).
 */

// ── Authoritative rules repository (server process memory) ──────────────
let authoritativeRules: PricingRules = DEFAULT_PRICING_RULES;

function getAuthoritativeRules(): PricingRules {
  // If the operator edited rules through the local/demo store and storage is
  // available in this process, honour those; otherwise the curated defaults.
  try {
    const local = PricingRuleStore.get();
    if (local && local.tiers.length > 0) return resolvePricingRules(local);
  } catch {
    /* server has no storage in non-SSR contexts — use defaults */
  }
  return resolvePricingRules(authoritativeRules);
}

function setAuthoritativeRules(rules: PricingRules): PricingRules {
  authoritativeRules = resolvePricingRules(rules);
  // Also persist to the local store so offline fallbacks see the same rules.
  PricingRuleStore.save(authoritativeRules);
  return authoritativeRules;
}

/* ── Quote ─────────────────────────────────────────────────────────────── */

export type QuoteRequest = {
  tripInput: PriceTripInput;
};

export const getPricingQuoteFn = createServerFn({ method: "POST" })
  .validator((data: QuoteRequest) => data)
  .handler(async ({ data }): Promise<FareQuote | { error: string }> => {
    if (!data?.tripInput) return { error: "Missing trip input" };
    try {
      const rules = getAuthoritativeRules();
      return calculateFare(data.tripInput, rules);
    } catch (error) {
      console.error("getPricingQuote failed", error);
      return { error: "Could not price this trip" };
    }
  });

/* ── Authorize a booking price (server re-derives, never trusts client) ── */

export type AuthorizeRequest = {
  quote: FareQuote;
  /** Optional reference inputs to re-check against the quote. */
  distanceKm?: number;
  durationMin?: number;
};

export const authorizeBookingPriceFn = createServerFn({ method: "POST" })
  .validator((data: AuthorizeRequest) => data)
  .handler(async ({ data }): Promise<PriceAuthorization> => {
    if (!data?.quote) {
      return {
        ok: false,
        code: "rejected",
        message: "Missing quote",
        price: 0,
        quote: data?.quote,
        degraded: true,
      };
    }
    const rules = getAuthoritativeRules();
    const now = Date.now();

    try {
      const valid = verifyQuote(data.quote, rules, now);
      if (!valid) {
        const fresh = calculateFare(data.quote.tripInput, rules, now);
        return {
          ok: false,
          code: now > data.quote.expiresAt ? "expired" : "tampered",
          message:
            now > data.quote.expiresAt
              ? "This quote has expired — refresh for the current price."
              : "Quote verification failed — the displayed price did not match.",
          price: fresh.breakdown.total,
          quote: fresh,
          degraded: false,
        };
      }
      return {
        ok: true,
        code: "authorized",
        message: "Price authorised",
        price: data.quote.breakdown.total,
        quote: data.quote,
        degraded: false,
      };
    } catch (error) {
      console.error("authorizeBookingPrice failed", error);
      return {
        ok: false,
        code: "unavailable",
        message: "Pricing is temporarily unavailable.",
        price: 0,
        quote: data.quote,
        degraded: true,
      };
    }
  });

/* ── Admin rule management ─────────────────────────────────────────────── */

export const getPricingRulesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PricingPreview> => {
    const rules = getAuthoritativeRules();
    const input: PriceTripInput = {
      tierId: rules.tiers[0]?.id ?? "go",
      distanceKm: 10,
      durationMin: 20,
      demandIndex: 0,
      driverSupply: 1,
    };
    const sample = calculateFare(input, rules);
    return { rules, sample };
  },
);

export type SaveRulesRequest = {
  rules: PricingRules;
};

export const savePricingRulesFn = createServerFn({ method: "POST" })
  .validator((data: SaveRulesRequest) => data)
  .handler(async ({ data }): Promise<PricingPreview | { error: string }> => {
    if (!data?.rules) return { error: "Missing rules" };
    try {
      const rules = setAuthoritativeRules(data.rules);
      const input: PriceTripInput = {
        tierId: rules.tiers[0]?.id ?? "go",
        distanceKm: 10,
        durationMin: 20,
        demandIndex: 0,
        driverSupply: 1,
      };
      const sample = calculateFare(input, rules);
      return { rules, sample };
    } catch (error) {
      console.error("savePricingRules failed", error);
      return { error: error instanceof Error ? error.message : "Could not save rules" };
    }
  });

export const resetPricingRulesFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<PricingPreview> => {
    const rules = setAuthoritativeRules(DEFAULT_PRICING_RULES);
    const input: PriceTripInput = {
      tierId: "go",
      distanceKm: 10,
      durationMin: 20,
      demandIndex: 0,
      driverSupply: 1,
    };
    return { rules, sample: calculateFare(input, rules) };
  },
);
