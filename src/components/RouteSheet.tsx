import { PROFILE_LABELS, type TravelProfile } from "@/config/map";
import { formatDistance, formatDuration } from "@/lib/geo";
import { externalDirectionsUrl } from "@/lib/routing";
import type { BinWithDistance, LatLng, RouteResult } from "@/lib/types";
import { IconCheck, IconExternal, IconInfo, IconNavigation, IconRoute } from "./icons";
import { Skeleton } from "./Feedback";

const profiles: TravelProfile[] = ["foot", "bike", "car"];

export const RouteSheet = ({
  bin,
  route,
  loading,
  error,
  from,
  profile,
  onProfileChange,
  onClose,
}: {
  bin: BinWithDistance;
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
  from: LatLng | null;
  profile: TravelProfile;
  onProfileChange: (profile: TravelProfile) => void;
  onClose: () => void;
}) => (
  <section className="card animate-rise overflow-hidden">
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <p className="label">Your route</p>
        <h2 className="truncate text-base font-semibold text-white">{bin.name}</h2>
      </div>
      <button type="button" onClick={onClose} className="btn-quiet -mr-2 px-2 py-1 text-xs">
        Close
      </button>
    </div>

    <div className="grid grid-cols-2 gap-px bg-line">
      <div className="bg-surface px-4 py-3">
        <p className="label">Distance</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-white">
            {route ? formatDistance(route.distanceMeters) : formatDistance(bin.distanceMeters)}
          </p>
        )}
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="label">{PROFILE_LABELS[profile]} time</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-lime">
            {route ? formatDuration(route.durationSeconds) : formatDuration(bin.walkSeconds)}
          </p>
        )}
      </div>
    </div>

    <div className="flex gap-1.5 px-4 pt-3">
      {profiles.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onProfileChange(option)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
            option === profile
              ? "bg-lime text-ink"
              : "border border-line bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          {PROFILE_LABELS[option]}
        </button>
      ))}
    </div>

    <div className="px-4 pb-2 pt-3">
      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay/10 p-2.5 text-[11px] text-clay">
          <IconInfo size={14} />
          <span>{error}</span>
        </div>
      )}

      {route?.source === "straight-line" && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px] text-white/55">
          <IconRoute size={14} />
          <span>
            Walking directions are unavailable right now, so this is a straight-line estimate.
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      ) : (
        <ol className="max-h-[172px] space-y-2 overflow-y-auto pr-1">
          {(route?.steps ?? []).slice(0, 12).map((step, index) => (
            <li key={`${step.instruction}-${index}`} className="flex gap-2.5 text-[12px]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/8 text-[10px] font-semibold text-white/60">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="leading-snug text-white/80">{step.instruction}</p>
                <p className="text-[10px] text-white/40">
                  {formatDistance(step.distanceMeters)} · {formatDuration(step.durationSeconds)}
                </p>
              </div>
            </li>
          ))}
          {!route?.steps.length && (
            <li className="flex items-center gap-2 text-[12px] text-white/50">
              <IconCheck size={14} className="text-mint" />
              Head to the pin, the bin is at the destination.
            </li>
          )}
        </ol>
      )}
    </div>

    <div className="flex gap-2 px-4 pb-4 pt-2">
      <a
        className="btn-primary flex-1"
        href={externalDirectionsUrl(from, {
          latitude: bin.latitude,
          longitude: bin.longitude,
        })}
        target="_blank"
        rel="noreferrer"
      >
        <IconNavigation size={17} />
        Navigate
      </a>
      <a
        className="btn-ghost"
        href={`https://www.openstreetmap.org/directions?from=${from?.latitude ?? ""},${
          from?.longitude ?? ""
        }&to=${bin.latitude},${bin.longitude}#map=17/${bin.latitude}/${bin.longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        <IconExternal size={16} />
        OSM
      </a>
    </div>
  </section>
);
