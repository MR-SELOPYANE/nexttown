import { describe, expect, it } from "vitest";
import { matchDrivers } from "../match";
import { makeCandidate, makeConfig, makeRequest } from "./helpers";

function manyCandidates(count: number) {
  return Array.from({ length: count }, (_, i) =>
    makeCandidate({
      driverId: `drv-${i}`,
      // spread drivers a little so scores differ slightly
      lat: -26.105 + i * 0.0005,
      lng: 28.08 + i * 0.0005,
    }),
  );
}

describe("matchDrivers", () => {
  it("returns a ranked shortlist of eligible drivers", () => {
    const request = makeRequest();
    const result = matchDrivers(manyCandidates(8), request, makeConfig());

    expect(result.rejected).toHaveLength(0);
    expect(result.all).toHaveLength(8);
    expect(result.selected).toHaveLength(makeConfig().candidateLimit); // 5
    expect(result.all[0]).toBe(result.best);

    for (let i = 1; i < result.all.length; i++) {
      expect(result.all[i - 1].score).toBeGreaterThanOrEqual(result.all[i].score);
    }
  });

  it("respects an operator-tuned candidate limit", () => {
    const config = makeConfig({ candidateLimit: 2 });
    const result = matchDrivers(manyCandidates(8), makeRequest(), config);
    expect(result.selected).toHaveLength(2);
  });

  it("moves ineligible drivers to the rejected list with reasons", () => {
    const far = makeCandidate({
      driverId: "drv-far",
      lat: -26.9,
      lng: 28.5,
    });
    const offline = makeCandidate({
      driverId: "drv-off",
      status: "offline",
    });
    const good = makeCandidate({ driverId: "drv-good" });

    const result = matchDrivers([good, far, offline], makeRequest(), makeConfig());

    expect(result.selected.map((s) => s.candidate.driverId)).toEqual(["drv-good"]);
    const rejectedIds = new Set(result.rejected.map((r) => r.candidate.driverId));
    expect(rejectedIds).toEqual(new Set(["drv-far", "drv-off"]));
    const farReasons = result.rejected.find((r) => r.candidate.driverId === "drv-far")!.reasons;
    expect(farReasons).toContain("outside_service_radius");
  });

  it("tie-breaks deterministically on driver id for identical candidates", () => {
    const a = makeCandidate({ driverId: "drv-a" });
    const b = makeCandidate({ driverId: "drv-b" });
    const result = matchDrivers([b, a], makeRequest(), makeConfig());
    expect(result.selected.map((s) => s.candidate.driverId)).toEqual(["drv-a", "drv-b"]);
  });

  it("produces the same ranking for identical inputs (deterministic)", () => {
    const candidates = manyCandidates(6);
    const request = makeRequest();
    const first = matchDrivers(candidates, request, makeConfig());
    const second = matchDrivers(candidates, request, makeConfig());
    expect(first.selected.map((s) => s.candidate.driverId)).toEqual(
      second.selected.map((s) => s.candidate.driverId),
    );
  });
});
