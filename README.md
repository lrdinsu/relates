# Relates

Relates is a high-performance, full-stack social media platform inspired by modern threads-style interaction. Built with `React`, `TypeScript`, `Vite`, `Express`, `PostgreSQL`, and `Redis`, it features a sophisticated UI, real-time optimistic updates, and a robust search engine.

## Table of Contents

- [Core Features](#core-features)
- [Client Architecture](#client-architecture)
  - [Technologies](#technologies)
  - [Key Features](#key-features)
- [Server Architecture](#server-architecture)
  - [Technologies](#technologies-1)
  - [Key Features](#key-features-1)
- [Packages](#packages)
- [Performance](#performance)
- [Horizontal Scaling](#horizontal-scaling)
- [Getting Started](#getting-started)
- [License](#license)

## Core Features

- **Dynamic Content Discovery**: "For You" and "Following" feeds with intelligent navigation.
- **Universal Search**: Real-time debounced search for both users and post content.
- **Sophisticated Media Experience**: Full-screen image viewer with multi-image navigation and keyboard shortcuts.
- **Optimistic UI Interaction**: Zero-latency feedback for Likes and interactions via React Query.
- **Full Post Lifecycle**: Create, Edit, and Soft-Delete capabilities for posts and nested replies.
- **Advanced Profile Management**: Live profile editing (Name, Bio, Avatar URL) with instant cross-app synchronization.
- **Secure Authentication**: JWT auth with refresh-token rotation and reuse detection, backed by a Redis session store, with log-out-everywhere support.
- **Responsive Design**: Polished mobile and desktop layouts featuring a smart navigation system and unified "Menu" button.

## Client Architecture

The client is a modern SPA designed for speed and responsiveness.

### Technologies

- **React 19** & **TypeScript**
- **Vite** for optimized bundling
- **Mantine UI** for professional-grade component architecture
- **React Query** for state synchronization and optimistic updates
- **Zustand** for lightweight global state management
- **React Router v7** with advanced lazy loading and path-aware navigation

### Key Features

- **Smart Navigation**: Header tabs that dynamically sync with home routes and hide during search/profile views.
- **Unified Post Component**: Single versatile component handling creation, replies, and edits.
- **Portal-based Modals**: Clean, accessible modals for profile editing and post management.
- **Intelligent Back Button**: Context-aware visibility logic based on navigation history.
- **Theme Engine**: Seamless light/dark mode transitions with persistent user preferences.

## Server Architecture

A scalable Express backend focused on data integrity and performance.

### Technologies

- **Express** & **TypeScript**
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** for relational data storage
- **Redis** for session storage and refresh-token rotation
- **Zod** for end-to-end type safety and validation
- **Argon2** for industry-standard password hashing

### Key Features

- **Soft-Delete System**: Database-safe post removal ensuring data integrity and relationship stability.
- **Blended Feed Logic**: Complex Prisma queries for fetching network-relevant content.
- **Type-Safe Search**: Case-insensitive partial matching for users and posts.
- **Consistent Counters**: Denormalized counts (likes, reposts, followers, comments) are updated together with their underlying rows inside a transaction, so a partial failure can never leave a count out of step; concurrent duplicate actions are idempotent via unique constraints.
- **Event-Driven Notifications**: Likes and follows record an event in a transactional outbox within the same transaction as the write (no dual-write to the broker). A relay publishes outbox events over the Kafka protocol (Redpanda locally), and an idempotent consumer turns them into notifications, deduped on the event id so at-least-once delivery can't double-notify.
- **Rotating Sessions**: Refresh tokens rotate on every use with reuse detection (a replayed token revokes the session); per-request auth validates the signed token without a database lookup.
- **Stateless & Horizontally Scalable**: No per-request state in process memory (sessions live in Redis), so the API runs behind a load balancer as identical replicas; a `/api/v1/health` liveness probe and graceful `SIGTERM` draining let replicas be added or removed without dropping requests.
- **Modular Controllers**: Clean separation of concerns for Auth, Post, User, and Search logic.

## Packages

### Validation

Shared Zod schemas located in `packages/validation/`. This ensures the client and server are always in sync regarding data structures, reducing runtime errors.

- **Sync Schemas**: One source of truth for Users, Posts, Searches, and Interactions.

## Performance

Benchmarked with a synthetic dataset (up to 100k users / 1M posts, seeded via PostgreSQL's `generate_series`) against local PostgreSQL 16. Median / p95 end-to-end latency:

| Endpoint        | 10k posts | 100k posts | 1M posts     |
|-----------------|-----------|------------|--------------|
| For You feed    | 8 / 10 ms | 14 / 17 ms | 60 / 76 ms   |
| Following feed  | 5 / 6 ms  | 11 / 13 ms | 50 / 59 ms   |
| Hot feed        | 4 / 5 ms  | 11 / 12 ms | 61 / 68 ms   |
| Search          | 11 / 15 ms| 37 / 45 ms | 292 / 353 ms |

`EXPLAIN ANALYZE` showed search doing a sequential scan, a leading-wildcard `ILIKE` can't use a B-tree index, so Postgres reads every row. Relates adds a `pg_trgm` GIN index on post text, so the same query uses a bitmap index scan instead, cutting search at 1M posts from ~290 ms to ~3 ms (about 100x). The feeds sort on unindexed columns; indexes help at moderate scale, and a precomputed (fan-out-on-write) feed is the direction beyond that.

The Search column above is the pre-index baseline that motivated the fix; with the shipped trigram index, search stays in the low single-digit milliseconds. (The benchmark applies all migrations, so re-running it reflects the indexed search.) Numbers are from local hardware and are directional. Reproduce with:

```bash
BENCH_DATABASE_URL=postgresql://user:pass@localhost:5432/relates_bench pnpm --filter server bench
```

## Horizontal Scaling

Because sessions live in Redis rather than in process memory, the API is stateless: any replica can serve any request, so it scales horizontally by simply running more copies behind a load balancer. No sticky sessions are needed.

A local-only demo stack (`docker-compose.lb.yml` + `Caddyfile.lb`) runs two `server` replicas behind Caddy:

```bash
docker compose -f docker-compose.lb.yml up --build   # http://localhost:8080
docker kill relates-lb-server-1                       # traffic shifts to the survivor, no downtime
```

Caddy balances `/api/v1/*` across the replicas round-robin, polls each one's `/api/v1/health` liveness probe, and pulls a failing replica out of rotation (re-adding it on recovery). On shutdown each replica handles `SIGTERM` by draining in-flight requests before exiting, so removing one drops no requests.


## Getting Started

### Prerequisites

- **Node.js** (v22+)
- **pnpm** (preferred)
- **Docker** & **Docker Compose**

### Installation

1. **Clone & Install**:
    ```bash
    git clone `repository-url`
    cd relates
    pnpm install
    ```

2. **Environment**:
    - Configure `.env` in the root using the provided samples.

3. **Database**:
    - Ensure PostgreSQL is running (or use Docker).
    - Generate the client and apply migrations (from the repo root):
      ```bash
      pnpm --filter server exec prisma generate
      pnpm --filter server exec prisma migrate dev
      ```

### Running the Application

**Using Docker** (runs the published images from the registry):
```bash
docker compose up -d
```

**Development Mode**:
```bash
# Terminal 1 (Client)
cd client && pnpm dev

# Terminal 2 (Server)
cd server && pnpm dev
```

## License

MIT License. See `LICENSE` for details.
