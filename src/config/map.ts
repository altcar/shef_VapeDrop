/**
 * Map + routing configuration.
 *
 * Provider choice (replaces Google Maps):
 *   - Tiles / style : OpenFreeMap (vector tiles, no API key, no request quota)
 *   - Routing       : Valhalla via the FOSSGIS public instance (no API key),
 *                     proxied and cached by our Worker at /api/route
 *   - Geocoding     : Photon via /api/geocode (optional, search box only)
 *
 * See docs/MAP-PROVIDER.md for the comparison table and trade-offs.
 */

export const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/dark";

export const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>';

export const DEFAULT_ZOOM = 14;
export const SELECTED_ZOOM = 16.2;

export type TravelProfile = "foot" | "bike" | "car";

export const PROFILE_LABELS: Record<TravelProfile, string> = {
  foot: "Walking",
  bike: "Cycling",
  car: "Driving",
};

/** A route shorter than this is probably a mapping error, not a walk. */
export const MIN_SENSIBLE_ROUTE_M = 15;
