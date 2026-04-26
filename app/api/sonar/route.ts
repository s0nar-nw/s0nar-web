import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { idl } from "@/lib/s0nar-idl";
import { type AttestationHistoryItem, type ObserverView, type RegionScoreView, type SonarSnapshot } from "@/lib/sonar-static";

export const dynamic = "force-dynamic";

const RPC_URL = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = idl.address;
const LAMPORTS_PER_SOL = 1_000_000_000;
const STALE_SLOT_THRESHOLD = 150;
const REGION_NAMES = ["Asia", "US", "EU", "South America", "Africa", "Oceania", "Other"] as const;
const REGION_IDS = ["asia", "us", "eu", "sa", "africa", "oc", "other"] as const;
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HISTORY_LIMIT = 10;
const INTERNAL_HISTORY_LIMIT = 60;
const SIGNATURE_SCAN_LIMIT = 80;
const TX_BATCH_SIZE = 12;
const HISTORY_TIMEOUT_MS = 8_000;

type RpcAccount = {
  pubkey: string;
  account: {
    data: [string, string];
  };
};

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

type NetworkHealthAccount = {
  score: number;
  reachability: number;
  slotLatency: number;
  activeObservers: number;
  activeRegions: number;
  lastUpdatedSlot: number;
  lastUpdatedTs: number;
  totalAttestations: number;
  regions: RegionScoreView[];
};

type RegistryAccount = {
  minStakeSol: number;
  observerCount: number;
  activeCount: number;
  maxObservers: number;
  paused: boolean;
};

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

function discriminator(name: string) {
  return createHash("sha256").update(`account:${name}`).digest().subarray(0, 8);
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
  const latencyScore = Math.max(0, ((400 - slotLatency) / 400) * 100);
  return Math.round(reachability * 0.7 + latencyScore * 0.3);
}

function regionName(region: number) {
  return REGION_NAMES[region] ?? "Other";
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

async function rpcBatchRequest<T>(requests: Array<{ method: string; params: unknown[]; id: string }>, timeoutMs = 8_000): Promise<Array<T | null>> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      requests.map((request) => ({
        jsonrpc: "2.0",
        id: request.id,
        method: request.method,
        params: request.params,
      })),
    ),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json();

  if (!response.ok || !Array.isArray(payload)) return requests.map(() => null);

  const byId = new Map(payload.map((item) => [item.id, item.error ? null : item.result]));
  return requests.map((request) => (byId.get(request.id) as T | null) ?? null);
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

function decodeRegionScore(reader: Reader, currentSlot: number): RegionScoreView {
  const region = reader.u8();
  const observers = reader.u16();
  const score = reader.u8();
  const reachability = reader.u8();
  const avgRttUs = reader.u32();
  const latency = reader.u32();
  const lastUpdatedSlot = reader.u64();
  reader.u32();
  reader.u32();
  reader.u64();
  reader.u64();

  return {
    id: REGION_IDS[region] ?? "other",
    name: regionName(region),
    score,
    reachability,
    latency,
    rtt: Math.round((avgRttUs / 1000 + Number.EPSILON) * 10) / 10,
    observers,
    stale: observers === 0 || lastUpdatedSlot === 0 || currentSlot - lastUpdatedSlot > STALE_SLOT_THRESHOLD,
  };
}

function decodeNetworkHealth(data: Uint8Array): NetworkHealthAccount {
  const reader = new Reader(data);
  const score = reader.u8();
  const reachability = reader.u8();
  const slotLatency = reader.u32();
  const activeObservers = reader.u16();
  const activeRegions = reader.u16();
  const lastUpdatedSlot = reader.u64();
  const lastUpdatedTs = reader.i64();
  reader.u8();
  reader.u8();
  const totalAttestations = reader.u64();

  const regions = Array.from({ length: 7 }, () => decodeRegionScore(reader, lastUpdatedSlot));
  return { score, reachability, slotLatency, activeObservers, activeRegions, lastUpdatedSlot, lastUpdatedTs, totalAttestations, regions };
}

function decodeObserver(data: Uint8Array): ObserverView {
  const reader = new Reader(data);
  const pubkey = reader.pubkey();
  const region = reader.u8();
  const stake = reader.u64() / LAMPORTS_PER_SOL;
  const registeredAt = reader.i64();
  const lastAttestationSlot = reader.u64();
  const attestationCount = reader.u64();
  const slot = reader.u64();
  reader.i64();
  const avgRttUs = reader.u32();
  const p95RttUs = reader.u32();
  const slotLatency = reader.u32();
  const tpuReachable = reader.u16();
  const tpuProbed = reader.u16();
  const active = reader.bool();
  const reach = tpuProbed > 0 ? Math.round((tpuReachable / tpuProbed) * 100) : 0;

  return {
    pubkey,
    region: regionName(region),
    active,
    stake,
    slot: slot || lastAttestationSlot,
    reach,
    rtt: Math.round((avgRttUs / 1000 + Number.EPSILON) * 10) / 10,
    score: active ? calculateScore(reach, slotLatency) : 0,
    p95Rtt: Math.round((p95RttUs / 1000 + Number.EPSILON) * 10) / 10,
    slotLatency,
    tpuReachable,
    tpuProbed,
    registeredAt,
    attestationCount,
  };
}

