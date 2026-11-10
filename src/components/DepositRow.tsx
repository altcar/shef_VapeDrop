import { POINTS_PER_VAPE } from "@/config/rewards";
import type { DepositRecord } from "@/lib/types";
import { IconMapPin, IconRecycle } from "./icons";

const formatWhen = (millis: number): string => {
  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const DepositRow = ({
  deposit,
  binName,
}: {
  deposit: DepositRecord;
  binName: string | null;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-line bg-elevated/60 px-3 py-2.5">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint">
      <IconRecycle size={18} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium text-white">
        {binName ?? "Collection bin"}
      </p>
      <p className="text-[11px] text-white/40">{formatWhen(deposit.createdAt)}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold tabular-nums text-lime">
        +{deposit.points ?? POINTS_PER_VAPE}
      </p>
      <p className="text-[10px] text-white/35">points</p>
    </div>
  </div>
);

export const DepositRowMini = ({ label, when }: { label: string; when: number }) => (
  <div className="flex items-center gap-2.5">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/50">
      <IconMapPin size={15} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-medium text-white/85">{label}</p>
      <p className="text-[10px] text-white/35">{formatWhen(when)}</p>
    </div>
  </div>
);
