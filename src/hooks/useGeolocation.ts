import { useCallback, useEffect, useState } from "react";
import { FALLBACK_ORIGIN } from "@/config/app";
import type { LatLng } from "@/lib/types";

export type LocationSource = "gps" | "fallback";
export type LocationStatus = "locating" | "ready" | "denied" | "unsupported";

interface GeolocationState {
  position: LatLng;
  accuracy: number | null;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
}

/** Every distance and route is measured from here when GPS is unavailable. */
const fallbackPosition: LatLng = {
  latitude: FALLBACK_ORIGIN.latitude,
  longitude: FALLBACK_ORIGIN.longitude,
};

const initialState: GeolocationState = {
  position: fallbackPosition,
  accuracy: null,
  source: "fallback",
  status: "locating",
  error: null,
};

/**
 * Browser GPS, or Sheffield Students' Union.
 *
 * Deliberately no IP geolocation in between: city-level IP lookups are often
 * tens of kilometres out, which produces confidently wrong walking times. The
 * Union is a known, stable anchor, and the UI tells the user that is where the
 * distances start from.
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(initialState);

  const locate = useCallback(async () => {
    setState((current) => ({ ...current, status: "locating", error: null }));

    const useFallback = (status: LocationStatus, error: string | null) => {
      setState({
        position: fallbackPosition,
        accuracy: null,
        source: "fallback",
        status,
        error,
      });
    };

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      useFallback("unsupported", "This browser cannot share your location.");
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
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was declined."
            : geoError.message || "Could not get your location.";
        useFallback("denied", message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    void locate();
  }, [locate]);

  return { ...state, refresh: locate };
};
