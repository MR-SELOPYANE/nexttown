import type { Driver } from "@/lib/ride/types";

export type IconSpec = {
  url: string;
  scaledSize: google.maps.Size;
  anchor: google.maps.Point;
  rotation?: number;
};

/** White-top car icon used for the active driver; outline colour varies. */
export function activeCarIcon(
  gmaps: typeof google.maps,
  heading: number,
  fill = "#22d3ee",
  stroke = "#0e7490",
): IconSpec {
  const size = 44;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">` +
    `<g filter="drop-shadow(0 2px 6px rgba(0,0,0,.45))">` +
    `<rect x="12" y="4" width="16" height="32" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>` +
    `<rect x="14.5" y="10" width="11" height="5" rx="2" fill="#ffffff" fill-opacity=".85"/>` +
    `<rect x="14.5" y="23" width="11" height="4" rx="2" fill="#ffffff" fill-opacity=".25"/>` +
    `<circle cx="10" cy="13" r="2.5" fill="#ffffff" fill-opacity=".6"/>` +
    `<circle cx="30" cy="13" r="2.5" fill="#ffffff" fill-opacity=".6"/>` +
    `<circle cx="10" cy="27" r="2.5" fill="#ffffff" fill-opacity=".6"/>` +
    `<circle cx="30" cy="27" r="2.5" fill="#ffffff" fill-opacity=".6"/>` +
    `</g></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new gmaps.Size(size, size),
    anchor: new gmaps.Point(size / 2, size / 2),
    rotation: heading,
  };
}

/** Smaller neutral car icon for nearby available drivers. */
export function idleCarIcon(gmaps: typeof google.maps, heading: number): IconSpec {
  const size = 30;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">` +
    `<g filter="drop-shadow(0 1px 4px rgba(0,0,0,.35))">` +
    `<rect x="13" y="5" width="14" height="30" rx="7" fill="#ffffff" stroke="#334155" stroke-width="2"/>` +
    `<rect x="15" y="11" width="10" height="4" rx="2" fill="#334155" fill-opacity=".3"/>` +
    `</g></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new gmaps.Size(size, size),
    anchor: new gmaps.Point(size / 2, size / 2),
    rotation: heading,
  };
}

/** Teardrop location pin — bottom tip sits exactly on the coordinate. */
export function locationPinIcon(gmaps: typeof google.maps, fill: string, size = 30): IconSpec {
  const h = Math.round(size * 1.34);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 30 40">` +
    `<g filter="drop-shadow(0 2px 5px rgba(0,0,0,.35))">` +
    `<path d="M15 1C8.9 1 4 5.9 4 12c0 8.6 11 27 11 27s11-18.4 11-27C26 5.9 21.1 1 15 1z" fill="${fill}" stroke="#ffffff" stroke-width="2"/>` +
    `<circle cx="15" cy="12.5" r="5" fill="#ffffff"/>` +
    `</g></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new gmaps.Size(size, h),
    anchor: new gmaps.Point(size / 2, h),
  };
}

/** Green GPS "you are here" dot with a soft halo. */
export function userLocationIcon(gmaps: typeof google.maps): IconSpec {
  const size = 28;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">` +
    `<circle cx="14" cy="14" r="11" fill="#10b981" fill-opacity="0.22"/>` +
    `<circle cx="14" cy="14" r="7.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>` +
    `<circle cx="14" cy="14" r="3" fill="#ffffff" fill-opacity="0.9"/>` +
    `</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new gmaps.Size(size, size),
    anchor: new gmaps.Point(size / 2, size / 2),
  };
}

/** Center crosshair used while planning a ride (no route yet). */
export function crosshairIcon(gmaps: typeof google.maps): IconSpec {
  const size = 32;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">` +
    `<circle cx="16" cy="16" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>` +
    `<circle cx="16" cy="16" r="12" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5"/>` +
    `</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new gmaps.Size(size, size),
    anchor: new gmaps.Point(size / 2, size / 2),
  };
}

/** Build the icon a marker should use for a driver at its current heading. */
export function driverIcon(gmaps: typeof google.maps, driver: Driver, active: boolean): IconSpec {
  const heading = driver.location?.heading ?? 0;
  return active ? activeCarIcon(gmaps, heading) : idleCarIcon(gmaps, driver.location ? heading : 0);
}
