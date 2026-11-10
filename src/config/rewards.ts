/**
 * REWARD SCHEME — STATUS: NOT DECIDED
 * -----------------------------------
 * We know people should get *something* for recycling a vape, but the gift is
 * still open. Everything below is a draft for discussion, not a promise.
 *
 * To switch the scheme on:
 *   1. agree the gift(s) with the partner / SU / council
 *   2. edit REWARD_CATALOGUE and set REWARDS_STATUS to "confirmed"
 *   3. agree POINTS_PER_VAPE and redemption fulfilment (voucher codes, stock)
 *   4. wire redemption in src/lib/deposits.ts (see docs/REWARDS.md)
 */

export const REWARDS_STATUS: "pending" | "confirmed" = "pending";

/**
 * Legacy value from the first build (the old UI hard-coded "Power 10").
 * Not agreed with anyone yet — it survives because it keeps the demo numbers
 * consistent.
 */
export const POINTS_PER_VAPE = 10;
export const POINTS_PER_VAPE_CONFIRMED = false;

export type RewardStatus = "draft" | "confirmed";

export interface RewardDraft {
  id: string;
  title: string;
  blurb: string;
  pointsCost: number;
  status: RewardStatus;
  /** Who would need to sign this off. */
  owner: string;
  notes: string;
}

export const REWARD_CATALOGUE: RewardDraft[] = [
  {
    id: "shop-voucher-3",
    title: "£3 off at a partner vape shop",
    blurb: "Spend it on pods, coils or a reusable device.",
    pointsCost: 300,
    status: "draft",
    owner: "Retail partner",
    notes: "Assumes shops will honour vouchers in exchange for footfall.",
  },
  {
    id: "su-credit",
    title: "£3 credit on your student card",
    blurb: "Works at the SU shop, café and laundry.",
    pointsCost: 300,
    status: "draft",
    owner: "Students' union",
    notes: "Needs an SU account integration or a one-time voucher code.",
  },
  {
    id: "prize-draw",
    title: "Monthly prize draw entry",
    blurb: "One entry per vape; draw runs on the first of the month.",
    pointsCost: 50,
    status: "draft",
    owner: "VapeDrop team",
    notes: "Low unit cost, high engagement, but it is a lottery not a reward.",
  },
  {
    id: "charity",
    title: "Donate to a vape-waste charity",
    blurb: "Turn your points into a cash donation for safe vape disposal.",
    pointsCost: 100,
    status: "draft",
    owner: "Charity partner",
    notes: "Attractive to people who do not want a reward at all.",
  },
  {
    id: "merch",
    title: "VapeDrop merch",
    blurb: "Recycled-material tote or cap, shipped to your campus address.",
    pointsCost: 1000,
    status: "draft",
    owner: "VapeDrop team",
    notes: "Highest cost per unit; only sensible at high point balances.",
  },
  {
    id: "coffee",
    title: "Free coffee on campus",
    blurb: "One hot drink at a participating campus café.",
    pointsCost: 200,
    status: "draft",
    owner: "Campus catering",
    notes: "Easy to fulfil, universally understood, low cash value.",
  },
];

export interface Tier {
  name: string;
  minPoints: number;
  perk: string;
}

export const TIERS: Tier[] = [
  { name: "Starter", minPoints: 0, perk: "Track your impact and every deposit" },
  { name: "Regular", minPoints: 100, perk: "Access to voucher drops" },
  { name: "Champion", minPoints: 500, perk: "Early access to limited rewards" },
];

export const tierFor = (points: number): { current: Tier; next: Tier | null } => {
  const sorted = [...TIERS].sort((a, b) => a.minPoints - b.minPoints);
  let current = sorted[0];
  for (const tier of sorted) if (points >= tier.minPoints) current = tier;
  const next = sorted.find((tier) => tier.minPoints > points) ?? null;
  return { current, next };
};

/** How many vapes a points balance represents at the current rate. */
export const pointsToVapes = (points: number): number =>
  Math.floor(points / Math.max(POINTS_PER_VAPE, 1));
