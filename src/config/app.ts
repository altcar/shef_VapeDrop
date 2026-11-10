/**
 * App-wide constants and programme status.
 *
 * VapeDrop is still being designed in two areas:
 *   1. how a collection bin proves it received a vape  -> ./proof.ts
 *   2. what the reward actually is                     -> ./rewards.ts
 *
 * Both are marked `pending` so the UI can be honest with users instead of
 * pretending the scheme is live.
 */

export const APP_NAME = "VapeDrop";
export const APP_TAGLINE = "Recycle your vape. Not your planet.";

/** Where the map should point before we know where the user is (Bristol). */
export const FALLBACK_CENTER = {
  latitude: 53.380795,
  longitude: -1.484205,
};

/** Average walking speed, metres per second (used for the walk-time estimate). */
export const WALK_SPEED_MPS = 1.35;

/** How far from the user we still consider a bin "nearby" for the home card. */
export const NEARBY_RADIUS_M = 2500;

export const PROGRAMME = {
  /** Proof of collection is not decided yet - see src/config/proof.ts */
  proofOfCollection: "pending" as "pending" | "confirmed",
  /** The reward catalogue is not decided yet - see src/config/rewards.ts */
  rewardCatalogue: "pending" as "pending" | "confirmed",
  /** Public launch state, shown in small print on the home screen. */
  phase: "pilot",
} as const;

export const CONTACT_EMAIL = "hello@vapedrop.uk";

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/find", label: "Find a bin", icon: "map" },
  { to: "/recycle", label: "Recycle", icon: "recycle" },
  { to: "/rewards", label: "Rewards", icon: "gift" },
  { to: "/account", label: "Account", icon: "user" },
] as const;
