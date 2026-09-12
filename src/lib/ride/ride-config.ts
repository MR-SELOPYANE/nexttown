import type { Driver } from "./types";
import type { PriceTripInput } from "@/lib/pricing/types";
import { offsetKm } from "./geo";
import { buildDriver } from "@/lib/driver/driver-utils";
import type { LatLng } from "@/lib/sa-places";

export const RIDE_CLASSES = [
  {
    id: "go",
    name: "NT Go",
    blurb: "Affordable everyday sedans",
    seats: 4,
    base: 22,
    perKm: 8.5,
    vehicleClass: "sedan",
    etaMin: 3,
    icon: "🚗",
  },
  {
    id: "comfort",
    name: "NT Comfort",
    blurb: "Newer cars, top-rated drivers",
    seats: 4,
    base: 30,
    perKm: 11.5,
    vehicleClass: "suv",
    etaMin: 5,
    icon: "🚙",
  },
  {
    id: "xl",
    name: "NT XL",
    blurb: "Up to 6 seats, extra luggage",
    seats: 6,
    base: 38,
    perKm: 14,
    vehicleClass: "minivan",
    etaMin: 7,
    icon: "🚐",
  },
] as const;

const DEMO_DRIVER_PROFILES = [
  {
    name: "Thabo M.",
    car: "VW Polo · Silver",
    plate: "JH 42 KL GP",
    rating: 4.93,
    trips: 2841,
    phone: "+27100000001",
  },
  {
    name: "Naledi K.",
    car: "Toyota Corolla · White",
    plate: "CA 118 992",
    rating: 4.88,
    trips: 1520,
    phone: "+27100000002",
  },
  {
    name: "Sipho D.",
    car: "Hyundai i20 · Grey",
    plate: "ND 77 210",
    rating: 4.97,
    trips: 3390,
    phone: "+27100000003",
  },
] as const;

export const EMPTY_COORDS: LatLng = { lat: 0, lng: 0 };

export function seedDriverPool(center: LatLng, count = 6): Driver[] {
  return Array.from({ length: count }, (_, index) => {
    const profile = DEMO_DRIVER_PROFILES[index % DEMO_DRIVER_PROFILES.length];
    return buildDriver(profile, `driver-${index}`, offsetKm(center, 1.5, 10));
  });
}

export function driverNearPickup(pickup: LatLng): Driver {
  return buildDriver(DEMO_DRIVER_PROFILES[0], "driver-fallback", offsetKm(pickup, 2, 4));
}

export function createPricingInputs(
  distanceKm: number,
  durationMin: number | null,
  demandIndex: number,
  driverSupply: number,
  zoneIds: string[],
): PriceTripInput[] {
  return RIDE_CLASSES.map((rideClass): PriceTripInput => ({
    tierId: rideClass.id,
    vehicleClass: rideClass.vehicleClass,
    distanceKm,
    durationMin: durationMin ?? Math.max(6, Math.round(distanceKm * 1.6)),
    demandIndex,
    driverSupply,
    zoneIds,
    at: Date.now(),
  }));
}
