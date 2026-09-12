import type { DispatchEvent, DispatchState } from "./types";

/**
 * DISPATCH LIFECYCLE STATE MACHINE
 * --------------------------------------------------------------------------
 * Server-authoritative lifecycle for one booking:
 *
 *   searching --OFFER_CREATED--> offered --DRIVER_ACCEPTED--> accepted
 *                                                                    |
 *                 offered --DRIVER_REJECTED|OFFER_TIMEOUT--> searching
 *                 offered --CANCELLED--> cancelled
 *   accepted --DRIVER_ASSIGNED--> driver_assigned --COMPLETED--> completed
 *   accepted --DRIVER_REJECTED--> searching          (reserve-lost or bail-out)
 *   accepted / driver_assigned --CANCELLED--> cancelled
 *   searching --CANDIDATES_EMPTY--> no_driver_available (terminal)
 *
 * `searching` means "seeking a candidate", `offered` means an offer is live,
 * and `accepted` is a provisional hold that becomes `driver_assigned` only
 * once the driver is atomically committed to the booking (the moment where
 * the double-assignment guard bites).
 *
 * Transitions are pure so the state machine is trivially unit-testable; the
 * persistence + atomic claim live in the server-dispatched layer.
 */

const TRANSITIONS: ReadonlyArray<{
  from: DispatchState;
  event: DispatchEvent["type"];
  to: DispatchState;
}> = [
  { from: "searching", event: "CANDIDATES_EMPTY", to: "no_driver_available" },
  { from: "searching", event: "OFFER_CREATED", to: "offered" },
  { from: "searching", event: "CANCELLED", to: "cancelled" },
  { from: "offered", event: "DRIVER_ACCEPTED", to: "accepted" },
  { from: "offered", event: "DRIVER_REJECTED", to: "searching" },
  { from: "offered", event: "OFFER_TIMEOUT", to: "searching" },
  { from: "offered", event: "CANCELLED", to: "cancelled" },
  { from: "accepted", event: "DRIVER_ASSIGNED", to: "driver_assigned" },
  { from: "accepted", event: "DRIVER_REJECTED", to: "searching" },
  { from: "accepted", event: "CANCELLED", to: "cancelled" },
  { from: "driver_assigned", event: "COMPLETED", to: "completed" },
  { from: "driver_assigned", event: "CANCELLED", to: "cancelled" },
];

/** States that can still absorb events. */
export function isDispatchActive(state: DispatchState): boolean {
  return state === "searching" || state === "offered" || state === "accepted";
}

/** Only while searching may a new candidate be offered. */
export function canOffer(state: DispatchState): boolean {
  return state === "searching";
}

/** Apply one event. Returns the next state; throws on an illegal transition. */
export function dispatchTransition(state: DispatchState, event: DispatchEvent): DispatchState {
  const rule = TRANSITIONS.find((t) => t.from === state && t.event === event.type);
  if (!rule) {
    throw new Error(`dispatch: illegal transition "${state}" --${event.type}--> ?`);
  }
  return rule.to;
}
