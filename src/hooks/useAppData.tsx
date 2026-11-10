import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useBins } from "./useBins";
import { useGeolocation, type LocationSource, type LocationStatus } from "./useGeolocation";
import { withDistance } from "@/lib/geo";
import type { BinWithDistance, LatLng } from "@/lib/types";

interface AppDataValue {
  position: LatLng;
  locationSource: LocationSource;
  locationStatus: LocationStatus;
  accuracy: number | null;
  refreshLocation: () => void;
  bins: BinWithDistance[];
  binsSource: "live" | "seed";
  binsProblem: string | null;
  binsLoading: boolean;
  reloadBins: () => void;
  /** Convenience: bins within N metres, nearest first. */
  binsWithin: (meters: number) => BinWithDistance[];
}

const AppDataContext = createContext<AppDataValue | null>(null);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const geo = useGeolocation();
  const { bins, source, problem, loading, reload } = useBins();

  const value = useMemo<AppDataValue>(() => {
    const sorted = withDistance(bins, geo.position);
    return {
      position: geo.position,
      locationSource: geo.source,
      locationStatus: geo.status,
      accuracy: geo.accuracy,
      refreshLocation: geo.refresh,
      bins: sorted,
      binsSource: source,
      binsProblem: problem,
      binsLoading: loading,
      reloadBins: reload,
      binsWithin: (meters: number) => sorted.filter((bin) => bin.distanceMeters <= meters),
    };
  }, [geo.position, geo.source, geo.status, geo.accuracy, geo.refresh, bins, source, problem, loading, reload]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataValue => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside <AppDataProvider>");
  return context;
};
