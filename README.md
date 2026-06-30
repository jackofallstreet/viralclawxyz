<div align="center">

```
 ██╗   ██╗██╗██████╗  █████╗ ██╗      ██████╗██╗      █████╗ ██╗    ██╗
 ██║   ██║██║██╔══██╗██╔══██╗██║     ██╔════╝██║     ██╔══██╗██║    ██║
 ██║   ██║██║██████╔╝███████║██║     ██║     ██║     ███████║██║ █╗ ██║
 ╚██╗ ██╔╝██║██╔══██╗██╔══██║██║     ██║     ██║     ██╔══██║██║███╗██║
  ╚████╔╝ ██║██║  ██║██║  ██║███████╗╚██████╗███████╗██║  ██║╚███╔███╔╝
   ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝
```

**The Synchronization Intelligence Layer — on-chain signal, alpha, and content, in sync.**

`v0.2.0` · `Node 24+` · `pnpm 9+` · `Python 3.11+`

</div>

---

## What this is

ViralClaw is a multi-signal intelligence layer specialized in capturing viral trends — with on-chain analysis as its core strength. It doesn't just detect signals, it synchronizes them: on-chain activity, social velocity, and narrative momentum are correlated into a single intelligence event, delivered as two outputs in lockstep — **participation alpha for degens** and **content intelligence for creators**.

It's not a dashboard. It's not a social listening tool. It's a synchronization layer: on-chain data, social signal, and narrative timing are fused in real time so that alpha and content are never out of sync with what's actually happening on-chain.

The core thesis: the edge belongs to those who see on-chain first and move before the crowd — and right now, alpha hunters and content creators are reacting to the same signal hours apart, through completely disconnected tools. ViralClaw synchronizes them into one pipeline, one signal, two outputs, zero lag between them.

---

## Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15 (App Router) |
| Signal runtime | LangGraph (Python) |
| Memory / vector | Qdrant |
| Memory / graph | Neo4j |
| Memory / cache | Redis |
| Backend services | FastAPI (Python) |
| Database | Supabase (Postgres) |
| Auth / waitlist | Privy (email) |
| LLM | Claude Sonnet / Opus via Anthropic API |
| Deploy — frontend | Vercel |
| Deploy — services | Fly.io |

---

## Signal architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SIGNAL ORCHESTRATOR                                         │
│  Routes raw signal → scoring → interpretation → review gates │
└──────────┬──────────────────────────────────────────────────┘
           │
    ┌──────▼───────────────────────────────────────────────┐
    │  01  On-Chain Scanner                                  │
    │      17-chain real-time indexing — wallets, bridges,   │
    │      DEX activity, contract deployments                │
    ├──────────────────────────────────────────────────────┤
    │  02  Social Velocity Engine                            │
    │      Narrative momentum across CT, Farcaster, Telegram │
    ├──────────────────────────────────────────────────────┤
    │  03  Trend Scoring Model                               │
    │      Signal strength + wallet reputation +              │
    │      cross-chain correlation + social lag               │
    ├──────────────────────────────────────────────────────┤
    │  04  Narrative Interpreter                              │
    │      Context, window estimation, pattern matching      │
    ├──────────────────────────────────────────────────────┤
    │  05  Alpha Engine          │  05b  Content Engine       │
    │      Degen participation   │  Creator narrative briefs, │
    │      briefs, entry context │  angles, publish timing    │
    ├──────────────────────────────────────────────────────┤
    │  06  Signal Memory                                      │
    │      Outcome tracking → model + scoring feedback loop   │
    └──────────────────────────────────────────────────────┘
```

All modules share a persistent memory layer: Qdrant (signal embeddings), Neo4j (cross-chain correlation graph), Redis (live signal state). Signal Memory is what makes the system compound — every outcome improves the next score.

**Hard constraint:** Alpha Engine and Content Engine never deliver a brief without passing through the configured review gate. This is not configurable away — only on/off per brief type.

---

## Local setup

**Prerequisites:** Node 24+, pnpm 9+, Python 3.11+, Docker

```bash
# 1. Clone
git clone https://github.com/viralclawlabs/viralclaw.git
cd viralclaw

# 2. Install
pnpm install

# 3. Env
cp .env.example .env

# 4. Memory services
docker compose -f infra/docker-compose.yml up -d

# 5. Python deps (per service)
cd services/orchestrator && pip install -r requirements.txt
cd ../intelligence && pip install -r requirements.txt

# 6. Start
pnpm dev
```

| App | URL |
|---|---|
| Landing | http://localhost:3000 |
| Dashboard | http://localhost:3001 |
| Orchestrator | http://localhost:8000 |
| Intelligence | http://localhost:8001 |

Full setup: [`docs/onboarding.md`](docs/onboarding.md)

---

## Scripts

```bash
pnpm dev          # all apps in watch mode
pnpm build        # production build
pnpm lint         # lint all packages
pnpm type-check   # TS check across monorepo
pnpm test         # run all tests
pnpm format       # prettier across .ts .tsx .md .json
pnpm clean        # wipe build artifacts + node_modules
```

---

## Docs

| Doc | What's in it |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System layers, data flow, service map |
| [`docs/signal-specs.md`](docs/signal-specs.md) | Each module — role, inputs, outputs, scoring |
| [`docs/api.md`](docs/api.md) | All service API endpoints |
| [`docs/memory-system.md`](docs/memory-system.md) | Qdrant + Neo4j + Redis schema |
| [`docs/onboarding.md`](docs/onboarding.md) | Full local + production setup |

---

## Status

Pre-alpha. Signal architecture and module interfaces are defined. On-Chain Scanner and Social Velocity Engine are actively being built; Trend Scoring, Alpha Engine, and Content Engine are next. First cohort gets early access — and founder pricing, locked in permanently — when Phase 1 ships.

---

## License

MIT
