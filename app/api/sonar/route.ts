import { createHash } from "crypto";
import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import {
  PROGRAM_ID as DEFAULT_PROGRAM_ID,
  createS0narClient,
  isObserverStale,
  isStale,
  lamportsToSol,
  latencyScore,
  regionLabel,
  type NetworkHealth,
  type Observer,
  type RegionScore,
  type Registry,
} from "s0nar-sdk";
import {
  CLIENT_COLORS,
  type AttestationHistoryItem,
  type ClientDiversityItem,
  type ObserverView,
  type RegionScoreView,
  type SonarSnapshot,
} from "@/lib/sonar-static";

export const dynamic = "force-dynamic";

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";
const PROGRAM_ID =
  process.env.S0NAR_PROGRAM_ID || process.env.NEXT_PUBLIC_S0NAR_PROGRAM_ID;
const HISTORY_LIMIT = 10;
const INTERNAL_HISTORY_LIMIT = 60;
const SIGNATURE_SCAN_LIMIT = 80;
const TX_SCAN_LIMIT = 32;
const HISTORY_TIMEOUT_MS = 8_000;
const SNAPSHOT_TTL_MS = 10_000;
const REGION_IDS_BY_NAME: Record<string, RegionScoreView["id"]> = {
  Asia: "asia",
  US: "us",
  EU: "eu",
  "South America": "sa",
  Africa: "africa",
  Oceania: "oc",
  Other: "other",
};

const connection = new Connection(RPC_URL, "confirmed");
const programId = PROGRAM_ID ? new PublicKey(PROGRAM_ID) : DEFAULT_PROGRAM_ID;
const client = createS0narClient({ connection, programId });

let cachedSnapshot: SonarSnapshot | null = null;
let cachedSnapshotAt = 0;
let snapshotPromise: Promise<SonarSnapshot> | null = null;

class Reader {
  private offset = 8;
  private view: DataView;

  constructor(private data: Uint8Array) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  u8() {
    return this.data[this.offset++];
  }

