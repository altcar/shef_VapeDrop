import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirebase } from "@/config/firebase";
import { PROOF_STATUS, parseBinQr, PROPOSED_PROOF } from "@/config/proof";
import { POINTS_PER_VAPE } from "@/config/rewards";
import type { Bin, DepositRecord, UserProfile } from "./types";

/** Firestore Timestamp | number | { seconds } -> epoch millis. */
const toMillis = (value: unknown): number => {
  if (!value) return Date.now();
  if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  if (typeof value === "object" && value !== null) {
    const candidate = value as { seconds?: number; toMillis?: () => number };
    if (typeof candidate.toMillis === "function") return candidate.toMillis();
    if (typeof candidate.seconds === "number") return candidate.seconds * 1000;
  }
  return Date.now();
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

export const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
  const firebase = getFirebase();
  if (!firebase) return null;

  try {
    const snapshot = await getDoc(doc(firebase.db, "user", uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Record<string, unknown>;
    return {
      uid,
      name: asString(data.name),
      email: asString(data.email),
      photo: asString(data.photo),
      points: typeof data.points === "number" ? data.points : 0,
    };
  } catch {
    return null;
  }
};

/** Deposits live in the existing `past` collection: { user, location, time }. */
export const fetchDeposits = async (uid: string, max = 25): Promise<DepositRecord[]> => {
  const firebase = getFirebase();
  if (!firebase) return [];

  try {
    const snapshot = await getDocs(
      query(
        collection(firebase.db, "past"),
        where("user", "==", uid),
        orderBy("time", "desc"),
        limit(max),
      ),
    );

    return snapshot.docs.map((entry) => {
      const data = entry.data() as Record<string, unknown>;
      return {
        id: entry.id,
        binId: asString(data.location),
        createdAt: toMillis(data.time),
        points: typeof data.points === "number" ? data.points : null,
      };
    });
  } catch {
    return [];
  }
};

export interface ClaimPreview {
  ok: boolean;
  binId: string | null;
  points: number;
  message: string;
  /** True when this was only a dry run - nothing has been written. */
  preview: boolean;
}

/**
 * PROOF OF COLLECTION — stub, decision pending.
 *
 * Today this only *validates* a scanned code and reports what a deposit would
 * be worth. It never writes to Firestore. When the mechanism is agreed:
 *   - add the real check here (server-side is mandatory for anything that
 *     credits points, because this function runs in the browser)
 *   - call a Worker endpoint that verifies, rate-limits and writes the deposit
 */
export const previewClaim = (rawCode: string, bins: Bin[]): ClaimPreview => {
  const binId = parseBinQr(rawCode);

  if (!binId) {
    return {
      ok: false,
      binId: null,
      points: 0,
      message: "That code is not a VapeDrop bin code.",
      preview: true,
    };
  }

  const bin = bins.find((candidate) => candidate.id === binId);
  if (!bin) {
    return {
      ok: false,
      binId,
      points: 0,
      message: `Bin "${binId}" is not in the current bin list.`,
      preview: true,
    };
  }

  return {
    ok: true,
    binId,
    points: POINTS_PER_VAPE,
    message:
      PROOF_STATUS === "confirmed"
        ? `Deposit would be credited at ${bin.name}.`
        : `Looks like ${bin.name}. Points are not live yet, so nothing was saved.`,
    preview: true,
  };
};

export const describeProof = (): string =>
  PROOF_STATUS === "confirmed" ? "Confirmed" : `Proposed: ${PROPOSED_PROOF.replace(/-/g, " ")}`;
