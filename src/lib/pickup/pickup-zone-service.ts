import { loadJson, saveJson, storageKey } from "../services/core";
import { recommendPickup } from "./recommend";
import type { LatLng, PickupRecommendation, PickupZone } from "./types";

/**
 * PICKUP ZONE STORE
 * --------------------------------------------------------------------------
 * The operator-maintained catalogue of known road-accessible pickup points
 * (gates, entrances, ranks, terminals). Mirrors the marketplace / pricing
 * services: seeded with curated SA locations, persisted to localStorage, and
 * ready to be backed by the `pickup_zones` Supabase table (see migration) so
 * more South African locations can be added through the admin panel.
 *
 * The recommendation itself is pure (`recommend.ts`) and just consumes this
 * catalogue.
 */

const key = () => storageKey("db", "pickup-zones");

/**
 * Curated seed. Coordinates are approximate landing points for the platform's
 * launch markets; operators refine entrances and add more through the admin
 * panel. `center` is the broad area the zone serves; `entrance` is the exact
 * road-accessible loading point drivers should aim for.
 */
export const SEED_PICKUP_ZONES: PickupZone[] = [
  // ── Campuses ─────────────────────────────────────────────────────────────
  {
    id: "tut-soshanguve-south-main-gate",
    name: "TUT South Campus Main Gate",
    center: { lat: -25.518, lng: 28.1 },
    radius: 2.5,
    entrance: { lat: -25.5208, lng: 28.1032 },
    active: true,
    priority: 90,
    placeType: "gate",
    region: "gauteng",
    description: "South gate entrance, 24h security post",
  },
  {
    id: "tut-soshanguve-north-gate",
    name: "TUT North Campus Gate",
    center: { lat: -25.484, lng: 28.115 },
    radius: 2,
    entrance: { lat: -25.4862, lng: 28.117 },
    active: true,
    priority: 72,
    placeType: "gate",
    region: "gauteng",
    description: "North campus access road",
  },
  {
    id: "uvs-main-gate",
    name: "Univen Main Gate",
    center: { lat: -22.978, lng: 30.458 },
    radius: 2,
    entrance: { lat: -22.979, lng: 30.457 },
    active: true,
    priority: 60,
    placeType: "gate",
    region: "limpopo",
    description: "Public entrance, Prinsevani campus",
  },
  {
    id: "vut-main-gate",
    name: "VUT Main Gate",
    center: { lat: -26.693, lng: 27.834 },
    radius: 2,
    entrance: { lat: -26.6935, lng: 27.8338 },
    active: true,
    priority: 60,
    placeType: "gate",
    region: "gauteng",
    description: "Andries Potgieter entrance",
  },

  // ── Rail / transit ───────────────────────────────────────────────────────
  {
    id: "sandton-gautrain",
    name: "Sandton Gautrain Station",
    center: { lat: -26.108, lng: 28.056 },
    radius: 1.6,
    entrance: { lat: -26.1086, lng: 28.0553 },
    active: true,
    priority: 78,
    placeType: "station",
    region: "gauteng",
    description: "Gautrain station, Maude St drop-off",
  },
  {
    id: "hatfield-gautrain",
    name: "Hatfield Gautrain Station",
    center: { lat: -25.744, lng: 28.234 },
    radius: 1.6,
    entrance: { lat: -25.7445, lng: 28.2338 },
    active: true,
    priority: 74,
    placeType: "station",
    region: "gauteng",
    description: "Collyer Rd station entrance",
  },
  {
    id: "joburg-park-station",
    name: "Johannesburg Park Station",
    center: { lat: -26.196, lng: 28.042 },
    radius: 1.4,
    entrance: { lat: -26.1965, lng: 28.041 },
    active: true,
    priority: 70,
    placeType: "bus_terminal",
    region: "gauteng",
    description: "Main concourse taxi & bus interchange",
  },

  // ── Airports ─────────────────────────────────────────────────────────────
  {
    id: "ortambo-arrivals",
    name: "OR Tambo Intl · Arrivals",
    center: { lat: -26.139, lng: 28.246 },
    radius: 2,
    entrance: { lat: -26.1392, lng: 28.2448 },
    active: true,
    priority: 85,
    placeType: "airport",
    region: "gauteng",
    description: "Arrivals level, Bay 1 pick-up zone",
  },
  {
    id: "king-shaka-arrivals",
    name: "King Shaka Intl · Arrivals",
    center: { lat: -29.616, lng: 31.118 },
    radius: 2,
    entrance: { lat: -29.6158, lng: 31.1176 },
    active: true,
    priority: 80,
    placeType: "airport",
    region: "kwazulu-natal",
    description: "Arrivals car pick-up lane",
  },

  // ── Malls ────────────────────────────────────────────────────────────────
  {
    id: "mall-of-africa",
    name: "Mall of Africa",
    center: { lat: -26.021, lng: 28.102 },
    radius: 1.5,
    entrance: { lat: -26.0205, lng: 28.1031 },
    active: true,
    priority: 58,
    placeType: "mall",
    region: "gauteng",
    description: "Main entrance, Waterfall node",
  },
  {
    id: "gateway-theatre",
    name: "Gateway / Theatre",
    center: { lat: -29.755, lng: 31.045 },
    radius: 1.6,
    entrance: { lat: -29.7557, lng: 31.0458 },
    active: true,
    priority: 55,
    placeType: "mall",
    region: "kwazulu-natal",
    description: "Palm Blvd pick-up zone",
  },
  {
    id: "menlyn-maine",
    name: "Menlyn Maine",
    center: { lat: -25.785, lng: 28.273 },
    radius: 1.5,
    entrance: { lat: -25.7855, lng: 28.2732 },
    active: true,
    priority: 56,
    placeType: "mall",
    region: "gauteng",
    description: "Central piazza entrance",
  },

  // ── Hospitals ────────────────────────────────────────────────────────────
  {
    id: "charlotte-maxeke-entrance",
    name: "Charlotte Maxeke Hospital",
    center: { lat: -26.168, lng: 28.023 },
    radius: 1.4,
    entrance: { lat: -26.1687, lng: 28.0233 },
    active: true,
    priority: 62,
    placeType: "hospital",
    region: "gauteng",
    description: "Joubert St main entrance",
  },

  // ── Landmarks / office parks ─────────────────────────────────────────────
  {
    id: "union-buildings-gate",
    name: "Union Buildings · West Gate",
    center: { lat: -25.743, lng: 28.209 },
    radius: 1.4,
    entrance: { lat: -25.7438, lng: 28.2075 },
    active: true,
    priority: 66,
    placeType: "landmark",
    region: "gauteng",
    description: "Mears St gate, visitors entrance",
  },
  {
    id: "sbic-midrand",
    name: "SBIC Midrand Office Park",
    center: { lat: -25.984, lng: 28.139 },
    radius: 1.2,
    entrance: { lat: -25.9845, lng: 28.1394 },
    active: true,
    priority: 52,
    placeType: "office_park",
    region: "gauteng",
    description: "Main visitor entrance",
  },
];

export const DEFAULT_PICKUP_ZONES: PickupZone[] = SEED_PICKUP_ZONES.map((z) => ({ ...z }));

function readZones(): PickupZone[] {
  const stored = loadJson<PickupZone[] | null>(key(), null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return DEFAULT_PICKUP_ZONES;
}

function writeZones(zones: PickupZone[]): void {
  saveJson(key(), zones);
}

export const PickupZoneService = {
  list(): PickupZone[] {
    return readZones();
  },

  upsert(zone: PickupZone): PickupZone[] {
    const zones = readZones();
    const idx = zones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) zones[idx] = zone;
    else zones.push(zone);
    writeZones(zones);
    return zones;
  },

  remove(id: string): PickupZone[] {
    const zones = readZones().filter((z) => z.id !== id);
    writeZones(zones);
    return zones;
  },

  reset(): PickupZone[] {
    writeZones(DEFAULT_PICKUP_ZONES);
    return DEFAULT_PICKUP_ZONES;
  },

  /**
   * Recommend a better pickup point near where the passenger chose one.
   * Returns an empty recommendation when no known zone is clearly better.
   */
  recommend(origin: LatLng, originLabel?: string): PickupRecommendation {
    return recommendPickup(origin, readZones(), originLabel);
  },
};
