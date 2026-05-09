<p align="center">
  <img src="public/logo.svg" alt="s0nar" width="320" />
</p>

<h1 align="center">s0nar-web</h1>

<p align="center">
  <strong>The on-chain pulse of Solana's network health.</strong><br/>
  A real-time dashboard that reads Solana network health from on-chain oracle accounts and visualises it across regions, observers, and validator client diversity.
</p>

<p align="center">
  <a href="https://github.com/s0nar-nw/s0nar-web"><img src="https://img.shields.io/badge/status-devnet-2de19b?style=flat-square" alt="Status" /></a>
  <a href="https://www.npmjs.com/package/s0nar-sdk"><img src="https://img.shields.io/npm/v/s0nar-sdk?style=flat-square&color=2de19b&label=s0nar-sdk" alt="SDK version" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
</p>

---

## Overview

**s0nar** compares observer reports from different geographic regions and writes aggregated network health data on-chain. `s0nar-web` is the frontend that reads those on-chain accounts and presents them in a human-readable dashboard.

- **Health Score** — A 0–100 global score derived from reachability (70%) and latency (30%).
- **Regional Breakdown** — Per-region scores for Asia, US, EU, South America, Africa, and Oceania.
- **Client Diversity** — Tracks validator client distribution (Agave, Firedancer, Jito, Solana Labs, Other).
- **Observer Network** — Live view of observer nodes, stakes, last-known health, attestation history, and activity.
- **Stable Attestation History** — Latest 10 attestations are served from a merged server-side history cache so partial RPC refreshes do not shrink the table.
- **On-chain State** — Every metric is sourced from the same oracle accounts that protocols can inspect directly.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with interactive globe, features, and CTA |
| `/network` | Live network overview — global health, regional scores, client diversity, attestation history |
| `/dashboard` | Detailed dashboard with observer breakdown and network metrics |
| `/observers` | Observer list with per-observer drill-down (`/observers/[pubkey]`) |
| `/regions` | Regional coverage map, last-known region fallback, and latest attested region |
| `/program` | On-chain program state explorer |
| `/docs` | SDK documentation with syntax-highlighted code examples |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | [Motion](https://motion.dev) (Framer Motion) |
| Globe | [COBE](https://cobe.vercel.app) |
| Blockchain | [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/), [s0nar-sdk](https://www.npmjs.com/package/s0nar-sdk) |
| UI | [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev), [React Icons](https://react-icons.github.io/react-icons/) |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/s0nar-nw/s0nar-web.git
cd s0nar-web

# Install dependencies and start the dev server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Server-only Solana RPC endpoint. Use this for paid RPC keys. |
| `S0NAR_PROGRAM_ID` | s0nar devnet program ID | Override the on-chain program address |

Do not put paid RPC keys in `NEXT_PUBLIC_*` variables. The browser only calls `/api/sonar`; RPC credentials should stay server-side.

## Architecture

```
s0nar-web/
├── app/
│   ├── api/sonar/          # Server-side RPC proxy with snapshot + history cache
│   ├── dashboard/          # Dashboard page
│   ├── docs/               # SDK documentation
│   ├── network/            # Network overview
│   ├── observers/          # Observer list & detail pages
│   ├── regions/            # Regional health
│   ├── program/            # On-chain program state
│   ├── layout.tsx          # Root layout with app shell
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/          # Dashboard panels (shell, regions, client diversity)
│   ├── home/               # Landing page sections (hero, features, CTA, footer)
│   ├── ui/                 # Shared UI primitives (COBE globe)
│   ├── navbar.tsx          # Main navigation
│   └── sonar-ui.tsx        # Design system components (Panel, StatusPill, etc.)
├── hooks/
│   └── use-sonar-snapshot  # Client-side data fetching hook
├── lib/
│   ├── s0nar-idl.ts        # Program IDL
│   ├── sonar-static.ts     # Type definitions & constants
│   ├── time-format.ts      # Relative freshness formatting
│   └── utils.ts            # Utility helpers
└── public/                 # Static assets (logos, globe data)
```

### Data Flow

1. **`/api/sonar`** — Reads on-chain accounts via `s0nar-sdk`, fetches attestation events from transaction logs, merges them with a server-side history cache, and returns a cached `SonarSnapshot`.
2. **Attestation history cache** — Keeps a stable internal history window, deduped by observer and slot. The public snapshot exposes the latest 10 rows.
3. **`useSonarSnapshot`** — Polls `/api/sonar` every few seconds and keeps the current snapshot while refreshes are in flight.
4. **Components** — Render last-known network, region, observer, attestation, and client-diversity data with stale/inactive states called out explicitly.

## Scripts

```bash
pnpm dev        # Start dev server (installs deps automatically)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## SDK

The frontend is powered by [`s0nar-sdk`](https://www.npmjs.com/package/s0nar-sdk) — a TypeScript SDK for reading Solana network health from on-chain oracle accounts. See the [in-app docs](/docs) or the [npm package](https://www.npmjs.com/package/s0nar-sdk) for the full API reference.

```typescript
import { createS0narClient } from "s0nar-sdk";
import { Connection } from "@solana/web3.js";

const client = createS0narClient({
  connection: new Connection("https://api.devnet.solana.com"),
});

const health = await client.getNetworkHealth();
console.log(health.healthScore); // 0–100
```

## License

MIT
