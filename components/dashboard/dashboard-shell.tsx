"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AreaChart,
  ChevronRight,
  Globe2,
  RadioTower,
  Server,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bars,
  KeyValueList,
  MetricCard,
  Panel,
  SectionTitle,
  Skeleton,
  StatusPill,
} from "@/components/sonar-ui";
import { RegionCard } from "@/components/dashboard/region-card";
import { REGION_PINS, REGIONS, type ObserverView, type RegionScoreView } from "@/lib/sonar-static";
import { useSonarSnapshot } from "@/hooks/use-sonar-snapshot";
import { cn } from "@/lib/utils";
import { formatRelativeAge } from "@/lib/time-format";

type DashboardTab = "network" | "observers" | "regions";
type StatusFilter = "all" | "active" | "inactive";
type SortKey = "score" | "rtt" | "slot";

const TABS = [
  {
    id: "network",
    label: "Network",
    description: "Health, metrics, oracle state",
    icon: Activity,
  },
  {
    id: "observers",
    label: "Observers",
    description: "Registry, filters, observer detail",
    icon: RadioTower,
  },
  {
    id: "regions",
    label: "Regions",
    description: "Coverage map and regional scores",
    icon: Globe2,
  },
] as const;

const EMPTY_OBSERVERS: ObserverView[] = [];

function slotLatencyValue(value: number) {
  return value === 0 ? <span className="text-[#2de19b]">Synced</span> : `${value}ms`;
}

function ClientCounts({ observer }: { observer: ObserverView }) {
  const clients = [
    { label: "AG", count: observer.agaveCount ?? 0, color: "#2de19b" },
    { label: "FD", count: observer.firedancerCount ?? 0, color: "#60a5fa" },
    { label: "JI", count: observer.jitoCount ?? 0, color: "#f59e0b" },
  ].filter((client) => client.count > 0);

  if (clients.length === 0) return <span>-</span>;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {clients.map((client) => (
        <span key={client.label} className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: client.color }} />
          <span>{client.label} {client.count}</span>
        </span>
      ))}
    </div>
  );
}

function getTab(value: string | null): DashboardTab {
  return value === "observers" || value === "regions" ? value : "network";
}

function shortKey(value: string) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function formatTime(timestamp?: number) {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DashboardSidebar({
  activeTab,
  activeCount,
  activeRegions,
  paused,
}: {
  activeTab: DashboardTab;
  activeCount: number;
  activeRegions: number;
  paused: boolean;
}) {
  return (
    <aside className="min-[760px]:sticky min-[760px]:top-[6.6rem] min-[760px]:h-[calc(100vh-7.8rem)]">
      <div className="flex h-full flex-col gap-4 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(4,14,10,0.92),rgba(0,0,0,0.95))] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
        <div className="px-3 py-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(45,225,155,0.24)] bg-[rgba(45,225,155,0.08)] text-[#2de19b]">
            <Server className="h-4 w-4" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-[1rem] font-semibold uppercase tracking-[-0.04em]">
            Control surface
          </h1>
          <p className="mt-2 max-w-54 text-[0.72rem] leading-[1.6] text-[rgba(245,255,249,0.5)]">
            Minimal command view for the s0nar health oracle.
          </p>
        </div>

        <nav aria-label="Dashboard" className="grid gap-1">
          {TABS.map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={`/dashboard?tab=${item.id}`}
                className={cn(
                  "group grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
                  active
                    ? "border-[rgba(45,225,155,0.24)] bg-[rgba(45,225,155,0.08)] text-white"
                    : "border-transparent text-[rgba(245,255,249,0.52)] hover:border-[rgba(255,255,255,0.08)] hover:bg-white/[0.035] hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-[12px] border",
                    active
                      ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.9)] text-[#2de19b]"
                      : "border-[rgba(255,255,255,0.08)] bg-black/25 text-[rgba(245,255,249,0.42)]",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                    {item.label}
                  </span>
                  <span className="mt-1 block truncate text-[0.64rem] leading-[1.45] text-[rgba(245,255,249,0.4)]">
                    {item.description}
                  </span>
                </span>
                <ChevronRight
                  className={cn("h-4 w-4", active ? "text-[#2de19b]" : "text-[rgba(245,255,249,0.24)]")}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              Registry
            </span>
            {paused ? <StatusPill>Paused</StatusPill> : <StatusPill active>Live</StatusPill>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Observers" value={activeCount} />
            <MiniStat label="Regions" value={activeRegions} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/30 p-3">
      <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        {label}
      </span>
      <strong className="mt-2 block text-[1.15rem] font-semibold leading-none tracking-[-0.05em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
        {value}
      </strong>
    </div>
  );
}

function DashboardHeader({
  tab,
  status,
}: {
  tab: DashboardTab;
  status: React.ReactNode;
}) {
  const title =
    tab === "network"
      ? "Network overview"
      : tab === "observers"
        ? "Observer registry"
        : "Regional breakdown";
  const description =
    tab === "network"
      ? "Current health, latency, and on-chain oracle state in one working view."
      : tab === "observers"
        ? "Filter the active set and inspect any observer without leaving the dashboard."
        : "Compare active regions and drill into coverage, reachability, RTT, and stale buckets.";

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(4,14,10,0.78)] px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.42)]">
          <AreaChart className="h-3.5 w-3.5 text-[#2de19b]" aria-hidden="true" />
          Dashboard / Devnet
        </div>
        <h2 className="mt-4 text-[clamp(1.55rem,4vw,3.35rem)] font-semibold uppercase leading-none tracking-[-0.045em] sm:tracking-[-0.06em]">
          {title}
        </h2>
        <p className="mt-3 max-w-180 text-[0.82rem] leading-[1.7] text-[rgba(245,255,249,0.62)]">
          {description}
        </p>
      </div>
      {status}
    </header>
  );
}

