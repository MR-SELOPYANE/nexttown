// Compatibility entry point for existing site consumers.
// The map implementation is a React presentation feature and remains reusable
// from the map domain barrel while older imports continue to resolve.
export { RideMap, RideMapInner } from "@/lib/map";
export type { RideMapProps, MapPinMode } from "@/lib/map";
