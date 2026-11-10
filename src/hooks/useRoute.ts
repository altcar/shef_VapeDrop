import { useEffect, useState } from "react";
import type { TravelProfile } from "@/config/map";
import { fetchRoute } from "@/lib/routing";
import type { LatLng, RouteResult } from "@/lib/types";

interface RouteState {
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
}

/** Fetch a route whenever either endpoint changes. */
export const useRoute = (
  from: LatLng | null,
  to: LatLng | null,
  profile: TravelProfile = "foot",
  enabled = true,
) => {
  const [state, setState] = useState<RouteState>({ route: null, loading: false, error: null });

  useEffect(() => {
    if (!enabled || !from || !to) {
      setState({ route: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState({ route: null, loading: true, error: null });

    void fetchRoute(from, to, profile, controller.signal)
      .then((route) => setState({ route, loading: false, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({
          route: null,
          loading: false,
          error: error instanceof Error ? error.message : "Could not build a route",
        });
      });

    return () => controller.abort();
    // from/to are recreated on every render by callers, so compare by value.
  }, [from?.latitude, from?.longitude, to?.latitude, to?.longitude, profile, enabled]);

  return state;
};
