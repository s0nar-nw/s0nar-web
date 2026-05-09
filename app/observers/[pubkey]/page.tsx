"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  KeyValueList,
  MetricCard,
  PageFrame,
  PageIntro,
  Panel,
  SectionTitle,
  Skeleton,
  StatusPill,
} from "@/components/sonar-ui";
import { useSonarSnapshot } from "@/hooks/use-sonar-snapshot";
import { formatRelativeAge } from "@/lib/time-format";
import { ChevronLeft } from "lucide-react";

const MIN_STAKE_SOL = 0.1;

function formatTime(timestamp?: number) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function slotLatencyValue(value: number) {
  return value === 0 ? (
    <span className="text-[#2de19b]">Synced</span>
  ) : (
    `${value}ms`
  );
}

export default function ObserverDetailPage() {
  const { snapshot, loading } = useSonarSnapshot();
  const { pubkey } = useParams<{ pubkey: string }>();
  const displayKey = decodeURIComponent(
    typeof pubkey === "string" ? pubkey : "",
  );
  const observer = snapshot?.observers.find(
    (item) => item.pubkey === displayKey,
  );

  if (!snapshot || (!observer && loading)) {
    return (
      <PageFrame wide>
        <Link
          href="/observers"
          className="flex items-centermb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
        >
          <ChevronLeft className="w-4 h-4 mr-3" /> Back to registry
        </Link>
        <PageIntro
          eyebrow="Observer detail"
          title="Observer profile"
          description="Latest observer state, recent attestations, and the score trend for this observer."
          aside={
            <StatusPill>
              {loading ? "Fetching on-chain" : "Unavailable"}
            </StatusPill>
          }
        />
        <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <Panel accent>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-5 h-8 w-56" />
            <Skeleton className="mt-6 h-14 w-full rounded-[12px]" />
            <div className="mt-[1.45rem] grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-30 rounded-[16px]" />
              ))}
            </div>
          </Panel>
          <div className="grid content-start gap-4">
            <Panel>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-5 h-36 w-full" />
            </Panel>
            <Panel accent>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-5 h-16 w-36" />
            </Panel>
          </div>
        </section>
      </PageFrame>
    );
  }

  if (!observer) {
    return (
      <PageFrame wide>
        <Link
          href="/observers"
          className="flex items-center mb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
        >
          <ChevronLeft className="w-4 h-4 mr-3" /> Back to registry
        </Link>
        <Panel>
          <SectionTitle>Observer not found</SectionTitle>
          <p className="font-mono text-[0.78rem] leading-7 text-[rgba(245,255,249,0.62)]">
            {displayKey || "Unknown observer"}
          </p>
        </Panel>
      </PageFrame>
    );
  }

  const avgRtt = observer.rtt;
  const p95Rtt =
    observer.p95Rtt ?? Math.round((avgRtt * 1.25 + Number.EPSILON) * 10) / 10;
  const slotLatency = observer.slotLatency ?? Math.round(avgRtt * 12);
  const registeredSlot =
    observer.registeredAt ?? Math.max(0, observer.slot - 2_442_100);
  const registeredValue = observer.registeredAt
    ? new Date(observer.registeredAt * 1000).toLocaleString()
    : registeredSlot.toLocaleString();
  const recentAttestations = observer.recentAttestations ?? [];
  const hasLastKnown =
    observer.slot > 0 ||
    observer.score > 0 ||
    observer.reach > 0 ||
    (observer.attestationCount ?? 0) > 0;

  return (
    <PageFrame wide>
      <Link
        href="/observers"
        className="flex items-center mb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
      >
        <ChevronLeft className="w-4 h-4 mr-3" /> Back to registry
      </Link>

      <PageIntro
        eyebrow="Observer detail"
        title="Observer profile"
        description="Latest observer state, recent attestations, and the score trend for this observer."
        aside={
          observer.active ? (
            <StatusPill active>Active</StatusPill>
          ) : hasLastKnown ? (
            <StatusPill>Inactive / last known</StatusPill>
          ) : (
            <StatusPill>Inactive</StatusPill>
          )
        }
      />

      <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch">
        <Panel accent className="h-full">
          <div className="grid gap-5 min-[700px]:grid-cols-[minmax(0,1fr)_auto] min-[700px]:items-start">
            <div className="min-w-0">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Latest attestation
              </div>
              <h2 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                Health
              </h2>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                {observer.active
                  ? "This is the most recent attestation submitted by this observer."
                  : hasLastKnown
                    ? "Showing the last known attestation while this observer is inactive."
                    : "This observer has not submitted an attestation yet."}
              </p>
              {observer.lastUpdatedSeconds !== undefined ? (
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  Last updated {formatRelativeAge(observer.lastUpdatedSeconds)}
                </p>
              ) : null}
            </div>
            <div className="text-right text-[clamp(3rem,7vw,5rem)] font-semibold leading-none tracking-[-0.1em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
              {hasLastKnown ? observer.score : "—"}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-black/40 p-4 font-mono text-[0.76rem] text-[rgba(245,255,249,0.78)]">
            {displayKey}
          </div>

          <div className="mt-[1.45rem] grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
            <MetricCard
              label="Reachability"
              value={`${observer.reach}/100`}
              hint="TPU probes that succeeded"
            />
            <MetricCard
              label="Avg RTT"
              value={`${avgRtt}ms`}
              hint="Median response latency"
            />
            <MetricCard
              label="Slot latency"
              value={slotLatencyValue(slotLatency)}
              hint="Below stale threshold"
            />
            <MetricCard
              label="P95 RTT"
              value={`${p95Rtt}ms`}
              hint={`Slot ${observer.slot.toLocaleString()}`}
            />
          </div>
        </Panel>

        <div className="grid h-full gap-4 min-[901px]:grid-rows-2">
          <Panel className="h-full">
            <SectionTitle>Identity</SectionTitle>
            <KeyValueList
              items={[
                { label: "Region", value: observer.region },
                { label: "PDA seeds", value: '[b"observer", pubkey]' },
                {
                  label: observer.registeredAt
                    ? "Registered at"
                    : "Registered slot",
                  value: registeredValue,
                },
                { label: "Last slot", value: observer.slot.toLocaleString() },
              ]}
            />
          </Panel>

          <Panel accent className="h-full">
            <SectionTitle>Stake</SectionTitle>
            <div className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-semibold uppercase leading-none tracking-[-0.08em] text-[#2de19b]">
              {observer.stake}
              <span className="ml-2 text-[0.75rem] tracking-[0.18em] text-[rgba(245,255,249,0.42)]">
                SOL
              </span>
            </div>
            <div className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              minimum required {MIN_STAKE_SOL} SOL
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[#2de19b] shadow-[0_0_1rem_rgba(45,225,155,0.28)]"
                style={{
                  width: `${Math.min(100, (observer.stake / MIN_STAKE_SOL) * 100)}%`,
                }}
              />
            </div>
          </Panel>
        </div>
      </section>

      <section className="mb-[3.2rem]">
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {loading && recentAttestations.length === 0
                ? "Loading events"
                : `${recentAttestations.length} latest events`}
            </span>
          }
        >
          Attestation history
        </SectionTitle>
        <div className="relative overflow-auto rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))]">
          <table className="min-w-[36rem] w-full border-collapse">
            <thead>
              <tr>
                {["Slot", "Score", "Reach", "Latency", "Time"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-left align-middle text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[rgba(245,255,249,0.36)]"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentAttestations.map((item) => (
                <tr key={item.signature} className="hover:bg-black/80">
                  <td className="border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] font-mono text-[0.72rem] text-[rgba(245,255,249,0.62)]">
                    {item.slot.toLocaleString()}
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
          {loading && recentAttestations.length === 0 ? (
            <div className="grid gap-2 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 rounded-[10px]" />
              ))}
            </div>
          ) : recentAttestations.length === 0 ? (
            <div className="p-4 text-[0.72rem] text-[rgba(245,255,249,0.62)]">
              No recent attestation events found for this observer.
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <SectionTitle>Raw account</SectionTitle>
        <div className="overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-black/70 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="border-b border-[rgba(255,255,255,0.08)] px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
            ObserverAccount
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[0.72rem] leading-6 text-[rgba(245,255,249,0.72)]">{`ObserverAccount {
  authority:          ${observer.pubkey},
  region:             ${observer.region},
  is_active:          ${observer.active},
  stake_lamports:     ${Math.round(observer.stake * 1e9)},
  latest_attestation: Attestation {
    tpu_reachable:    ${observer.tpuReachable ?? observer.reach},
    tpu_probed:       ${observer.tpuProbed ?? 100},
    avg_rtt_ms:       ${avgRtt},
    p95_rtt_ms:       ${p95Rtt},
    slot_latency_ms:  ${slotLatency},
    slot:             ${observer.slot},
  },
}`}</pre>
        </div>
      </section>
    </PageFrame>
  );
}
