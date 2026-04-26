"use client";

import { useEffect, useState } from "react";
import {
  PageFrame,
  PageIntro,
  Panel,
  SectionTitle,
  Skeleton,
  StatusPill,
} from "@/components/sonar-ui";
import { ScoreMomentumPanel } from "@/components/dashboard/score-momentum-panel";
import { NetworkSidebar } from "@/components/dashboard/network-sidebar";
import { useSonarSnapshot } from "@/lib/sonar-client";

export default function NetworkPage() {
  const { snapshot, loading } = useSonarSnapshot();
  const [now, setNow] = useState(0);
  const snapshotFetchedAt = snapshot?.fetchedAt ?? 0;
  const networkUpdatedSeconds = snapshot?.network.updatedSeconds ?? 0;

  useEffect(() => {
    const freshness = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(freshness);
    };
  }, []);

  if (!snapshot) {
    return (
      <PageFrame wide>
        <PageIntro
          eyebrow="Oracle / Devnet"
          title="Network overview"
          description="One surface for current health, regional divergence, and the on-chain state every downstream consumer reads."
          aside={
            <StatusPill>
              {loading ? "Fetching on-chain" : "Unavailable"}
            </StatusPill>
          }
        />
        <section className="mb-12">
          <Panel accent className="p-[1.6rem]">
            <div className="grid gap-8 min-[901px]:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1fr)]">
              <div className="grid gap-8">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-28 w-44" />
              </div>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-[5.2rem] rounded-[12px]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </section>
        <section className="grid gap-6 min-[901px]:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.82fr)]">
          <Panel accent>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-6 h-24 w-full" />
          </Panel>
          <Panel>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-6 h-28 w-full" />
          </Panel>
        </section>
      </PageFrame>
    );
  }

  const { network, registry, regions, history, source } = snapshot;
  const updatedSeconds =
    networkUpdatedSeconds +
    (now > snapshotFetchedAt
      ? Math.floor((now - snapshotFetchedAt) / 1000)
      : 0);
  const activeRegions = regions.filter((region) => !region.stale);
  const networkMetrics = [
    {
      label: "Reachability",
      value: `${network.reachability}%`,
      hint: "Median active observers",
    },
    {
      label: "Slot latency",
      value: `${network.slotLatency}ms`,
      hint: "400ms stale ceiling",
    },
    {
      label: "Quorum",
      value: `${network.activeObservers} / ${network.totalObservers}`,
      hint: "Active observers",
    },
  ] as const;

  return (
    <PageFrame wide>
      <PageIntro
        eyebrow="Oracle / Devnet"
        title="Network overview"
        description="One surface for current health, regional divergence, and the on-chain state every downstream consumer reads."
        aside={
          <StatusPill active={source === "onchain"}>
            {source === "onchain"
              ? `Updated ${updatedSeconds}s ago`
              : "Placeholder fallback"}
          </StatusPill>
        }
      />

      <section className="mb-12">
        <Panel accent className="p-[1.6rem]">
          <div className="grid gap-8 min-[901px]:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1fr)] min-[901px]:items-stretch">
            <div className="flex flex-col justify-between gap-8">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Primary signal
              </div>
              <div className="flex items-end gap-3">
                <span className="text-[clamp(4.8rem,12vw,8rem)] font-semibold leading-[0.82] tracking-[-0.11em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
                  {network.score}
                </span>
                <span className="pb-[0.7rem] text-[1rem] tracking-widest text-[rgba(245,255,249,0.36)]">
                  /100
                </span>
              </div>
            </div>

            <div className="grid content-between gap-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <h2 className="text-[clamp(1.55rem,2.8vw,2.4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.08em]">
                    Global health
                  </h2>
                  <p className="mt-[0.95rem] max-w-150 text-[0.82rem] leading-[1.65] text-[rgba(245,255,249,0.62)]">
                    Active regions are inside the healthy band, with stale
                    buckets excluded from aggregation.
                  </p>
                </div>
                <StatusPill active>
                  {activeRegions.length} active regions
                </StatusPill>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5">
                {networkMetrics.map(({ label, value, hint }) => (
                  <div
                    key={label}
                    className="min-h-[5.2rem] rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-4"
                  >
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                      {label}
                    </span>
                    <strong className="mt-[0.4rem] block text-[1.15rem] font-semibold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
                      {value}
                    </strong>
                    <span className="mt-[0.45rem] block text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[rgba(245,255,249,0.36)]">
                      {hint}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 min-[901px]:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.82fr)]">
        <div className="grid gap-5">
          <ScoreMomentumPanel score={network.score} history={[...history]} />
        </div>

        <div className="grid gap-5 content-start">
          <Panel>
            <SectionTitle>Oracle state</SectionTitle>
            <div className="grid gap-4">
              <div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  Attestations
                </div>
                <div className="mt-2 text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-none tracking-[-0.06em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
                  {network.totalAttestations.toLocaleString()}
                </div>
              </div>
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-4">
                <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  Current slot
                </div>
                <div className="mt-2 font-mono text-[0.95rem] text-[rgba(245,255,249,0.78)]">
                  {network.lastUpdatedSlot.toLocaleString()}
                </div>
              </div>
            </div>
          </Panel>
          <NetworkSidebar
            activeRegions={activeRegions.length}
            totalRegions={regions.length}
            observerCap={registry.observerCap}
            minStakeSol={registry.minStakeSol}
            paused={registry.paused}
          />
        </div>
      </section>
    </PageFrame>
  );
}
