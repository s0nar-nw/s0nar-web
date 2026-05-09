"use client";

import { useState } from "react";
import {
  MetricCard,
  PageFrame,
  PageIntro,
  Panel,
  SectionTitle,
  Skeleton,
  StatusPill,
} from "@/components/sonar-ui";
import { REGION_PINS, type RegionScoreView } from "@/lib/sonar-static";
import { useSonarSnapshot } from "@/hooks/use-sonar-snapshot";

function CoverageMap({
  selected,
  onSelect,
  regions,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  regions: RegionScoreView[];
}) {
  const labelOffsets: Record<string, number> = {
    us: -20,
    eu: -20,
    sa: -18,
    africa: -18,
    asia: -20,
    oc: -18,
    other: -18,
  };

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] p-[1.15rem] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5">
      <SectionTitle
        action={
          <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            Click a region pin for detail
          </span>
        }
      >
        Observer coverage map
      </SectionTitle>
      <svg viewBox="0 0 960 480" className="w-full">
        <g
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.8"
        >
          <path d="M120,80 L240,70 L270,100 L280,160 L260,200 L240,240 L200,260 L160,240 L140,200 L100,180 L90,130 Z" />
          <path d="M210,260 L280,250 L300,300 L290,370 L250,400 L210,380 L190,320 Z" />
          <path d="M430,80 L530,70 L560,100 L550,150 L500,160 L460,150 L430,130 Z" />
          <path d="M440,170 L560,160 L590,220 L580,310 L540,360 L480,370 L430,320 L420,240 Z" />
          <path d="M560,60 L820,50 L860,100 L840,200 L780,220 L720,200 L660,210 L600,190 L560,150 Z" />
          <path d="M720,290 L820,280 L840,320 L820,360 L760,370 L720,340 Z" />
        </g>
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.5">
          <line x1="0" y1="240" x2="960" y2="240" />
          <line x1="480" y1="0" x2="480" y2="480" />
        </g>
        {regions.map((region) => {
          const pin = REGION_PINS[region.id];
          const active = selected === region.id;
          if (!pin) return null;
          return (
            <g
              key={region.id}
              onClick={() => onSelect(region.id)}
              className="cursor-pointer"
            >
              {!region.stale && (
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r={active ? 24 : 18}
                  fill="none"
                  stroke="rgba(45,225,155,0.35)"
                />
              )}
              <circle
                cx={pin.cx}
                cy={pin.cy}
                r={active ? 9 : 7}
                fill={region.stale ? "rgba(255,255,255,0.22)" : "#2DE19B"}
                opacity={region.stale ? 0.5 : 1}
              />
              <text
                x={pin.cx}
                y={pin.cy + (labelOffsets[region.id] ?? -18)}
                textAnchor="middle"
                style={{
                  fill: "rgba(255,255,255,0.52)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {region.name}
              </text>
              {!region.stale && (
                <text
                  x={pin.cx}
                  y={pin.cy + 22}
                  textAnchor="middle"
                  style={{ fill: "#2DE19B", fontSize: 12, fontWeight: 700 }}
                >
                  {region.score}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function RegionsPage() {
  const { snapshot, loading } = useSonarSnapshot();
  const [selected, setSelected] = useState<string | null>("asia");

  if (!snapshot) {
    return (
      <PageFrame wide>
        <PageIntro
          eyebrow="Coverage / Devnet"
          title="Regional breakdown"
          description="Geographic visibility matters. Each region contributes an independent view of validator reachability and slot propagation."
          aside={
            <StatusPill>
              {loading ? "Fetching on-chain" : "Unavailable"}
            </StatusPill>
          }
        />
        <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <Panel>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="mt-5 aspect-[2/1] w-full rounded-[14px]" />
          </Panel>
          <Panel accent>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-5 h-8 w-48" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-4/5" />
            <div className="mt-[1.45rem] grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-30 rounded-[16px]" />
              ))}
            </div>
          </Panel>
        </section>
      </PageFrame>
    );
  }

  const { regions } = snapshot;
  const activeRegions = regions.filter((region) => !region.stale);
  const current =
    regions.find((region) => region.id === selected) ??
    activeRegions[0] ??
    regions[0];
  const currentOtherClients = current.otherCount + current.solanaLabsCount;
  const currentClientTotal =
    current.agaveCount +
    current.firedancerCount +
    current.jitoCount +
    currentOtherClients;

  return (
    <PageFrame wide>
      <PageIntro
        eyebrow="Coverage / Devnet"
        title="Regional breakdown"
        description="Geographic visibility matters. Each region contributes an independent view of validator reachability and slot propagation."
        aside={
          <StatusPill active>{activeRegions.length} active regions</StatusPill>
        }
      />

      <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch">
        <CoverageMap
          selected={selected}
          onSelect={setSelected}
          regions={regions}
        />

        <Panel accent className="grid content-start">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Selected region
              </div>
              <h2 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                {current.name}
              </h2>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                {current.stale
                  ? "This bucket is currently excluded from the global score."
                  : `${current.observers} active observers continue to publish attestations for this zone.`}
              </p>
            </div>
            {current.stale ? (
              <StatusPill>Excluded</StatusPill>
            ) : (
              <StatusPill active>Included</StatusPill>
            )}
          </div>

          <div className="mt-[1.45rem] grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
            <MetricCard
              label="Health"
              value={current.stale ? "—" : current.score}
              accent
            />
            <MetricCard
              label="Reachability"
              value={current.stale ? "—" : `${current.reachability}%`}
            />
            <MetricCard
              label="Stake reach"
              value={current.stale ? "—" : `${current.reachableStakePct}%`}
            />
            <MetricCard
              label="Avg RTT"
              value={current.stale ? "—" : `${current.rtt}ms`}
            />
            <MetricCard
              label="Slot latency"
              value={
                current.stale ? (
                  "—"
                ) : current.latency === 0 ? (
                  <span className="text-[#2de19b]">Synced</span>
                ) : (
                  `${current.latency}ms`
                )
              }
            />
            <MetricCard
              label="Client mix"
              value={current.stale ? "—" : currentClientTotal.toLocaleString()}
              hint={`Agave ${current.agaveCount} / FD ${current.firedancerCount} / Jito ${current.jitoCount}`}
            />
          </div>
        </Panel>
      </section>

      {/* region cards grid */}
      {/* <section className="grid gap-4">
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              All scoring buckets at a glance
            </span>
          }
        >
          Region cards
        </SectionTitle>
        <div className="grid gap-[0.9rem] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {regions.map((region) => (
            <RegionCard
              key={region.id}
              name={region.name}
              score={region.score}
              reachability={region.reachability}
              latency={region.latency}
              stale={region.stale}
              selected={selected === region.id}
              onClick={() => setSelected(region.id)}
            />
          ))}
        </div>
      </section> */}
    </PageFrame>
  );
}
