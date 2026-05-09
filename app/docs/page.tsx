"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const sections = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Install" },
  { id: "quickstart", label: "Quick start" },
  { id: "client", label: "Client" },
  { id: "reads", label: "Read methods" },
  { id: "types", label: "Types" },
  { id: "helpers", label: "Helpers" },
  { id: "events", label: "Events" },
  { id: "instructions", label: "Instructions" },
  { id: "pdas", label: "PDAs" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const CODE = {
  install: `pnpm add s0nar-sdk @solana/web3.js`,

  quickstart: `import { Connection } from "@solana/web3.js";
import { createS0narClient } from "s0nar-sdk";

const connection = new Connection("https://api.devnet.solana.com");
const client = createS0narClient({ connection });

const health = await client.getNetworkHealth();

console.log(health.healthScore);         // 0–100
console.log(health.tpuReachabilityPct);  // validator reachability %
console.log(health.avgSlotLatencyMs);    // slot propagation latency
console.log(health.agaveCount);          // validator client diversity`,

  client: `const client = createS0narClient({
  connection,   // required — Solana RPC connection
  programId,    // optional — defaults to s0nar devnet program
  wallet,       // optional — needed for instruction builders
});`,

  events: `const id = client.onAttestationSubmitted((event, slot) => {
  console.log(event.observer.toBase58(), event.score, slot);
});

await client.removeEventListener(id);`,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <button
      onClick={copy}
      className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-white/36 transition-colors hover:border-white/20 hover:text-white/60"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

type TokenKind =
  | "comment"
  | "string"
  | "keyword"
  | "builtin"
  | "sdk"
  | "method"
  | "number"
  | "operator"
  | "plain";

interface Token {
  kind: TokenKind;
  value: string;
}

const KEYWORDS = new Set([
  "import",
  "from",
  "const",
  "let",
  "var",
  "await",
  "async",
  "return",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "export",
  "default",
  "function",
  "class",
  "extends",
  "interface",
  "type",
  "as",
  "of",
  "in",
  "if",
  "else",
]);
const BUILTINS = new Set(["console", "Promise", "Connection", "PublicKey"]);
const SDK_IDENTS = new Set([
  "createS0narClient",
  "getNetworkHealth",
  "onAttestationSubmitted",
  "removeEventListener",
  "s0nar-sdk",
  "s0nar_sdk",
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  // Order matters — first match wins
  const patterns: [TokenKind, RegExp][] = [
    ["comment", /\/\/[^\n]*/],
    ["string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/],
    ["number", /\b\d+(?:\.\d+)?\b/],
    ["operator", /[{}()[\]<>.,;:=+\-*/%&|!?]/],
    ["sdk", new RegExp(`\\b(?:${[...SDK_IDENTS].join("|")})\\b`)],
    ["builtin", new RegExp(`\\b(?:${[...BUILTINS].join("|")})\\b`)],
    ["keyword", new RegExp(`\\b(?:${[...KEYWORDS].join("|")})\\b`)],
    ["method", /\b[a-z][a-zA-Z0-9]*(?=\()/],
    ["plain", /\S+|\s+/],
  ];

  const combined = new RegExp(
    patterns.map(([, re]) => `(${re.source})`).join("|"),
    "g",
  );

  let match: RegExpExecArray | null;
  while ((match = combined.exec(code)) !== null) {
    for (let i = 0; i < patterns.length; i++) {
      if (match[i + 1] !== undefined) {
        tokens.push({ kind: patterns[i][0], value: match[i + 1] });
        break;
      }
    }
  }
  return tokens;
}

const TOKEN_COLORS: Record<TokenKind, string> = {
  comment: "rgba(255,255,255,0.28)",
  string: "#e5a46b",
  keyword: "#8b9cf4",
  builtin: "#c792ea",
  sdk: "#2DE19B",
  method: "#7dd3c8",
  number: "#f78c6c",
  operator: "rgba(255,255,255,0.38)",
  plain: "rgba(255,255,255,0.68)",
};

function HighlightedCode({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[tok.kind] }}>
          {tok.value}
        </span>
      ))}
    </>
  );
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

const SHELL_MANAGERS = new Set(["pnpm", "npm", "yarn", "npx"]);
const SHELL_CMDS = new Set([
  "add",
  "install",
  "remove",
  "uninstall",
  "run",
  "init",
  "create",
]);

function HighlightedShell({ code }: { code: string }) {
  return (
    <>
      {code.split(/(\s+)/).map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
        if (SHELL_MANAGERS.has(part))
          return (
            <span key={i} style={{ color: "#2DE19B" }}>
              {part}
            </span>
          );
        if (SHELL_CMDS.has(part))
          return (
            <span key={i} style={{ color: "#8b9cf4" }}>
              {part}
            </span>
          );
        if (part.startsWith("@") || part.includes("/"))
          return (
            <span key={i} style={{ color: "#e5a46b" }}>
              {part}
            </span>
          );
        if (part.startsWith("-"))
          return (
            <span key={i} style={{ color: "rgba(255,255,255,0.36)" }}>
              {part}
            </span>
          );
        return (
          <span key={i} style={{ color: "rgba(255,255,255,0.72)" }}>
            {part}
          </span>
        );
      })}
    </>
  );
}