  u32() {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  u64() {
    const value = Number(this.view.getBigUint64(this.offset, true));
    this.offset += 8;
    return value;
  }

  pubkey() {
    const value = new PublicKey(
      this.data.slice(this.offset, this.offset + 32),
    ).toBase58();
    this.offset += 32;
    return value;
  }
}

type RpcSignature = {
  signature: string;
  blockTime?: number;
  err: unknown;
};

type RpcTransaction = {
  blockTime?: number;
  meta?: {
    logMessages?: string[];
  };
};

function roundTenth(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function scoreFromAttestation(reachability: number, slotLatencyMs: number) {
  return Math.round(reachability * 0.7 + latencyScore(slotLatencyMs) * 0.3);
}

function reachabilityPct(tpuReachable: number, tpuProbed: number) {
  return tpuProbed > 0 ? Math.round((tpuReachable / tpuProbed) * 100) : 0;
}

function appRegionName(region: RegionScore["region"] | Observer["region"]) {
  const label = regionLabel(region);
  if (label === "United States") return "US";
  if (label === "Europe") return "EU";
  return label;
}

function clientDiversityFromCounts(counts: {
  agaveCount: number;
  firedancerCount: number;
  jitoCount: number;
  solanaLabsCount: number;
  otherCount: number;
  tpuProbed?: number;
}): ClientDiversityItem[] {
  const known =
    counts.agaveCount +
    counts.firedancerCount +
    counts.jitoCount +
    counts.solanaLabsCount +
    counts.otherCount;
  const unknown = Math.max((counts.tpuProbed ?? known) - known, 0);

  return [
    { name: "Agave", count: counts.agaveCount, color: CLIENT_COLORS.Agave },
    {
      name: "Firedancer",
      count: counts.firedancerCount,
      color: CLIENT_COLORS.Firedancer,
    },
    { name: "Jito", count: counts.jitoCount, color: CLIENT_COLORS.Jito },
    { name: "Labs", count: counts.solanaLabsCount, color: CLIENT_COLORS.Labs },
    { name: "Other", count: counts.otherCount, color: CLIENT_COLORS.Other },
    { name: "Unknown", count: unknown, color: CLIENT_COLORS.Unknown },
  ];
}

function mapRegion(
  region: RegionScore,
  activeObserverRegions: Set<string>,
): RegionScoreView {
  const name = appRegionName(region.region);
  const stale = !activeObserverRegions.has(name);

  return {
    id: REGION_IDS_BY_NAME[name] ?? "other",
    name,
    score: stale ? 0 : region.healthScore,
    reachability: stale ? 0 : region.reachabilityPct,
    latency: stale ? 0 : region.slotLatencyMs,
    rtt: stale ? 0 : roundTenth(region.avgRttUs / 1000),
    observers: region.observerCount,
    stale,
    reachableStakePct: region.reachableStakePct ?? 0,
    agaveCount: region.agaveCount ?? 0,
    firedancerCount: region.firedancerCount ?? 0,
    jitoCount: region.jitoCount ?? 0,
    solanaLabsCount: region.solanaLabsCount ?? 0,
    otherCount: region.otherCount ?? 0,
  };
}

function mapObserver(observer: Observer, currentSlot: bigint): ObserverView {
  const latest = observer.latestAttestation;
  const reach = reachabilityPct(latest.tpuReachable, latest.tpuProbed);
  const active = observer.isActive && !isObserverStale(observer, currentSlot);

  return {
    pubkey: observer.authority.toBase58(),
    region: appRegionName(observer.region),
    active,
    stake: lamportsToSol(observer.stakeLamports),
    slot: Number(latest.slot || observer.lastAttestationSlot),
    reach,
    rtt: roundTenth(latest.avgRttUs / 1000),
    score: active ? scoreFromAttestation(reach, latest.slotLatencyMs) : 0,
    p95Rtt: roundTenth(latest.p95RttUs / 1000),
    slotLatency: latest.slotLatencyMs,
    tpuReachable: latest.tpuReachable,
    tpuProbed: latest.tpuProbed,
    registeredAt: Number(observer.registeredAt),
    attestationCount: Number(observer.attestationCount),
    reachableStakePct: latest.reachableStakePct ?? 0,
    agaveCount: latest.agaveCount ?? 0,
    firedancerCount: latest.firedancerCount ?? 0,
    jitoCount: latest.jitoCount ?? 0,
    solanaLabsCount: latest.solanaLabsCount ?? 0,
    otherCount: latest.otherCount ?? 0,
  };
}

function attestationFromObserver(
  observer: Observer,
): AttestationHistoryItem | null {
  const latest = observer.latestAttestation;
  const slot = Number(latest.slot || observer.lastAttestationSlot);
  if (slot <= 0) return null;

  const reachability = reachabilityPct(latest.tpuReachable, latest.tpuProbed);
  const observerKey = observer.authority.toBase58();

  return {
    observer: observerKey,
    region: appRegionName(observer.region),
    score: scoreFromAttestation(reachability, latest.slotLatencyMs),
    reachability,
    slotLatency: latest.slotLatencyMs,
    slot,
    timestamp:
      latest.timestamp > BigInt(0) ? Number(latest.timestamp) : undefined,
    signature: `${observerKey}-${slot}`,
    reachableStakePct: latest.reachableStakePct ?? 0,
  };
}

function buildAttestationHistory(observers: Observer[]) {
  return observers
    .map(attestationFromObserver)
    .filter((item): item is AttestationHistoryItem => Boolean(item))
    .sort((a, b) => b.slot - a.slot);
}

function eventDiscriminator(name: string) {
  return createHash("sha256").update(`event:${name}`).digest().subarray(0, 8);
}

function matchesDiscriminator(data: Uint8Array, expected: Uint8Array) {
  return expected.every((byte, index) => data[index] === byte);
}

function regionName(region: number) {
  return (
    ["Asia", "US", "EU", "South America", "Africa", "Oceania", "Other"][
      region
    ] ?? "Other"
  );
}

async function rpcRequest<T>(
  method: string,
  params: unknown[],
  id = method,
  timeoutMs = 8_000,
): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error?.message || `RPC request failed with ${response.status}`,
    );
  }

  return payload.result;
}

