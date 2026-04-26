"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PageFrame,
  PageIntro,
  SectionTitle,
  Skeleton,
  StatusPill,
  Panel,
} from "@/components/sonar-ui";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { REGIONS, type ObserverView } from "@/lib/sonar-static";
import { useSonarSnapshot } from "@/lib/use-sonar-snapshot";

type StatusFilter = "all" | "active" | "inactive";
type SortKey = "score" | "rtt" | "slot";
const EMPTY_OBSERVERS: ObserverView[] = [];

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel?: (v: T) => string;
}) {
  return (
    <div className="grid gap-[0.65rem]">
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-[0.55rem]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "min-h-[2.2rem] rounded-[12px] border px-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
              value === option
                ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.86)] text-[rgba(245,255,249,1)]"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(3,12,9,0.8)] text-[rgba(245,255,249,0.36)] hover:border-[rgba(45,225,155,0.24)] hover:text-[rgba(245,255,249,1)]",
            )}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ObserversPage() {
  const { snapshot, loading } = useSonarSnapshot();
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("score");
  const observers = snapshot?.observers ?? EMPTY_OBSERVERS;

  const rows = useMemo(() => {
    return [...observers]
      .filter((observer) => region === "All" || observer.region === region)
      .filter((observer) =>
        status === "all" ? true : status === "active" ? observer.active : !observer.active,
      )
      .sort((a, b) => {
        if (sort === "score") return b.score - a.score;
        if (sort === "rtt") return a.rtt - b.rtt;
        return b.slot - a.slot;
      });
  }, [observers, region, sort, status]);

  if (!snapshot) {
    return (
      <PageFrame wide>
        <PageIntro
          eyebrow="Registry / Devnet"
          title="Observer registry"
          description="Every active observer is visible, stake-backed, and traceable to a region-level view of network health."
          aside={<StatusPill>{loading ? "Fetching on-chain" : "Unavailable"}</StatusPill>}
        />
        <Panel accent className="mb-[3.2rem]">
          <div className="grid gap-6 min-[901px]:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-64" />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-[12px]" />
                ))}
              </div>
            </div>
            <Skeleton className="h-48 rounded-[12px]" />
          </div>
        </Panel>
        <Panel>
          <Skeleton className="h-4 w-32" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-[8px]" />
            ))}
          </div>
        </Panel>
      </PageFrame>
    );
  }

  const activeCount = observers.filter((observer) => observer.active).length;
  const inactiveCount = observers.length - activeCount;
  const avgScore =
    Math.round(
      observers.filter((observer) => observer.active).reduce(
        (sum, observer) => sum + observer.score,
        0,
      ) / activeCount,
    ) || 0;

  return (
    <PageFrame wide>
      <PageIntro
        eyebrow="Registry / Devnet"
        title="Observer registry"
        description="Every active observer is visible, stake-backed, and traceable to a region-level view of network health."
        aside={<StatusPill active>{activeCount} active</StatusPill>}
      />

      <DashboardHero
        eyebrow="Registry health"
        title="Observer fleet"
        description="Filter the active set by region and status, then pivot the table by score, RTT, or freshness."
        statusLabel="Live registry"
        metrics={[
          { label: "Visible observers", value: rows.length, hint: "Current filtered view", accent: true },
          { label: "Active set", value: activeCount, hint: `${inactiveCount} inactive` },
          { label: "Median score", value: avgScore, hint: "Across active observers" },
        ]}
        sidebar={
          <div className="grid gap-[1.15rem]">
            <SectionTitle>Filters</SectionTitle>
            <FilterChips label="Region" options={REGIONS} value={region} onChange={setRegion} />
            <FilterChips
              label="Status"
              options={["all", "active", "inactive"] as const}
              value={status}
              onChange={setStatus}
            />
            <FilterChips
              label="Sort"
              options={["score", "rtt", "slot"] as const}
              value={sort}
              onChange={setSort}
              renderLabel={(v) => `sort ${v}`}
            />
          </div>
        }
      />

      <section className="grid gap-4">
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {rows.length} observers in this slice
            </span>
          }
        >
          Registry table
        </SectionTitle>

        <div className="relative overflow-auto rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Observer", "Region", "Status", "Stake", "Last slot", "Reach", "RTT", "Score"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-left align-middle text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[rgba(245,255,249,0.36)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((observer) => (
                <tr key={observer.pubkey} className="hover:bg-black/80">
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle">
                    <Link
                      href={`/observers/${observer.pubkey}`}
                      className="font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
                    >
                      {observer.pubkey}
                    </Link>
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-[0.72rem] leading-[1.45] align-middle text-[rgba(245,255,249,0.62)]">
                    {observer.region}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle">
                    {observer.active ? <StatusPill active>Active</StatusPill> : <StatusPill>Inactive</StatusPill>}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,1)]">
                    {observer.stake} SOL
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,0.62)]">
                    {observer.slot.toLocaleString()}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,0.62)]">
                    {observer.active ? `${observer.reach}%` : "—"}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,0.62)]">
                    {observer.active ? `${observer.rtt.toFixed(1)}ms` : "—"}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle font-mono text-[0.72rem] [font-variant-numeric:tabular-nums] text-[#2de19b]">
                    {observer.active ? observer.score : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageFrame>
  );
}
