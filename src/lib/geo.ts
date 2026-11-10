import type { Bin, BinWithDistance, LatLng } from "./types";
import { WALK_SPEED_MPS } from "@/config/app";

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export const distanceMeters = (a: LatLng, b: LatLng): number => {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

/** Estimated walking time in seconds, with a small fudge for street detours. */
export const walkSeconds = (meters: number): number =>
  Math.round((meters * 1.25) / WALK_SPEED_MPS);

export const withDistance = (bins: Bin[], from: LatLng): BinWithDistance[] =>
  bins
    .map((bin) => {
      const d = distanceMeters(from, { latitude: bin.latitude, longitude: bin.longitude });
      return { ...bin, distanceMeters: d, walkSeconds: walkSeconds(d) };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

export const formatDistance = (meters: number): string => {
  if (!Number.isFinite(meters)) return "—";
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 9500 ? 1 : 0)} km`;
};

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
};

/** True when the point is inside a bounding box [west, south, east, north]. */
export const inBounds = (
  point: LatLng,
  bounds: [number, number, number, number],
): boolean => {
  const [west, south, east, north] = bounds;
  return (
    point.longitude >= west &&
    point.longitude <= east &&
    point.latitude >= south &&
    point.latitude <= north
  );
};

export const toLngLat = (point: LatLng): [number, number] => [point.longitude, point.latitude];

/** Rough equality check used to decide whether to re-fetch a route. */
export const samePlace = (a: LatLng, b: LatLng, toleranceDeg = 0.00005): boolean =>
  Math.abs(a.latitude - b.latitude) < toleranceDeg &&
  Math.abs(a.longitude - b.longitude) < toleranceDeg;
