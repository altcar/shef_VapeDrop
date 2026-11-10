import { Link } from "react-router-dom";
import { FALLBACK_ORIGIN, NEARBY_RADIUS_M, PROGRAMME } from "@/config/app";
import { POINTS_PER_VAPE, REWARDS_STATUS, pointsToVapes, tierFor } from "@/config/rewards";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useDeposits } from "@/hooks/useDeposits";
import { formatDistance, formatDuration } from "@/lib/geo";
import { Screen, SectionHeading } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { UserAvatar } from "@/components/UserAvatar";
import { StatusChip } from "@/components/StatusChip";
import { SeedNotice } from "@/components/SeedNotice";
import { LocationNotice } from "@/components/LocationNotice";
import { DepositRowMini } from "@/components/DepositRow";
import { Skeleton } from "@/components/Feedback";
import {
  IconChevronRight,
  IconClock,
  IconGift,
  IconLeaf,
  IconMapPin,
  IconNavigation,
  IconQr,
  IconRecycle,
  IconSparkles,
} from "@/components/icons";

const greetingFor = (hour: number): string => {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const firstName = (value: string | null | undefined): string | null => {
  const cleaned = value?.trim().split(/\s+/)[0];
  return cleaned ? cleaned : null;
};

export const HomePage = () => {
  const { user, profile, points, loading: authLoading } = useAuth();
  const {
    bins,
    binsSource,
    binsProblem,
    binsLoading,
    reloadBins,
    locationStatus,
    locationSource,
    refreshLocation,
  } = useAppData();
  const { deposits } = useDeposits(user?.uid ?? null, 5);

  const nearest = bins[0] ?? null;
  const binNames = new Map(bins.map((bin) => [bin.id, bin.name]));
  const { current, next } = tierFor(points);
  const progress = next
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100),
        ),
      )
    : 100;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const name = firstName(profile?.name ?? user?.displayName ?? null);
  const greeting = `${greetingFor(now.getHours())}${name ? `, ${name}` : ""}`;

  const vapesRecycled = points > 0 ? pointsToVapes(points) : deposits.length;
  const nearbyCount = bins.filter((bin) => bin.distanceMeters <= NEARBY_RADIUS_M).length;
  const usingFallbackOrigin = locationSource === "fallback" && locationStatus !== "locating";

  return (
    <Screen>
      <TopBar title={greeting} subtitle={dateLabel} action={<UserAvatar />} />

      <main className="space-y-4 px-4 pt-4">
        {binsSource === "seed" && !binsLoading && (
          <SeedNotice problem={binsProblem} onRetry={reloadBins} />
        )}

        <LocationNotice status={locationStatus} onRetry={refreshLocation} />

        {/* Nearest bin + route */}
        <section className="card relative overflow-hidden p-4">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-lime/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label flex items-center gap-1.5">
                <IconMapPin size={12} />
                Nearest collection bin
              </p>
              {binsLoading && !nearest ? (
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : nearest ? (
                <>
                  <h2 className="mt-1 truncate text-xl font-semibold text-white">{nearest.name}</h2>
                  <p className="mt-0.5 truncate text-xs text-white/45">
                    {nearest.address ?? nearest.description ?? "Address not listed"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="chip border-lime/25 text-lime">
                      <IconNavigation size={12} />
                      {formatDistance(nearest.distanceMeters)}
                    </span>
                    <span className="chip">
                      <IconClock size={12} />
                      {formatDuration(nearest.walkSeconds)} walk
                    </span>
                    {usingFallbackOrigin && (
                      <span className="chip border-sky/30 text-sky">
                        from {FALLBACK_ORIGIN.shortLabel}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <h2 className="mt-1 text-lg font-semibold text-white">No bins loaded</h2>
              )}
            </div>

            <Link
              to={nearest ? `/find?bin=${encodeURIComponent(nearest.id)}` : "/find"}
              className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border border-lime/30 bg-lime/10 text-center text-lime transition hover:bg-lime/15"
              aria-label="Open the map"
            >
              <span className="flex flex-col items-center gap-0.5">
                <IconNavigation size={22} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Route</span>
              </span>
            </Link>
          </div>

          <div className="relative mt-4 flex gap-2">
            <Link
              to={nearest ? `/find?bin=${encodeURIComponent(nearest.id)}` : "/find"}
              className="btn-primary flex-1"
            >
              <IconNavigation size={17} />
              Walk me there
            </Link>
            <Link to="/find" className="btn-ghost">
              All bins
            </Link>
          </div>
        </section>

        {/* Points */}
        <section className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label">Points balance</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-semibold tabular-nums text-white">
                  {authLoading ? "—" : points}
                </p>
                <span className="text-xs text-white/40">
                  {POINTS_PER_VAPE} per vape
                </span>
              </div>
            </div>
            <Link to="/rewards" className="btn-ghost px-3 py-2 text-xs">
              <IconGift size={15} />
              Rewards
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-white/45">
              <span className="font-medium text-white/70">
                {current.name}
                {next ? ` → ${next.name}` : " (top tier)"}
              </span>
              {next && <span className="tabular-nums">{next.minPoints - points} pts to go</span>}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint to-lime transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-white/40">{next ? next.perk : current.perk}</p>
          </div>

          {!user && !authLoading && (
            <Link to="/account" className="mt-3 flex items-center gap-1.5 text-[11px] text-lime">
              Sign in to keep your points
              <IconChevronRight size={13} />
            </Link>
          )}
        </section>

        {/* Impact strip */}
        <section className="grid grid-cols-3 gap-2">
          {[
            { label: "Vapes recycled", value: vapesRecycled, icon: IconRecycle },
            { label: "Bins nearby", value: nearbyCount, icon: IconMapPin },
            {
              label: "Deposits logged",
              value: deposits.length,
              icon: IconLeaf,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-tight flex flex-col gap-1 p-3">
              <Icon size={16} className="text-lime/80" />
              <p className="text-lg font-semibold tabular-nums leading-none text-white">
                {binsLoading || authLoading ? "—" : value}
              </p>
              <p className="text-[10px] leading-tight text-white/40">{label}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="card p-4">
          <SectionHeading title="How it works" hint="Three steps, about a minute" />
          <ol className="space-y-3">
            {[
              {
                icon: IconMapPin,
                title: "Find a bin",
                body: "Nearest first, with a walking route that avoids crossing the ring road twice.",
              },
              {
                icon: IconQr,
                title: "Drop and prove it",
                body: "Drop the vape, then prove you were at the bin. The proof method is still being decided.",
              },
              {
                icon: IconSparkles,
                title: "Take the reward",
                body: "Points turn into something useful. The reward catalogue is still a draft.",
              },
            ].map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="flex gap-3">
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-lime">
                  <Icon size={17} />
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ink text-[9px] font-bold text-white/50 ring-1 ring-line">
                    {index + 1}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[11px] leading-relaxed text-white/45">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Rewards teaser */}
        <section className="card relative overflow-hidden p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label">Rewards</p>
              <h2 className="mt-1 text-base font-semibold text-white">
                {REWARDS_STATUS === "pending" ? "Still being decided" : "Live now"}
              </h2>
              <p className="mt-1 max-w-[38ch] text-[11px] leading-relaxed text-white/45">
                Vouchers, campus credit, a monthly draw and a charity option are all on the table.
                Nothing is redeemable until the scheme is agreed.
              </p>
            </div>
            <StatusChip tone={REWARDS_STATUS === "pending" ? "pending" : "confirmed"}>
              {REWARDS_STATUS === "pending" ? "draft" : "live"}
            </StatusChip>
          </div>
          <Link to="/rewards" className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-lime">
            See the draft catalogue
            <IconChevronRight size={13} />
          </Link>
        </section>

        {/* Recent deposits */}
        <section>
          <SectionHeading
            title="Recent deposits"
            action={
              user ? (
                <Link to="/account/history" className="text-[11px] font-medium text-lime">
                  View all
                </Link>
              ) : undefined
            }
          />
          {!user ? (
            <div className="card flex items-center gap-3 p-4">
              <IconLeaf size={18} className="text-white/40" />
              <p className="flex-1 text-[11px] leading-relaxed text-white/45">
                Sign in to keep a history of every vape you have kept out of the bin.
              </p>
              <Link to="/account" className="btn-primary px-3 py-2 text-xs">
                Sign in
              </Link>
            </div>
          ) : deposits.length === 0 ? (
            <div className="card px-4 py-6 text-center text-[11px] text-white/45">
              No deposits recorded yet. Your first trip is a short walk away.
            </div>
          ) : (
            <div className="card divide-y divide-line p-1.5">
              {deposits.slice(0, 3).map((deposit) => (
                <div key={deposit.id} className="p-2">
                  <DepositRowMini
                    label={(deposit.binId && binNames.get(deposit.binId)) || "Collection bin"}
                    when={deposit.createdAt}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="px-1 pb-2 text-center text-[10px] leading-relaxed text-white/30">
          {PROGRAMME.phase === "pilot" ? "Pilot programme" : "Live programme"} · proof of deposit{" "}
          {PROGRAMME.proofOfCollection === "pending" ? "pending" : "confirmed"} · rewards{" "}
          {PROGRAMME.rewardCatalogue === "pending" ? "pending" : "confirmed"}
        </p>
      </main>
    </Screen>
  );
};
