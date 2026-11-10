import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import type { Feature, LineString } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, DEFAULT_ZOOM } from "@/config/map";
import type { BinWithDistance, LatLng, RouteResult } from "@/lib/types";

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
  const [ready, setReady] = useState(false);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
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

    map.on("load", () => setReady(true));

    if (!interactive) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-centre when the caller's centre changes (e.g. GPS arrives after mount).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (route || selectedId) return;
    map.easeTo({ center: [center.longitude, center.latitude], zoom, duration: 700 });
  }, [center.latitude, center.longitude, zoom, ready, route, selectedId]);

  // Bin markers.
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
        onSelectBin?.(bin.id);
      });

      return new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([bin.longitude, bin.latitude])
        .addTo(map);
    });
  }, [bins, selectedId, ready, onSelectBin]);

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
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-surface text-xs text-white/40">
          Loading map…
        </div>
      )}
    </div>
  );
};
