import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FALLBACK_ORIGIN } from "@/config/app";
import { SELECTED_ZOOM, type TravelProfile } from "@/config/map";
import { useAppData } from "@/hooks/useAppData";
import { useRoute } from "@/hooks/useRoute";
import type { BinWithDistance } from "@/lib/types";
import { MapView } from "@/components/MapView";
import { BinCard } from "@/components/BinCard";
import { RouteSheet } from "@/components/RouteSheet";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { SeedNotice } from "@/components/SeedNotice";
import { LocationNotice } from "@/components/LocationNotice";
import { BinCardSkeleton, EmptyState } from "@/components/Feedback";
import { IconLocate, IconSearch, IconX } from "@/components/icons";

export const FindPage = () => {
  const {
    bins,
    binsLoading,
    binsSource,
    binsProblem,
    reloadBins,
    position,
    locationStatus,
    locationSource,
    refreshLocation,
  } = useAppData();
  const [params, setParams] = useSearchParams();
  const binParam = params.get("bin");

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(binParam);
  const [routeTarget, setRouteTarget] = useState<BinWithDistance | null>(null);
  const [profile, setProfile] = useState<TravelProfile>("foot");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return bins;
    return bins.filter((bin) =>
      [bin.name, bin.address, bin.description, bin.openingHours]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle)),
    );
  }, [bins, query]);

  // Deep link from the home screen: /find?bin=<id> opens the route straight away.
  useEffect(() => {
    if (!binParam || !bins.length) return;
    const match = bins.find((bin) => bin.id === binParam);
    if (match) {
      setSelectedId(match.id);
      setRouteTarget(match);
    }
  }, [binParam, bins]);

  const routeDestination = routeTarget
    ? { latitude: routeTarget.latitude, longitude: routeTarget.longitude }
    : null;

  const { route, loading: routeLoading, error } = useRoute(
    position,
    routeDestination,
    profile,
    Boolean(routeTarget),
  );

  const openRoute = (bin: BinWithDistance) => {
    setSelectedId(bin.id);
    setRouteTarget(bin);
    setParams({ bin: bin.id }, { replace: true });
  };

  const closeRoute = () => {
    setRouteTarget(null);
    const next = new URLSearchParams(params);
    next.delete("bin");
    setParams(next, { replace: true });
  };

  const selected = bins.find((bin) => bin.id === selectedId) ?? null;

  return (
    <Screen>
      <TopBar
        title="Find a bin"
        subtitle={
          locationStatus === "locating"
            ? "Locating you…"
            : `${filtered.length} bin${filtered.length === 1 ? "" : "s"}${
                locationSource === "fallback"
                  ? ` from ${FALLBACK_ORIGIN.shortLabel}`
                  : " nearby"
              }`
        }
        action={
          <button
            type="button"
            onClick={refreshLocation}
            aria-label="Recentre on my location"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/5 text-white/75 transition hover:text-white"
          >
            <IconLocate size={18} />
          </button>
        }
      />

      <div className="relative">
        <MapView
          className="h-[46vh] min-h-[300px] w-full border-b border-line"
          center={
            selected
              ? { latitude: selected.latitude, longitude: selected.longitude }
              : position
          }
          zoom={selected ? SELECTED_ZOOM : 14}
          bins={filtered}
          selectedId={selectedId}
          user={locationSource === "gps" ? position : null}
          route={routeTarget ? route : null}
          onSelectBin={(id) => {
            const bin = bins.find((candidate) => candidate.id === id);
            if (bin) openRoute(bin);
          }}
        />

        <div className="absolute inset-x-4 bottom-4 z-20">
          <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]">
            <IconSearch size={16} className="text-[#5f6368]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a bin, street or campus"
              className="w-full bg-transparent text-[13px] text-[#202124] placeholder:text-[#80868b] focus:outline-none"
              aria-label="Search bins"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-[#5f6368] hover:text-[#202124]"
              >
                <IconX size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-3 px-4 pt-4">
        {binsSource === "seed" && !binsLoading && (
          <SeedNotice problem={binsProblem} onRetry={reloadBins} />
        )}

        <LocationNotice status={locationStatus} onRetry={refreshLocation} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {query ? `Results for “${query}”` : "Nearest first"}
          </h2>
          <span className="text-[11px] text-white/40">walking distance</span>
        </div>

        {binsLoading ? (
          <div className="space-y-2">
            <BinCardSkeleton />
            <BinCardSkeleton />
            <BinCardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No bins match that search"
            description="Try a street name, a campus building, or clear the search to see every bin."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
                selected={bin.id === selectedId}
                onSelect={() => {
                  setSelectedId(bin.id);
                  if (routeTarget) closeRoute();
                }}
                onRoute={() => openRoute(bin)}
              />
            ))}
          </div>
        )}

        <p className="pb-2 text-center text-[10px] leading-relaxed text-white/30">
          Map data from OpenStreetMap (OpenFreeMap). Walking routes use Valhalla. No Google Maps key
          required.
        </p>
      </div>

      {routeTarget && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[540px] px-3 pb-[calc(104px+var(--safe-bottom))]">
          <div className="max-h-[62vh] overflow-y-auto">
            <RouteSheet
              bin={routeTarget}
              route={route}
              loading={routeLoading}
              error={error}
              from={position}
              profile={profile}
              originLabel={
                locationSource === "fallback" ? FALLBACK_ORIGIN.shortLabel : undefined
              }
              onProfileChange={setProfile}
              onClose={closeRoute}
            />
          </div>
        </div>
      )}
    </Screen>
  );
};

export default FindPage;
