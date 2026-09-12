/**
 * DESTINATION RECOMMENDATIONS — RECOMMENDATION ENGINE TESTS
 * --------------------------------------------------------------------------
 * Unit tests for the pure recommendation scoring and ranking algorithm.
 * All functions are deterministic and fully testable.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { RideDestination, SavedDestination, LatLng } from "../types";
import {
  scoreDestination,
  scoreSavedDestination,
  timeOfDayRelevance,
  haversineKm,
  deduplicateDestinations,
  getMostRecentLabel,
  rankDestinationRecommendations,
  hasEnoughDataForRecommendations,
} from "../recommend";

describe("Destination Recommendation Scoring", () => {
  // ─────────────────────────────────────────────────────────────────────
  // HAVERSINE DISTANCE
  // ─────────────────────────────────────────────────────────────────────

  describe("haversineKm", () => {
    it("should calculate distance between two coordinates", () => {
      // Johannesburg to Pretoria ~55 km
      const jnb = { lat: -26.2023, lng: 28.0436 };
      const pta = { lat: -25.7461, lng: 28.2293 };
      const distance = haversineKm(jnb, pta);
      expect(distance).toBeGreaterThan(50);
      expect(distance).toBeLessThan(60);
    });

    it("should return 0 for same location", () => {
      const loc = { lat: -25.5, lng: 28.0 };
      expect(haversineKm(loc, loc)).toBe(0);
    });

    it("should be symmetric (distance A->B = distance B->A)", () => {
      const a = { lat: -26.0, lng: 28.0 };
      const b = { lat: -25.0, lng: 28.5 };
      expect(haversineKm(a, b)).toBe(haversineKm(b, a));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // TIME OF DAY RELEVANCE
  // ─────────────────────────────────────────────────────────────────────

  describe("timeOfDayRelevance", () => {
    it("should return high score for perfect time match", () => {
      const score = timeOfDayRelevance(9, 9);
      expect(score).toBeGreaterThan(0.9);
    });

    it("should return lower score for different hours", () => {
      const score = timeOfDayRelevance(9, 17);
      expect(score).toBeLessThan(0.5);
    });

    it("should return neutral score for undefined pattern", () => {
      const score = timeOfDayRelevance(undefined, 9);
      expect(score).toBe(0.5);
    });

    it("should handle hour wrap-around", () => {
      // 23:00 to 01:00 should be only 2 hours apart, not 22
      const score1 = timeOfDayRelevance(23, 1);
      const score2 = timeOfDayRelevance(12, 14);
      expect(score1).toBeGreaterThan(score2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // SCORE DESTINATION
  // ─────────────────────────────────────────────────────────────────────

  describe("scoreDestination", () => {
    const now = Date.now();
    const today = new Date(now);
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    it("should score higher for frequently visited destinations", () => {
      const frequent: RideDestination[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `ride-${i}`,
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(now - i * 24 * 60 * 60 * 1000),
          archived: false,
          dayOfWeek: "Monday",
          hourOfDay: 9,
        }));

      const infrequent: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.7, lng: 28.2 },
          completedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
          archived: false,
        },
      ];

      const frequentScore = scoreDestination(frequent, 9);
      const infrequentScore = scoreDestination(infrequent, 9);

      expect(frequentScore).toBeGreaterThan(infrequentScore);
    });

    it("should score higher for recently visited destinations", () => {
      const recent: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: today,
          archived: false,
          hourOfDay: 9,
        },
      ];

      const old: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: weekAgo,
          archived: false,
          hourOfDay: 9,
        },
      ];

      const recentScore = scoreDestination(recent, 9);
      const oldScore = scoreDestination(old, 9);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it("should return 0 for empty destination list", () => {
      expect(scoreDestination([], 9)).toBe(0);
    });

    it("should score higher when time of day matches", () => {
      const rides: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: today,
          archived: false,
          hourOfDay: 9,
        },
      ];

      const scoreAtNine = scoreDestination(rides, 9);
      const scoreAtThree = scoreDestination(rides, 15);

      expect(scoreAtNine).toBeGreaterThan(scoreAtThree);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // SCORE SAVED DESTINATION
  // ─────────────────────────────────────────────────────────────────────

  describe("scoreSavedDestination", () => {
    it("should score high for saved destinations", () => {
      const saved: SavedDestination = {
        id: "saved-1",
        userId: "user1",
        label: "Home",
        location: { lat: -25.5, lng: 28.0 },
        category: "home",
        usageCount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const score = scoreSavedDestination(saved, []);
      expect(score).toBeGreaterThan(0.8);
    });

    it("should score higher for frequently used saved destinations", () => {
      const frequent: SavedDestination = {
        id: "saved-1",
        userId: "user1",
        label: "Work",
        location: { lat: -25.5, lng: 28.0 },
        category: "work",
        usageCount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const infrequent: SavedDestination = {
        id: "saved-2",
        userId: "user1",
        label: "Gym",
        location: { lat: -25.6, lng: 28.1 },
        category: "custom",
        usageCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const frequentScore = scoreSavedDestination(frequent, []);
      const infrequentScore = scoreSavedDestination(infrequent, []);

      expect(frequentScore).toBeGreaterThan(infrequentScore);
    });

    it("should boost score if recently used", () => {
      const recent: SavedDestination = {
        id: "saved-1",
        userId: "user1",
        label: "Home",
        location: { lat: -25.5, lng: 28.0 },
        category: "home",
        usageCount: 5,
        lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const old: SavedDestination = {
        id: "saved-2",
        userId: "user1",
        label: "Gym",
        location: { lat: -25.6, lng: 28.1 },
        category: "custom",
        usageCount: 5,
        lastUsedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const recentScore = scoreSavedDestination(recent, []);
      const oldScore = scoreSavedDestination(old, []);

      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // DEDUPLICATION
  // ─────────────────────────────────────────────────────────────────────

  describe("deduplicateDestinations", () => {
    it("should group nearby destinations", () => {
      const destinations: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
        },
        {
          id: "ride-2",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6001, lng: 28.1001 }, // ~11m away
          completedAt: new Date(),
          archived: false,
        },
        {
          id: "ride-3",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.8, lng: 28.3 }, // Far away
          completedAt: new Date(),
          archived: false,
        },
      ];

      const groups = deduplicateDestinations(destinations, 0.1);
      expect(groups.size).toBe(2); // Two distinct locations
    });

    it("should preserve all rides in groups", () => {
      const destinations: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
        },
        {
          id: "ride-2",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6001, lng: 28.1001 },
          completedAt: new Date(),
          archived: false,
        },
      ];

      const groups = deduplicateDestinations(destinations, 0.1);
      let totalRides = 0;
      for (const rides of groups.values()) {
        totalRides += rides.length;
      }
      expect(totalRides).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // GET MOST RECENT LABEL
  // ─────────────────────────────────────────────────────────────────────

  describe("getMostRecentLabel", () => {
    it("should return the most recent label", () => {
      const destinations: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          dropoffLabel: "Old Name",
          completedAt: new Date(Date.now() - 1000),
          archived: false,
        },
        {
          id: "ride-2",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          dropoffLabel: "New Name",
          completedAt: new Date(Date.now()),
          archived: false,
        },
      ];

      expect(getMostRecentLabel(destinations)).toBe("New Name");
    });

    it("should return undefined if no labels", () => {
      const destinations: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
        },
      ];

      expect(getMostRecentLabel(destinations)).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // RANK RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────

  describe("rankDestinationRecommendations", () => {
    it("should rank saved destinations first", () => {
      const saved: SavedDestination[] = [
        {
          id: "saved-1",
          userId: "user1",
          label: "Home",
          location: { lat: -25.5, lng: 28.0 },
          usageCount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const history: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
          hourOfDay: 9,
        },
      ];

      const ranked = rankDestinationRecommendations(saved, history, 9);
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].source).toBe("saved");
    });

    it("should respect minimum visit count", () => {
      const saved: SavedDestination[] = [];
      const history: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
          hourOfDay: 9,
        },
      ];

      const ranked = rankDestinationRecommendations(saved, history, 9, {
        minVisitsToRecommend: 5,
      });

      expect(ranked.filter((r) => r.source === "history")).toHaveLength(0);
    });

    it("should return sorted by score", () => {
      const saved: SavedDestination[] = [
        {
          id: "saved-1",
          userId: "user1",
          label: "Home",
          location: { lat: -25.5, lng: 28.0 },
          usageCount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const history: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
          hourOfDay: 9,
        },
        {
          id: "ride-2",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.61, lng: 28.11 },
          completedAt: new Date(),
          archived: false,
          hourOfDay: 9,
        },
        {
          id: "ride-3",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.62, lng: 28.12 },
          completedAt: new Date(),
          archived: false,
          hourOfDay: 9,
        },
      ];

      const ranked = rankDestinationRecommendations(saved, history, 9, {
        minVisitsToRecommend: 1,
      });

      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].combinedScore).toBeGreaterThanOrEqual(ranked[i].combinedScore);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // ENOUGH DATA CHECK
  // ─────────────────────────────────────────────────────────────────────

  describe("hasEnoughDataForRecommendations", () => {
    it("should return true with sufficient history", () => {
      const history: RideDestination[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `ride-${i}`,
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6 - i * 0.1, lng: 28.1 + i * 0.1 },
          completedAt: new Date(),
          archived: false,
        }));

      expect(hasEnoughDataForRecommendations(history)).toBe(true);
    });

    it("should return false with insufficient history", () => {
      const history: RideDestination[] = [
        {
          id: "ride-1",
          userId: "user1",
          pickupLocation: { lat: -25.5, lng: 28.0 },
          dropoffLocation: { lat: -25.6, lng: 28.1 },
          completedAt: new Date(),
          archived: false,
        },
      ];

      expect(hasEnoughDataForRecommendations(history)).toBe(false);
    });
  });
});
