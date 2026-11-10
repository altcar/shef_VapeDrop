import { IconInfo } from "./icons";

export const SeedNotice = ({
  problem,
  onRetry,
}: {
  problem: string | null;
  onRetry?: () => void;
}) => (
  <div className="flex items-start gap-2 rounded-2xl border border-clay/25 bg-clay/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-clay/90">
    <IconInfo size={14} className="mt-0.5 shrink-0" />
    <div className="flex-1">
      <span className="font-semibold">Showing sample bins.</span> Live bin locations could not be
      loaded{problem ? ` (${problem})` : ""}. Do not use these to plan a real trip.
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline">
        Retry
      </button>
    )}
  </div>
);
