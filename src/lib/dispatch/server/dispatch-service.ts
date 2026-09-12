import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dispatchTransition,
  matchDrivers,
  resolveConfig,
  type DispatchState,
  type DriverCandidate,
  type MatchingConfig,
  type MatchingRequest,
  type VehicleClass,
} from "../../matching";
import { getServiceClient } from "./supabase-service";

/**
 * SERVER-AUTHORITATIVE DISPATCH SERVICE
 * --------------------------------------------------------------------------
 * Orchestrates the pure matching engine against the real store:
 *
 *   1. fetch the eligible pool (available + fresh fixes, joined to profiles)
 *   2. matchDrivers() -> ranked shortlist            (pure, tested)
 *   3. persist the dispatch row, then atomically claim a driver:
 *        UPDATE driver_locations SET status='reserved'
 *        WHERE driver_id=? AND status='available'
 *      so two concurrent dispatches never grab the same driver.
 *   4. on rejection/timeout, release the reservation, advance the shortlist
 *      and repeat — driven by the pure lifecycle state machine.
 *
 * Double-assignment is therefore enforced three ways: the atomic claim
 * UPDATE, the partial unique index `ride_dispatch_active_driver` (a driver
 * can be current on only one active dispatch), and the machine transitions.
 *
 * This module is import-protected (it lives under a `server/` directory),
 * so client bundles can never reach it. It is only invoked through the
 * server functions in `../dispatch-server.ts`.
 */

export const VEHICLE_CLASSES: VehicleClass[] = ["hatch", "sedan", "suv", "minivan", "minibus"];

const ACTIVE_STATES: DispatchState[] = ["offered", "accepted", "driver_assigned"];

export type CreateDispatchInput = {
  bookingId: string;
  passengerLabel: string;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  pickupLabel: string;
  dropoffLabel: string;
  pickupZone?: string | null;
  rideType: string;
  vehicleClass: VehicleClass;
  requiredSeats: number;
  requiredCapabilities?: string[];
  demandIndex?: number;
};

export type ShortlistEntry = {
  driverId: string;
  score: number;
  etaMin: number;
  distanceKm: number;
};

export type DispatchRow = {
  id: string;
  booking_id: string;
  state: DispatchState;
  offer_sequence: number;
  candidate_shortlist: ShortlistEntry[];
  current_driver_id: string | null;
  pickup_label: string;
  dropoff_label: string;
  vehicle_class: string;
  required_seats: number;
  ride_type: string;
  demand_index: number;
  created_at: string;
  updated_at: string;
};

export type DispatchServiceResult =
  | {
      ok: true;
      dispatch: DispatchRow;
      offered: boolean;
      driverId: string | null;
      reason: "offered" | "no_driver_available" | "accepted" | "reassigned";
    }
  | {
      ok: false;
      code:
        | "unconfigured"
        | "invalid_input"
        | "already_dispatched"
        | "not_found"
        | "forbidden"
        | "conflict"
        | "service_error";
      message: string;
    };

/* ─── Pool + match ───────────────────────────────────────────────────────── */

type PoolRow = {
  driver_id: string;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed_kmh: number | null;
  updated_at: string | null;
  // driver_locations has no FK to driver_profiles, so PostgREST embeds the
  // related row as an ARRAY (one element) even though it is one-to-one.
  driver_profiles:
    | {
        vehicle_class: string | null;
        seats: number | null;
        rating: number | null;
        acceptance_rate: number | null;
        cancellation_rate: number | null;
        preferred_zone: string | null;
        ride_types: string[] | null;
        capabilities: string[] | null;
      }[]
    | null;
};

