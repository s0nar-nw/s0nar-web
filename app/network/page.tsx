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
import { useSonarSnapshot } from "@/hooks/use-sonar-snapshot";

function shortKey(value: string) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function formatTime(timestamp?: number) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

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
          aside={<StatusPill>{loading ? "Fetching on-chain" : "Unavailable"}</StatusPill>}
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
                    <Skeleton key={index} className="h-[5.2rem] rounded-[12px]" />
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

  const { network, registry, regions, history, attestationHistory } = snapshot;
  const updatedSeconds =
    networkUpdatedSeconds + (now > snapshotFetchedAt ? Math.floor((now - snapshotFetchedAt) / 1000) : 0);
  const activeRegionCount = network.activeRegions;
  const networkMetrics = [
    { label: "Reachability", value: `${network.reachability}%`, hint: "Median active observers" },
    { label: "Slot latency", value: `${network.slotLatency}ms`, hint: "400ms stale ceiling" },
    { label: "Quorum", value: `${network.activeObservers} / ${network.totalObservers}`, hint: "Active observers" },
  ] as const;

  return (
    <PageFrame wide>
      <PageIntro
        eyebrow="Oracle / Devnet"
        title="Network overview"
        description="One surface for current health, regional divergence, and the on-chain state every downstream consumer reads."
        aside={<StatusPill active>Updated {updatedSeconds}s ago</StatusPill>}
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
                    Active regions are inside the healthy band, with stale buckets excluded from aggregation.
                  </p>
                </div>
                <StatusPill active>{activeRegionCount} active regions</StatusPill>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5">
                {networkMetrics.map(({ label, value, hint }) => (
                  <div key={label} className="min-h-[5.2rem] rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-4">
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
            activeRegions={activeRegionCount}
            totalRegions={regions.length}
            observerCap={registry.observerCap}
            minStakeSol={registry.minStakeSol}
            paused={registry.paused}
          />
        </div>
      </section>

      <section className="mt-[3.2rem]">
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {attestationHistory.length} latest events
            </span>
          }
        >
          Attestation history
        </SectionTitle>
        <div className="relative overflow-auto rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Slot", "Observer", "Region", "Score", "Reach", "Latency", "Time"].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-left align-middle text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[rgba(245,255,249,0.36)]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attestationHistory.map((item) => (
                <tr key={item.signature} className="hover:bg-black/80">
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {item.slot.toLocaleString()}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,1)]">
                    {shortKey(item.observer)}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {item.region}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[#2de19b]">
                    {item.score}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {item.reachability}%
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {item.slotLatency}ms
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {formatTime(item.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attestationHistory.length === 0 ? (
            <div className="p-4 text-[0.72rem] text-[rgba(245,255,249,0.62)]">No recent attestation events found.</div>
          ) : null}
        </div>
      </section>
    </PageFrame>
  );
}
