import { createHash } from "crypto";
import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import {
  createS0narClient,
  lamportsToSol,
  latencyScore,
  type NetworkHealth,
  type Observer,
  type Region,
  type RegionScore,
  type Registry,
} from "s0nar-sdk";
import { idl } from "@/lib/s0nar-idl";
import { type AttestationHistoryItem, type ObserverView, type RegionScoreView, type SonarSnapshot } from "@/lib/sonar-static";

export const dynamic = "force-dynamic";

const RPC_URL = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = idl.address;
const STALE_SLOT_THRESHOLD = 150;
const REGION_NAMES = ["Asia", "US", "EU", "South America", "Africa", "Oceania", "Other"] as const;
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
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
const client = createS0narClient({
  connection,
  programId: new PublicKey(PROGRAM_ID),
});

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

  bool() {
    return this.u8() === 1;
  }

  u16() {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
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

  i64() {
    const value = Number(this.view.getBigInt64(this.offset, true));
    this.offset += 8;
    return value;
  }

  pubkey() {
    const value = encodeBase58(this.data.slice(this.offset, this.offset + 32));
    this.offset += 32;
    return value;
  }

  optionPubkey() {
    const some = this.u8() === 1;
    if (!some) return null;
    return this.pubkey();
  }
}

function eventDiscriminator(name: string) {
  return createHash("sha256").update(`event:${name}`).digest().subarray(0, 8);
}

function matchesDiscriminator(data: Uint8Array, expected: Uint8Array) {
  return expected.every((byte, index) => data[index] === byte);
}

