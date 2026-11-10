import { MIN_SENSIBLE_ROUTE_M, type TravelProfile } from "@/config/map";
import { decodePolyline } from "./polyline";
import { distanceMeters, walkSeconds } from "./geo";
import type { LatLng, RouteResult } from "./types";

interface RouteResponse {
  distanceMeters?: number;
  durationSeconds?: number;
  geometry?: string;
  precision?: number;
  steps?: { instruction: string; distanceMeters: number; durationSeconds: number }[];
  source?: "valhalla" | "straight-line";
}

const cache = new Map<string, RouteResult>();

const keyFor = (from: LatLng, to: LatLng, profile: TravelProfile) =>
  `${profile}:${from.latitude.toFixed(5)},${from.longitude.toFixed(5)}->${to.latitude.toFixed(5)},${to.longitude.toFixed(5)}`;

const straightLine = (from: LatLng, to: LatLng): RouteResult => {
  const meters = distanceMeters(from, to);
  return {
    distanceMeters: meters,
    durationSeconds: walkSeconds(meters),
    geometry: [
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ],
    steps: [
      {
        instruction: "Head straight towards the bin (offline estimate).",
        distanceMeters: meters,
        durationSeconds: walkSeconds(meters),
      },
    ],
    source: "straight-line",
  };
};

/**
 * Ask our Worker for a walking route (Valhalla behind the scenes).
 * Falls back to a straight-line estimate when the routing service is down, so
 * the user always gets *something* rather than a spinner.
 */
export const fetchRoute = async (
  from: LatLng,
  to: LatLng,
  profile: TravelProfile = "foot",
  signal?: AbortSignal,
): Promise<RouteResult> => {
  const key = keyFor(from, to, profile);
  const cached = cache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    from: `${from.latitude},${from.longitude}`,
    to: `${to.latitude},${to.longitude}`,
    profile,
  });

  try {
    const response = await fetch(`/api/route?${params.toString()}`, { signal });
    if (!response.ok) throw new Error(`Route request failed (${response.status})`);

    const payload = (await response.json()) as RouteResponse;
    const geometry = payload.geometry
      ? decodePolyline(payload.geometry, payload.precision ?? 6)
      : [];

    if (!geometry.length) throw new Error("Route had no geometry");

    const result: RouteResult = {
      distanceMeters: payload.distanceMeters ?? 0,
      durationSeconds: payload.durationSeconds ?? 0,
      geometry,
      steps: payload.steps ?? [],
      source: payload.source === "straight-line" ? "straight-line" : "valhalla",
    };

    if (result.distanceMeters < MIN_SENSIBLE_ROUTE_M) {
      // A 2 m "route" usually means the bin and the user are the same point.
      const fallback = straightLine(from, to);
      cache.set(key, fallback);
      return fallback;
    }

    cache.set(key, result);
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    const fallback = straightLine(from, to);
    cache.set(key, fallback);
    return fallback;
  }
};

/** Deep link for people who would rather navigate in their own maps app. */
export const externalDirectionsUrl = (from: LatLng | null, to: LatLng, label?: string) => {
  const destination = `${to.latitude},${to.longitude}`;
  const origin = from ? `&origin=${from.latitude},${from.longitude}` : "";
  // Google Maps universal link works on iOS, Android and desktop.
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${destination}&travelmode=walking&destination_place_id=${
    label ? encodeURIComponent(label) : ""
  }`;
};

/** geo: URI so phones can hand the route to whichever app is installed. */
export const geoUri = (to: LatLng, label?: string) =>
  `geo:${to.latitude},${to.longitude}?q=${to.latitude},${to.longitude}${label ? `(${encodeURIComponent(label)})` : ""}`;
