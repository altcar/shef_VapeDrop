import { Link } from "react-router-dom";
import { Screen } from "@/components/Screen";
import { IconMapPin } from "@/components/icons";

export const NotFoundPage = () => (
  <Screen>
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-lime">
        <IconMapPin size={24} />
      </span>
      <h1 className="text-xl font-semibold text-white">This page took a wrong turn</h1>
      <p className="max-w-[32ch] text-xs leading-relaxed text-white/45">
        The screen you were looking for does not exist. The nearest bin, however, definitely does.
      </p>
      <div className="mt-2 flex gap-2">
        <Link to="/" className="btn-ghost px-4 py-2 text-xs">
          Home
        </Link>
        <Link to="/find" className="btn-primary px-4 py-2 text-xs">
          Find a bin
        </Link>
      </div>
    </div>
  </Screen>
);
