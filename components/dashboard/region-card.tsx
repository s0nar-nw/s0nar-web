import { Panel } from "@/components/sonar-ui";
import { cn } from "@/lib/utils";

interface RegionCardProps {
  name: string;
  score: number;
  reachability: number;
  latency: number;
  stale: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function RegionCard({
  name,
  score,
  reachability,
  latency,
  stale,
  onClick,
  selected,
}: RegionCardProps) {
  const inner = (
    <>
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-[1rem] font-semibold uppercase tracking-[-0.04em]">{name}</div>
          <div className="mt-[0.45rem] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            {stale ? "Excluded / stale" : `${latency}ms slot latency`}
          </div>
        </div>
        <div className="shrink-0 text-[2.2rem] font-semibold leading-[0.9] tracking-[-0.08em] text-[#2de19b]">
          {stale ? "—" : score}
        </div>
      </div>

      <div className="mt-5 flex justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        <span>Reachability</span>
        <span>{stale ? "—" : `${reachability}%`}</span>
      </div>
      <div className="mt-3 h-[0.38rem] overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full rounded-[inherit] bg-[linear-gradient(90deg,rgba(45,225,155,0.55),#2de19b)]"
          style={{ width: stale ? "0%" : `${reachability}%` }}
        />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          // mirror Panel base styles
          "relative min-h-[9.8rem] overflow-hidden rounded-[16px] border p-[1.15rem] text-left backdrop-blur-[18px]",
          "bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(45,225,155,0.08),transparent_34%),linear-gradient(180deg,rgba(45,225,155,0.02),transparent_44%)] before:opacity-50",
          "after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
          selected
            ? "border-[rgba(45,225,155,0.24)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.28),0_24px_64px_rgba(45,225,155,0.08)]"
            : "border-[rgba(255,255,255,0.06)]",
          stale && "opacity-50",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <Panel className={cn("min-h-[9.8rem] p-[1.15rem]", stale && "opacity-50", selected && "border-[rgba(45,225,155,0.24)]")}>
      {inner}
    </Panel>
  );
}
