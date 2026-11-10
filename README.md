# VapeDrop

Find a vape collection bin near you, get a walking route to it, and earn something for keeping
disposable vapes out of the bin.

**Live app:** <https://vapedrop.hheylau.workers.dev>

- Web app: React + Vite SPA on **Cloudflare Workers** (Workers Static Assets + one small API Worker)
- Map: **MapLibre GL + OpenFreeMap** tiles — no Google Maps key, no monthly bill
- Routing: **Valhalla** (OSM) walking/cycling/driving directions, proxied and cached by the Worker
- Location: browser GPS; if the device refuses, every distance and route is measured from
  **Sheffield Students' Union** and the UI says so
- Accounts & history: Firebase Auth + Firestore (optional — the app runs in demo mode without it)
- Auto deploy: **Workers Builds**, git-connected to `main`, build `npm ci && npm run build`,
  deploy `npx wrangler deploy`, Wrangler pinned to `4.160.0`

> **Status:** pilot. Two things are deliberately **not decided yet** and the UI says so instead of
> pretending otherwise:
>
> 1. **How a bin proves it received your vape** — see [`docs/REWARDS.md`](docs/REWARDS.md) and
>    [`src/config/proof.ts`](src/config/proof.ts)
> 2. **What the reward actually is** — see [`src/config/rewards.ts`](src/config/rewards.ts)

## What changed in v2

| Before | After |
| --- | --- |
| Next.js app on Vercel (`vape-drop.vercel.app`, deployment paused) | Static SPA + Worker on `vapedrop.hheylau.workers.dev` |
| Google Maps JS API + Directions + Distance Matrix (billed, key required) | MapLibre + OpenFreeMap tiles, Valhalla routing (no key) |
| `/api/distance` needed a server key | Distance/walk time computed in the browser; routes cached at the edge |
| `/api/geolocation` proxied ipinfo.io with a token | No IP geolocation at all — GPS, or Sheffield Students' Union as the origin |
| Mixed Expo + Next.js in one root | Web app at the root, Expo app moved to [`mobile/`](mobile/) |
| Hard-coded "Power 10" and a fake reward screen | Points/rewards driven by config with explicit "pending" states |

## Repo layout

```
.
├── index.html               # SPA entry
├── src/
│   ├── config/              # app constants, map, firebase, proof + reward decisions
│   ├── lib/                 # geo maths, bins, deposits, routing, Firestore access
│   ├── hooks/               # auth, geolocation, bins, route, deposits
│   ├── components/          # MapView (MapLibre), BinCard, RouteSheet, nav, icons…
│   ├── pages/               # Home, Find, Recycle, Rewards, Account, History
│   └── styles.css           # Tailwind + design tokens
├── worker/index.ts          # /api/health, /api/route
├── wrangler.jsonc           # Worker + static assets config
├── docs/                    # deployment, map provider, rewards/decisions
└── mobile/                  # legacy Expo app (kept, not built by CI)
```

## Local development

```bash
npm install
npm run dev          # SPA on http://localhost:5173, /api/* proxied to the Worker
npm run worker       # Worker on http://127.0.0.1:8787 (needed for /api during `npm run dev`)
npm run build        # typecheck + production build into dist/
npm run deploy       # build + `wrangler deploy`
```

Copy `.env.example` to `.env.local` to enable Firebase. Without those variables the app runs in
**demo mode**: sample bins, no sign-in, everything else works.

## Environment variables (build time)

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web config (public identifiers) |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional analytics id |
| `VITE_MAP_STYLE_URL` | Optional basemap override (default OpenFreeMap `dark`) |

They are **build-time** values, set as Workers Builds environment variables (stored as secrets) and
locally in `.env.local`. Nothing is committed.

## Firestore data model (unchanged)

| Collection | Document | Fields used by the web app |
| --- | --- | --- |
| `location` | bin id | `name`, `description`, `address`, `image`, `openingHours`/`hours`, `accepts[]`, `fillLevel` (0–1), `enabled`, `location` (GeoPoint `{latitude, longitude}`) |
| `past` | deposit id | `user` (uid), `location` (bin id), `time` (Timestamp) |
| `user` | uid | `name`, `email`, `photo`, `points` |

The parser is deliberately tolerant (`src/lib/bins.ts`) so existing documents keep working. If the
rules block anonymous reads, the app falls back to clearly-labelled sample bins.

## Deploying

Pushes to `main` trigger a Workers Build. Details, exact settings and rollback steps live in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

```bash
npx wrangler deploy          # manual deploy
npx wrangler deployments list
npx wrangler rollback
```

The old Vercel project is no longer needed; see the decommission checklist in the deployment doc.

## Decisions still open

- [ ] Proof of collection mechanism (7 options compared in `docs/REWARDS.md`)
- [ ] The reward itself (voucher, SU credit, prize draw, charity, merch, coffee)
- [ ] Points per vape (currently the legacy `10`)
- [ ] Partner agreements and redemption fulfilment
- [ ] Firestore rules so bins are publicly readable and deposits are only writable via the Worker
