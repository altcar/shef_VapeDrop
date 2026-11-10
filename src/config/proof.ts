/**
 * PROOF OF COLLECTION — STATUS: NOT DECIDED
 * -----------------------------------------
 * A bin needs to prove it actually received a vape before points are credited.
 * Nothing here is wired to Firestore yet: the UI renders the proposed option
 * and explains the alternatives so the decision can be made with open eyes.
 *
 * To switch approach later:
 *   1. pick the winning `PROOF_OPTIONS[].id`
 *   2. set PROPOSED_PROOF to it and flip PROOF_STATUS to "confirmed"
 *   3. implement `verifyDeposit()` in src/lib/deposits.ts for that mechanism
 *   4. update Firestore rules + the collection docs described in docs/REWARDS.md
 */

export const PROOF_STATUS: "pending" | "confirmed" = "pending";

export type ProofOptionId =
  | "qr-at-bin"
  | "bin-keypad-code"
  | "nfc-tap"
  | "photo-geofence"
  | "smart-bin-sensor"
  | "retailer-scan"
  | "manual-review";

export type Effort = "Low" | "Medium" | "High";
export type FraudResistance = "Low" | "Medium" | "High";

export interface ProofOption {
  id: ProofOptionId;
  label: string;
  tagline: string;
  /** What the user physically does in the app. */
  userSteps: string[];
  strengths: string[];
  risks: string[];
  /** Build/ops effort for us. */
  effort: Effort;
  /** How hard it is to fake a deposit. */
  fraudResistance: FraudResistance;
  /** Extra hardware, data or agreements needed. */
  needs: string[];
  /** Rough points cost / per-deposit running cost, in plain words. */
  runningCost: string;
}

