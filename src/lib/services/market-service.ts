import { SA_PLACES, lookupPlace, distanceKm } from "../sa-places";
import { SEED_LISTINGS } from "../domain/seed";
import type { Listing, MarketType } from "../domain/types";
import { latency, loadJson, makeRef, saveJson, storageKey, uid } from "./core";

const KEY = storageKey("db", "listings");

function readAll(): Listing[] {
  const custom = loadJson<Listing[]>(KEY, []);
  const seen = new Set(custom.map((l) => l.id));
  return [...custom, ...SEED_LISTINGS.filter((l) => !seen.has(l.id))];
}

function writeAll(listings: Listing[]): void {
  const custom = listings.filter((l) => !l.id.startsWith("seed-"));
  saveJson(KEY, custom);
}

export type SearchQuery = {
  type: MarketType;
  from?: string;
  to?: string;
  when?: string;
  limit?: number;
};

/** Tokenises a free-text location query and checks it against a listing field. */
function locationMatch(query: string, target: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = target.toLowerCase();

  const qPlace = lookupPlace(q);
  if (qPlace) {
    // Nearby-match: accept listings whose own place is within ~60 km.
    const tPlace = lookupPlace(t);
    if (tPlace) return distanceKm(qPlace, tPlace) <= 60;
    return t.includes(q);
  }
  return t.includes(q);
}

/** Resolves short airport codes so JNB/CPT searches work against city names. */
function expandAlias(query: string): string {
  const map: Record<string, string[]> = {
    jnb: ["johannesburg", "lanseria", "sandton", "rosebank", "midrand", "soweto"],
    cpt: ["cape town", "stellenbosch", "paarl", "century city"],
    dur: ["durban", "umhlanga", "king shaka", "pietermaritzburg"],
    plz: ["port elizabeth", "gqeberha"],
  };
  const q = query.trim().toLowerCase();
  return map[q]?.join(" ") ?? query;
}

function whenMatch(filter: string, listing: Listing): boolean {
  if (!filter) return true;
  const lower = listing.when.toLowerCase() + " " + listing.title.toLowerCase();
  if (filter === "today")
    return lower.includes("today") || lower.includes("on-demand") || lower.includes("leaving");
  if (filter === "this-week") return true;
  return true;
}

function typeFilterMatch(filter: string, listing: Listing): boolean {
  if (!filter) return true;
  const haystack =
    `${listing.tags.join(" ")} ${listing.meta.join(" ")} ${listing.when} ${listing.title}`.toLowerCase();
  if (filter === "any") return true;
  if (filter === "now") return true;
  if (filter === "tomorrow") return true;
  if (filter === "week") return true;
  return haystack.includes(filter.toLowerCase());
}

export const MarketService = {
  async list(type: MarketType): Promise<Listing[]> {
    await latency(280);
    return readAll().filter((l) => l.type === type && l.status === "live");
  },

  async mine(ownerId: string): Promise<Listing[]> {
    await latency(250);
    return readAll()
      .filter((l) => l.ownerId === ownerId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async get(id: string): Promise<Listing | null> {
    await latency(120);
    return readAll().find((l) => l.id === id) ?? null;
  },

  async search(query: SearchQuery): Promise<Listing[]> {
    await latency(450);
    const q = query.from ? expandAlias(query.from) : "";
    const d = query.to ? expandAlias(query.to) : "";
    return readAll()
      .filter((l) => l.type === query.type && l.status === "live")
      .filter((l) => locationMatch(q, l.from) || locationMatch(q, l.title))
      .filter((l) => locationMatch(d, l.to) || locationMatch(d, l.title))
      .filter((l) => whenMatch(query.when ?? "", l))
      .filter((l) => typeFilterMatch(query.when ?? "", l))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, query.limit ?? 50);
  },

  async create(
    ownerId: string,
    input: Omit<Listing, "id" | "ownerId" | "status" | "createdAt" | "rating" | "seats" | "meta">,
  ): Promise<Listing> {
    await latency(450);
    const all = readAll();
    const listing: Listing = {
      ...input,
      id: `user-${uid()}`,
      ownerId,
      rating: 5,
      seats: input.capacity ? 1 : 0,
      meta: ["New listing", "Verified operator"],
      status: "live",
      createdAt: Date.now(),
    };
    writeAll([listing, ...all]);
    return listing;
  },

  async toggle(ownerId: string, id: string): Promise<Listing> {
    await latency(200);
    const all = readAll();
    const next = all.map((l) =>
      l.id === id && l.ownerId === ownerId
        ? { ...l, status: (l.status === "live" ? "paused" : "live") as Listing["status"] }
        : l,
    );
    writeAll(next);
    return next.find((l) => l.id === id) as Listing;
  },

  async remove(ownerId: string, id: string): Promise<void> {
    await latency(200);
    writeAll(readAll().filter((l) => !(l.id === id && l.ownerId === ownerId)));
  },

  /** Consume capacity when a booking is created. */
  async consumeSeats(id: string, qty: number): Promise<void> {
    const all = readAll();
    writeAll(all.map((l) => (l.id === id ? { ...l, seats: Math.max(0, l.seats - qty) } : l)));
  },

  async releaseSeats(id: string, qty: number): Promise<void> {
    const all = readAll();
    writeAll(all.map((l) => (l.id === id ? { ...l, seats: l.seats + qty } : l)));
  },
};

export { SA_PLACES, makeRef };
