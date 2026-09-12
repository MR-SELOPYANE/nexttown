import { DEFAULT_PRICING_RULES, resolvePricingRules } from "./config";
import { calculateFare, verifyQuote } from "./engine";
import type { FareQuote, PriceTripInput, PricingRules } from "./types";
import { loadJson, saveJson, storageKey } from "../services/core";

/**
 * PRICING RULE STORE (client / local + offline fallback)
 * --------------------------------------------------------------------------
 * Persists the operator-configurable ruleset to localStorage so pricing rules
 * survive reloads without a backend, mirroring how the BookingService and
 * MarketService already work in this codebase. The authoritative prices still
 * come from the server (see pricing-server.ts); this store is the source for
 * the local/demo path and a fallback when the server is unavailable.
 *
 * `version` is bumped on every save so outstanding quotes are invalidated.
 */

const key = () => storageKey("pricing", "rules");

function readRules(): PricingRules {
  const stored = loadJson<PricingRules | null>(key(), null);
  if (stored && stored.tiers && stored.tiers.length > 0) {
    try {
      return resolvePricingRules(stored);
    } catch {
      return DEFAULT_PRICING_RULES;
    }
  }
  return DEFAULT_PRICING_RULES;
}

function writeRules(rules: PricingRules): void {
  saveJson(key(), { ...rules, version: rules.version + 1 });
}

export const PricingRuleStore = {
  get(): PricingRules {
    return readRules();
  },

  save(rules: PricingRules): PricingRules {
    writeRules(rules);
    return readRules();
  },

  reset(): PricingRules {
    saveJson(key(), DEFAULT_PRICING_RULES);
    return DEFAULT_PRICING_RULES;
  },

  /** Local-only quote (used when no server is reachable). */
  quote(input: PriceTripInput, now = Date.now()): FareQuote {
    return calculateFare(input, readRules(), now);
  },

  /** Local-only tamper/expiry check. */
  verify(quote: FareQuote, now = Date.now()): boolean {
    if (quote.rulesVersion !== readRules().version) return false;
    return verifyQuote(quote, readRules(), now);
  },
};
