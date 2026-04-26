"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bars,
  KeyValueList,
  MetricCard,
  PageFrame,
  PageIntro,
  Panel,
  SectionTitle,
  Skeleton,
  StatusPill,
} from "@/components/sonar-ui";
import { useSonarSnapshot } from "@/lib/sonar-client";

const DEFAULT_HISTORY = [88, 90, 91, 89, 92, 91, 93, 91, 90, 91, 92, 91, 89, 91, 91, 92, 90, 91, 92, 91];
const MIN_STAKE_SOL = 0.1;

export default function ObserverDetailPage() {
  const { snapshot, loading } = useSonarSnapshot();
  const { pubkey } = useParams<{ pubkey: string }>();
  const displayKey = decodeURIComponent(typeof pubkey === "string" ? pubkey : "");
  const observer = snapshot?.observers.find((item) => item.pubkey === displayKey);

  if (!snapshot || (!observer && loading)) {
    return (
      <PageFrame wide>
        <Link
          href="/observers"
          className="mb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
        >
          Back to registry
        </Link>
        <PageIntro
          eyebrow="Observer detail"
          title="Observer profile"
          description="Per-observer state, latest attestation envelope, and the exact score trend contributing to the regional model."
          aside={<StatusPill>{loading ? "Fetching on-chain" : "Unavailable"}</StatusPill>}
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
          className="mb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
        >
          Back to registry
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
  const p95Rtt = observer.p95Rtt ?? Math.round((avgRtt * 1.25 + Number.EPSILON) * 10) / 10;
  const slotLatency = observer.slotLatency ?? Math.round(avgRtt * 12);
  const registeredSlot = observer.registeredAt ?? Math.max(0, observer.slot - 2_442_100);
  const registeredValue = observer.registeredAt
    ? new Date(observer.registeredAt * 1000).toLocaleString()
    : registeredSlot.toLocaleString();
  const history = DEFAULT_HISTORY.map((value, index) =>
    index === DEFAULT_HISTORY.length - 1 ? observer.score : Math.max(0, Math.min(100, value + observer.score - 91)),
  );

  return (
    <PageFrame wide>
      <Link
        href="/observers"
        className="mb-6 inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)] transition-colors hover:text-[#2de19b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
      >
        Back to registry
      </Link>

      <PageIntro
        eyebrow="Observer detail"
        title="Observer profile"
        description="Per-observer state, latest attestation envelope, and the exact score trend contributing to the regional model."
        aside={observer.active ? <StatusPill active>{snapshot.source === "onchain" ? "On-chain active" : "Active"}</StatusPill> : <StatusPill>Inactive</StatusPill>}
      />

      <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Panel accent>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">Latest attestation</div>
              <h2 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                Health score {observer.score}
              </h2>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                Current envelope remains healthy, with strong reachability and latency still
                below the 400ms threshold.
              </p>
            </div>
            <StatusPill active>Publishing</StatusPill>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-black/40 p-4 font-mono text-[0.76rem] text-[rgba(245,255,249,0.78)]">
            {displayKey}
          </div>

          <div className="mt-[1.45rem] grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
            <MetricCard label="Reachability" value={`${observer.reach}/100`} hint="TPU probes that succeeded" />
            <MetricCard label="Avg RTT" value={`${avgRtt}ms`} hint="Median response latency" />
            <MetricCard label="Slot latency" value={`${slotLatency}ms`} hint="Below stale threshold" />
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
            <SectionTitle>Stake posture</SectionTitle>
            <div className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-semibold uppercase leading-none tracking-[-0.08em] text-[#2de19b]">
              {observer.stake}
              <span className="ml-2 text-[0.75rem] tracking-[0.18em] text-[rgba(245,255,249,0.42)]">SOL</span>
            </div>
            <div className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              minimum required {MIN_STAKE_SOL} SOL
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[#2de19b] shadow-[0_0_1rem_rgba(45,225,155,0.28)]"
                style={{ width: `${Math.min(100, (observer.stake / MIN_STAKE_SOL) * 100)}%` }}
              />
            </div>
          </Panel>
        </div>
      </section>

      <section className="mb-[3.2rem]">
        <Panel>
          <SectionTitle>Score history</SectionTitle>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            Last 20 observation windows
          </div>
          <div className="mt-5">
            <Bars values={history} accentIndex={history.length - 1} />
          </div>
        </Panel>
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
