import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft } from "./icons";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
  /** Use over the map so the bar floats instead of pushing content down. */
  floating?: boolean;
}

export const TopBar = ({ title, subtitle, back, action, floating }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <header
      className={`z-30 flex items-center gap-3 px-4 pt-[calc(14px+env(safe-area-inset-top,0px))] ${
        floating ? "absolute inset-x-0 top-0" : "sticky top-0 bg-ink/70 backdrop-blur-xl"
      }`}
    >
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-ink/70 text-white/80 backdrop-blur transition hover:text-white"
        >
          <IconArrowLeft size={19} />
        </button>
      )}

      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-[17px] font-semibold leading-tight text-white">{title}</h1>
        )}
        {subtitle && <p className="truncate text-xs text-white/50">{subtitle}</p>}
      </div>

      {action}
    </header>
  );
};
