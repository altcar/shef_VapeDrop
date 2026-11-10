import { IconAlert, IconCheck, IconInfo } from "./icons";

type Tone = "pending" | "confirmed" | "neutral" | "warn" | "good";

const styles: Record<Tone, string> = {
  pending: "border-clay/35 bg-clay/10 text-clay",
  confirmed: "border-mint/35 bg-mint/10 text-mint",
  neutral: "border-line bg-white/5 text-white/60",
  warn: "border-clay/40 bg-clay/10 text-clay",
  good: "border-lime/35 bg-lime/10 text-lime",
};

const ToneIcon = ({ tone }: { tone: Tone }) => {
  if (tone === "pending" || tone === "warn") return <IconAlert size={13} />;
  if (tone === "confirmed" || tone === "good") return <IconCheck size={13} />;
  return <IconInfo size={13} />;
};

export const StatusChip = ({
  tone = "neutral",
  children,
  icon = true,
}: {
  tone?: Tone;
  children: React.ReactNode;
  icon?: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles[tone]}`}
  >
    {icon && <ToneIcon tone={tone} />}
    {children}
  </span>
);