function decodeRegistry(data: Uint8Array): RegistryAccount {
  const reader = new Reader(data);
  reader.pubkey();
  reader.optionPubkey();
  const minStakeSol = reader.u64() / LAMPORTS_PER_SOL;
  const observerCount = reader.u16();
  const activeCount = reader.u16();
  const maxObservers = reader.u16();
  const paused = reader.bool();
  return { minStakeSol, observerCount, activeCount, maxObservers, paused };
}

async function fetchProgramAccounts(): Promise<RpcAccount[]> {
  return rpcRequest<RpcAccount[]>("getProgramAccounts", [PROGRAM_ID, { encoding: "base64" }], "s0nar");
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

  for (let index = 0; index < successfulSignatures.length && events.length < INTERNAL_HISTORY_LIMIT; index += TX_BATCH_SIZE) {
    const batch = successfulSignatures.slice(index, index + TX_BATCH_SIZE);
    const transactionResults = await rpcBatchRequest<RpcTransaction>(
      batch.map(({ signature }) => ({
        method: "getTransaction",
        params: [signature, { encoding: "json", commitment: "confirmed", maxSupportedTransactionVersion: 0 }],
        id: signature,
      })),
      5_000,
    );
    const transactions = batch.map(({ signature, blockTime }, transactionIndex) => ({
      signature,
      blockTime,
      transaction: transactionResults[transactionIndex],
    }));

    for (const item of transactions) {
      if (!item.transaction) continue;
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
  }

  return events.sort((a, b) => b.slot - a.slot).slice(0, INTERNAL_HISTORY_LIMIT);
}

async function getOnchainSnapshot(): Promise<SonarSnapshot> {
  const historyPromise = timeout(fetchAttestationHistory(), [], HISTORY_TIMEOUT_MS);
  const accounts = await fetchProgramAccounts();
  const attestationHistory = await historyPromise;
  const recentGlobalAttestations = attestationHistory.slice(0, HISTORY_LIMIT);
  const networkDiscriminator = discriminator("NetworkHealthAccount");
  const observerDiscriminator = discriminator("ObserverAccount");
  const registryDiscriminator = discriminator("RegistryAccount");
  let network: NetworkHealthAccount | null = null;
  let registry: RegistryAccount | null = null;
  const observers: ObserverView[] = [];

  for (const account of accounts) {
    const data = Buffer.from(account.account.data[0], "base64");
    if (matchesDiscriminator(data, networkDiscriminator)) network = decodeNetworkHealth(data);
    if (matchesDiscriminator(data, observerDiscriminator)) {
      const observer = decodeObserver(data);
      observer.recentAttestations = attestationHistory
        .filter((attestation) => attestation.observer === observer.pubkey)
        .slice(0, HISTORY_LIMIT);
      observers.push(observer);
    }
    if (matchesDiscriminator(data, registryDiscriminator)) registry = decodeRegistry(data);
  }

  if (!network || !registry) {
    throw new Error("Required s0nar accounts were not found on-chain");
  }

  return {
    source: "onchain",
    fetchedAt: Date.now(),
    programId: PROGRAM_ID,
    history: recentGlobalAttestations.map((item) => item.score).reverse(),
    attestationHistory: recentGlobalAttestations,
    regions: network.regions,
    observers: observers.sort((a, b) => b.score - a.score),
    network: {
      score: network.score,
      reachability: network.reachability,
      slotLatency: network.slotLatency,
      activeObservers: network.activeObservers || registry.activeCount,
      totalObservers: registry.observerCount || observers.length,
      activeRegions: network.activeRegions,
      totalRegions: network.regions.length,
      lastUpdatedSlot: network.lastUpdatedSlot,
      totalAttestations: network.totalAttestations,
      updatedSeconds: network.lastUpdatedTs > 0 ? Math.max(0, Math.floor(Date.now() / 1000 - network.lastUpdatedTs)) : 0,
    },
    registry: {
      paused: registry.paused,
      observerCap: registry.maxObservers,
      minStakeSol: registry.minStakeSol,
    },
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getOnchainSnapshot());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "On-chain snapshot unavailable",
      },
      { status: 503 },
    );
  }
}
