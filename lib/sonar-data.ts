export const PROGRAM_ID = "Au4AWwhGvJFpxgJh3Qe83V8Z4emdd3CoE7EVoSiR5P5L";

export const REGION_SCORES = [
  { id: "asia", name: "Asia", score: 91, reachability: 94, latency: 210, rtt: 18.4, observers: 3, stale: false },
  { id: "us", name: "US", score: 88, reachability: 92, latency: 245, rtt: 21.0, observers: 3, stale: false },
  { id: "eu", name: "EU", score: 85, reachability: 89, latency: 278, rtt: 24.3, observers: 3, stale: false },
  { id: "sa", name: "South America", score: 72, reachability: 78, latency: 310, rtt: 31.0, observers: 2, stale: false },
  { id: "africa", name: "Africa", score: 61, reachability: 68, latency: 355, rtt: 38.0, observers: 1, stale: false },
  { id: "oc", name: "Oceania", score: 79, reachability: 83, latency: 290, rtt: 27.5, observers: 1, stale: false },
  { id: "other", name: "Other", score: 0, reachability: 0, latency: 0, rtt: 0, observers: 1, stale: true },
] as const;

export const HISTORY = [82, 84, 83, 86, 85, 87, 88, 86, 89, 87, 88, 87, 85, 86, 88, 87, 86, 88, 87, 87];

export const OBSERVERS = [
  { pubkey: "DxH7...k9mW", region: "Asia", active: true, stake: 0.1, slot: 287442100, reach: 94, rtt: 18.4, score: 91 },
  { pubkey: "F3aQ...n2Lp", region: "US", active: true, stake: 0.15, slot: 287442098, reach: 92, rtt: 21.0, score: 88 },
  { pubkey: "BwK1...p7Rz", region: "EU", active: true, stake: 0.1, slot: 287442095, reach: 89, rtt: 24.3, score: 85 },
  { pubkey: "J9sM...v4Xt", region: "US", active: true, stake: 0.2, slot: 287442090, reach: 91, rtt: 20.1, score: 89 },
  { pubkey: "Kp4N...q8Wv", region: "South America", active: true, stake: 0.1, slot: 287442085, reach: 78, rtt: 31.0, score: 72 },
  { pubkey: "Lm2T...r5Ys", region: "EU", active: true, stake: 0.1, slot: 287442080, reach: 87, rtt: 25.8, score: 83 },
  { pubkey: "Mn8U...s6Zt", region: "Africa", active: true, stake: 0.1, slot: 287442075, reach: 68, rtt: 38.0, score: 61 },
  { pubkey: "No3V...t7Au", region: "Asia", active: true, stake: 0.25, slot: 287442070, reach: 93, rtt: 17.9, score: 92 },
  { pubkey: "Op5W...u8Bv", region: "Oceania", active: true, stake: 0.1, slot: 287442065, reach: 83, rtt: 27.5, score: 79 },
  { pubkey: "Pq6X...v9Cw", region: "US", active: true, stake: 0.1, slot: 287442060, reach: 90, rtt: 22.1, score: 86 },
  { pubkey: "Qr7Y...w0Dx", region: "EU", active: true, stake: 0.1, slot: 287442055, reach: 88, rtt: 26.0, score: 84 },
  { pubkey: "Rs8Z...x1Ey", region: "Asia", active: true, stake: 0.1, slot: 287442050, reach: 95, rtt: 17.0, score: 93 },
  { pubkey: "St9A...y2Fz", region: "South America", active: true, stake: 0.1, slot: 287442045, reach: 77, rtt: 32.0, score: 71 },
  { pubkey: "Tu0B...z3Ga", region: "US", active: true, stake: 0.1, slot: 287442040, reach: 88, rtt: 23.0, score: 85 },
  { pubkey: "Uv1C...a4Hb", region: "Asia", active: false, stake: 0.1, slot: 287400000, reach: 0, rtt: 0, score: 0 },
  { pubkey: "Vw2D...b5Ic", region: "EU", active: false, stake: 0.1, slot: 287390000, reach: 0, rtt: 0, score: 0 },
  { pubkey: "Wx3E...c6Jd", region: "Other", active: false, stake: 0.1, slot: 287380000, reach: 0, rtt: 0, score: 0 },
] as const;

export const REGIONS = ["All", "Asia", "US", "EU", "South America", "Africa", "Oceania", "Other"] as const;

export const REGION_PINS: Record<string, { cx: number; cy: number }> = {
  asia: { cx: 720, cy: 180 },
  us: { cx: 175, cy: 190 },
  eu: { cx: 490, cy: 150 },
  sa: { cx: 270, cy: 310 },
  africa: { cx: 500, cy: 270 },
  oc: { cx: 770, cy: 320 },
  other: { cx: 400, cy: 220 },
};

