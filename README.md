<p align="center">
  <img src="public/sonar-logo.svg" alt="s0nar" width="64" height="64" />
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
- **Observer Network** — Live view of observer nodes, their stakes, attestation history, and activity.
- **On-chain State** — Every metric is sourced from the same oracle accounts that protocols can inspect directly.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with interactive globe, features, and CTA |
| `/network` | Live network overview — global health, regional scores, client diversity, attestation history |
| `/dashboard` | Detailed dashboard with observer breakdown and network metrics |
| `/observers` | Observer list with per-observer drill-down (`/observers/[pubkey]`) |
| `/regions` | Regional health cards |
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
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `S0NAR_PROGRAM_ID` | s0nar devnet program ID | Override the on-chain program address |

> Both variables also support `NEXT_PUBLIC_` prefixes for client-side access.

## Architecture

```
s0nar-web/
├── app/
│   ├── api/sonar/          # Server-side RPC proxy with 10s TTL cache
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
│   └── utils.ts            # Utility helpers
└── public/                 # Static assets (logos, globe data)
```

### Data Flow

1. **`/api/sonar`** — A Next.js API route that reads on-chain accounts via `s0nar-sdk`, fetches attestation history from transaction logs, and returns a cached `SonarSnapshot`.
2. **`useSonarSnapshot`** — A client-side hook that polls the API and provides the snapshot to dashboard pages.
3. **Components** — Render the snapshot data as health scores, region cards, attestation tables, and client diversity charts.

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
