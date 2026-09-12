import { DriverMarker } from "../markers/DriverMarker";
import type { Driver } from "@/lib/ride/types";

/**
 * Renders the fleet of visible drivers: the ride's assigned driver (highlighted)
 * plus any nearby available drivers. Positions come exclusively from each
 * `Driver.location` payload.
 */
export function DriverLayer({
  activeDriver,
  nearbyDrivers = [],
}: {
  activeDriver?: Driver | null;
  nearbyDrivers?: Driver[];
}) {
  return (
    <>
      {nearbyDrivers.map((d) => (
        <DriverMarker key={d.id} driver={d} />
      ))}
      {activeDriver && (
        <DriverMarker key={`active-${activeDriver.id}`} driver={activeDriver} active />
      )}
    </>
  );
}
