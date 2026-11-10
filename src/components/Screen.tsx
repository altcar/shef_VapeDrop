import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export const Screen = ({
  children,
  bottomNav = true,
  className = "",
}: {
  children: ReactNode;
  bottomNav?: boolean;
  className?: string;
}) => (
  <div className={`app-frame ${bottomNav ? "pb-[calc(112px+var(--safe-bottom))]" : ""} ${className}`}>
    {children}
    {bottomNav && <BottomNav />}
  </div>
);

export const SectionHeading = ({
  title,
  action,
  hint,
}: {
  title: string;
  action?: ReactNode;
  hint?: string;
}) => (
  <div className="mb-3 flex items-end justify-between gap-3">
    <div>
      <h2 className="section-title">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-white/45">{hint}</p>}
    </div>
    {action}
  </div>
);
