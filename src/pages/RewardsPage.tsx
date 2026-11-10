import { Link } from "react-router-dom";
import {
  POINTS_PER_VAPE,
  POINTS_PER_VAPE_CONFIRMED,
  REWARD_CATALOGUE,
  REWARDS_STATUS,
  TIERS,
  pointsToVapes,
  tierFor,
} from "@/config/rewards";
import { PROOF_STATUS } from "@/config/proof";
import { CONTACT_EMAIL } from "@/config/app";
import { useAuth } from "@/hooks/useAuth";
import { Screen, SectionHeading } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { StatusChip } from "@/components/StatusChip";
import { IconChevronRight, IconGift, IconSparkles, IconTrophy } from "@/components/icons";

export const RewardsPage = () => {
  const { points, user, loading } = useAuth();
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

  return (
    <Screen>
      <TopBar title="Rewards" subtitle="Draft scheme — not live yet" />

      <main className="space-y-4 px-4 pt-4">
        <section className="card relative overflow-hidden p-4">
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-mint/10 blur-3xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="label">Balance</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-white">
                {loading ? "—" : points}
              </p>
              <p className="mt-1 text-[11px] text-white/40">
                ≈ {pointsToVapes(points)} vapes recycled at {POINTS_PER_VAPE} points each
              </p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-lime">
              <IconTrophy size={22} />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white/75">{current.name}</span>
              {next ? (
                <span className="text-white/40">{next.minPoints - points} points to {next.name}</span>
              ) : (
                <span className="text-lime">Top tier</span>
              )}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint to-lime"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
              {TIERS.map((tier) => (
                <span
                  key={tier.name}
                  className={`chip shrink-0 ${
                    points >= tier.minPoints ? "border-lime/30 text-lime" : ""
                  }`}
                >
                  {tier.name} · {tier.minPoints}
                </span>
              ))}
            </div>
          </div>

          {!user && !loading && (
            <Link to="/account" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-lime">
              Sign in so points survive a refresh
              <IconChevronRight size={13} />
            </Link>
          )}
        </section>

        <div className="flex items-start gap-2 rounded-2xl border border-clay/25 bg-clay/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-clay/90">
          <IconSparkles size={14} className="mt-0.5 shrink-0" />
          <p>
            Nothing here can be redeemed yet. The gift itself is an open decision — these are drafts
            for discussion with partners, not offers.
          </p>
        </div>

        <section>
          <SectionHeading
            title="Draft catalogue"
            hint="Costs in points; each card needs a partner to agree"
            action={
              <StatusChip tone={REWARDS_STATUS === "pending" ? "pending" : "confirmed"}>
                {REWARDS_STATUS === "pending" ? "draft" : "live"}
              </StatusChip>
            }
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {REWARD_CATALOGUE.map((reward) => {
              const affordable = points >= reward.pointsCost;
              return (
                <article key={reward.id} className="card-tight flex flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold leading-snug text-white">
                      {reward.title}
                    </h3>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 text-white/60">
                      <IconGift size={15} />
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/45">{reward.blurb}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="chip border-lime/25 font-semibold text-lime">
                      {reward.pointsCost} pts
                    </span>
                    <span className="chip">{pointsToVapes(reward.pointsCost)} vapes</span>
                    <StatusChip tone="pending" icon={false}>
                      {reward.owner}
                    </StatusChip>
                  </div>

                  <button
                    type="button"
                    disabled
                    className={`btn mt-3 w-full text-xs ${
                      affordable ? "bg-white/8 text-white/50" : "bg-white/[0.04] text-white/30"
                    }`}
                  >
                    {affordable ? "Locked until agreed" : "Not enough points"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="card p-4">
          <SectionHeading title="How points will work" />
          <ul className="space-y-2.5 text-[11px] leading-relaxed text-white/55">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
              <span>
                One deposit is worth{" "}
                <strong className="text-white">{POINTS_PER_VAPE} points</strong>
                {POINTS_PER_VAPE_CONFIRMED ? "" : " (legacy value, not agreed)"}.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
              <span>
                Points only count once a deposit passes the proof check — see the{" "}
                <Link to="/recycle" className="link">
                  proof options
                </Link>
                {PROOF_STATUS === "pending" ? " (still open)" : ""}.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
              <span>
                Redemption will be a voucher code or a partner scan. No cash, no resale, one account
                per person.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
              <span>
                Got a better idea for the reward?{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=Reward%20idea`} className="link">
                  Send it in
                </a>
                .
              </span>
            </li>
          </ul>
        </section>
      </main>
    </Screen>
  );
};
