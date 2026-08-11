import type { MarketType, Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  traveler: "Traveler",
  driver: "Driver",
  trucker: "Truck operator",
  airline: "Airline / charter",
  school: "School transport",
  business: "Business / logistics",
  admin: "Administrator",
};

export const ROLE_SHORT: Record<Role, string> = {
  traveler: "Traveler",
  driver: "Driver",
  trucker: "Trucker",
  airline: "Airline",
  school: "School",
  business: "Business",
  admin: "Admin",
};

export const OPERATOR_ROLES: Role[] = ["driver", "trucker", "airline", "school", "business"];

export function isOperator(role: Role): boolean {
  return OPERATOR_ROLES.includes(role);
}

/** Which marketplace a role primarily operates in. */
export const ROLE_MARKET: Partial<Record<Role, MarketType>> = {
  driver: "ride",
  trucker: "freight",
  airline: "flight",
  school: "school",
};

/** Where a signed-in role lands first — operators get their working console. */
export const ROLE_HOME: Record<Role, string> = {
  traveler: "/dashboard",
  driver: "/drive",
  trucker: "/truck",
  airline: "/airline",
  school: "/school-ops",
  business: "/business",
  admin: "/admin",
};

/** Registration roles the public can self-select. */
export const REGISTRATION_ROLES: Role[] = [
  "traveler",
  "driver",
  "trucker",
  "airline",
  "school",
  "business",
];

export const ROLE_TAGLINE: Record<Role, string> = {
  traveler: "Book rides, send parcels and travel affordably.",
  driver: "Fill empty seats and earn from every trip.",
  trucker: "Sell return-load capacity, never drive empty.",
  airline: "Sell seats that would otherwise fly empty.",
  school: "Run verified school routes with live parent tracking.",
  business: "Move staff, cargo and parcels at volume pricing.",
  admin: "Operate and govern the platform.",
};
