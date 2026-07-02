# Contributing to ViralClaw

Thank you for considering contributing!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/viralclawlabs/viralclaw.git`
3. Install dependencies: `pnpm install`
4. Copy env: `cp .env.example .env`
5. Start memory services: `docker compose -f infra/docker-compose.yml up -d`
6. Start dev: `pnpm dev`

## Code Guidelines

- **TypeScript strict mode** everywhere in packages and apps
- **Zod schemas** for all data boundaries (API inputs, agent outputs)
- **ESLint + Prettier** — run `pnpm format` before committing
- **Meaningful commit messages** — use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- **Feature branches**: `feat/`, `fix/`, `refactor/`, `docs/`
- **No direct pushes to main** — always via PR

## Where to Contribute

- **Agent tools** — add new data sources to `packages/integrations/src/`
- **Agent logic** — improve prompt quality in `packages/agents/src/<agent>/prompts.ts`
- **Dashboard UI** — improve the Command Center in `apps/dashboard/`
- **Memory queries** — optimize Neo4j queries in `packages/memory/src/graph.ts`
- **Documentation** — improve any file in `docs/`
- **Tests** — add Vitest unit tests (packages) or Playwright E2E (apps)

## Pull Request Process

1. Create an issue describing the change and why
2. Branch from `main`: `git checkout -b feat/your-feature`
3. Make changes + add tests where possible
4. Run `pnpm lint && pnpm type-check && pnpm build`
5. Submit PR with a clear description of what changed and why
6. Wait for review — we aim to respond within 48 hours

## High-Value Contribution Areas

- LangGraph graph implementation in `services/orchestrator/src/graph.py`
- YouTube format pattern analyzer in `packages/integrations/src/youtube/`
- Trend signal ranking model in `services/intelligence/src/`
- Neo4j Brand DNA query optimization
- End-to-end mission flow tests

We maintain high code quality and make realistic promises. If unsure about scope, open a discussion issue first.
