# Deploying VapeDrop on Cloudflare Workers

Production URL: <https://vapedrop.hheylau.workers.dev>
Worker name: `vapedrop` · Account: `Shalev` (`4012f7f23d815ed28c0f45e8ce57cd3e`)

## How it is built

The Worker serves two things from one deployment:

1. **Static assets** — `dist/` from `vite build`, with SPA fallback (`not_found_handling:
   single-page-application`) so `/find` and `/account/history` resolve to `index.html`.
2. **API routes** — `worker/index.ts` handles `/api/*` before assets are considered
   (`assets.run_worker_first: ["/api/*"]`).

`/api/health` and `/api/route` all run on the same origin as the app, so there is no
CORS and no second domain.

## Workers Builds (git-connected, auto deploy)

| Setting | Value |
| --- | --- |
| Repository | `altcar/VapeDrop` |
| Branch | `main` |
| Root directory | `/` |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build caching | on |
| Previews | off |
| Pinned Wrangler | env var `WRANGLER_VERSION=4.160.0` (and `wrangler` pinned exactly in `package.json`) |
| Node | env var `NODE_VERSION=22` |
| Build-time vars | `VITE_FIREBASE_*` (stored as secrets) |

A push to `main` starts a build; a successful build deploys the Worker. Build logs are on the
Worker's *Builds* tab in the dashboard, or:

```bash
# account-level build records for this worker
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/<account_id>/builds/workers/<script_tag>/builds"
```

The `script_tag` is the *system tag* of the Worker, not its name — fetch it from
`/workers/scripts` (`tag` field).

### Why the commands are exactly those

- `npm ci` (not `npm install`) uses the committed `package-lock.json`, so CI and local builds resolve
  the same tree.
- `npm run build` runs `tsc --noEmit && vite build` — a type error fails the deploy instead of
  shipping a broken bundle.
- `npx wrangler deploy` uses the locally pinned Wrangler (`4.160.0`), so the CLI can never drift
  ahead of the config schema.
- `.npmrc` allow-lists install scripts for `esbuild` and `workerd` (npm 11 blocks postinstall by
  default), which the build needs for platform binaries.

## Manual deploy / rollback

```bash
npm run build
npx wrangler deploy

npx wrangler deployments list
npx wrangler rollback            # previous version
npx wrangler tail                # live logs
```

### Triggering a build by hand

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "content-type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/<account_id>/builds/triggers/<trigger_uuid>/builds" \
  -d '{"commit_hash":"<full 40-character sha>"}'
```

Use the **full** SHA (from `git rev-parse HEAD`). A short SHA is accepted by the API but the clone
step then fails with `error occurred while fetching repository`, which looks like a GitHub problem
and is not one.

## Local development

```bash
npm run dev      # Vite on :5173, proxies /api/* to :8787
npm run worker   # wrangler dev on :8787 (the API worker + built assets)
```

`wrangler dev` reads `.env.local` as local secrets, so the Worker (mostly routing) runs without any
Cloudflare configuration.

## Environment variables

Set in **Workers Builds → Settings → Variables** (build-time) for the deployed app, and in
`.env.local` locally. They are never committed; only `.env.example` is.

| Name | Where it is read |
| --- | --- |
| `VITE_FIREBASE_*` | baked into the client bundle by Vite |
| `VITE_MAP_STYLE_URL` | optional basemap override |
| `ROUTING_PROVIDER` | `wrangler.jsonc` var, reported by `/api/health` |

Changing a `VITE_*` value requires a rebuild (it is compile-time), not just a redeploy.

## Custom domain (optional)

```bash
npx wrangler deploy   # then add a route in the dashboard or:
# wrangler.jsonc -> "routes": [{ "pattern": "vapedrop.example.org", "custom_domain": true }]
```

`shalev.eu.org` is already in the account if a nicer domain than `*.workers.dev` is wanted.

## Decommissioning Vercel

The Vercel project `acar/vapedrop` (`vape-drop.vercel.app`) currently returns
`DEPLOYMENT_PAUSED`. Once the Workers deployment is accepted:

1. Repoint the GitHub repo homepage/description to the Workers URL.
2. Delete the Vercel project (or keep it archived as a reference build).
3. Remove the now-unused Vercel env vars (`GOOGLE_MAPS_API_KEY`, `IPINFO_API_KEY`) — those keys
   should be revoked in Google Cloud and ipinfo regardless, since nothing calls them any more.