async function fetchPool(
  client: SupabaseClient,
  config: MatchingConfig,
): Promise<DriverCandidate[] | null> {
  const staleIso = new Date(Date.now() - config.staleLocationMs).toISOString();
  const { data, error } = await client
    .from("driver_locations")
    .select(
      "driver_id,latitude,longitude,heading,speed_kmh,updated_at,driver_profiles(vehicle_class,seats,rating,acceptance_rate,cancellation_rate,preferred_zone,ride_types,capabilities)",
    )
    .eq("status", "available")
    .gte("updated_at", staleIso);
  if (error) return null;

  // Fairness/workload: how busy each driver already is.
  const activeCounts = new Map<string, number>();
  const offerCounts = new Map<string, number>();
  const { data: active } = await client
    .from("ride_dispatch")
    .select("current_driver_id,state,updated_at")
    .in("state", ACTIVE_STATES)
    .not("current_driver_id", "is", null);
  if (active) {
    for (const row of active) {
      activeCounts.set(row.current_driver_id, (activeCounts.get(row.current_driver_id) ?? 0) + 1);
      if (row.state === "offered" || row.state === "accepted") {
        offerCounts.set(row.current_driver_id, (offerCounts.get(row.current_driver_id) ?? 0) + 1);
      }
    }
  }

  const candidates: DriverCandidate[] = [];
  for (const raw of data ?? []) {
    const row = raw as PoolRow;
    const embedded = Array.isArray(row.driver_profiles)
      ? row.driver_profiles[0]
      : row.driver_profiles;
    if (!embedded || !row.updated_at) continue; // no profile -> cannot judge capability
    candidates.push({
      driverId: row.driver_id,
      lat: row.latitude,
      lng: row.longitude,
      heading: row.heading ?? 0,
      speedKmh: row.speed_kmh ?? 0,
      status: "available",
      updatedAt: new Date(row.updated_at).getTime(),
      activeDispatches: activeCounts.get(row.driver_id) ?? 0,
      recentOffers: offerCounts.get(row.driver_id) ?? 0,
      profile: {
        vehicleClass: asVehicleClass(embedded.vehicle_class),
        seats: embedded.seats ?? 4,
        rating: embedded.rating ?? 5,
        acceptanceRate: embedded.acceptance_rate ?? 1,
        cancellationRate: embedded.cancellation_rate ?? 0,
        preferredZone: embedded.preferred_zone,
        rideTypes: embedded.ride_types ?? [],
        capabilities: embedded.capabilities ?? [],
      },
    });
  }
  return candidates;
}

function asVehicleClass(value: string | null): VehicleClass {
  return (VEHICLE_CLASSES as string[]).includes(value ?? "") ? (value as VehicleClass) : "sedan";
}

/* ─── Dispatch lifecycle operations ──────────────────────────────────────── */

export async function createDispatch(input: CreateDispatchInput): Promise<DispatchServiceResult> {
  const client = getServiceClient();
  if (!client) {
    return { ok: false, code: "unconfigured", message: "Supabase service role not configured" };
  }

  const config = resolveConfig();
  const request: MatchingRequest = {
    bookingId: input.bookingId,
    pickup: input.pickup,
    dropoff: input.dropoff,
    pickupLabel: input.pickupLabel,
    dropoffLabel: input.dropoffLabel,
    pickupZone: input.pickupZone,
    rideType: input.rideType,
    vehicleClass: input.vehicleClass,
    requiredSeats: input.requiredSeats,
    requiredCapabilities: input.requiredCapabilities,
    demandIndex: input.demandIndex ?? 0.5,
  };

  const pool = await fetchPool(client, config);
  if (!pool) {
    return { ok: false, code: "service_error", message: "Could not read the driver pool" };
  }

  const match = matchDrivers(pool, request, config);
  const shortlist: ShortlistEntry[] = match.all.map((c) => ({
    driverId: c.candidate.driverId,
    score: c.score,
    etaMin: c.etaMin,
    distanceKm: c.distanceKm,
  }));

  const created = await insertDispatch(client, {
    ...input,
    state: "searching",
    shortlist,
  });
  if (created.code === "already_dispatched") {
    return {
      ok: false,
      code: "already_dispatched",
      message: "This booking already has an active dispatch",
    };
  }
  if (created.code === "service_error") {
    return { ok: false, code: "service_error", message: "Could not create the dispatch" };
  }

  const offer = await offerNext(client, created.dispatch);
  if (!offer.ok) return { ok: false, code: "service_error", message: "Could not offer the driver" };
  return {
    ok: true,
    dispatch: offer.dispatch,
    offered: offer.offered,
    driverId: offer.driverId,
    reason: offer.offered ? "offered" : "no_driver_available",
  };
}

async function insertDispatch(
  client: SupabaseClient,
  options: Omit<CreateDispatchInput, "bookingId"> & {
    bookingId: string;
    state: DispatchState;
    shortlist: ShortlistEntry[];
  },
): Promise<
  { code: "ok"; dispatch: DispatchRow } | { code: "already_dispatched" } | { code: "service_error" }
