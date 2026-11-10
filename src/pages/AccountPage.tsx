import { Link } from "react-router-dom";
import { CONTACT_EMAIL, PROGRAMME } from "@/config/app";
import { PROOF_STATUS } from "@/config/proof";
import { REWARDS_STATUS } from "@/config/rewards";
import { useAuth } from "@/hooks/useAuth";
import { Screen, SectionHeading } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { StatusChip } from "@/components/StatusChip";
import {
  IconChevronRight,
  IconGift,
  IconInfo,
  IconLogout,
  IconRecycle,
  IconShield,
  IconTrash,
  IconUser,
} from "@/components/icons";

const linkClass =
  "flex items-center gap-3 px-4 py-3.5 text-[13px] font-medium text-white/85 transition hover:bg-white/[0.04]";

export const AccountPage = () => {
  const { user, profile, points, mode, loading, signingIn, error, signIn, signOutUser } = useAuth();

  return (
    <Screen>
      <TopBar title="Account" subtitle={mode === "demo" ? "Demo mode" : "Signed in with Google"} />

      <main className="space-y-4 px-4 pt-4">
        {mode === "demo" && (
          <div className="flex items-start gap-2 rounded-2xl border border-clay/25 bg-clay/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-clay/90">
            <IconInfo size={14} className="mt-0.5 shrink-0" />
            <p>
              Firebase environment variables are not configured in this build, so sign-in is
              disabled and points stay on this device only.
            </p>
          </div>
        )}

        {user ? (
          <section className="card p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/5 text-white/60">
                {profile?.photo ?? user.photoURL ? (
                  <img
                    src={profile?.photo ?? user.photoURL ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <IconUser size={24} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-white">
                  {profile?.name ?? user.displayName ?? "VapeDrop member"}
                </p>
                <p className="truncate text-[11px] text-white/45">
                  {profile?.email ?? user.email ?? "No email on file"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold tabular-nums text-lime">{points}</p>
                <p className="text-[10px] text-white/40">points</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="card p-4">
            <SectionHeading title="Sign in to keep your points" hint="Google sign-in, no password" />
            <p className="text-[11px] leading-relaxed text-white/50">
              Your deposit history and points are stored against your account. Signing in also
              unlocks the rewards catalogue once it goes live.
            </p>
            <button
              type="button"
              onClick={() => void signIn()}
              disabled={signingIn || mode === "demo"}
              className="btn-primary mt-3 w-full"
            >
              {signingIn ? "Opening Google…" : "Continue with Google"}
            </button>
            {error && <p className="mt-2 text-[11px] text-clay">{error}</p>}
          </section>
        )}

        <section className="card overflow-hidden">
          <Link to="/account/history" className={linkClass}>
            <IconRecycle size={17} className="text-lime" />
            Deposit history
            <IconChevronRight size={15} className="ml-auto text-white/30" />
          </Link>
          <div className="mx-4 h-px bg-line" />
          <Link to="/rewards" className={linkClass}>
            <IconGift size={17} className="text-lime" />
            Points &amp; rewards
            <IconChevronRight size={15} className="ml-auto text-white/30" />
          </Link>
          <div className="mx-4 h-px bg-line" />
          <Link to="/recycle" className={linkClass}>
            <IconShield size={17} className="text-lime" />
            Proof of collection
            <span className="ml-auto mr-1 text-[10px] text-white/35">
              {PROOF_STATUS === "pending" ? "pending" : "confirmed"}
            </span>
            <IconChevronRight size={15} className="text-white/30" />
          </Link>
        </section>

        <section className="card p-4">
          <SectionHeading title="Programme status" hint="What is still being decided" />
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center justify-between gap-2">
              <span className="text-white/55">Proof that a bin received a vape</span>
              <StatusChip tone={PROOF_STATUS === "pending" ? "pending" : "confirmed"}>
                {PROOF_STATUS === "pending" ? "pending" : "confirmed"}
              </StatusChip>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-white/55">The reward itself</span>
              <StatusChip tone={REWARDS_STATUS === "pending" ? "pending" : "confirmed"}>
                {REWARDS_STATUS === "pending" ? "pending" : "confirmed"}
              </StatusChip>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-white/55">Points per vape</span>
              <StatusChip tone="pending">legacy value</StatusChip>
            </li>
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-white/35">
            {PROGRAMME.phase === "pilot" ? "Pilot" : "Live"} build. Have a say:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <section className="card overflow-hidden">
          <a href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20VapeDrop%20account`} className={linkClass}>
            <IconTrash size={17} className="text-white/45" />
            Request account deletion
            <IconChevronRight size={15} className="ml-auto text-white/30" />
          </a>
          {user && (
            <>
              <div className="mx-4 h-px bg-line" />
              <button
                type="button"
                onClick={() => void signOutUser()}
                className={`${linkClass} w-full text-left text-clay`}
              >
                <IconLogout size={17} />
                Sign out
              </button>
            </>
          )}
        </section>

        <p className="px-1 pb-2 text-center text-[10px] leading-relaxed text-white/30">
          VapeDrop v2 · web app on Cloudflare Workers · map data © OpenStreetMap contributors
          {loading ? " · loading session…" : ""}
        </p>
      </main>
    </Screen>
  );
};
