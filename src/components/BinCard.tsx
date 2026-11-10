import { formatDistance, formatDuration } from "@/lib/geo";
import type { BinWithDistance } from "@/lib/types";
import { IconBattery, IconClock, IconMapPin, IconNavigation, IconRecycle } from "./icons";
import { StatusChip } from "./StatusChip";

export const BinCard = ({
  bin,
  selected,
  onSelect,
  onRoute,
}: {
  bin: BinWithDistance;
  selected?: boolean;
  onSelect: () => void;
  onRoute: () => void;
}) => (
  <article
    className={`card-tight w-full p-3 text-left transition ${
      selected ? "border-lime/40 bg-lime/[0.06]" : "hover:border-white/15"
    }`}
  >
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onSelect}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/12 text-lime"
        aria-label={`Show ${bin.name} on the map`}
      >
        <IconMapPin size={20} />
      </button>

      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-white">{bin.name}</h3>
          {bin.source === "seed" && (
            <StatusChip tone="pending" icon={false}>
              sample
            </StatusChip>
          )}
        </div>

        <p className="mt-0.5 truncate text-[11px] text-white/45">
          {bin.address ?? bin.description ?? "Collection bin"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="chip border-lime/25 text-lime">
            <IconNavigation size={12} />
            {formatDistance(bin.distanceMeters)}
          </span>
          <span className="chip">
            <IconClock size={12} />
            {formatDuration(bin.walkSeconds)} walk
          </span>
          {bin.openingHours && (
            <span className="chip">
              <IconRecycle size={12} />
              {bin.openingHours}
            </span>
          )}
          {bin.accepts?.includes("batteries") && (
            <span className="chip">
              <IconBattery size={12} />
              batteries too
            </span>
          )}
        </div>
      </button>

      <div className="flex h-11 shrink-0 items-center">
        <button
          type="button"
          onClick={onRoute}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={`Directions to ${bin.name}`}
        >
          <IconNavigation size={17} />
        </button>
      </div>
    </div>

    {typeof bin.fillLevel === "number" && (
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              bin.fillLevel > 0.8 ? "bg-clay" : bin.fillLevel > 0.5 ? "bg-lime/70" : "bg-mint"
            }`}
            style={{ width: `${Math.min(100, Math.round(bin.fillLevel * 100))}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-white/40">
          {bin.fillLevel > 0.8 ? "Nearly full" : `${Math.round(bin.fillLevel * 100)}% full`}
        </span>
      </div>
    )}
  </article>
);
