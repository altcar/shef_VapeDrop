import { useCallback, useEffect, useState } from "react";
import { FALLBACK_CENTER } from "@/config/app";
import type { LatLng } from "@/lib/types";

export type LocationSource = "gps" | "network" | "default";
export type LocationStatus = "locating" | "ready" | "denied" | "unsupported";

interface GeolocationState {
  position: LatLng;
  accuracy: number | null;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
}

interface IpLocation {
  latitude?: number;
  longitude?: number;
  city?: string | null;
}

const initialState: GeolocationState = {
  position: FALLBACK_CENTER,
  accuracy: null,
  source: "default",
  status: "locating",
  error: null,
};

/**
 * Browser GPS first, then a Cloudflare-derived approximate location, then the
 * Bristol/Sheffield-ish fallback from config (the map always renders).
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(initialState);

  const locate = useCallback(async () => {
    setState((current) => ({ ...current, status: "locating", error: null }));

    const fallbackToNetwork = async (reason: string) => {
      try {
        const response = await fetch("/api/locate");
        if (!response.ok) throw new Error(`locate failed (${response.status})`);
        const data = (await response.json()) as IpLocation;
        if (typeof data.latitude === "number" && typeof data.longitude === "number") {
          setState({
            position: { latitude: data.latitude, longitude: data.longitude },
            accuracy: 5000,
            source: "network",
            status: "ready",
            error: null,
          });
          return;
        }
        throw new Error("no coordinates in response");
      } catch {
        setState((current) => ({
          ...current,
          status: current.source === "default" ? "denied" : "ready",
          error: reason,
        }));
      }
    };

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      await fallbackToNetwork("This browser cannot share your location.");
      setState((current) => ({ ...current, status: "unsupported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          source: "gps",
          status: "ready",
          error: null,
        });
      },
      (geoError) => {
        void fallbackToNetwork(geoError.message || "Location permission was declined.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    void locate();
  }, [locate]);

  return { ...state, refresh: locate };
};
