import { Panel } from "@/components/sonar-ui";
import { cn } from "@/lib/utils";

interface RegionCardProps {
  name: string;
  score: number;
  reachability: number;
  latency: number;
  stale: boolean;
  reachableStakePct?: number;
  agaveCount?: number;
  firedancerCount?: number;
  jitoCount?: number;
  otherCount?: number;
  onClick?: () => void;
  selected?: boolean;
}

export function RegionCard({
  name,
  score,
  reachability,
  latency,
  stale,
  reachableStakePct = 0,
  agaveCount = 0,
  firedancerCount = 0,
  jitoCount = 0,
  otherCount = 0,
  onClick,
  selected,
}: RegionCardProps) {
  const total = agaveCount + firedancerCount + jitoCount + otherCount;
  const agavePct = total > 0 ? (agaveCount / total) * 100 : 0;
  const firedancerPct = total > 0 ? (firedancerCount / total) * 100 : 0;
  const jitoPct = total > 0 ? (jitoCount / total) * 100 : 0;
  const otherPct = total > 0 ? (otherCount / total) * 100 : 0;
  const hasReport =
    score > 0 || reachability > 0 || latency > 0 || reachableStakePct > 0 || total > 0;

  const inner = (
    <>
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-[1rem] font-semibold uppercase tracking-[-0.04em]">
            {name}
          </div>
          <div className="mt-[0.45rem] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            {!hasReport
              ? "No report"
              : stale
                ? "Last known / stale"
                : latency === 0
                  ? "Synced"
                  : `${latency}ms slot lag`}
          </div>
        </div>
        <div
          className={cn(
            "shrink-0 text-[2.2rem] font-semibold leading-[0.9] tracking-[-0.08em]",
            stale ? "text-[rgba(245,255,249,0.58)]" : "text-[#2de19b]",
          )}
        >
          {hasReport ? score : "—"}
        </div>
      </div>

      <div className="mt-5 flex justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        <span>Reachability</span>
        <span>{reachability}%</span>
      </div>
      <div className="mt-3 h-[0.38rem] overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
        <div
          className={cn(
            "h-full rounded-[inherit]",
            stale
              ? "bg-[rgba(245,255,249,0.28)]"
              : "bg-[linear-gradient(90deg,rgba(45,225,155,0.55),#2de19b)]",
          )}
          style={{ width: `${reachability}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        <span>Stake reach</span>
        <span>{reachableStakePct}%</span>
      </div>
      <div className="mt-1.5 h-[0.38rem] overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
        <div
          className={cn(
            "h-full rounded-[inherit]",
            stale
              ? "bg-[rgba(245,255,249,0.22)]"
              : "bg-[linear-gradient(90deg,rgba(45,225,155,0.35),rgba(45,225,155,0.7))]",
          )}
          style={{ width: `${reachableStakePct}%` }}
        />
      </div>

      {total > 0 ? (
        <div className="mt-3">
          <div className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            Client mix
          </div>
          <div className="flex h-[0.38rem] gap-px overflow-hidden rounded-full">
            <div style={{ width: `${agavePct}%` }} className="bg-[#2de19b]" />
            <div style={{ width: `${firedancerPct}%` }} className="bg-[#60a5fa]" />
            <div style={{ width: `${jitoPct}%` }} className="bg-[#f59e0b]" />
            <div style={{ width: `${otherPct}%` }} className="bg-[rgba(255,255,255,0.18)]" />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[rgba(245,255,249,0.36)]">
            <span><span className="text-[#2de19b]">●</span> Agave {agaveCount}</span>
            {firedancerCount > 0 ? <span><span className="text-[#60a5fa]">●</span> FD {firedancerCount}</span> : null}
            {jitoCount > 0 ? <span><span className="text-[#f59e0b]">●</span> Jito {jitoCount}</span> : null}
          </div>
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          // mirror Panel base styles
          "relative min-h-[12.8rem] overflow-hidden rounded-[16px] border p-[1.15rem] text-left backdrop-blur-[18px]",
          "bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(45,225,155,0.08),transparent_34%),linear-gradient(180deg,rgba(45,225,155,0.02),transparent_44%)] before:opacity-50",
          "after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
          selected
            ? "border-[rgba(45,225,155,0.24)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.28),0_24px_64px_rgba(45,225,155,0.08)]"
            : "border-[rgba(255,255,255,0.06)]",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <Panel
      className={cn(
        "min-h-[12.8rem] p-[1.15rem]",
        selected && "border-[rgba(45,225,155,0.24)]",
      )}
    >
      {inner}
    </Panel>
  );
}
