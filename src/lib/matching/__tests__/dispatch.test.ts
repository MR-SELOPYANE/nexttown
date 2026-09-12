import { describe, expect, it } from "vitest";
import { canOffer, dispatchTransition, isDispatchActive } from "../dispatch";
import { selectNextCandidate } from "../rank";
import { makeCandidate } from "./helpers";
import type { DispatchState, ScoredCandidate } from "../types";

function scored(id: string): ScoredCandidate {
  return {
    candidate: makeCandidate({ driverId: id }),
    distanceKm: 1,
    etaMin: 2,
    factorScores: {} as ScoredCandidate["factorScores"],
    score: 1,
  };
}

describe("dispatch lifecycle state machine", () => {
  it("walks the happy path searching → offered → accepted → driver_assigned → completed", () => {
    let state = dispatchTransition("searching", { type: "OFFER_CREATED" });
    expect(state).toBe("offered");
    state = dispatchTransition(state, { type: "DRIVER_ACCEPTED" });
    expect(state).toBe("accepted");
    state = dispatchTransition(state, { type: "DRIVER_ASSIGNED" });
    expect(state).toBe("driver_assigned");
    state = dispatchTransition(state, { type: "COMPLETED" });
    expect(state).toBe("completed");
  });

  it("cycles to the next candidate after a rejection", () => {
    let state: DispatchState = "searching";
    state = dispatchTransition(state, { type: "OFFER_CREATED" });
    state = dispatchTransition(state, { type: "DRIVER_REJECTED" });
    expect(state).toBe("searching");
    state = dispatchTransition(state, { type: "OFFER_CREATED" });
    expect(state).toBe("offered");
  });

  it("treats an offer timeout like a rejection", () => {
    const state = dispatchTransition(dispatchTransition("searching", { type: "OFFER_CREATED" }), {
      type: "OFFER_TIMEOUT",
    });
    expect(state).toBe("searching");
  });

  it("terminates when no candidates remain", () => {
    const state = dispatchTransition("searching", { type: "CANDIDATES_EMPTY" });
    expect(state).toBe("no_driver_available");
    expect(isDispatchActive(state)).toBe(false);
    expect(() => dispatchTransition(state, { type: "OFFER_CREATED" })).toThrow(
      /illegal transition/,
    );
  });

  it("can be cancelled from searching, offered, accepted and driver_assigned", () => {
    expect(dispatchTransition("searching", { type: "CANCELLED" })).toBe("cancelled");
    expect(
      dispatchTransition(dispatchTransition("searching", { type: "OFFER_CREATED" }), {
        type: "CANCELLED",
      }),
    ).toBe("cancelled");
    expect(
      dispatchTransition(
        dispatchTransition(dispatchTransition("searching", { type: "OFFER_CREATED" }), {
          type: "DRIVER_ACCEPTED",
        }),
        { type: "CANCELLED" },
      ),
    ).toBe("cancelled");
    expect(
      dispatchTransition(
        dispatchTransition(
          dispatchTransition(dispatchTransition("searching", { type: "OFFER_CREATED" }), {
            type: "DRIVER_ACCEPTED",
          }),
          { type: "DRIVER_ASSIGNED" },
        ),
        { type: "CANCELLED" },
      ),
    ).toBe("cancelled");
  });

  it("illegal transitions throw", () => {
    expect(() => dispatchTransition("completed", { type: "OFFER_CREATED" })).toThrow(
      /illegal transition/,
    );
    expect(() => dispatchTransition("searching", { type: "COMPLETED" })).toThrow(
      /illegal transition/,
    );
  });

  it("only allows new offers while searching", () => {
    expect(canOffer("searching")).toBe(true);
    expect(canOffer("offered")).toBe(false);
    expect(canOffer("driver_assigned")).toBe(false);
  });
});

describe("selectNextCandidate", () => {
  it("returns the best candidate that was not already excluded", () => {
    const ranked = [scored("a"), scored("b"), scored("c")];
    expect(selectNextCandidate(ranked, ["a"])?.candidate.driverId).toBe("b");
    expect(selectNextCandidate(ranked, ["a", "b"])?.candidate.driverId).toBe("c");
  });

  it("returns null once every candidate is exhausted", () => {
    const ranked = [scored("a")];
    expect(selectNextCandidate(ranked, ["a"])).toBeNull();
  });
});
