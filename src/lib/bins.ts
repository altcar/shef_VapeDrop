import { collection, getDocs } from "firebase/firestore";
import { getFirebase } from "@/config/firebase";
import type { Bin } from "./types";

/**
 * Sample bins used when Firestore is not configured, or when the rules block
 * anonymous reads (which they currently do). Every seeded bin is labelled
 * "(sample)" in the UI so nobody is sent on a wild goose chase.
 */
export const SEED_BINS: Bin[] = [
  {
    id: "sample-union",
    name: "Students' Union (sample)",
    description: "Drop box by the main entrance, next to the bike racks.",
    address: "Western Bank, Sheffield S10 2TG",
    latitude: 53.38157,
    longitude: -1.48936,
    openingHours: "Mon-Sun 8am-11pm",
    accepts: ["vapes", "pods", "batteries"],
    fillLevel: 0.32,
    indoor: true,
    source: "seed",
  },
  {
    id: "sample-hallam",
    name: "Hallam Owen Building (sample)",
    description: "Ground floor atrium, opposite the coffee kiosk.",
    address: "Howard St, Sheffield S1 1WB",
    latitude: 53.37881,
    longitude: -1.46641,
    openingHours: "Mon-Fri 7am-9pm",
    accepts: ["vapes", "pods"],
    fillLevel: 0.68,
    indoor: true,
    source: "seed",
  },
  {
    id: "sample-moor",
    name: "The Moor Market (sample)",
    description: "Recycling point by the Eyre Street entrance.",
    address: "77 The Moor, Sheffield S1 4PF",
    latitude: 53.37602,
    longitude: -1.47408,
    openingHours: "Mon-Sat 8am-6pm",
    accepts: ["vapes", "batteries"],
    fillLevel: 0.15,
    indoor: true,
    source: "seed",
  },
  {
    id: "sample-station",
    name: "Sheffield Station (sample)",
    description: "Outside the main concourse, by the taxi rank.",
    address: "Sheaf St, Sheffield S1 2BP",
    latitude: 53.37805,
    longitude: -1.46211,
    openingHours: "24 hours",
    accepts: ["vapes", "pods", "batteries"],
    fillLevel: 0.84,
    indoor: false,
    source: "seed",
  },
  {
    id: "sample-broomhill",
    name: "Broomhill shops (sample)",
    description: "Beside the post box on Fulwood Road.",
    address: "Fulwood Rd, Sheffield S10 3BD",
    latitude: 53.37955,
    longitude: -1.50093,
    openingHours: "24 hours",
    accepts: ["vapes", "pods"],
    fillLevel: 0.47,
    indoor: false,
    source: "seed",
  },
  {
    id: "sample-ecclesall",
    name: "Ecclesall Road (sample)",
    description: "Outside the convenience store, near the bus stop.",
    address: "Ecclesall Rd, Sheffield S11 8PR",
    latitude: 53.37081,
    longitude: -1.48803,
    openingHours: "Mon-Sun 7am-10pm",
    accepts: ["vapes", "batteries"],
    fillLevel: 0.59,
    indoor: false,
    source: "seed",
  },
];

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/** Read lat/lng from a Firestore GeoPoint, a plain object or a legacy string. */
const readCoordinates = (raw: unknown): { latitude: number; longitude: number } | null => {
  if (!raw) return null;

  if (typeof raw === "object") {
    const candidate = raw as Record<string, unknown>;
    const latitude = toNumber(candidate.latitude ?? candidate.lat ?? candidate._latitude);
    const longitude = toNumber(candidate.longitude ?? candidate.lng ?? candidate._longitude);
    if (latitude !== null && longitude !== null) return { latitude, longitude };
  }

  if (typeof raw === "string") {
    const [lat, lng] = raw.split(",").map((part) => Number(part.trim()));
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { latitude: lat, longitude: lng };
  }

  return null;
};

/** Tolerant mapper for the existing `location/{id}` Firestore documents. */
export const parseBinDocument = (id: string, raw: Record<string, unknown>): Bin | null => {
  const coords = readCoordinates(raw.location ?? raw.geo ?? raw.position ?? raw);
  if (!coords) return null;
  if (raw.enabled === false) return null;

  const accepts = Array.isArray(raw.accepts)
    ? (raw.accepts as unknown[]).filter((item): item is string => typeof item === "string")
    : undefined;

  const fill = toNumber(raw.fillLevel ?? raw.fill ?? raw.capacity);

  return {
    id,
    name: typeof raw.name === "string" && raw.name ? raw.name : "VapeDrop bin",
    description: typeof raw.description === "string" ? raw.description : undefined,
    image: typeof raw.image === "string" ? raw.image : undefined,
    address: typeof raw.address === "string" ? raw.address : undefined,
    openingHours:
      typeof raw.openingHours === "string"
        ? raw.openingHours
        : typeof raw.hours === "string"
          ? raw.hours
          : undefined,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accepts,
    fillLevel: fill !== null && fill >= 0 && fill <= 1 ? fill : undefined,
    indoor: typeof raw.indoor === "boolean" ? raw.indoor : undefined,
    source: "live",
  };
};

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out loading bins")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

export type BinSourceState = "live" | "seed";

export interface BinsResult {
  bins: Bin[];
  source: BinSourceState;
  /** Non-fatal reason why live data was not available. */
  problem: string | null;
}

export const loadBins = async (): Promise<BinsResult> => {
  const firebase = getFirebase();
  if (!firebase) {
    return { bins: SEED_BINS, source: "seed", problem: "Firebase not configured" };
  }

  try {
    const snapshot = await withTimeout(getDocs(collection(firebase.db, "location")), 7000);
    const live = snapshot.docs
      .map((doc) => parseBinDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((bin): bin is Bin => bin !== null);

    if (live.length === 0) {
      return { bins: SEED_BINS, source: "seed", problem: "No bins published yet" };
    }

    return { bins: live, source: "live", problem: null };
  } catch (error) {
    return {
      bins: SEED_BINS,
      source: "seed",
      problem: error instanceof Error ? error.message : "Could not load bins",
    };
  }
};
