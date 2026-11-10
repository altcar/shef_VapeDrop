# Map provider: replacing Google Maps with a free stack

The old build used four Google products: the Maps JavaScript API, Directions, Distance Matrix and
(from the Vercel env vars) a billing-enabled API key. This document records what replaced them, why,
and how to swap a piece out later.

## TL;DR

| Need | Old (Google) | New | Key? | Cost |
| --- | --- | --- | --- | --- |
| Basemap | Maps JavaScript API | **MapLibre GL JS + OpenFreeMap** vector tiles | No | Free, no quota |
| Walking route | Directions API | **Valhalla** (FOSSGIS public instance) via `/api/route` | No | Free, fair use |
| Distance + time | Distance Matrix API | Haversine + walking speed in the browser (`src/lib/geo.ts`) | No | Free |
| IP location | ipinfo.io | Dropped — city-level guesses distort walking times; origin falls back to Sheffield SU | No | Free |

Monthly cost of the map stack: **£0**, with no API key to leak and no billing account to protect.

## Why not one of the "free tier" providers?

| Option | Free tier | Why it was not chosen |
| --- | --- | --- |
| Google Maps JS + Directions | $200/mo credit (legacy), then pay-per-load | Requires billing, key restrictions and usage caps; Directions/Distance Matrix are the expensive parts |
| Mapbox GL | 50k map loads/mo | Great maps, but overage is charged and the token must be restricted per domain |
| MapTiler | 100k tiles/mo | Excellent vector styles; still a key + quota to monitor |
| Stadia Maps | 200k tiles/mo (non-commercial) | Non-commercial clause is awkward for a funded pilot |
| Thunderforest | 150k tiles/mo | Raster only, outdoor-focused styling |
| OpenFreeMap | **Unlimited, no key, no account** | Chosen for the basemap |
| Protomaps + R2 | Storage cost only | Best long-term option if we ever need full control; more setup than needed today |

OpenFreeMap is a plain style URL (`https://tiles.openfreemap.org/styles/dark`), which means it can be
swapped with one environment variable (`VITE_MAP_STYLE_URL`) and no code change.

## Routing options

| Provider | Profiles | Key | Notes |
| --- | --- | --- | --- |
| Google Directions | walk/bike/drive/transit | Yes | Billed, best transit coverage |
| **Valhalla (FOSSGIS)** | pedestrian, bicycle, auto | No | Chosen: real turn-by-turn manoeuvres, OSM data, fair-use public instance |
| OpenRouteService | foot, bike, car, HGV | Yes (2k/day) | Good alternative if we need an SLA |
| GraphHopper | foot, bike, car | Yes (500/day) | Solid, small free tier |
| OSRM demo | car (foot unreliable) | No | Kept as a documented fallback only |
| Self-hosted Valhalla | anything | No | The escape hatch if public fair use is exceeded |

The Worker caches each route for a day at the edge and sends a proper `User-Agent`
(`VapeDrop/2.0 (+repo)`), which is what the FOSSGIS instance asks for. If routing fails the browser
falls back to a straight-line estimate and the UI labels it as such, so nobody is left with a
spinner.

## Attribution and licensing

- Tiles: © OpenStreetMap contributors, served by OpenFreeMap (ODbL data, free tile service).
- Routing: Valhalla on FOSSGIS infrastructure, OSM data.
- MapLibre GL JS: BSD-3.
- Photon/Nominatim were evaluated for address search but are **not** used: searching the bin list
  client-side is instant and avoids hammering a shared geocoder.

Attribution is rendered by MapLibre's compact attribution control in the bottom-right of the map.

## If we need to change provider

1. **Basemap** — set `VITE_MAP_STYLE_URL` to any MapLibre style JSON (MapTiler, Stadia, Protomaps,
   self-hosted). No code changes.
2. **Routing** — swap `VALHALLA_URL` in `worker/index.ts`, or add a second provider and keep the same
   response shape (`distanceMeters`, `durationSeconds`, `geometry` as polyline, `steps[]`). The
   client only knows the `/api/route` contract.
3. **Self-host Protomaps on R2** — generate a `.pmtiles` extract for South Yorkshire, upload to an R2
   bucket, and swap the style's `sources` to `pmtiles://…`. This removes the last third-party
   dependency and is the recommended step before a national rollout.
