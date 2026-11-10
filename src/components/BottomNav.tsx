import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/config/app";
import { iconByName } from "./icons";

export const BottomNav = () => (
  <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[540px] px-3 pb-[calc(14px+var(--safe-bottom))] pt-2">
    <div className="pointer-events-auto flex items-end justify-between rounded-[26px] border border-line bg-ink/80 px-1.5 py-1.5 shadow-[0_-8px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      {NAV_ITEMS.map((item) => {
        const Icon = iconByName[item.icon];
        const isCenter = item.to === "/recycle";

        if (isCenter) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="group relative -mt-6 flex w-[64px] flex-col items-center gap-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full border shadow-glow transition ${
                      isActive
                        ? "border-lime bg-lime text-ink"
                        : "border-lime/40 bg-elevated text-lime"
                    }`}
                  >
                    <Icon size={24} />
                  </span>
                  <span className="text-[10px] font-medium text-white/60">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex w-[64px] flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition ${
                isActive ? "text-lime" : "text-white/55 hover:text-white/80"
              }`
            }
          >
            <Icon size={21} />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  </nav>
);
