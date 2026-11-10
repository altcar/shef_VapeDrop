/**
 * VapeDrop API Worker
 * -------------------
 * Serves three small endpoints next to the static SPA:
 *
 *   GET /api/health  - liveness
 *   GET /api/locate  - coarse location from Cloudflare's request metadata
 *   GET /api/route   - walking/cycling/driving route via Valhalla (no API key)
 *
 * Why a Worker at all? Routing needs a same-origin proxy to add a proper
 * User-Agent, cache aggressively and keep the tile/routing providers off the
 * critical path when they are having a bad day.
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  ROUTING_PROVIDER?: string;
}

type WaitUntil = (promise: Promise<unknown>) => void;

type RequestCf = {
  latitude?: string;
  longitude?: string;
  city?: string;
  region?: string;
  country?: string;
};

const VALHALLA_URL = "https://valhalla1.openstreetmap.de/route";
const USER_AGENT = "VapeDrop/2.0 (+https://github.com/altcar/VapeDrop)";

const COSTING: Record<string, string> = {
  foot: "pedestrian",
  bike: "bicycle",
  car: "auto",
};

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });

const parsePoint = (value: string | null): { lat: number; lon: number } | null => {
  if (!value) return null;
  const [latRaw, lonRaw] = value.split(",");
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
};

const fetchWithTimeout = async (
  input: string,
  init: RequestInit,
  ms = 9000,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

interface ValhallaManeuver {
  instruction?: string;
  length?: number;
  time?: number;
  type?: number;
}

interface ValhallaLeg {
  shape?: string;
  maneuvers?: ValhallaManeuver[];
}

interface ValhallaResponse {
  trip?: {
    summary?: { length?: number; time?: number };
    legs?: ValhallaLeg[];
  };
  error?: string;
  error_code?: number;
}

const handleRoute = async (request: Request, waitUntil: WaitUntil): Promise<Response> => {
  const url = new URL(request.url);
  const from = parsePoint(url.searchParams.get("from"));
  const to = parsePoint(url.searchParams.get("to"));
  const profile = url.searchParams.get("profile") ?? "foot";

  if (!from || !to) {
    return json({ error: "from and to must be 'lat,lng' pairs" }, { status: 400 });
  }
  if (!COSTING[profile]) {
    return json({ error: "profile must be one of foot, bike, car" }, { status: 400 });
  }

  // `caches.default` is a Workers extension; the DOM types only know the named caches.
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const body = {
    locations: [
      { lat: from.lat, lon: from.lon },
      { lat: to.lat, lon: to.lon },
    ],
    costing: COSTING[profile],
    shape_format: "polyline6",
    directions_options: { units: "kilometers", language: "en-GB" },
  };

  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(VALHALLA_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": USER_AGENT,
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return json({ error: "routing service unreachable" }, { status: 504 });
  }

  if (!upstream.ok) {
    return json({ error: `routing service returned ${upstream.status}` }, { status: 502 });
  }

  const payload = (await upstream.json()) as ValhallaResponse;
  const trip = payload.trip;
  if (!trip?.summary || !trip.legs?.length) {
    return json({ error: payload.error ?? "no route found" }, { status: 404 });
  }

  const legs = trip.legs;
  const steps = legs
    .flatMap((leg) => leg.maneuvers ?? [])
    .filter((maneuver) => maneuver.instruction && maneuver.type !== 4)
    .map((maneuver) => ({
      instruction: (maneuver.instruction ?? "").trim(),
      distanceMeters: Math.round((maneuver.length ?? 0) * 1000),
      durationSeconds: Math.round(maneuver.time ?? 0),
    }));

  const result = {
    distanceMeters: Math.round((trip.summary.length ?? 0) * 1000),
    durationSeconds: Math.round(trip.summary.time ?? 0),
    geometry: legs.map((leg) => leg.shape ?? "").join(""),
    precision: 6,
    steps,
    source: "valhalla" as const,
  };

  const response = json(result, {
    headers: {
      // Routes rarely change; a day of edge caching is plenty.
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });

  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};

const handleLocate = (request: Request): Response => {
  const cf = (request as Request & { cf?: RequestCf }).cf;
  const latitude = cf?.latitude ? Number(cf.latitude) : null;
  const longitude = cf?.longitude ? Number(cf.longitude) : null;

  if (latitude === null || longitude === null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return json({ latitude: null, longitude: null, city: null, country: null, source: "none" });
  }

  return json({
    latitude,
    longitude,
    city: cf?.city ?? null,
    region: cf?.region ?? null,
    country: cf?.country ?? null,
    source: "cloudflare",
  });
};

export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil: WaitUntil }): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { allow: "GET, OPTIONS", "cache-control": "no-store" },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method not allowed" }, { status: 405 });
    }

    switch (url.pathname) {
      case "/api/health":
        return json({ ok: true, service: "vapedrop", provider: env.ROUTING_PROVIDER ?? "valhalla" });
      case "/api/locate":
        return handleLocate(request);
      case "/api/route":
        return handleRoute(request, ctx.waitUntil.bind(ctx) as WaitUntil);
      default:
        return json({ error: "not found" }, { status: 404 });
    }
  },
};