> {
  const { data, error } = await client
    .from("ride_dispatch")
    .insert({
      booking_id: options.bookingId,
      passenger_label: options.passengerLabel,
      state: options.state,
      candidate_shortlist: options.shortlist,
      pickup_lat: options.pickup.lat,
      pickup_lng: options.pickup.lng,
      dropoff_lat: options.dropoff.lat,
      dropoff_lng: options.dropoff.lng,
      pickup_label: options.pickupLabel,
      dropoff_label: options.dropoffLabel,
      vehicle_class: options.vehicleClass,
      required_seats: options.requiredSeats,
      ride_type: options.rideType,
      demand_index: options.demandIndex ?? 0.5,
    })
    .select(
      "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
    )
    .single();
  if (error) {
    return error.code === "23505" ? { code: "already_dispatched" } : { code: "service_error" };
  }
  return { code: "ok", dispatch: rowToDispatch(data) };
}

/**
 * Atomically flip `available` -> `reserved` for a driver. Returns true only
 * when this call was the one that won the race against every other request.
 */
async function claimDriver(client: SupabaseClient, driverId: string): Promise<boolean> {
  const { data, error } = await client
    .from("driver_locations")
    .update({ status: "reserved", updated_at: new Date().toISOString() })
    .eq("driver_id", driverId)
    .eq("status", "available")
    .select("driver_id")
    .maybeSingle();
  if (error) return false;
  return Boolean(data?.driver_id);
}

/** Return a reservation so the driver can take other work. */
async function releaseDriver(client: SupabaseClient, driverId: string): Promise<void> {
  await client
    .from("driver_locations")
    .update({ status: "available", updated_at: new Date().toISOString() })
    .eq("driver_id", driverId)
    .eq("status", "reserved");
}

async function offerNext(
  client: SupabaseClient,
  dispatch: DispatchRow,
): Promise<
  { ok: true; dispatch: DispatchRow; offered: boolean; driverId: string | null } | { ok: false }
> {
  const shortlist = dispatch.candidate_shortlist ?? [];
  let cursor = dispatch.offer_sequence;

  while (cursor < shortlist.length) {
    const entry = shortlist[cursor];
    cursor += 1;

    const claimed = await claimDriver(client, entry.driverId);
    if (!claimed) continue; // taken by another request in the meantime

    const attempt = await client
      .from("ride_dispatch")
      .update({
        state: "offered",
        current_driver_id: entry.driverId,
        offer_sequence: cursor,
      })
      .eq("id", dispatch.id)
      .select(
        "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
      )
      .single();

    if (attempt.error) {
      // Most likely 23505 `ride_dispatch_active_driver` — this driver is
      // already current on another active dispatch. Code 403/406 can also
      // surface; treat any failure as "skip this driver".
      await releaseDriver(client, entry.driverId);
      continue;
    }
    if (!attempt.data?.id) continue;

    return {
      ok: true,
      dispatch: rowToDispatch(attempt.data),
      offered: true,
      driverId: entry.driverId,
    };
  }

  // Shortlist exhausted — nothing left to offer.
  const { data } = await client
    .from("ride_dispatch")
    .update({ state: "no_driver_available", current_driver_id: null, offer_sequence: cursor })
    .eq("id", dispatch.id)
    .select(
      "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
    )
    .single();
  if (!data?.id) return { ok: false };
  return { ok: true, dispatch: rowToDispatch(data), offered: false, driverId: null };
}

export async function respondDispatch(
  dispatchId: string,
  driverId: string,
  response: "accepted" | "rejected" | "timeout",
): Promise<DispatchServiceResult> {
  const client = getServiceClient();
  if (!client) {
    return { ok: false, code: "unconfigured", message: "Supabase service role not configured" };
  }

  const { data: current, error } = await client
    .from("ride_dispatch")
    .select(
      "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
    )
    .eq("id", dispatchId)
    .maybeSingle();
  if (error || !current) {
    return { ok: false, code: "not_found", message: "Dispatch not found" };
  }
  const dispatch = rowToDispatch(current);
  if (dispatch.current_driver_id !== driverId) {
    return { ok: false, code: "forbidden", message: "This offer is not for that driver" };
  }

  const event =
    response === "accepted"
      ? ({ type: "DRIVER_ACCEPTED" } as const)
      : response === "rejected"
        ? ({ type: "DRIVER_REJECTED" } as const)
        : ({ type: "OFFER_TIMEOUT" } as const);

  let nextState: DispatchState;
  try {
    nextState = dispatchTransition(dispatch.state, event);
  } catch {
    return {
      ok: false,
      code: "conflict",
      message: `Dispatch is ${dispatch.state}; cannot respond`,
    };
  }

  if (nextState === "accepted") {
    const { data, error: updateError } = await client
      .from("ride_dispatch")
      .update({ state: "accepted" })
      .eq("id", dispatchId)
      .eq("state", "offered")
      .eq("current_driver_id", driverId)
      .select(
        "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
      )
      .single();
    if (updateError || !data?.id) {
      return { ok: false, code: "conflict", message: "Offer already resolved elsewhere" };
    }
    return {
      ok: true,
      dispatch: rowToDispatch(data),
      offered: true,
      driverId,
      reason: "accepted",
    };
  }

  // Rejected / timed out: release the reservation and offer the next driver.
  await releaseDriver(client, driverId);
  const { data: afterRelease } = await client
    .from("ride_dispatch")
    .update({
      state: "searching",
      current_driver_id: null,
      offer_sequence: dispatch.offer_sequence,
    })
    .eq("id", dispatchId)
    .select(
      "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
    )
    .single();
  if (!afterRelease?.id) {
    return { ok: false, code: "service_error", message: "Could not release the rejected driver" };
  }
  const next = await offerNext(client, rowToDispatch(afterRelease));
  if (!next.ok) {
    return { ok: false, code: "service_error", message: "Could not advance to the next driver" };
  }
  return {
    ok: true,
    dispatch: next.dispatch,
    offered: next.offered,
    driverId: next.driverId,
    reason: next.offered ? "reassigned" : "no_driver_available",
  };
}

