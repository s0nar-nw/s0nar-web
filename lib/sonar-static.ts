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
  recentAttestations?: AttestationHistoryItem[];
};

export type AttestationHistoryItem = {
  observer: string;
  region: string;
  score: number;
  reachability: number;
  slotLatency: number;
  slot: number;
  timestamp?: number;
  signature: string;
};

export type SonarSnapshot = {
  source: "onchain";
  fetchedAt: number;
  programId: string;
  history: number[];
  attestationHistory: AttestationHistoryItem[];
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
};