function timeout<T>(promise: Promise<T>, fallback: T, ms: number): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(timer));
  });
}

function decodeAttestationEvent(
  data: Uint8Array,
  signature: string,
  timestamp?: number,
): AttestationHistoryItem | null {
  if (!matchesDiscriminator(data, eventDiscriminator("AttestationSubmitted")))
    return null;

  const reader = new Reader(data);
  const observer = reader.pubkey();
  const region = reader.u8();
  const score = reader.u8();
  const reachability = reader.u8();
  const slotLatency = reader.u32();
  const slot = reader.u64();

  return {
    observer,
    region: regionName(region),
    score,
    reachability,
    slotLatency,
    slot,
    timestamp,
    signature,
  };
}

async function fetchAttestationHistory(): Promise<AttestationHistoryItem[]> {
  const signatures = await rpcRequest<RpcSignature[]>(
    "getSignaturesForAddress",
    [client.programId.toBase58(), { limit: SIGNATURE_SCAN_LIMIT }],
    "s0nar-signatures",
  );
  const events: AttestationHistoryItem[] = [];
  const seen = new Set<string>();
  const transactions = await Promise.all(
    signatures
      .filter((item) => !item.err)
      .slice(0, TX_SCAN_LIMIT)
      .map(async ({ signature, blockTime }) => {
        try {
          const transaction = await rpcRequest<RpcTransaction | null>(
            "getTransaction",
            [
              signature,
              {
                encoding: "json",
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
              },
            ],
            signature,
            5_000,
          );
          return { signature, blockTime, transaction };
        } catch {
          return null;
        }
      }),
  );

  for (const item of transactions) {
    if (!item?.transaction?.meta?.logMessages) continue;

    for (const log of item.transaction.meta.logMessages) {
      if (!log.startsWith("Program data: ")) continue;
      const data = Buffer.from(log.replace("Program data: ", ""), "base64");
      const event = decodeAttestationEvent(
        data,
        item.signature,
        item.transaction.blockTime ?? item.blockTime,
      );
      if (!event || seen.has(event.signature)) continue;
      seen.add(event.signature);
      events.push(event);
    }
  }

  return events
    .sort((a, b) => b.slot - a.slot)
    .slice(0, INTERNAL_HISTORY_LIMIT);
}

function buildClientDiversity(network: NetworkHealth, observers: Observer[]) {
  const networkCounts = {
    agaveCount: network.agaveCount,
    firedancerCount: network.firedancerCount,
    jitoCount: network.jitoCount,
    solanaLabsCount: network.solanaLabsCount,
    otherCount: network.otherCount,
  };
  const known =
    networkCounts.agaveCount +
    networkCounts.firedancerCount +
    networkCounts.jitoCount +
    networkCounts.solanaLabsCount +
    networkCounts.otherCount;

  if (known > 0) return clientDiversityFromCounts(networkCounts);

  const observerCounts = observers.reduce(
    (totals, observer) => ({
      agaveCount: totals.agaveCount + observer.latestAttestation.agaveCount,
      firedancerCount:
        totals.firedancerCount + observer.latestAttestation.firedancerCount,
      jitoCount: totals.jitoCount + observer.latestAttestation.jitoCount,
      solanaLabsCount:
        totals.solanaLabsCount + observer.latestAttestation.solanaLabsCount,
      otherCount: totals.otherCount + observer.latestAttestation.otherCount,
      tpuProbed: totals.tpuProbed + observer.latestAttestation.tpuProbed,
    }),
    {
      agaveCount: 0,
      firedancerCount: 0,
      jitoCount: 0,
      solanaLabsCount: 0,
      otherCount: 0,
      tpuProbed: 0,
    },
  );

  return clientDiversityFromCounts(observerCounts);
}

