export interface LatLng {
  latitude: number;
  longitude: number;
}

export type BinSource = "live" | "seed";

export interface Bin {
  id: string;
  name: string;
  description?: string;
  image?: string;
  address?: string;
  latitude: number;
  longitude: number;
  /** Opening hours as free text, e.g. "Mon-Sat 8am-6pm". */
  openingHours?: string;
  /** What the bin takes, e.g. ["vapes", "pods", "batteries"]. */
  accepts?: string[];
  /** 0 = empty, 1 = full. Only present when a sensor or admin updates it. */
  fillLevel?: number;
  indoor?: boolean;
  source: BinSource;
}

export interface BinWithDistance extends Bin {
  distanceMeters: number;
  walkSeconds: number;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  /** [lng, lat] pairs, ready for GeoJSON. */
  geometry: [number, number][];
  steps: RouteStep[];
  source: "valhalla" | "straight-line";
}

export interface DepositRecord {
  id: string;
  binId: string | null;
  createdAt: number;
  points: number | null;
}

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  points: number;
}
