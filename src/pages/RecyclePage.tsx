import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BIN_QR_PREFIX,
  PROOF_OPTIONS,
  PROOF_STATUS,
  PROPOSED_PROOF,
  getProofOption,
} from "@/config/proof";
import { POINTS_PER_VAPE, POINTS_PER_VAPE_CONFIRMED } from "@/config/rewards";
import { useAppData } from "@/hooks/useAppData";
import { previewClaim, type ClaimPreview } from "@/lib/deposits";
import { Screen, SectionHeading } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { StatusChip } from "@/components/StatusChip";
import {
  IconAlert,
  IconCheck,
  IconChevronRight,
  IconInfo,
  IconQr,
  IconRecycle,
  IconShield,
  IconSparkles,
} from "@/components/icons";

const steps = [
  {
    icon: IconRecycle,
    title: "Drop the vape in a VapeDrop bin",
    body: "Pods, disposables and loose batteries all go in the same slot.",
  },
  {
    icon: IconShield,
    title: "Prove you were at the bin",
    body: "The method is not finalised yet — scanning a bin code is the leading option.",
  },
  {
    icon: IconSparkles,
    title: "Claim your points",
    body: "Points will be credited to your account once the proof check passes.",
  },
];

export const RecyclePage = () => {
  const { bins } = useAppData();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ClaimPreview | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const proposed = getProofOption(PROPOSED_PROOF);
  const isConfirmed = PROOF_STATUS === "confirmed";

  const check = () => {
    if (!code.trim()) {
      setResult({
        ok: false,
        binId: null,
        points: 0,
        message: "Enter the code printed on the bin, or a vapedrop:bin:… link.",
        preview: true,
      });
      return;
    }
    setResult(previewClaim(code, bins));
  };

  return (
    <Screen>
      <TopBar back title="Recycle a vape" subtitle="Claim points for a real deposit" />

      <main className="space-y-4 px-4 pt-4">
        <ol className="card divide-y divide-line p-1.5">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="flex items-start gap-3 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-lime">
                <Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  <span className="mr-1.5 text-white/35">{index + 1}.</span>
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* ---- the open decision ---- */}
        <section className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label">Proof of collection</p>
              <h2 className="mt-1 text-base font-semibold text-white">
                {isConfirmed ? "Confirmed" : "Not decided yet"}
              </h2>
            </div>
            <StatusChip tone={isConfirmed ? "confirmed" : "pending"}>
              {isConfirmed ? "live" : "decision pending"}
            </StatusChip>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-white/50">
            A bin cannot automatically tell us that <em>your</em> vape went in, so we need a way to
            prove it. The leading candidate is <strong className="text-white/80">{proposed.label}</strong>{" "}
            — {proposed.tagline.toLowerCase()}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="chip">effort: {proposed.effort}</span>
            <span className="chip">fake-resistance: {proposed.fraudResistance}</span>
            <span className="chip">{proposed.runningCost}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowOptions((value) => !value)}
            className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-lime"
          >
            {showOptions ? "Hide" : `Compare all ${PROOF_OPTIONS.length} options`}
            <IconChevronRight
              size={13}
              className={`transition ${showOptions ? "rotate-90" : ""}`}
            />
          </button>

          {showOptions && (
            <div className="mt-3 space-y-2">
              {PROOF_OPTIONS.map((option) => {
                const isProposed = option.id === PROPOSED_PROOF;
                return (
                  <details
                    key={option.id}
                    className={`rounded-2xl border p-3 ${
                      isProposed ? "border-lime/35 bg-lime/[0.05]" : "border-line bg-white/[0.02]"
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-white">{option.label}</span>
                      <span className="flex gap-1">
                        {isProposed && <StatusChip tone="good" icon={false}>proposed</StatusChip>}
                        <span className="chip">{option.effort}</span>
                      </span>
                    </summary>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                      {option.tagline}
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-mint/80">
                          Strengths
                        </p>
                        <ul className="mt-1 space-y-1">
                          {option.strengths.slice(0, 3).map((item) => (
                            <li key={item} className="flex gap-1.5 text-[11px] text-white/55">
                              <IconCheck size={12} className="mt-0.5 shrink-0 text-mint" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-clay/80">
                          Risks
                        </p>
                        <ul className="mt-1 space-y-1">
                          {option.risks.slice(0, 3).map((item) => (
                            <li key={item} className="flex gap-1.5 text-[11px] text-white/55">
                              <IconAlert size={12} className="mt-0.5 shrink-0 text-clay" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-white/35">
                      Needs: {option.needs.join(", ")} · {option.runningCost}
                    </p>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        {/* ---- dry-run claim ---- */}
        <section className="card p-4">
          <SectionHeading
            title="Preview the claim"
            hint="Dry run only — nothing is saved to your account"
          />

          <label htmlFor="bin-code" className="label">
            Bin code
          </label>
          <div className="mt-1.5 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-ink/60 px-3">
              <IconQr size={16} className="shrink-0 text-white/35" />
              <input
                id="bin-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") check();
                }}
                placeholder={`${BIN_QR_PREFIX}sample-union`}
                className="w-full bg-transparent py-2.5 font-mono text-[12px] text-white placeholder:text-white/25 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button type="button" onClick={check} className="btn-ghost px-3">
              Check
            </button>
          </div>

          {result && (
            <div
              className={`mt-3 rounded-2xl border p-3 text-[11px] leading-relaxed ${
                result.ok
                  ? "border-mint/30 bg-mint/[0.07] text-mint"
                  : "border-clay/30 bg-clay/[0.07] text-clay"
              }`}
            >
              <p className="font-semibold">{result.ok ? "Code looks valid" : "Not a valid code"}</p>
              <p className="mt-0.5 text-white/60">{result.message}</p>
              {result.ok && (
                <p className="mt-1.5 text-white/45">
                  A confirmed deposit would be worth{" "}
                  <span className="font-semibold text-white">{result.points} points</span> (
                  {POINTS_PER_VAPE_CONFIRMED ? "agreed rate" : "rate not agreed yet"}).
                </p>
              )}
            </div>
          )}

          <button type="button" disabled className="btn-primary mt-3 w-full">
            <IconRecycle size={17} />
            Claim {POINTS_PER_VAPE} points — locked
          </button>
          <p className="mt-2 flex gap-1.5 text-[10px] leading-relaxed text-white/35">
            <IconInfo size={12} className="mt-0.5 shrink-0" />
            Claiming stays locked until the proof method is agreed. The button will call a Worker
            endpoint that re-checks the code server-side and applies a per-bin cooldown.
          </p>
        </section>

        <div className="card flex items-center gap-3 p-4">
          <IconInfo size={16} className="shrink-0 text-white/40" />
          <p className="text-[11px] leading-relaxed text-white/45">
            Not near a bin yet?{" "}
            <Link to="/find" className="link">
              Find your nearest one
            </Link>{" "}
            and we will draw the walking route.
          </p>
        </div>
      </main>
    </Screen>
  );
};