async function getOnchainSnapshot(): Promise<SonarSnapshot> {
  const historyPromise = timeout(
    fetchAttestationHistory(),
    [],
    HISTORY_TIMEOUT_MS,
  );
  const [network, registry, sdkObservers, slot] = await Promise.all([
    client.getNetworkHealth(),
    client.getRegistry(),
    client.getAllObservers(),
    connection.getSlot("confirmed"),
  ] satisfies [
    Promise<NetworkHealth>,
    Promise<Registry>,
    Promise<Observer[]>,
    Promise<number>,
  ]);
  const currentSlot = BigInt(slot);
  const eventHistory = await historyPromise;
  const attestationHistory =
    eventHistory.length > 0
      ? eventHistory
      : buildAttestationHistory(sdkObservers);
  const recentGlobalAttestations = attestationHistory.slice(0, HISTORY_LIMIT);
  const activeObserverRegions = new Set(
    sdkObservers
      .filter(
        (observer) =>
          observer.isActive && !isObserverStale(observer, currentSlot),
      )
      .map((observer) => appRegionName(observer.region)),
  );
  const observers = sdkObservers.map((observer) => {
    const view = mapObserver(observer, currentSlot);
    view.recentAttestations = attestationHistory
      .filter((attestation) => attestation.observer === view.pubkey)
      .slice(0, HISTORY_LIMIT);
    return view;
  });
  const regions = network.regionScores.map((region) =>
    mapRegion(region, activeObserverRegions),
  );
  const activeObservers = sdkObservers.filter(
    (observer) => observer.isActive && !isObserverStale(observer, currentSlot),
  );
  const avgRttMs =
    activeObservers.reduce(
      (total, observer) => total + observer.latestAttestation.avgRttUs / 1000,
      0,
    ) / Math.max(activeObservers.length, 1);

  return {
    source: "onchain",
    fetchedAt: Date.now(),
    programId: client.programId.toBase58(),
    history: recentGlobalAttestations.map((item) => item.score).reverse(),
    attestationHistory: recentGlobalAttestations,
    clientDiversity: buildClientDiversity(network, sdkObservers),
    regions,
    observers: observers.sort((a, b) => b.score - a.score),
    network: {
      score: isStale(network, currentSlot) ? 0 : network.healthScore,
      reachability: isStale(network, currentSlot)
        ? 0
        : network.tpuReachabilityPct,
      rtt: roundTenth(avgRttMs),
      slotLatency: network.avgSlotLatencyMs,
      activeObservers: activeObservers.length,
      totalObservers: registry.observerCount || observers.length,
      activeRegions: network.activeRegionCount,
      totalRegions: regions.length,
      lastUpdatedSlot: Number(network.lastUpdatedSlot),
      totalAttestations: Number(network.totalAttestations),
      updatedSeconds:
        network.lastUpdatedTs > BigInt(0)
          ? Math.max(
              0,
              Math.floor(Date.now() / 1000 - Number(network.lastUpdatedTs)),
            )
          : 0,
      agaveCount: network.agaveCount ?? 0,
      firedancerCount: network.firedancerCount ?? 0,
      jitoCount: network.jitoCount ?? 0,
      solanaLabsCount: network.solanaLabsCount ?? 0,
      otherCount: network.otherCount ?? 0,
    },
    registry: {
      paused: registry.paused,
      observerCap: registry.maxObservers,
      minStakeSol: lamportsToSol(registry.minStakeLamports),
    },
  };
}

async function getCachedOnchainSnapshot() {
  const now = Date.now();
  if (cachedSnapshot && now - cachedSnapshotAt < SNAPSHOT_TTL_MS) {
    return cachedSnapshot;
  }

  snapshotPromise ??= getOnchainSnapshot()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cachedSnapshotAt = Date.now();
      return snapshot;
    })
    .finally(() => {
      snapshotPromise = null;
    });

  return snapshotPromise;
}

export async function GET() {
  try {
    return NextResponse.json(await getCachedOnchainSnapshot(), {
      headers: {
        "cache-control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "On-chain snapshot unavailable",
      },
      { status: 503 },
    );
  }
}
