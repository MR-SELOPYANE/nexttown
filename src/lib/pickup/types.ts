/**
 * SMART PICKUP LOCATION — SHARED TYPES
 * --------------------------------------------------------------------------
 * Pure, framework-agnostic vocabulary for known pickup points. A passenger's
 * GPS coordinate is not always the best place to be collected (they may be on
 * a campus, inside a mall, or at a busy gate), so the platform maintains a
 * catalogue of verified pickup zones — road-accessible entrances and gates —
 * and recommends the nearest one when it is clearly better than the point the
 * passenger picked.
 *
 * Everything here is plain data so the recommendation logic is fully
 * unit-testable in node (mirrors the pricing / matching engine convention).
 */

/** LatLng is re-exported here so pickup code never reaches into sa-places. */
export type LatLng = { lat: number; lng: number };

/**
 * A known, road-accessible pickup point (gate / entrance / rank / terminal).
 * `radius` is how far the passenger may roam around `center` before this zone
 * stops being a candidate; `entrance` is the exact loading point drivers aim
 * for (often offset from `center`).
 */
export type PickupZone = {
  /** Slug id, e.g. "tut-sosh-guard-south". */
  id: string;
  /** Human name, e.g. "TUT South Campus Main Gate". */
  name: string;
  /** Zone centroid (the campus / mall / station it serves). */
  center: LatLng;
  /** Radius (km) around `center` within which the zone applies. */
  radius: number;
  /** The exact road-accessible pickup point (lat/lng). */
  entrance: LatLng;
  /** Whether the zone is currently offered to passengers. */
  active: boolean;
  /** Sort priority — larger is recommended first (ties broken by distance). */
  priority: number;
  /** Broad place kind, used to communicate WHY this is a good pickup. */
  placeType?: PickupPlaceType;
  /** Short helper text, e.g. "South gate, 24h security". */
  description?: string;
  /** Linked pricing zone id(s) this pickup belongs to (e.g. "campus"). */
  region?: string;
  /** Whether a vehicle can reach the entrance, when verified. */
  roadAccessible?: boolean;
  /** Whether passengers can safely walk to this point, when known. */
  pedestrianFriendly?: boolean;
  /** Known restrictions such as "no stopping" or "bus-only". */
  trafficRestrictions?: string[];
  /** Optional driver-facing access guidance. */
  notesForDrivers?: string;
};

export type PickupPlaceType =
  | "campus"
  | "station"
  | "airport"
  | "mall"
  | "hospital"
  | "landmark"
  | "taxi_rank"
  | "bus_terminal"
  | "office_park"
  | "gate";

/** Why a zone is being suggested back to the passenger. */
export type PickupRecommendationReason =
  "nearby_known_zone" | "better_road_access" | "priority_landmark" | "close_to_pickup";

/**
 * The outcome of evaluating a passenger's chosen pickup point against the
 * known zones. Either there is no clearly-better suggestion (`zones: []`) or
 * a ranked list of alternatives.
 */
export type PickupRecommendation = {
  /** The point the passenger originally chose. */
  origin: LatLng;
  /** What the passenger sees as the "you are here" context (e.g. GPS name). */
  originLabel?: string;
  /** Ranked candidate zones (best first). Empty when no improvement exists. */
  zones: RankedPickupZone[];
  /** True when `zones.length > 0`; a convenience flag for the UI. */
  hasSuggestion: boolean;
};

/** A zone with its quality score and human explanation attached. */
export type RankedPickupZone = {
  zone: PickupZone;
  /** Composite quality score — the higher the better. */
  score: number;
  /** Distance in km from the passenger's chosen point to `zone.entrance`. */
  distanceKm: number;
  /** Short text explaining the suggestion. */
  description: string;
  /** Why we surfaced it. */
  reason: PickupRecommendationReason;
};