export const PROOF_OPTIONS: ProofOption[] = [
  {
    id: "qr-at-bin",
    label: "QR sticker on the bin",
    tagline: "Scan the bin's own QR code when you drop a vape.",
    userSteps: [
      "Walk to the bin and drop the vape in",
      "Open VapeDrop and scan the QR sticker on the bin",
      "Points land in your account instantly",
    ],
    strengths: [
      "No hardware, no keys, no battery",
      "Cheapest to roll out across many bins",
      "Works on any phone with a camera",
    ],
    risks: [
      "Anyone can photograph the sticker and scan it from home",
      "Stickers get damaged, removed or copied",
      "Needs a cooldown (e.g. 1 scan per bin per 24h) to limit abuse",
    ],
    effort: "Low",
    fraudResistance: "Low",
    needs: ["Weatherproof QR stickers per bin", "Bin id encoded in the QR URL"],
    runningCost: "~£1-2 per bin, one-off printing",
  },
  {
    id: "bin-keypad-code",
    label: "Rotating code printed inside the bin",
    tagline: "The bin displays a code that changes weekly; type it in.",
    userSteps: [
      "Drop the vape, then look at the code inside the bin lid",
      "Type the code into VapeDrop",
      "Points are credited after the code checks out",
    ],
    strengths: [
      "No camera or hardware needed",
      "Cheaper than a QR reprint when codes rotate",
      "Works for users who block camera permission",
    ],
    risks: [
      "Codes leak on group chats within days",
      "Someone has to physically change the code each week",
      "Typing friction at the bin",
    ],
    effort: "Low",
    fraudResistance: "Medium",
    needs: ["Weekly code rotation rota", "Code table in Firestore"],
    runningCost: "Staff time only",
  },
  {
    id: "nfc-tap",
    label: "NFC tag on the bin",
    tagline: "Tap your phone on the bin's tag - no camera, no typing.",
    userSteps: [
      "Drop the vape in",
      "Hold your phone against the NFC tag on the lid",
      "A VapeDrop link opens and credits the deposit",
    ],
    strengths: [
      "Smoothest experience of all options",
      "Tap range is short, so it proves physical presence",
      "Tags cost pennies in bulk",
    ],
    risks: [
      "iPhone users need iOS 14+ and a browser that handles NFC links",
      "Tags can be peeled off and stuck to a desk",
      "Some Android browsers still block Web NFC",
    ],
    effort: "Medium",
    fraudResistance: "Medium",
    needs: ["NTAG213 stickers", "HTTPS deep links", "Android Web NFC support"],
    runningCost: "~£0.30-1 per bin",
  },
  {
    id: "photo-geofence",
    label: "Photo + location check",
    tagline: "Snap the vape going in; we check you were at the bin.",
    userSteps: [
      "Take a photo of the vape at the bin",
      "VapeDrop checks the photo's location stamp against the bin",
      "Points are credited (or queued for review)",
    ],
    strengths: [
      "Strong evidence trail for audits",
      "No bin hardware at all",
      "Photos double as content for impact reporting",
    ],
    risks: [
      "Location data can be stripped or spoofed",
      "Photo storage + moderation costs",
      "Slow if every deposit needs human review",
    ],
    effort: "Medium",
    fraudResistance: "Medium",
    needs: ["Image storage (R2)", "EXIF/location validation", "Moderation policy"],
    runningCost: "Storage + review time",
  },
  {
    id: "smart-bin-sensor",
    label: "Smart bin with fill sensor",
    tagline: "The bin itself reports that something went in.",
    userSteps: [
      "Open VapeDrop near the bin so your phone is paired",
      "Drop the vape; the sensor registers it",
      "Points are credited automatically",
    ],
    strengths: [
      "Best fraud resistance and gives live fill levels",
      "Enables route planning to bins that are not full",
      "Great data for councils and funders",
    ],
    risks: [
      "Highest build cost and power/battery management",
      "Sensor false positives (coins, litter)",
      "Firmware, connectivity and maintenance burden",
    ],
    effort: "High",
    fraudResistance: "High",
    needs: ["Sensor hardware", "MQTT/HTTP ingestion", "Device fleet management"],
    runningCost: "£30-80 per bin + connectivity",
  },
  {
    id: "retailer-scan",
    label: "Partner shop or staff scan",
    tagline: "Hand the vape to a staffed counter; they scan your code.",
    userSteps: [
      "Take the vape to a participating shop counter",
      "Staff scan your personal QR code",
      "Points are credited by the partner",
    ],
    strengths: [
      "Human verification at the point of hand-over",
      "No vandalism risk to bin hardware",
      "Builds retail partnerships for rewards",
    ],
    risks: [
      "Only works where a partner is open",
      "Staff training and trust needed",
      "Not self-service, so fewer deposits per hour",
    ],
    effort: "Medium",
    fraudResistance: "High",
    needs: ["Partner onboarding", "Staff scanner app or web page"],
    runningCost: "Partner incentive share",
  },
  {
    id: "manual-review",
    label: "Manual claim review",
    tagline: "Users submit a claim; a human approves it in batches.",
    userSteps: [
      "Drop the vape and submit a claim with the bin id",
      "Wait for a weekly review",
      "Points are credited once approved",
    ],
    strengths: [
      "Can launch immediately with zero hardware",
      "Easy to tighten rules as abuse patterns appear",
      "Useful fallback when a scan fails",
    ],
    risks: [
      "Does not scale beyond a few hundred claims a week",
      "Slow rewards feel unrewarding",
      "High chance of disputes",
    ],
    effort: "Low",
    fraudResistance: "Low",
    needs: ["Admin review screen", "Clear evidence requirements"],
    runningCost: "Volunteer/admin hours",
  },
];

/** The mechanism we would ship first if nothing else is decided. */
export const PROPOSED_PROOF: ProofOptionId = "qr-at-bin";

export const getProofOption = (id: ProofOptionId): ProofOption =>
  PROOF_OPTIONS.find((option) => option.id === id) ?? PROOF_OPTIONS[0];

/** Format of the QR payload a bin sticker should contain. */
export const BIN_QR_PREFIX = "vapedrop:bin:";

export const parseBinQr = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (trimmed.startsWith(BIN_QR_PREFIX)) return trimmed.slice(BIN_QR_PREFIX.length);
  // Also accept a plain URL like https://vapedrop.hheylau.workers.dev/drop/<binId>
  const match = trimmed.match(/\/drop\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};
