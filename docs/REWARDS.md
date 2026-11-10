# Rewards, proof of collection, and what is still open

Two questions were deliberately left open in v2:

1. **How does a VapeDrop bin prove it received *your* vape?**
2. **What do you actually get for recycling it?**

The app does not invent answers. It renders the proposed default, shows the alternatives, and keeps
claiming/redemption locked until a human decides. This document is the decision workspace: options,
trade-offs, and the exact code changes needed for each path.

Status lives in two files, both imported by the UI:

- `src/config/proof.ts` — `PROOF_STATUS`, `PROPOSED_PROOF`, `PROOF_OPTIONS`
- `src/config/rewards.ts` — `REWARDS_STATUS`, `REWARD_CATALOGUE`, `POINTS_PER_VAPE`, `TIERS`

## 1. Proof of collection

A bin cannot tell us that *your* vape went in unless it has hardware, and nothing on the phone can
prove physical presence without a signal from the bin itself.

| Option | Effort | Fake-resistance | Hardware | Per-bin cost | Main risk |
| --- | --- | --- | --- | --- | --- |
| QR sticker on the bin | Low | Low | None | £1–2 one-off | Code gets photographed and scanned from home |
| Rotating code inside the bin | Low | Medium | None | Staff time | Codes leak in group chats; weekly rota |
| NFC tag on the lid | Medium | Medium | NTAG stickers | ~£0.30–1 | Tag can be peeled off; Android-only Web NFC |
| Photo + location check | Medium | Medium | None | Storage + review | EXIF/location spoofing, moderation cost |
| Smart bin with fill sensor | High | High | Sensors, connectivity | £30–80 + data | Build, battery, maintenance, false positives |
| Partner / staff scan | Medium | High | — | Incentive share | Only where a partner is open |
| Manual claim review | Low | Low | — | Admin hours | Does not scale, slow rewards |

### Recommendation for a pilot

Start with **QR sticker on the bin, with a per-bin cooldown and a manual review queue**, and add the
fill sensor to the two busiest bins as a parallel trial. That gives:

- a launchable scheme this term with almost no hardware,
- honest data to compare fraud rates (manual review flags vs sensor events),
- a migration path: the same `binId` and claim endpoint can later accept sensor-attested events
  without changing the UI.

### Questions that must be answered before flipping the flag

- [ ] How many vapes per person per day is plausible? (sets the cooldown)
- [ ] Do we punish abuse (points clawback) or just rate-limit?
- [ ] Who reviews flagged claims, and how often?
- [ ] Do we require a signed-in Google account, or allow anonymous claims tied to a device?
- [ ] For photo proof: retention period, who can see photos, and how it fits UK GDPR (a photo of a
      bin corner is low-risk; a photo with a person in it is not).

### Implementation steps (when decided)

1. Pick the id in `PROOF_OPTIONS`, set `PROPOSED_PROOF` and flip `PROOF_STATUS` to `"confirmed"`.
2. Add a Worker endpoint `POST /api/claims` that:
   - validates the bin exists and is `enabled`,
   - enforces a cooldown keyed by `binId + uid` (KV or D1; not Firestore — needs to be atomic),
   - writes `past/{autoId}` with `{ user, location, time, points, proof }` using a service credential,
   - increments `user/{uid}.points` in a transaction.
3. Keep `previewClaim()` in `src/lib/deposits.ts` as the client-side pre-check; **never** let the
   client write points directly.
4. Tighten Firestore rules: `past` and `user.points` become server-write-only.
5. Replace the disabled button in `src/pages/RecyclePage.tsx` with the real claim call.

### QR payload contract

```
vapedrop:bin:<binId>
https://vapedrop.hheylau.workers.dev/drop/<binId>
```

Both are accepted by `parseBinQr()` in `src/config/proof.ts`.

## 2. The reward

Nothing in the catalogue is a promise. Each entry needs a partner or a budget line.

| Idea | Points (draft) | Owner | Notes |
| --- | --- | --- | --- |
| £3 off at a partner vape shop | 300 | Retail partner | Drives footfall into the shops that sell the vapes |
| £3 SU / campus card credit | 300 | Students' union | Best "feels like money" option for students |
| Monthly prize draw entry | 50 | VapeDrop team | Cheap per entry, but it is a lottery, not a reward |
| Donate to a vape-waste charity | 100 | Charity partner | For people who do not want a gift |
| VapeDrop merch | 1000 | VapeDrop team | High unit cost, good for top-tier champions |
| Free campus coffee | 200 | Campus catering | Easy fulfilment, universally understood |

### Questions that must be answered

- [ ] Cash-equivalent (voucher/credit) or in-kind (merch/coffee/donation)?
- [ ] Who funds it — SU, council waste budget, retailer, or grant?
- [ ] Redemption mechanics: one-time code, partner scan, or manual fulfilment?
- [ ] Expiry: do points expire at the end of term?
- [ ] Legal: prize draws need T&Cs and a free entry route in the UK.

### Points economics

`POINTS_PER_VAPE = 10` is a legacy value from the first build (the old UI said "Power 10"). At that
rate a 300-point voucher is 30 vapes — too many for a student in one term. Sensible pilot options:

| Rate | Vapes per £3 voucher | Comment |
| --- | --- | --- |
| 10 pts/vape | 30 | Legacy, probably demotivating |
| 25 pts/vape | 12 | Reachable in a term |
| 50 pts/vape | 6 | Generous, needs a funding partner |
| 100 pts/vape | 3 | "Every third vape earns a coffee" style |

Keep the points-per-vape decision in one constant and re-derive the catalogue costs from it, so the
UI cannot drift out of sync.

## 3. What is already wired

- Points balance, tiers and progress bars read from `user.points`.
- Deposit history reads `past` where `user == uid`.
- `/recycle` shows the proposed proof mechanism, all seven alternatives (strengths, risks, effort),
  and a **dry-run** code check that never writes anything.
- `/rewards` shows the draft catalogue with explicit "locked until agreed" buttons.
- `PROGRAMME` in `src/config/app.ts` drives the "pending/confirmed" chips in the footer and account
  screen, so flipping one value updates the whole app.
