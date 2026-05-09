export const REGIONS = [
  "All",
  "Asia",
  "US",
  "EU",
  "South America",
  "Africa",
  "Oceania",
  "Other",
] as const;

export const CLIENT_COLORS = {
  Agave: "#2de19b",
  Firedancer: "#60a5fa",
  Jito: "#f59e0b",
  Labs: "rgba(255,255,255,0.18)",
  Other: "rgba(255,255,255,0.18)",
  Unknown: "rgba(245,255,249,0.36)",
} as const;

export type ClientDiversityItem = {
  name: keyof typeof CLIENT_COLORS;
  count: number;
  color: string;
};

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
  {
    name: "RegistryAccount",
    seeds: '[b"registry"]',
    size: "65B",
    desc: "Global config, operator authority, stake parameters.",
  },
  {
    name: "NetworkHealthAccount",
    seeds: '[b"network_health"]',
    size: "632B",
    desc: "Canonical oracle surface for CPI consumers.",
  },
  {
    name: "ObserverAccount",
    seeds: '[b"observer", pubkey]',
    size: "128B",
    desc: "Per-observer state, stake escrow, latest attestation.",
  },
] as const;

export const INSTRUCTIONS = [
  {
    name: "initialize",
    caller: "deployer",
    desc: "Bootstraps registry and network health accounts.",
  },
  {
    name: "register_observer",
    caller: "observer daemon",
    desc: "Creates observer PDA and escrows stake.",
  },
  {
    name: "submit_attestation",
    caller: "observer daemon",
    desc: "Publishes reachability, RTT, slot latency, client diversity, and stake-weighted reach.",
  },
  {
    name: "crank_aggregation",
    caller: "permissionless",
    desc: "Recomputes regional and global scores.",
  },
  {
    name: "deregister_observer",
    caller: "observer or authority",
    desc: "Closes active participation and returns stake.",
  },
  {
    name: "slash_observer",
    caller: "authority",
    desc: "Penalizes malicious or stale observers.",
  },
  {
    name: "update_config",
    caller: "authority",
    desc: "Adjusts caps, stake threshold, and pause state.",
  },
  {
    name: "propose_authority",
    caller: "authority",
    desc: "Starts a two-step authority handoff.",
  },
  {
    name: "accept_authority",
    caller: "new authority",
    desc: "Accepts a pending authority handoff.",
  },
] as const;

export const REGISTRY_FIELDS = [
  { field: "authority", type: "Pubkey", desc: "Current admin authority." },
  {
    field: "pending_authority",
    type: "Option<Pubkey>",
    desc: "Two-step authority handoff target.",
  },
  {
    field: "min_stake_lamports",
    type: "u64",
    desc: "Stake floor required to register.",
  },
  {
    field: "observer_count",
    type: "u16",
    desc: "Total observers ever registered.",
  },
  {
    field: "active_count",
    type: "u16",
    desc: "Observers currently contributing.",
  },
  { field: "max_observers", type: "u16", desc: "Concurrent observer limit." },
  {
    field: "paused",
    type: "bool",
    desc: "Blocks register and submit while enabled.",
  },
  { field: "version", type: "u8", desc: "Schema version." },
] as const;

export const NETWORK_HEALTH_FIELDS = [
  { field: "health_score", type: "u8", desc: "Global score from 0 to 100." },
  {
    field: "tpu_reachability_pct",
    type: "u8",
    desc: "Average TPU success rate.",
  },
  { field: "avg_slot_latency_ms", type: "u32", desc: "Average slot latency." },
  {
    field: "active_observer_count",
    type: "u16",
    desc: "Active observers in score computation.",
  },
  {
    field: "active_region_count",
    type: "u16",
    desc: "Regions currently included.",
  },
  {
    field: "last_updated_slot",
    type: "u64",
    desc: "Freshness anchor for consumers.",
  },
  {
    field: "last_updated_ts",
    type: "i64",
    desc: "Unix timestamp for the last aggregate update.",
  },
  {
    field: "min_health_ever",
    type: "Option<u8>",
    desc: "Lowest global score observed since initialization.",
  },
  {
    field: "max_health_ever",
    type: "u8",
    desc: "Highest global score observed since initialization.",
  },
  {
    field: "total_attestations",
    type: "u64",
    desc: "Cumulative writes from the network.",
  },
  {
    field: "region_scores",
    type: "[RegionScore; 7]",
    desc: "Per-region score buckets.",
  },
  {
    field: "agave_count",
    type: "u16",
    desc: "Network-wide Agave validators seen.",
  },
  {
    field: "firedancer_count",
    type: "u16",
    desc: "Network-wide Firedancer validators seen.",
  },
  { field: "jito_count", type: "u16", desc: "Network-wide Jito validators seen." },
  {
    field: "solana_labs_count",
    type: "u16",
    desc: "Network-wide Solana Labs validators seen.",
  },
  {
    field: "other_count",
    type: "u16",
    desc: "Network-wide other-client validators seen.",
  },
] as const;

export const OBSERVER_FIELDS = [
  { field: "authority", type: "Pubkey", desc: "Wallet authorized to report." },
  { field: "region", type: "Region", desc: "Observer geographic region." },
  { field: "stake_lamports", type: "u64", desc: "Registered observer stake." },
  { field: "registered_at", type: "i64", desc: "Observer registration timestamp." },
  { field: "last_attestation_slot", type: "u64", desc: "Most recent attestation slot." },
  { field: "attestation_count", type: "u64", desc: "Total attestations submitted." },
  { field: "latest_attestation", type: "Attestation", desc: "Latest network measurement payload." },
  { field: "is_active", type: "bool", desc: "Whether the observer is active." },
] as const;

export const EVENTS = [
  {
    name: "ObserverRegistered",
    desc: "Observer accepted with stake escrowed.",
  },
  { name: "ObserverDeregistered", desc: "Observer removed from active set." },
  { name: "ObserverSlashed", desc: "Stake penalty emitted by authority." },
  {
    name: "AttestationSubmitted",
    desc: "Signed network measurement committed.",
  },
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
  reachableStakePct: number;
  agaveCount: number;
  firedancerCount: number;
  jitoCount: number;
  solanaLabsCount: number;
  otherCount: number;
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
  reachableStakePct?: number;
  agaveCount?: number;
  firedancerCount?: number;
  jitoCount?: number;
  solanaLabsCount?: number;
  otherCount?: number;
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
  reachableStakePct?: number;
};

export type SonarSnapshot = {
  source: "onchain";
  fetchedAt: number;
  programId: string;
  history: number[];
  attestationHistory: AttestationHistoryItem[];
  clientDiversity: ClientDiversityItem[];
  regions: RegionScoreView[];
  observers: ObserverView[];
  network: {
    score: number;
    reachability: number;
    rtt: number;
    slotLatency: number;
    activeObservers: number;
    totalObservers: number;
    activeRegions: number;
    totalRegions: number;
    lastUpdatedSlot: number;
    totalAttestations: number;
    updatedSeconds: number;
    agaveCount: number;
    firedancerCount: number;
    jitoCount: number;
    solanaLabsCount: number;
    otherCount: number;
  };
  registry: {
    paused: boolean;
    observerCap: number;
    minStakeSol: number;
  };
};
