import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import type { Feature, LineString } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, DEFAULT_ZOOM } from "@/config/map";
import type { BinWithDistance, LatLng, RouteResult } from "@/lib/types";
import { IconAlert, IconMapPin } from "./icons";

export interface MapViewProps {
  center: LatLng;
  zoom?: number;
  bins: BinWithDistance[];
  selectedId?: string | null;
  user?: LatLng | null;
  route?: RouteResult | null;
  onSelectBin?: (id: string) => void;
  interactive?: boolean;
  className?: string;
}

type MapStatus = "loading" | "ready" | "error";

const binPinMarkup = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5.5H4.5V7A3.5 3.5 0 0 0 8 10.5M16 5.5h3.5V7A3.5 3.5 0 0 1 16 10.5"/><path d="M12 13v3.5M9 20h6M10 20l.5-3.5h3l.5 3.5"/></svg>`;

const routeFeature = (route: RouteResult): Feature<LineString> => ({
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: route.geometry },
});

const boundsOf = (route: RouteResult): [[number, number], [number, number]] => {
  const lngs = route.geometry.map(([lng]) => lng);
  const lats = route.geometry.map(([, lat]) => lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
};

/** How long to wait for the first style/tile load before admitting defeat. */
const LOAD_TIMEOUT_MS = 8_000;
/** Tile errors are normal; this many means the basemap is down. */
const ERROR_BUDGET = 3;

const humanizeMapError = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (/failed to fetch|networkerror|load failed|aborted/i.test(raw)) {
    return "The basemap could not be reached (network blocked or provider outage).";
  }
  if (/webgl|context/i.test(raw)) {
    return "This browser could not start WebGL, which the map needs.";
  }
  return raw || "The basemap could not be loaded.";
};

export const MapView = ({
  center,
  zoom = DEFAULT_ZOOM,
  bins,
  selectedId = null,
  user = null,
  route = null,
  onSelectBin,
  interactive = true,
  className = "",
}: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const loadedRef = useRef(false);
  const errorCountRef = useRef(0);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [problem, setProblem] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const ready = status === "ready";

  // Create the map (and re-create it when the user retries).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    loadedRef.current = false;
    errorCountRef.current = 0;
    setStatus("loading");
    setProblem(null);

    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [center.longitude, center.latitude],
        zoom,
        interactive,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
    } catch (error) {
      // WebGL blocked or missing: the rest of the page still works, so say so.
      setStatus("error");
      setProblem(
        error instanceof Error
          ? `The map renderer could not start (${error.message}).`
          : "The map renderer could not start.",
      );
      return;
    }

    if (!interactive) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }

    map.on("load", () => {
      loadedRef.current = true;
      setStatus("ready");
      setProblem(null);
    });

    map.on("error", (event) => {
      if (loadedRef.current) return;
      errorCountRef.current += 1;

      // A missing style never recovers, so do not make the user wait for the
      // timeout. Tile/glyph errors are tolerated until the budget runs out.
      const styleMissing = !map.isStyleLoaded() && errorCountRef.current >= 2;
      if (styleMissing || errorCountRef.current >= ERROR_BUDGET) {
        setStatus("error");
        setProblem(humanizeMapError(event.error));
      }
    });

    // A silent failure (blocked request, blank GL context) never fires "load".
    const timer = setTimeout(() => {
      if (loadedRef.current) return;
      setStatus("error");
      setProblem("The basemap is taking too long to respond.");
    }, LOAD_TIMEOUT_MS);

    mapRef.current = map;

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const hasFittedRef = useRef<string | null>(null);
  const binsKey = bins.map((bin) => bin.id).join(",");

  // Frame every bin on first load (and whenever the result set changes), rather
  // than dropping the user at street zoom with a single pin in view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (route || selectedId) return;

    if (bins.length > 0 && hasFittedRef.current !== binsKey) {
      hasFittedRef.current = binsKey;
      const points: [number, number][] = bins.map((bin) => [bin.longitude, bin.latitude]);
      points.push([center.longitude, center.latitude]);

      const lngs = points.map(([lng]) => lng);
      const lats = points.map(([, lat]) => lat);

      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: { top: 84, bottom: 132, left: 44, right: 44 },
          maxZoom: 15,
          duration: 600,
        },
      );
      return;
    }

    map.easeTo({ center: [center.longitude, center.latitude], zoom, duration: 700 });
  }, [binsKey, bins, center.latitude, center.longitude, zoom, ready, route, selectedId]);

  // Bin markers. The click handler is read from a ref so that a new callback
  // identity from the parent does not tear down and rebuild every marker.
  const onSelectRef = useRef(onSelectBin);
  useEffect(() => {
    onSelectRef.current = onSelectBin;
  }, [onSelectBin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = bins.map((bin) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `bin-pin${bin.id === selectedId ? " is-selected" : ""}`;
      element.innerHTML = binPinMarkup;
      element.setAttribute("aria-label", bin.name);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current?.(bin.id);
      });

      return new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([bin.longitude, bin.latitude])
        .addTo(map);
    });
  }, [bins, selectedId, ready]);

  // "You are here" dot.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!user) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      const element = document.createElement("div");
      element.className = "user-dot";
      element.setAttribute("aria-label", "Your location");
      userMarkerRef.current = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([user.longitude, user.latitude])
        .addTo(map);
      return;
    }

    userMarkerRef.current.setLngLat([user.longitude, user.latitude]);
  }, [user, ready]);

  // Route line.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!route) {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getLayer("route-casing")) map.removeLayer("route-casing");
      if (map.getSource("route")) map.removeSource("route");
      return;
    }

    const data = routeFeature(route);
    const source = map.getSource("route") as GeoJSONSource | undefined;

    if (source) {
      source.setData(data);
    } else {
      map.addSource("route", { type: "geojson", data });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#04130d", "line-width": 9, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#C7FF3D", "line-width": 5 },
      });
    }

    map.fitBounds(boundsOf(route), {
      padding: { top: 110, bottom: 260, left: 46, right: 46 },
      duration: 800,
      maxZoom: 17,
    });
  }, [route, ready]);

  // Focus a selected bin when there is no route yet.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || route) return;
    const bin = bins.find((candidate) => candidate.id === selectedId);
    if (!bin) return;
    map.easeTo({
      center: [bin.longitude, bin.latitude],
      zoom: Math.max(map.getZoom(), 15.6),
      duration: 700,
    });
  }, [selectedId, bins, ready, route]);

  return (
    <div
      className={`relative isolate overflow-hidden bg-surface ${className}`}
      role="region"
      aria-label="Map of collection bins"
    >
      {/*
        NB: do not add `absolute inset-0` here. maplibre-gl.css sets
        `.maplibregl-map { position: relative }` after Tailwind, so an
        absolutely-positioned container collapses to zero height and the canvas
        renders into nothing (the "black screen" bug).
      */}
      <div ref={containerRef} className="h-full w-full" />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface/90 text-center">
          <p className="text-xs text-white/45">Loading map…</p>
          <p className="text-[10px] text-white/30">Every bin is listed below already.</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/95 px-6 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay/10 text-clay">
            <IconAlert size={20} />
          </span>
          <p className="text-sm font-semibold text-white">The map did not load</p>
          <p className="max-w-[32ch] text-[11px] leading-relaxed text-white/50">
            {problem ?? "The basemap could not be reached."} Every bin is still listed below, with
            distances and walking routes.
          </p>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={retry} className="btn-ghost px-3 py-1.5 text-[11px]">
              <IconMapPin size={13} />
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
