import {
  type LatLng,
  type PickupRecommendation,
  type PickupRecommendationReason,
  type PickupZone,
  type RankedPickupZone,
} from "./types";

/**
 * SMART PICKUP — RECOMMENDATION ENGINE (PURE)
 * --------------------------------------------------------------------------
 * Decides whether there is a better known pickup point near where the
 * passenger dropped the pin. Deterministic and fully unit-testable.
 *
 * Model
 * -----
 *  1. Look at every ACTIVE zone whose `center` is within `captureRadiusKm` of
 *     the passenger's chosen point. A campus is one zone centred on the
 *     campus, so picking anywhere on campus catches its gate.
 *  2. Compute the straight-line distance from the chosen point to the zone's
 *     `entrance` (the actual loading point).
 *  3. Drop zones the passenger is ALREADY at — i.e. within
 *     `entranceToleranceKm` of the entrance — recommending those would be a
 *     pointless round-trip.
 *  4. Score the survivors and return the best, unless it falls below
 *     `minRecommendedScore`.
 *
 * Score (higher = better), kept explainable:
 *     distanceScore = clamp(1 - distance / zone.radius, 0, 1)
 *     score         = priority + typeBonus + round(distanceScore * 10, 1)
 */

/** How far around the passenger's point we search for zone centres. */
export const captureRadiusKm = 8;

/** If the passenger is already within this of an entrance, no suggestion. */
export const entranceToleranceKm = 0.08; // ~80 m

/** Below this composite score a zone is not worth suggesting. */
export const minRecommendedScore = 12;

type TypeBoni = Record<NonNullable<PickupZone["placeType"]>, number>;

const TYPE_BONUS: TypeBoni = {
  gate: 8,
  campus: 12,
  station: 10,
  airport: 14,
  mall: 6,
  hospital: 8,
  landmark: 4,
  taxi_rank: 5,
  bus_terminal: 7,
  office_park: 4,
};

const TYPE_REASON: Record<NonNullable<PickupZone["placeType"]>, PickupRecommendationReason> = {
  gate: "better_road_access",
  campus: "nearby_known_zone",
  station: "nearby_known_zone",
  airport: "priority_landmark",
  mall: "nearby_known_zone",
  hospital: "nearby_known_zone",
  landmark: "priority_landmark",
  taxi_rank: "nearby_known_zone",
  bus_terminal: "nearby_known_zone",
  office_park: "nearby_known_zone",
};

export function scorePickupZone(zone: PickupZone, distanceKm: number): number {
  const typeBonus = zone.placeType ? (TYPE_BONUS[zone.placeType] ?? 0) : 0;
  const radial = zone.radius > 0 ? Math.min(1, Math.max(0, 1 - distanceKm / zone.radius)) : 0;
  const distanceScore = Math.round(radial * 10 * 100) / 100;
  const accessScore = zone.roadAccessible === false ? -30 : 5;
  const pedestrianScore = zone.pedestrianFriendly === true ? 2 : 0;
  const restrictionPenalty = (zone.trafficRestrictions?.length ?? 0) * 8;
  return (
    Math.round(
      (zone.priority +
        typeBonus +
        distanceScore +
        accessScore +
        pedestrianScore -
        restrictionPenalty) *
        100,
    ) / 100
  );
}

function reasonFor(zone: PickupZone, distanceKm: number): PickupRecommendationReason {
  if (zone.placeType) {
    const r = TYPE_REASON[zone.placeType];
    if (r) return r;
  }
  return distanceKm <= 1 ? "nearby_known_zone" : "close_to_pickup";
}

function humaniseKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Build a recommendation for a passenger pickup point.
 * @param origin Where the passenger actually picked.
 * @param zones The full known-zone catalogue.
 * @param originLabel Optional label for the passenger's point (GPS/tag).
 */
export function recommendPickup(
  origin: LatLng,
  zones: PickupZone[],
  originLabel?: string,
): PickupRecommendation {
  const ranked: RankedPickupZone[] = [];

  for (const zone of zones) {
    if (!zone.active) continue;

    const dCenter = haversineKm(zone.center, origin);
    if (dCenter > captureRadiusKm) continue;

    const dEntrance = haversineKm(zone.entrance, origin);
    if (dEntrance <= entranceToleranceKm) continue;

    const score = scorePickupZone(zone, dEntrance);
    if (score < minRecommendedScore) continue;

    ranked.push({
      zone,
      score,
      distanceKm: dEntrance,
      description: describeZone(zone, dEntrance),
      reason: reasonFor(zone, dEntrance),
    });
  }

  ranked.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);

  return {
    origin,
    originLabel,
    zones: ranked,
    hasSuggestion: ranked.length > 0,
  };
}

function describeZone(zone: PickupZone, distanceKm: number): string {
  const dist = humaniseKm(distanceKm);
  if (zone.description) return `${zone.description} · ${dist} from your point`;
  const kind = zone.placeType?.replace(/_/g, " ") ?? "pickup point";
  return `${zone.name} (${kind}) · ${dist} from your point`;
}

/** Haversine distance in km between two coordinates. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}