export const PDAS = [
  { name: "RegistryAccount", seeds: '[b"registry"]', size: "65B", desc: "Global config, operator authority, stake parameters." },
  { name: "NetworkHealthAccount", seeds: '[b"network_health"]', size: "205B", desc: "Canonical oracle surface for CPI consumers." },
  { name: "ObserverAccount", seeds: '[b"observer", pubkey]', size: "128B", desc: "Per-observer state, stake escrow, latest attestation." },
] as const;

export const INSTRUCTIONS = [
  { name: "initialize", caller: "deployer", desc: "Bootstraps registry and network health accounts." },
  { name: "register_observer", caller: "observer daemon", desc: "Creates observer PDA and escrows stake." },
  { name: "submit_attestation", caller: "observer daemon", desc: "Publishes reachability and slot latency measurements." },
  { name: "crank_aggregation", caller: "permissionless", desc: "Recomputes regional and global scores." },
  { name: "deregister_observer", caller: "observer or authority", desc: "Closes active participation and returns stake." },
  { name: "slash_observer", caller: "authority", desc: "Penalizes malicious or stale observers." },
  { name: "update_config", caller: "authority", desc: "Adjusts caps, stake threshold, and pause state." },
] as const;

export const REGISTRY_FIELDS = [
  { field: "authority", type: "Pubkey", desc: "Current admin authority." },
  { field: "pending_authority", type: "Option<Pubkey>", desc: "Two-step authority handoff target." },
  { field: "min_stake_lamports", type: "u64", desc: "Stake floor required to register." },
  { field: "observer_count", type: "u16", desc: "Total observers ever registered." },
  { field: "active_count", type: "u16", desc: "Observers currently contributing." },
  { field: "max_observers", type: "u16", desc: "Concurrent observer limit." },
  { field: "paused", type: "bool", desc: "Blocks register and submit while enabled." },
  { field: "version", type: "u8", desc: "Schema version." },
] as const;

export const NETWORK_HEALTH_FIELDS = [
  { field: "health_score", type: "u8", desc: "Global score from 0 to 100." },
  { field: "tpu_reachability_pct", type: "u8", desc: "Average TPU success rate." },
  { field: "avg_slot_latency_ms", type: "u32", desc: "Average slot latency." },
  { field: "active_observer_count", type: "u16", desc: "Active observers in score computation." },
  { field: "active_region_count", type: "u16", desc: "Regions currently included." },
  { field: "last_updated_slot", type: "u64", desc: "Freshness anchor for consumers." },
  { field: "total_attestations", type: "u64", desc: "Cumulative writes from the network." },
  { field: "region_scores", type: "[RegionScore; 7]", desc: "Per-region score buckets." },
] as const;

export const EVENTS = [
  { name: "ObserverRegistered", desc: "Observer accepted with stake escrowed." },
  { name: "ObserverDeregistered", desc: "Observer removed from active set." },
  { name: "ObserverSlashed", desc: "Stake penalty emitted by authority." },
  { name: "AttestationSubmitted", desc: "Signed network measurement committed." },
  { name: "ConfigUpdated", desc: "Registry configuration changed." },
] as const;

export type RegionScoreView = {
  id: string;
  name: string;
  score: number;
  reachability: number;
  latency: number;
  rtt: number;
  observers: number;
  stale: boolean;
};

export type ObserverView = {
  pubkey: string;
  region: string;
  active: boolean;
  stake: number;
  slot: number;
  reach: number;
  rtt: number;
  score: number;
  p95Rtt?: number;
  slotLatency?: number;
  tpuReachable?: number;
  tpuProbed?: number;
  registeredAt?: number;
  attestationCount?: number;
};

export type SonarSnapshot = {
  source: "placeholder" | "onchain";
  fetchedAt: number;
  programId: string;
  history: number[];
  regions: RegionScoreView[];
  observers: ObserverView[];
  network: {
    score: number;
    reachability: number;
    slotLatency: number;
    activeObservers: number;
    totalObservers: number;
    activeRegions: number;
    totalRegions: number;
    lastUpdatedSlot: number;
    totalAttestations: number;
    updatedSeconds: number;
  };
  registry: {
    paused: boolean;
    observerCap: number;
    minStakeSol: number;
  };
  error?: string;
};

export const PLACEHOLDER_SNAPSHOT: SonarSnapshot = {
  source: "placeholder",
  fetchedAt: Date.now(),
  programId: PROGRAM_ID,
  history: [...HISTORY],
  regions: REGION_SCORES.map((region) => ({ ...region })),
  observers: OBSERVERS.map((observer) => ({ ...observer })),
  network: {
    score: 87,
    reachability: 89,
    slotLatency: 271,
    activeObservers: OBSERVERS.filter((observer) => observer.active).length,
    totalObservers: OBSERVERS.length,
    activeRegions: REGION_SCORES.filter((region) => !region.stale).length,
    totalRegions: REGION_SCORES.length,
    lastUpdatedSlot: 287442108,
    totalAttestations: 482910,
    updatedSeconds: 2,
  },
  registry: {
    paused: false,
    observerCap: 100,
    minStakeSol: 0.1,
  },
};