function LoadingDashboard() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-20 max-w-180" />
      <div className="grid gap-4 min-[900px]:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-30 rounded-[16px]" />
        ))}
      </div>
      <Skeleton className="h-[24rem] rounded-[16px]" />
    </div>
  );
}

function NetworkView({
  snapshot,
  loading,
}: {
  snapshot: NonNullable<ReturnType<typeof useSonarSnapshot>["snapshot"]>;
  loading: boolean;
}) {
  const { network, registry, regions, attestationHistory } = snapshot;
  const activeRegions = regions.filter((region) => !region.stale);
  const activeRegionCount = activeRegions.length;
  const hasActiveRegions = activeRegionCount > 0;
  const regionsForFallback = hasActiveRegions ? activeRegions : regions;
  const avgStakeReach = Math.round(
    regionsForFallback.reduce((sum, region) => sum + region.reachableStakePct, 0) /
      Math.max(regionsForFallback.length, 1),
  );
  const totalClients =
    network.agaveCount + network.firedancerCount + network.jitoCount + network.solanaLabsCount + network.otherCount;
  const agavePct = totalClients > 0 ? Math.round((network.agaveCount / totalClients) * 100) : 0;
  const metrics = [
    { label: "Reachability", value: `${network.reachability}%`, hint: "Median active observers" },
    { label: "Avg RTT", value: `${network.rtt}ms`, hint: "Primary latency signal" },
    { label: "Slot latency", value: slotLatencyValue(network.slotLatency), hint: "Slot propagation" },
    { label: "Quorum", value: `${network.activeObservers} / ${network.totalObservers}`, hint: "Active observers" },
    { label: "Stake Reach", value: `${avgStakeReach}%`, hint: "% of cluster stake reachable" },
    { label: "Validators Probed", value: network.totalValidatorsProbed.toLocaleString(), hint: "TPU endpoints sampled" },
    { label: "Agave Share", value: `${agavePct}%`, hint: "Validators running Agave client" },
  ] as const;

  return (
    <div className="grid min-w-0 gap-6">
      <Panel accent className="max-w-full p-[1.6rem]">
        <div className="grid min-w-0 gap-8 min-[901px]:grid-cols-[minmax(13rem,0.62fr)_minmax(0,1fr)] min-[901px]:items-stretch">
          <div className="flex min-w-0 flex-col justify-start gap-5">
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

          <div className="grid min-w-0 content-between gap-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h3 className="text-[clamp(1.55rem,2.8vw,2.4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.08em]">
                  Global health
                </h3>
                <p className="mt-[0.95rem] max-w-150 break-words text-[0.82rem] leading-[1.65] text-[rgba(245,255,249,0.62)]">
                  Active regions are inside the healthy band, with stale buckets excluded from aggregation.
                </p>
              </div>
              <StatusPill active={hasActiveRegions}>{activeRegionCount} active regions</StatusPill>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map(({ label, value, hint }) => (
                <MetricCard key={label} label={label} value={value} hint={hint} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <section>
        <Panel>
          <SectionTitle>Oracle state</SectionTitle>
          <KeyValueList
            items={[
              { label: "Attestations", value: network.totalAttestations.toLocaleString() },
              { label: "Current slot", value: network.lastUpdatedSlot.toLocaleString() },
              { label: "Observer cap", value: registry.observerCap.toLocaleString() },
              { label: "Min stake", value: `${registry.minStakeSol} SOL` },
              { label: "Regions", value: `${activeRegionCount} / ${regions.length}` },
            ]}
          />
        </Panel>
      </section>

      <section>
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {loading && attestationHistory.length === 0 ? "Loading events" : `${attestationHistory.length} latest events`}
            </span>
          }
        >
          Attestation history
        </SectionTitle>
        <AttestationTable events={attestationHistory} loading={loading} />
      </section>
    </div>
  );
}

function AttestationTable({
  events,
  loading = false,
}: {
  events: NonNullable<ReturnType<typeof useSonarSnapshot>["snapshot"]>["attestationHistory"];
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-auto rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))]">
      <table className="min-w-[44rem] w-full border-collapse">
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
          {events.map((item) => (
            <tr key={item.signature} className="hover:bg-black/80">
              <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                {item.slot.toLocaleString()}
              </td>
              <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-white">
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
                {slotLatencyValue(item.slotLatency)}
              </td>
              <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                {formatTime(item.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && events.length === 0 ? (
        <div className="grid gap-2 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 rounded-[10px]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-4 text-[0.72rem] text-[rgba(245,255,249,0.62)]">No recent attestation events found.</div>
      ) : null}
    </div>
  );
}

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
                ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.86)] text-white"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(3,12,9,0.8)] text-[rgba(245,255,249,0.36)] hover:border-[rgba(45,225,155,0.24)] hover:text-white",
            )}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ObserversView({
  snapshot,
  selectedPubkey,
}: {
  snapshot: NonNullable<ReturnType<typeof useSonarSnapshot>["snapshot"]>;
  selectedPubkey: string | null;
}) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("score");
  const observers = snapshot.observers ?? EMPTY_OBSERVERS;
  const selectedObserver = selectedPubkey
    ? observers.find((observer) => observer.pubkey === selectedPubkey)
    : null;

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

  const activeCount = observers.filter((observer) => observer.active).length;
  const inactiveCount = observers.length - activeCount;
  const avgScore =
    Math.round(
      observers
        .filter((observer) => observer.active)
        .reduce((sum, observer) => sum + observer.score, 0) / activeCount,
    ) || 0;

  if (selectedObserver) {
    return <ObserverDetailView observer={selectedObserver} />;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch">
        <Panel accent>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Registry health
              </div>
              <h3 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                Observer fleet
              </h3>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                Filter the active set by region and status, then pivot the table by score, RTT, or freshness.
              </p>
            </div>
            <StatusPill active>{activeCount} active</StatusPill>
          </div>

          <div className="mt-[1.45rem] grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
            <MetricCard label="Visible observers" value={rows.length} hint="Current filtered view" accent />
            <MetricCard label="Active set" value={activeCount} hint={`${inactiveCount} inactive`} />
            <MetricCard label="Median score" value={avgScore} hint="Across active observers" />
          </div>
        </Panel>

        <Panel className="grid content-start gap-[1.15rem]">
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
            renderLabel={(value) => `sort ${value}`}
          />
        </Panel>
      </section>

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
          <table className="min-w-[72rem] w-full border-collapse">
            <thead>
              <tr>
                {["Observer", "Region", "Status", "Stake", "Last slot", "Reach", "Stake Reach", "Clients seen", "RTT", "Score"].map((heading) => (
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
              {rows.map((observer) => (
                <tr key={observer.pubkey} className="hover:bg-black/80">
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] align-middle">
                    <Link
                      href={`/dashboard?tab=observers&pubkey=${encodeURIComponent(observer.pubkey)}`}
                      className="font-mono text-[0.72rem] text-white [font-variant-numeric:tabular-nums] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
                    >
                      {observer.pubkey}
                    </Link>
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {observer.region}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem]">
                    {observer.active ? <StatusPill active>Active</StatusPill> : <StatusPill>Inactive</StatusPill>}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-white">
                    {observer.stake} SOL
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {observer.slot.toLocaleString()}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {observer.active ? `${observer.reach}%` : "-"}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {observer.reachableStakePct === undefined ? "-" : `${observer.reachableStakePct}%`}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    <ClientCounts observer={observer} />
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {observer.active ? `${observer.rtt.toFixed(1)}ms` : "-"}
                  </td>
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[#2de19b]">
                    {observer.active ? observer.score : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ObserverDetailView({ observer }: { observer: ObserverView }) {
  const avgRtt = observer.rtt;
  const p95Rtt = observer.p95Rtt ?? Math.round((avgRtt * 1.25 + Number.EPSILON) * 10) / 10;
  const slotLatency = observer.slotLatency ?? Math.round(avgRtt * 12);
  const registeredSlot = observer.registeredAt ?? Math.max(0, observer.slot - 2_442_100);
  const registeredValue = observer.registeredAt
    ? new Date(observer.registeredAt * 1000).toLocaleString()
    : registeredSlot.toLocaleString();
  const recentAttestations = observer.recentAttestations ?? [];
  const history = recentAttestations.map((item) => item.score).reverse();

  return (
    <div className="grid gap-6">
      <Link
        href="/dashboard?tab=observers"
        className="inline-flex w-fit text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
      >
        Back to registry
      </Link>

      <section className="grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Panel accent>
          <div className="grid gap-5 min-[700px]:grid-cols-[minmax(0,1fr)_auto] min-[700px]:items-start">
            <div className="min-w-0">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Latest attestation
              </div>
              <h3 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                Observer profile
              </h3>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                Latest observer state, recent attestations, and score trend.
              </p>
            </div>
            <div className="text-right text-[clamp(3rem,7vw,5rem)] font-semibold leading-none tracking-[-0.1em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
              {observer.score}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-black/40 p-4 font-mono text-[0.76rem] text-[rgba(245,255,249,0.78)]">
            {observer.pubkey}
          </div>

          <div className="mt-[1.45rem] grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
            <MetricCard label="Reachability" value={`${observer.reach}/100`} hint="TPU probes that succeeded" />
            <MetricCard label="Avg RTT" value={`${avgRtt}ms`} hint="Median response latency" />
            <MetricCard label="Slot latency" value={slotLatencyValue(slotLatency)} hint="Below stale threshold" />
            <MetricCard label="P95 RTT" value={`${p95Rtt}ms`} hint={`Slot ${observer.slot.toLocaleString()}`} />
          </div>
        </Panel>

        <div className="grid content-start gap-4">
          <Panel>
            <SectionTitle>Identity</SectionTitle>
            <KeyValueList
              items={[
                { label: "Region", value: observer.region },
                { label: "PDA seeds", value: '[b"observer", pubkey]' },
                { label: observer.registeredAt ? "Registered at" : "Registered slot", value: registeredValue },
                { label: "Last slot", value: observer.slot.toLocaleString() },
              ]}
            />
          </Panel>

          <Panel accent>
            <SectionTitle>Stake</SectionTitle>
            <div className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-semibold uppercase leading-none tracking-[-0.08em] text-[#2de19b]">
              {observer.stake}
              <span className="ml-2 text-[0.75rem] tracking-[0.18em] text-[rgba(245,255,249,0.42)]">SOL</span>
            </div>
          </Panel>
        </div>
      </section>

      <Panel>
        <SectionTitle>Score history</SectionTitle>
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
          Last 20 observation windows
        </div>
        <div className="mt-5">
          <Bars values={history} accentIndex={history.length - 1} />
        </div>
      </Panel>

      <section>
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {recentAttestations.length} latest events
            </span>
          }
        >
          Attestation history
        </SectionTitle>
        <AttestationTable events={recentAttestations} />
      </section>
    </div>
  );
}

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
            Click a region pin
          </span>
        }
      >
        Observer coverage map
      </SectionTitle>
      <svg viewBox="0 0 960 480" className="w-full">
        <g fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8">
          <path d="M120,80 L240,70 L270,100 L280,160 L260,200 L240,240 L200,260 L160,240 L140,200 L100,180 L90,130 Z" />
          <path d="M210,260 L280,250 L300,300 L290,370 L250,400 L210,380 L190,320 Z" />
          <path d="M430,80 L530,70 L560,100 L550,150 L500,160 L460,150 L430,130 Z" />
          <path d="M440,170 L560,160 L590,220 L580,310 L540,360 L480,370 L430,320 L420,240 Z" />
          <path d="M560,60 L820,50 L860,100 L840,200 L780,220 L720,200 L660,210 L600,190 L560,150 Z" />
          <path d="M720,290 L820,280 L840,320 L820,360 L760,370 L720,340 Z" />
        </g>
        {regions.map((region) => {
          const pin = REGION_PINS[region.id];
          const active = selected === region.id;
          const hasReport =
            region.lastUpdatedSlot > 0 ||
            region.score > 0 ||
            region.reachability > 0 ||
            region.agaveCount + region.firedancerCount + region.jitoCount + region.solanaLabsCount + region.otherCount > 0;
          if (!pin) return null;

          return (
            <g key={region.id} onClick={() => onSelect(region.id)} className="cursor-pointer">
              {!region.stale ? (
                <circle cx={pin.cx} cy={pin.cy} r={active ? 24 : 18} fill="none" stroke="rgba(45,225,155,0.35)" />
              ) : null}
              <circle
                cx={pin.cx}
                cy={pin.cy}
                r={active ? 9 : 7}
                fill={!hasReport ? "#050505" : region.stale ? "rgba(255,255,255,0.22)" : "#2DE19B"}
                opacity={region.stale ? 0.65 : 1}
              />
              <text x={pin.cx} y={pin.cy + (labelOffsets[region.id] ?? -18)} textAnchor="middle" style={{ fill: "rgba(255,255,255,0.52)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {region.name}
              </text>
              {!region.stale ? (
                <text x={pin.cx} y={pin.cy + 22} textAnchor="middle" style={{ fill: "#2DE19B", fontSize: 12, fontWeight: 700 }}>
                  {region.score}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RegionsView({ snapshot }: { snapshot: NonNullable<ReturnType<typeof useSonarSnapshot>["snapshot"]> }) {
  const [selected, setSelected] = useState<string | null>("asia");
  const { regions } = snapshot;
  const activeRegions = regions.filter((region) => !region.stale);
  const hasActiveRegions = activeRegions.length > 0;
  const latestRegion =
    [...regions]
      .filter((region) => region.lastAttestation || region.lastUpdatedSlot > 0)
      .sort(
        (a, b) =>
          (b.lastAttestation?.timestamp ?? 0) -
            (a.lastAttestation?.timestamp ?? 0) ||
          b.lastUpdatedSlot - a.lastUpdatedSlot,
      )[0] ?? activeRegions[0] ?? regions[0];
  const current = regions.find((region) => region.id === selected) ?? activeRegions[0] ?? regions[0];
  const currentOtherClients = current.otherCount + current.solanaLabsCount;
  const currentClientTotal = current.agaveCount + current.firedancerCount + current.jitoCount + currentOtherClients;
  const currentHasReport =
    current.lastUpdatedSlot > 0 ||
    current.score > 0 ||
    current.reachability > 0 ||
    currentClientTotal > 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch">
        <CoverageMap selected={selected} onSelect={setSelected} regions={regions} />

        <Panel accent className="grid content-start">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Selected region
              </div>
              <h3 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                {current.name}
              </h3>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                {!currentHasReport
                  ? "This region has not even started reporting yet."
                  : current.stale
                  ? "Showing the last known report while this bucket is excluded from the global score."
                  : `${current.observers} active observers continue to publish attestations for this zone.`}
              </p>
              {current.lastUpdatedSeconds !== undefined ? (
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  Last updated {formatRelativeAge(current.lastUpdatedSeconds)}
                </p>
              ) : null}
            </div>
            {!currentHasReport ? (
              <StatusPill tone="neutral">Not even started</StatusPill>
            ) : current.stale ? (
              <StatusPill>Excluded</StatusPill>
            ) : (
              <StatusPill active={hasActiveRegions}>Included</StatusPill>
            )}
          </div>

          {currentHasReport ? (
            <div className="mt-[1.45rem] grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
              <MetricCard label="Health" value={current.score} accent />
              <MetricCard label="Reachability" value={`${current.reachability}%`} />
              <MetricCard label="Stake reach" value={`${current.reachableStakePct}%`} />
              <MetricCard label="Avg RTT" value={current.rtt > 0 ? `${current.rtt}ms` : "-"} />
              <MetricCard label="Slot latency" value={slotLatencyValue(current.latency)} />
              <MetricCard
                label="Client mix"
                value={currentClientTotal.toLocaleString()}
                hint={`Agave ${current.agaveCount} / FD ${current.firedancerCount} / Jito ${current.jitoCount}`}
              />
            </div>
          ) : (
            <div className="mt-[1.45rem] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-black/40 p-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.46)]">
              No attestation data exists for this region yet.
            </div>
          )}
        </Panel>
      </section>

      {latestRegion ? (
        <section className="grid gap-4 min-[901px]:grid-cols-[minmax(16rem,0.48fr)_minmax(0,1fr)]">
          <RegionCard
            name={latestRegion.name}
            score={latestRegion.score}
            reachability={latestRegion.reachability}
            latency={latestRegion.latency}
            stale={latestRegion.stale}
            reachableStakePct={latestRegion.reachableStakePct}
            agaveCount={latestRegion.agaveCount}
            firedancerCount={latestRegion.firedancerCount}
            jitoCount={latestRegion.jitoCount}
            otherCount={latestRegion.otherCount + latestRegion.solanaLabsCount}
            selected
            onClick={() => setSelected(latestRegion.id)}
          />
          <Panel>
            <SectionTitle>Last attested region</SectionTitle>
            <KeyValueList
              items={[
                { label: "Region", value: latestRegion.name },
                {
                  label: "Freshness",
                  value:
                    latestRegion.lastUpdatedSeconds === undefined
                      ? "Last known"
                      : formatRelativeAge(latestRegion.lastUpdatedSeconds),
                },
                { label: "Last slot", value: latestRegion.lastUpdatedSlot.toLocaleString() },
                {
                  label: "Observer",
                  value:
                    latestRegion.lastAttestation?.observer
                      .slice(0, 4)
                      .concat("...", latestRegion.lastAttestation.observer.slice(-4)) ?? "-",
                },
              ]}
            />
          </Panel>
        </section>
      ) : null}
    </div>
  );
}

export function DashboardShell() {
  const searchParams = useSearchParams();
  const activeTab = getTab(searchParams.get("tab"));
  const selectedPubkey = searchParams.get("pubkey");
  const { snapshot, loading } = useSonarSnapshot();
  const [now, setNow] = useState(0);
  const activeObserverCount = snapshot?.observers.filter((observer) => observer.active).length ?? 0;
  const activeRegionCount = snapshot?.regions.filter((region) => !region.stale).length ?? 0;
  const updatedSeconds =
    (snapshot?.network.updatedSeconds ?? 0) +
    (snapshot && now > snapshot.fetchedAt
      ? Math.floor((now - snapshot.fetchedAt) / 1000)
      : 0);

  useEffect(() => {
    const freshness = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(freshness);
  }, []);

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-[1.1rem] pb-[4.8rem] pt-[7.4rem] min-[760px]:grid-cols-[17rem_minmax(0,1fr)] max-md:pt-[6.2rem]">
      <DashboardSidebar
        activeTab={activeTab}
        activeCount={activeObserverCount}
        activeRegions={activeRegionCount}
        paused={snapshot?.registry.paused ?? false}
      />

      <section className="min-w-0 max-w-full max-[759px]:order-first">
        <DashboardHeader
          tab={activeTab}
          status={
            snapshot ? (
              <StatusPill active={activeRegionCount > 0}>
                Updated {formatRelativeAge(updatedSeconds)}
              </StatusPill>
            ) : (
              <StatusPill>{loading ? "Fetching on-chain" : "Unavailable"}</StatusPill>
            )
          }
        />

        {!snapshot ? (
          <LoadingDashboard />
        ) : activeTab === "network" ? (
          <NetworkView snapshot={snapshot} loading={loading} />
        ) : activeTab === "observers" ? (
          <ObserversView snapshot={snapshot} selectedPubkey={selectedPubkey} />
        ) : (
          <RegionsView snapshot={snapshot} />
        )}
      </section>
    </main>
  );
}
