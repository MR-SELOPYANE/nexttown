import {
  Bell,
  Building2,
  Car,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Package,
  Plane,
  Repeat,
  ShieldCheck,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "./types";

export interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
  blurb?: string;
}

/** Every signed-in role gets its own primary nav — console first, then its marketplace. */
export const ROLE_NAV: Record<Role, NavLink[]> = {
  traveler: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/rides", label: "Rides", icon: Car },
    { to: "/commute", label: "Commute", icon: Repeat },
    { to: "/parcels", label: "Parcels", icon: Package },
    { to: "/freight", label: "Freight", icon: Truck },
    { to: "/flights", label: "Flights", icon: Plane },
    { to: "/school", label: "School", icon: GraduationCap },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  driver: [
    { to: "/drive", label: "Drive", icon: LayoutDashboard },
    { to: "/rides", label: "Find rides", icon: Car },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  trucker: [
    { to: "/truck", label: "Trucking", icon: LayoutDashboard },
    { to: "/freight", label: "Loads", icon: Truck },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  airline: [
    { to: "/airline", label: "Airline", icon: LayoutDashboard },
    { to: "/flights", label: "Seats", icon: Plane },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  school: [
    { to: "/school-ops", label: "Operations", icon: LayoutDashboard },
    { to: "/school", label: "Routes", icon: GraduationCap },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  business: [
    { to: "/business", label: "Business", icon: LayoutDashboard },
    { to: "/freight", label: "Cargo", icon: Truck },
    { to: "/parcels", label: "Parcels", icon: Package },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
  admin: [
    { to: "/admin", label: "Admin", icon: ShieldCheck },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ],
};

/** Guest / signed-out nav — marketing pages, no account links. */
export const GUEST_NAV: NavLink[] = [
  { to: "/features", label: "Features", icon: Zap },
  { to: "/pricing", label: "Pricing", icon: Building2 },
  { to: "/about", label: "About", icon: ShieldCheck },
  { to: "/support", label: "Support", icon: Bell },
];

/** Marketplace dropdown, shown to every visitor. */
export const MARKET_NAV: NavLink[] = [
  { to: "/ride", label: "Ride now", icon: Zap, blurb: "Tap-to-ride, upfront fare" },
  { to: "/rides", label: "Rides", icon: Car, blurb: "Metro, airport, intercity" },
  { to: "/commute", label: "Commute", icon: Repeat, blurb: "Daily runs & shared passes" },
  { to: "/parcels", label: "Parcels", icon: Package, blurb: "Same-day peer delivery" },
  { to: "/freight", label: "Freight", icon: Truck, blurb: "Truck return-loads" },
  { to: "/flights", label: "Flights", icon: Plane, blurb: "Empty seats & charter" },
  { to: "/school", label: "School", icon: GraduationCap, blurb: "Vetted daily runs" },
];

/** Account links shared at the tail of every role nav (kept on the right of the bar). */
const ACCOUNT_PATHS = new Set(["/track", "/wallet", "/notifications"]);

export function isAccountLink(link: NavLink): boolean {
  return ACCOUNT_PATHS.has(link.to);
}