export async function getDispatch(dispatchId: string): Promise<DispatchRow | null> {
  const client = getServiceClient();
  if (!client) return null;
  const { data, error } = await client
    .from("ride_dispatch")
    .select(
      "id,booking_id,state,offer_sequence,candidate_shortlist,current_driver_id,pickup_label,dropoff_label,vehicle_class,required_seats,ride_type,demand_index,created_at,updated_at",
    )
    .eq("id", dispatchId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToDispatch(data);
}

function rowToDispatch(row: Record<string, unknown>): DispatchRow {
  return {
    id: String(row.id),
    booking_id: String(row.booking_id),
    state: String(row.state) as DispatchState,
    offer_sequence: Number(row.offer_sequence),
    candidate_shortlist: Array.isArray(row.candidate_shortlist)
      ? (row.candidate_shortlist as ShortlistEntry[])
      : [],
    current_driver_id: row.current_driver_id ? String(row.current_driver_id) : null,
    pickup_label: String(row.pickup_label),
    dropoff_label: String(row.dropoff_label),
    vehicle_class: String(row.vehicle_class),
    required_seats: Number(row.required_seats),
    ride_type: String(row.ride_type),
    demand_index: Number(row.demand_index) || 0.5,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

/** Validation for the create-dispatch payload. Returns null when valid. */
export function validateDispatchInput(body: Record<string, unknown>): CreateDispatchInput | null {
  const pickup = body.pickup as Record<string, unknown> | undefined;
  const dropoff = body.dropoff as Record<string, unknown> | undefined;
  const vehicleClass = String(body.vehicleClass ?? "");

  const isLatLong = (v: unknown): v is { lat: number; lng: number } =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).lat === "number" &&
    typeof (v as Record<string, unknown>).lng === "number";

  const requiredSeats = Number(body.requiredSeats);
  if (
    typeof body.bookingId !== "string" ||
    typeof body.passengerLabel !== "string" ||
    !pickup ||
    !isLatLong(pickup) ||
    !dropoff ||
    !isLatLong(dropoff) ||
    typeof body.pickupLabel !== "string" ||
    typeof body.dropoffLabel !== "string" ||
    typeof body.rideType !== "string" ||
    !VEHICLE_CLASSES.includes(vehicleClass as VehicleClass) ||
    !Number.isInteger(requiredSeats) ||
    requiredSeats < 1
  ) {
    return null;
  }

  const demandIndex =
    typeof body.demandIndex === "number" ? Math.min(1, Math.max(0, body.demandIndex)) : 0.5;

  return {
    bookingId: body.bookingId,
    passengerLabel: body.passengerLabel,
    pickup: pickup as { lat: number; lng: number },
    dropoff: dropoff as { lat: number; lng: number },
    pickupLabel: body.pickupLabel,
    dropoffLabel: body.dropoffLabel,
    pickupZone: typeof body.pickupZone === "string" ? body.pickupZone : undefined,
    rideType: body.rideType,
    vehicleClass: vehicleClass as VehicleClass,
    requiredSeats,
    requiredCapabilities: Array.isArray(body.requiredCapabilities)
      ? (body.requiredCapabilities.filter((c) => typeof c === "string") as string[])
      : undefined,
    demandIndex,
  };
}
