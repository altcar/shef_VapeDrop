import { FALLBACK_ORIGIN } from "@/config/app";
import type { LocationStatus } from "@/hooks/useGeolocation";
import { IconLocate } from "./icons";

/**
 * Shown when the browser will not give us a location. Explains the (visible)
 * consequence: distances and routes are measured from the Students' Union.
 */
export const LocationNotice = ({
  status,
  onRetry,
}: {
  status: LocationStatus;
  onRetry: () => void;
}) => {
  if (status !== "denied" && status !== "unsupported") return null;

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky/25 bg-sky/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-sky/90">
      <IconLocate size={14} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <span className="font-semibold">Location is off.</span> Distances and walking routes start
        from <span className="font-semibold">{FALLBACK_ORIGIN.label}</span>.
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full border border-sky/30 bg-sky/10 px-2 py-0.5 text-[10px] font-semibold text-sky transition hover:bg-sky/20"
      >
        Enable
      </button>
    </div>
  );
};