function CodeBlock({
  code,
  lang = "typescript",
}: {
  code: string;
  lang?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-white/8">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.02] px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">
          {lang}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto bg-black/60 p-4 font-mono text-[12px] leading-7">
        <code>
          {lang === "shell" ? (
            <HighlightedShell code={code} />
          ) : (
            <HighlightedCode code={code} />
          )}
        </code>
      </pre>
    </div>
  );
}

function Table({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-white/8">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.025]">
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-white/8 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-white/8 last:border-0 hover:bg-white/[0.015] transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5 align-top text-[12.5px] leading-6 text-white/52"
                >
                  {ci === 0 ? (
                    <code className="font-mono text-[#2DE19B] text-[12px]">
                      {cell}
                    </code>
                  ) : ci === 1 ? (
                    <code className="font-mono text-white/68 text-[12px]">
                      {cell}
                    </code>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-white/8 border-l-[2px] border-l-[#2DE19B]/50 bg-[rgba(45,225,155,0.03)] px-4 py-3 text-[13px] leading-7 text-white/52">
      {children}
    </div>
  );
}

function TypeGroup({
  name,
  rows,
}: {
  name: string;
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="space-y-3">
      <span className="inline-block rounded-md border border-[#2DE19B]/20 bg-[rgba(45,225,155,0.08)] px-2.5 py-1 font-mono text-[12.5px] text-[#2DE19B]">
        {name}
      </span>
      <Table columns={["Field", "Type", "Description"]} rows={rows} />
    </div>
  );
}

function SectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 border-b border-white/8 py-12 first:pt-0 last:border-0"
    >
      <h2 className="mb-6 text-[15px] font-medium tracking-[-0.02em] text-white">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState<SectionId>("overview");
  const [scrolled, setScrolled] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // Scroll-spy
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const handler = () => {
      const top = article.scrollTop + 80;
      setScrolled(article.scrollTop > 4);
      const atBottom =
        article.scrollTop + article.clientHeight >= article.scrollHeight - 4;
      if (atBottom) {
        setActiveId(sections.at(-1)!.id);
        return;
      }

      const all = sections.map(({ id }) => ({
        id,
        top: document.getElementById(id)?.offsetTop ?? 0,
      }));
      const active = all.filter((s) => s.top <= top).at(-1);
      if (active) setActiveId(active.id as SectionId);
    };

    article.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => article.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    const article = articleRef.current;
    const el = document.getElementById(id);
    if (article && el) article.scrollTop = el.offsetTop - 24;
  };

  return (
    <main className="mx-auto mt-40 grid h-[calc(100vh-5.6rem)] w-full max-w-[88rem] grid-cols-1 overflow-hidden bg-black px-6 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-10">
      {/* ── Sidebar nav ─────────────────────────────────────── */}
      <aside className="scrollbar-none hidden min-h-0 overflow-y-auto border-r border-white/8 py-8 pr-5 lg:block">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/28">
          s0nar SDK
        </p>
        <nav className="grid gap-0.5" aria-label="Docs navigation">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={[
                "rounded-[8px] px-3 py-2 text-left text-[13px] transition-colors",
                activeId === id
                  ? "bg-white/[0.05] text-[#2DE19B]"
                  : "text-white/40 hover:bg-white/[0.03] hover:text-white/70",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="relative min-h-0 min-w-0">
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-black via-black/80 to-transparent transition-opacity duration-200",
            scrolled ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <article
          ref={articleRef}
          className="scrollbar-none h-full min-h-0 min-w-0 overflow-y-auto py-8 lg:px-10 xl:px-14"
        >
          {/* Overview / header */}
          <header
            id="overview"
            className="scroll-mt-6 border-b border-white/8 pb-9"
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {["v0.3.0", "TypeScript", "MIT"].map((t) => (
                <span
                  key={t}
                  className="rounded-[8px] border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-white/40"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-medium leading-none tracking-[-0.06em] text-white">
              s0nar SDK
            </h1>

            <p className="mt-4 max-w-lg text-[13.5px] leading-7 text-white/48">
              Read Solana network health from on-chain oracle accounts.{" "}
              <code className="text-white/60">s0nar-sdk</code> wraps oracle
              accounts into typed objects and exposes read methods, instruction
              builders, event listeners, PDA helpers, and score utilities.
            </p>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/8 pt-5 text-[12px] text-white/34">
              <span>
                Package: <code className="text-white/52">s0nar-sdk</code>
              </span>
              <span>
                Peer dep: <code className="text-white/52">@solana/web3.js</code>
              </span>
              <Link
                href="https://www.npmjs.com/package/s0nar-sdk"
                className="font-medium text-[#2DE19B] hover:text-white"
              >
                View on npm ↗
              </Link>
            </div>
          </header>

          {/* Install */}
          <SectionBlock id="install" title="Install">
            <CodeBlock code={CODE.install} lang="shell" />
            <p className="text-[13px] leading-7 text-white/46">
              A wallet is optional — only required when composing write
              transactions.
            </p>
          </SectionBlock>

          {/* Quick start */}
          <SectionBlock id="quickstart" title="Quick start">
            <CodeBlock code={CODE.quickstart} />
            <Callout>
              Client diversity counts and stake-weighted reach are returned on
              <code className="text-white/60"> NetworkHealth</code>,
              <code className="text-white/60"> RegionScore</code>, and
              <code className="text-white/60"> Attestation</code>.
            </Callout>
          </SectionBlock>

          {/* Client */}
          <SectionBlock id="client" title="Client">
            <CodeBlock code={CODE.client} />
            <Table
              columns={["Option", "Type", "Required", "Description"]}
              rows={[
                ["connection", "Connection", "Yes", "Solana RPC connection."],
                [
                  "programId",
                  "PublicKey",
                  "No",
                  "Override the default s0nar devnet program ID.",
                ],
                [
                  "wallet",
                  "Wallet",
                  "No",
                  "Anchor wallet for instruction builders.",
                ],
              ]}
            />
          </SectionBlock>

          {/* Read methods */}
          <SectionBlock id="reads" title="Read methods">
            <Table
              columns={["Method", "Returns", "Description"]}
              rows={[
                [
                  "getNetworkHealth()",
                  "Promise<NetworkHealth>",
                  "Global score, latency, reachability, and per-region scores.",
                ],
                [
                  "getRegistry()",
                  "Promise<Registry>",
                  "Program authority, observer counts, stake config, and pause state.",
                ],
                [
                  "getObserver(pubkey)",
                  "Promise<Observer>",
                  "Single observer account by wallet public key.",
                ],
                [
                  "getAllObservers()",
                  "Promise<Observer[]>",
                  "All observer accounts via getProgramAccounts.",
                ],
                [
                  "getObserversByRegion(region)",
                  "Promise<Observer[]>",
                  "Observer accounts filtered by Region enum.",
                ],
              ]}
            />
            <p className="text-[13px] leading-7 text-white/46">
              Read methods perform direct RPC account reads and return plain
              TypeScript objects. For production UIs, wrap reads in retry and
              cache logic.
            </p>
          </SectionBlock>

          {/* Types */}
          <SectionBlock id="types" title="Types">
            <TypeGroup
              name="NetworkHealth"
              rows={[
                ["healthScore", "number", "Global 0–100 health score."],
                [
                  "tpuReachabilityPct",
                  "number",
                  "Percent of probed TPU endpoints reachable.",
                ],
                [
                  "avgSlotLatencyMs",
                  "number",
                  "Average slot propagation latency in ms.",
                ],
                [
                  "activeObserverCount",
                  "number",
                  "Observers included in the current score.",
                ],
                ["activeRegionCount", "number", "Regions with active data."],
                ["lastUpdatedSlot", "bigint", "Slot of the last score update."],
                [
                  "lastUpdatedTs",
                  "bigint",
                  "Unix timestamp of the last score update.",
                ],
                [
                  "totalAttestations",
                  "bigint",
                  "Lifetime submitted attestations.",
                ],
                [
                  "regionScores",
                  "RegionScore[]",
                  "Per-region score breakdown.",
                ],
                ["minHealthEver", "number | null", "Lowest global score observed."],
                ["maxHealthEver", "number", "Highest global score observed."],
                ["agaveCount", "number", "Network-wide Agave validators seen."],
                [
                  "firedancerCount",
                  "number",
                  "Network-wide Firedancer validators seen.",
                ],
                ["jitoCount", "number", "Network-wide Jito validators seen."],
                [
                  "solanaLabsCount",
                  "number",
                  "Network-wide Solana Labs validators seen.",
                ],
                [
                  "otherCount",
                  "number",
                  "Network-wide other-client validators seen.",
                ],
              ]}
            />
            <TypeGroup
              name="RegionScore"
              rows={[
                ["region", "Region", "Region enum value."],
                [
                  "observerCount",
                  "number",
                  "Observer contributions in this aggregate.",
                ],
                ["healthScore", "number", "Regional 0-100 health score."],
                [
                  "reachabilityPct",
                  "number",
                  "Regional TPU reachability percent.",
                ],
                ["avgRttUs", "number", "Average RTT in microseconds."],
                ["slotLatencyMs", "number", "Slot propagation latency in ms."],
                [
                  "agaveCount",
                  "number",
                  "Agave validators seen in this region.",
                ],
                [
                  "firedancerCount",
                  "number",
                  "Firedancer validators seen in this region.",
                ],
                ["jitoCount", "number", "Jito validators seen in this region."],
                [
                  "solanaLabsCount",
                  "number",
                  "Solana Labs validators seen in this region.",
                ],
                [
                  "otherCount",
                  "number",
                  "Other-client validators seen in this region.",
                ],
                [
                  "reachableStakePct",
                  "number",
                  "Stake-weighted reachability for this region.",
                ],
              ]}
            />
            <TypeGroup
              name="Observer"
              rows={[
                ["publicKey", "PublicKey", "Observer account address."],
                ["authority", "PublicKey", "Wallet authorized to report."],
                ["region", "Region", "Observer region enum value."],
                ["stakeLamports", "bigint", "Registered stake amount."],
                [
                  "lastAttestationSlot",
                  "bigint",
                  "Latest submitted attestation slot.",
                ],
                ["attestationCount", "bigint", "Total attestations submitted."],
                [
                  "latestAttestation",
                  "Attestation",
                  "Latest measurement payload.",
                ],
                ["isActive", "boolean", "Whether the observer is active."],
              ]}
            />
            <TypeGroup
              name="Attestation"
              rows={[
                ["slot", "bigint", "Solana slot measured."],
                ["timestamp", "bigint", "Measurement timestamp."],
                ["avgRttUs", "number", "Average RTT in microseconds."],
                ["p95RttUs", "number", "P95 RTT in microseconds."],
                ["slotLatencyMs", "number", "Slot propagation latency in ms."],
                ["tpuReachable", "number", "Reachable validators probed."],
                ["tpuProbed", "number", "Total validators probed."],
                ["agaveCount", "number", "Agave validators seen."],
                ["firedancerCount", "number", "Firedancer validators seen."],
                ["jitoCount", "number", "Jito validators seen."],
                ["solanaLabsCount", "number", "Solana Labs validators seen."],
                ["otherCount", "number", "Other-client validators seen."],
                ["reachableStakePct", "number", "Reachable stake share."],
              ]}
            />
            <TypeGroup
              name="Registry"
              rows={[
                ["authority", "PublicKey", "Program authority."],
                [
                  "pendingAuthority",
                  "PublicKey | null",
                  "In-progress authority transfer target.",
                ],
                [
                  "minStakeLamports",
                  "bigint",
                  "Minimum observer stake to register.",
                ],
                ["observerCount", "number", "Total registered observers."],
                ["activeCount", "number", "Currently active observers."],
                ["maxObservers", "number", "Registry capacity."],
                ["paused", "boolean", "Whether writes are paused."],
                ["version", "number", "Registry schema version."],
              ]}
            />
          </SectionBlock>

          {/* Helpers */}
          <SectionBlock id="helpers" title="Helpers">
            <Table
              columns={["Function", "Returns", "Description"]}
              rows={[
                [
                  "healthStatus(health, currentSlot?)",
                  '"healthy" | "degraded" | "critical" | "stale"',
                  "Human-readable health state.",
                ],
                [
                  "isStale(health, currentSlot)",
                  "boolean",
                  "True when oracle data is older than 150 slots.",
                ],
                [
                  "isObserverStale(observer, currentSlot)",
                  "boolean",
                  "True when an observer has not reported recently.",
                ],
                [
                  "isDegraded(health, threshold?)",
                  "boolean",
                  "True when score is below threshold (default 70).",
                ],
                [
                  "regionLabel(region)",
                  "string",
                  "UI label for a Region enum value.",
                ],
                [
                  "lamportsToSol(lamports)",
                  "number",
                  "Converts bigint lamports to SOL.",
                ],
                [
                  "latencyScore(slotLatencyMs)",
                  "number",
                  "Computes the latency component of the score formula.",
                ],
                [
                  "isConsensusCritical(reachableStakePct)",
                  "boolean",
                  "True when stake reach is below the 67% finality threshold.",
                ],
                [
                  "stakeReachStatus(reachableStakePct)",
                  '"healthy" | "degraded" | "critical"',
                  "Classifies stake-weighted reachability.",
                ],
                [
                  "dominantClient(region)",
                  '"agave" | "firedancer" | "jito" | "other"',
                  "Returns the largest validator client count in a region.",
                ],
                [
                  "clientDiversityIndex(region)",
                  "number",
                  "0-100 score; higher means a more even client distribution.",
                ],
              ]}
            />
            <div>
              <h3 className="mb-3 text-[13px] font-medium text-white/70">
                Score formula
              </h3>
              <div className="rounded-[10px] border border-white/8 bg-black/60 p-4 font-mono text-[12px] leading-7">
                <p className="text-white/60">
                  <span className="text-[#2DE19B]">healthScore</span>
                  {" = (reachabilityPct × 0.70) + (latencyScore × 0.30)"}
                </p>
                <p className="text-white/60">
                  <span className="text-[#2DE19B]">latencyScore</span>
                  {" = max(0, (400 − slotLatencyMs) × 100 / 400)"}
                </p>
              </div>
            </div>
          </SectionBlock>

          {/* Events */}
          <SectionBlock id="events" title="Events">
            <CodeBlock code={CODE.events} />
            <Table
              columns={["Method", "Event type"]}
              rows={[
                ["onAttestationSubmitted(cb)", "AttestationSubmittedEvent"],
                ["onObserverRegistered(cb)", "ObserverRegisteredEvent"],
                ["onObserverDeregistered(cb)", "ObserverDeregisteredEvent"],
                ["onObserverSlashed(cb)", "ObserverSlashedEvent"],
                ["onConfigUpdated(cb)", "ConfigUpdatedEvent"],
                ["removeEventListener(id)", "Promise<void>"],
              ]}
            />
          </SectionBlock>

          {/* Instructions */}
          <SectionBlock id="instructions" title="Instruction builders">
            <p className="text-[13px] leading-7 text-white/46">
              All builders return{" "}
              <code className="text-white/60">
                Promise&lt;TransactionInstruction&gt;
              </code>
              . Compose the instruction into your own transaction and signing
              flow.
            </p>
            <Table
              columns={["Builder", "Caller", "Description"]}
              rows={[
                [
                  "registerObserver(observer, region)",
                  "New observer",
                  "Register a new observer with a region.",
                ],
                [
                  "submitAttestation(authority, params)",
                  "Existing observer",
                  "Submit a new attestation payload.",
                ],
                [
                  "deregisterObserver(caller, observerWallet)",
                  "Observer or authority",
                  "Remove an observer from the registry.",
                ],
                [
                  "crankAggregation(cranker, observerAccounts)",
                  "Anyone",
                  "Aggregate observer scores on-chain.",
                ],
                [
                  "initialize(authority, minStakeLamports, maxObservers)",
                  "Authority",
                  "First-time program setup.",
                ],
                [
                  "slashObserver(authority, observerWallet, treasury, slashBps)",
                  "Authority",
                  "Slash an observer's stake by basis points.",
                ],
                [
                  "updateConfig(authority, params)",
                  "Authority",
                  "Update program configuration.",
                ],
                [
                  "proposeAuthority(authority, newAuthority)",
                  "Authority",
                  "Initiate a two-step authority transfer.",
                ],
                [
                  "acceptAuthority(newAuthority)",
                  "New authority",
                  "Confirm a pending authority transfer.",
                ],
              ]}
            />
            <Callout>
              <strong className="font-medium text-white/70">
                Two-step transfer:
              </strong>{" "}
              call <code className="text-white/60">proposeAuthority</code>{" "}
              first, then <code className="text-white/60">acceptAuthority</code>{" "}
              from the new authority wallet to confirm.
            </Callout>
          </SectionBlock>

          {/* PDAs */}
          <SectionBlock id="pdas" title="PDAs & regions">
            <Table
              columns={["Helper", "Returns"]}
              rows={[
                ["getRegistryPDA(programId?)", "[PublicKey, number]"],
                ["getNetworkHealthPDA(programId?)", "[PublicKey, number]"],
                ["getObserverPDA(observer, programId?)", "[PublicKey, number]"],
              ]}
            />
            <div>
              <h3 className="mb-3 text-[13px] font-medium text-white/70">
                Region enum
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Asia",
                  "US",
                  "EU",
                  "SouthAmerica",
                  "Africa",
                  "Oceania",
                  "Other",
                ].map((r) => (
                  <code
                    key={r}
                    className="rounded-[7px] border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[12px] text-white/52"
                  >
                    Region.{r}
                  </code>
                ))}
              </div>
            </div>
          </SectionBlock>
        </article>
      </div>
    </main>
  );
}