function encodeBase58(bytes: Uint8Array) {
  const digits = [0];

  for (const byte of bytes) {
    let carry = byte;
    for (let index = 0; index < digits.length; index++) {
      carry += digits[index] << 8;
      digits[index] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let output = "";
  for (const byte of bytes) {
    if (byte !== 0) break;
    output += BASE58_ALPHABET[0];
  }
  for (let index = digits.length - 1; index >= 0; index--) {
    output += BASE58_ALPHABET[digits[index]];
  }
  return output;
}

function calculateScore(reachability: number, slotLatency: number) {
  return Math.round(reachability * 0.7 + latencyScore(slotLatency) * 0.3);
}

function regionName(region: number) {
  return REGION_NAMES[region] ?? "Other";
}

function sdkRegionName(region: Region) {
  if (region === "SouthAmerica") return "South America";
  return region;
}

function mapRegionScore(region: RegionScore, currentSlot: bigint): RegionScoreView {
  const name = sdkRegionName(region.region);
  return {
    id: REGION_IDS_BY_NAME[name] ?? "other",
    name,
    score: region.healthScore,
    reachability: region.reachabilityPct,
    latency: region.slotLatencyMs,
    rtt: Math.round((region.avgRttUs / 1000 + Number.EPSILON) * 10) / 10,
    observers: region.observerCount,
    stale:
      region.observerCount === 0 ||
      region.lastUpdatedSlot === BigInt(0) ||
      currentSlot - region.lastUpdatedSlot > BigInt(STALE_SLOT_THRESHOLD),
  };
}

function mapObserver(observer: Observer): ObserverView {
  const latest = observer.latestAttestation;
  const tpuProbed = latest.tpuProbed;
  const tpuReachable = latest.tpuReachable;
  const reach = tpuProbed > 0 ? Math.round((tpuReachable / tpuProbed) * 100) : 0;
  const slotLatency = latest.slotLatencyMs;

  return {
    pubkey: observer.authority.toBase58(),
    region: sdkRegionName(observer.region),
    active: observer.isActive,
    stake: lamportsToSol(observer.stakeLamports),
    slot: Number(latest.slot || observer.lastAttestationSlot),
    reach,
    rtt: Math.round((latest.avgRttUs / 1000 + Number.EPSILON) * 10) / 10,
    score: observer.isActive ? calculateScore(reach, slotLatency) : 0,
    p95Rtt: Math.round((latest.p95RttUs / 1000 + Number.EPSILON) * 10) / 10,
    slotLatency,
    tpuReachable,
    tpuProbed,
    registeredAt: Number(observer.registeredAt),
    attestationCount: Number(observer.attestationCount),
  };
}

async function rpcRequest<T>(method: string, params: unknown[], id = method, timeoutMs = 8_000): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `RPC request failed with ${response.status}`);
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

function decodeAttestationEvent(data: Uint8Array, signature: string, timestamp?: number): AttestationHistoryItem | null {
  if (!matchesDiscriminator(data, eventDiscriminator("AttestationSubmitted"))) return null;

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
    [PROGRAM_ID, { limit: SIGNATURE_SCAN_LIMIT }],
    "s0nar-signatures",
  );

  const successfulSignatures = signatures.filter((item) => !item.err);
  const events: AttestationHistoryItem[] = [];
  const seen = new Set<string>();

  const transactionInputs = successfulSignatures.slice(0, TX_SCAN_LIMIT);
  const transactions = await Promise.all(
    transactionInputs.map(async ({ signature, blockTime }) => {
      try {
        const transaction = await rpcRequest<RpcTransaction | null>(
          "getTransaction",
          [signature, { encoding: "json", commitment: "confirmed", maxSupportedTransactionVersion: 0 }],
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
    if (!item?.transaction) continue;
    const logMessages = item.transaction.meta?.logMessages;
    if (!logMessages) continue;

    for (const log of logMessages) {
      if (!log.startsWith("Program data: ")) continue;
      const data = Buffer.from(log.replace("Program data: ", ""), "base64");
      const event = decodeAttestationEvent(data, item.signature, item.transaction.blockTime ?? item.blockTime);
      if (!event || seen.has(event.signature)) continue;
      seen.add(event.signature);
      events.push(event);
    }
  }

  return events.sort((a, b) => b.slot - a.slot).slice(0, INTERNAL_HISTORY_LIMIT);
}

async function getOnchainSnapshot(): Promise<SonarSnapshot> {
  const historyPromise = timeout(fetchAttestationHistory(), [], HISTORY_TIMEOUT_MS);
  const [network, registry, sdkObservers] = await Promise.all([
    client.getNetworkHealth(),
    client.getRegistry(),
    client.getAllObservers(),
  ] satisfies [Promise<NetworkHealth>, Promise<Registry>, Promise<Observer[]>]);
  const attestationHistory = await historyPromise;
  const recentGlobalAttestations = attestationHistory.slice(0, HISTORY_LIMIT);
  const observers = sdkObservers.map((observer) => {
    const view = mapObserver(observer);
    view.recentAttestations = attestationHistory
      .filter((attestation) => attestation.observer === view.pubkey)
      .slice(0, HISTORY_LIMIT);
    return view;
  });
  const regions = network.regionScores.map((region) => mapRegionScore(region, network.lastUpdatedSlot));

  return {
    source: "onchain",
    fetchedAt: Date.now(),
    programId: PROGRAM_ID,
    history: recentGlobalAttestations.map((item) => item.score).reverse(),
    attestationHistory: recentGlobalAttestations,
    regions,
    observers: observers.sort((a, b) => b.score - a.score),
    network: {
      score: network.healthScore,
      reachability: network.tpuReachabilityPct,
      slotLatency: network.avgSlotLatencyMs,
      activeObservers: network.activeObserverCount || registry.activeCount,
      totalObservers: registry.observerCount || observers.length,
      activeRegions: network.activeRegionCount,
      totalRegions: regions.length,
      lastUpdatedSlot: Number(network.lastUpdatedSlot),
      totalAttestations: Number(network.totalAttestations),
      updatedSeconds: network.lastUpdatedTs > BigInt(0) ? Math.max(0, Math.floor(Date.now() / 1000 - Number(network.lastUpdatedTs))) : 0,
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
        error: error instanceof Error ? error.message : "On-chain snapshot unavailable",
      },
      { status: 503 },
    );
  }
}
