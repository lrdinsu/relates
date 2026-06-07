# Relates

A full-stack social media platform that started as a synchronous CRUD app and was deliberately evolved into an **event-driven, derived-state architecture**, the way the system-design playbook teaches it: PostgreSQL owns correctness, committed changes become events, and consumers build the read-optimized views each feature needs.

**Stack:** TypeScript · React · Express · PostgreSQL · Prisma · Redis · Kafka (Redpanda) · Elasticsearch · Docker · AWS EC2

**Status:** Deployed to AWS EC2 behind Cloudflare + Caddy, serving active users. The heavier streaming/search-cluster pieces run locally by design (see [Production vs. local](#production-vs-local)).

**Live demo:** https://relatesapp.com

---

## Highlights

- **Event backbone:** a transactional **outbox** publishes domain events to **Kafka**; **idempotent consumers** build derived state, with at-least-once delivery handled honestly.
- **Feed fan-out on write** into per-follower **Redis** sorted sets, including the **celebrity/hot-key hybrid** and a read-time fallback.
- **Search index kept in sync via CDC** (Debezium reading the Postgres WAL) into **Elasticsearch**, plus relevance-ranked Postgres full-text search benchmarked **sub-millisecond at 1M posts**.
- **Correctness at the source of truth:** denormalized counters maintained in **transactions**, idempotent via unique constraints.
- **Stateless, horizontally scalable API** behind a Caddy load balancer with health checks and graceful shutdown.
- **Redis-backed auth:** refresh-token rotation, reuse detection, and lookup-free request validation.
- **Tested at the seams** with Vitest + Testcontainers (Postgres, Redis, Kafka, Elasticsearch) and gated by CI.

## Table of Contents

- [Architecture](#architecture)
- [Backend engineering](#backend-engineering)
- [Performance](#performance)
- [Frontend](#frontend)
- [Production vs. local](#production-vs-local)
- [Testing](#testing)
- [Local demos](#local-demos)
- [Getting started](#getting-started)
- [License](#license)

---

## Architecture

PostgreSQL is the single source of truth. State changes are captured as events (via an application-level outbox, or via CDC off the write-ahead log) and flow through Kafka to consumers that maintain derived views: notifications, precomputed feeds, and a search index. Reads are served from the view best suited to them (Redis for feeds, Elasticsearch for search) instead of recomputing against the primary.

```mermaid
flowchart LR
  Client -->|HTTP| Caddy[Caddy LB]
  Caddy --> API[Express API]
  API -->|source of truth| PG[(PostgreSQL)]
  API -->|sessions| REDIS[(Redis)]

  PG -->|transactional outbox| K[(Kafka / Redpanda)]
  PG -->|CDC: Debezium reads WAL| K

  K --> NOTI[Notifications consumer] --> PG
  K --> FAN[Feed fan-out consumer] --> REDIS
  K --> IDX[Search indexer] --> ES[(Elasticsearch)]

  API -->|feed read| REDIS
  API -->|search| ES
```

Every derived view is a **rebuildable cache of a derivable thing**, never the truth: feeds warm from Postgres on a miss, the search index can be fully reindexed, and serving falls back to a direct Postgres query when a view is unavailable.

---

## Backend engineering

### Event backbone: outbox → Kafka → idempotent consumers
On a like or follow, the event is written to an **outbox table in the same transaction** as the state change, so there is no dual write to Postgres and the broker. A relay publishes outbox rows to Kafka; a consumer turns `LIKE_CREATED` / `FOLLOW_CREATED` events into notifications. Delivery is at-least-once, so the consumer is **idempotent** (it dedupes on a unique event id), which means a redelivered event can never create a duplicate notification.

### Feed fan-out on write (the centerpiece)
A new post emits a `POST_CREATED` event; a fan-out consumer writes the post id into each follower's feed, a **Redis sorted set** scored by post id (chronological order plus cursor-friendly paging). The home feed becomes a fast cache read instead of a query across everyone you follow.
- **Celebrity / hot-key hybrid:** authors above a follower threshold are not fanned out (write amplification); their posts are merged in at read time instead.
- **Resilience:** a cold feed is rebuilt from Postgres on demand; if Redis is unavailable, serving falls back to the read-time query (and that fallback fails fast so a Redis blip can't hang requests).

### Search: Postgres full-text + CDC to Elasticsearch
Post search uses a generated **`tsvector`** column with a GIN index, matched with `websearch_to_tsquery` and ranked by **`ts_rank`** so a strong match outranks an incidental mention. An **Elasticsearch** index is kept in sync through **Change Data Capture**: Debezium reads the Postgres WAL and streams row changes to a consumer that updates the index, eliminating the dual-write problem. Search prefers Elasticsearch when configured and falls back to Postgres full-text otherwise.

### Correctness at the source of truth
Denormalized counters (likes, reposts, followers, comments) are updated **together with their rows inside a `prisma.$transaction`**, so a partial failure can never leave a count out of step. Concurrent duplicate actions (double-tap like, racing follow) are **idempotent** via `@@unique` constraints, caught and treated as no-ops rather than errors.

### Authentication
JWT access/refresh auth with **refresh-token rotation and reuse detection** (a replayed, retired token revokes the session), backed by a **Redis session store** with log-out-everywhere. Per-request authorization validates the signed access token **without a database lookup**; revocation happens at the refresh boundary.

### Horizontal scalability
The API holds no per-request state in process memory (sessions live in Redis), so it runs as **identical stateless replicas** behind a Caddy load balancer, no sticky sessions needed. A `/api/v1/health` liveness probe and graceful `SIGTERM` draining let replicas be added or removed without dropping in-flight requests.

### Foundations
Monorepo with **shared Zod schemas** (`packages/validation`) giving end-to-end type safety between API contracts and the frontend; Prisma ORM; Argon2 password hashing; soft-deletes for referential safety; Docker Compose; GitHub Actions CI/CD that runs the test suite before building and deploying.

---

## Performance

Benchmarked with a synthetic dataset (up to 100k users / 1M posts, seeded via PostgreSQL `generate_series`) against local PostgreSQL 16. Median / p95 end-to-end latency:

| Endpoint        | 10k posts | 100k posts | 1M posts   |
|-----------------|-----------|------------|------------|
| For You feed    | 8 / 10 ms | 14 / 17 ms | 60 / 76 ms |
| Following feed  | 5 / 6 ms  | 11 / 13 ms | 50 / 59 ms |
| Hot feed        | 4 / 5 ms  | 11 / 12 ms | 61 / 68 ms |
| Search (FTS)    | 3 / 5 ms  | 3 / 8 ms   | 5 / 9 ms   |

Search originally used `text ILIKE '%term%'`, a sequential scan that read every row (~290 ms at 1M). A `pg_trgm` GIN index cut that to a bitmap index scan (~100x), and full-text search then added relevance ranking on top at the same cost. `EXPLAIN ANALYZE` confirms the tsvector GIN index with **sub-millisecond** query execution even at 1M posts (~0.8 ms); the few-ms end-to-end figures are HTTP and result hydration, not the search itself. Numbers are from local hardware and are directional. Reproduce with:

```bash
BENCH_DATABASE_URL=postgresql://user:pass@localhost:5432/relates_bench pnpm --filter server bench
```

---

## Frontend

A React 19 SPA focused on speed and a polished feel.

- **React Query** for server-state sync and **optimistic updates** (likes, reposts) with rollback on error.
- **Mantine UI** components, light/dark theme engine, responsive mobile + desktop layouts.
- **React Router v7** with lazy-loaded routes and context-aware navigation.
- **Zustand** for lightweight global state.
- Real-time debounced universal search, a full-screen multi-image viewer, full post lifecycle (create / reply / edit / soft-delete), reposts surfaced on the profile, and a notifications bell with an unread indicator.

---

## Production vs. local

A deliberate cost decision on a small VPS: the correctness-critical pieces run in production, and the JVM-heavy or operationally heavy pieces are built and demoed **locally**, because at this scale they would be cost without benefit. The architecture is ready to flip them on; the README and code are honest about where that line is.

| Runs in production | Built and run locally (with a production-safe fallback) |
|---|---|
| Core API, posts, interactions, profiles | Kafka (Redpanda) event backbone + outbox + notifications consumer |
| Redis-backed auth (rotation, reuse detection, sessions) | Feed fan-out on write (prod serves the read-time feed) |
| Transactional counters | Elasticsearch + CDC search index (prod serves Postgres full-text) |
| Postgres full-text search | Multi-replica load-balancing demo (prod runs a single replica) |
| Stateless API, CI/CD, AWS EC2 deploy | |

> Note on Kafka: the broker is **Redpanda**, which is Kafka-API-compatible (same protocol and `kafkajs` client), chosen for a lighter footprint; it is swappable to Apache Kafka with a config change.

The guiding principle throughout: build the streaming/derived-view version to understand the pattern, keep the simple transactional/read-time version as the default at this scale, and be explicit about the threshold where you would switch.

---

## Testing

Integration tests run against **real dependencies via Testcontainers**, because the async pipelines here (consumers, eventual consistency, idempotency, fan-out) are exactly where bugs hide silently.

- Vitest + Supertest against the real Express app.
- Testcontainers spins up Postgres, Redis, Kafka (Redpanda), and Elasticsearch.
- Coverage targets the signature risk of each feature: refresh-token reuse detection, counter consistency under concurrency, consumer idempotency on redelivery, feed fan-out correctness (and the celebrity merge), and search ranking / index sync.
- GitHub Actions runs the suite and gates build + deploy.

---

## Local demos

The local-only pipelines each have a self-contained Compose stack:

```bash
# Event backbone (Redpanda broker for notifications + feed fan-out)
docker compose -f docker-compose.events.yml up -d

# Load balancing: two stateless replicas behind Caddy
docker compose -f docker-compose.lb.yml up --build       # http://localhost:8080
docker kill relates-lb-server-1                           # traffic shifts to the survivor

# Search index: Postgres (logical WAL) -> Debezium -> Redpanda -> Elasticsearch
docker compose -f docker-compose.search.yml up -d
```

---

## Getting started

### Prerequisites
- Node.js v22+
- pnpm
- Docker & Docker Compose

### Setup
```bash
git clone <repository-url>
cd relates
pnpm install

# configure root .env from the provided sample, then:
pnpm --filter server exec prisma generate
pnpm --filter server exec prisma migrate dev
```

### Run in development
```bash
pnpm --filter client dev    # client
pnpm --filter server dev    # server
```

Run `prisma migrate deploy` after pulling new migrations so the local schema (e.g. the search vector column) stays current.

---

## License

MIT License. See `LICENSE` for details.
