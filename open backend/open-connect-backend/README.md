# Open Connect Backend

Production-oriented TypeScript REST + Realtime API for the **Open Connect** Expo mobile and web streaming application. 

Built on **Fastify 5**, raw parameterized PostgreSQL queries, Redis cache-aside, rotating JWT refresh-token families, BullMQ background job queues, Socket.IO realtime gateway, Zod validation, Pino structured logging, and comprehensive OpenAPI 3.0 documentation.

> **No ORMs:** Prisma and MongoDB are not used. All database operations use parameterized SQL through the `pg` connection pool for maximum control and performance.

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** ≥20 (check: `node --version`)
- **Docker** + **Docker Compose** (check: `docker --version`, `docker compose version`)
- **Git** (for version control)

### Step-by-Step Setup

```bash
# 1. Navigate to backend directory
cd "open backend/open-connect-backend"

# 2. Copy environment template
cp .env.example .env

# 3. Generate secure JWT secrets (auto-inserts into .env)
npm run setup:local
# For macOS/Linux, use: npm run setup:local:unix

# 4. Install Node dependencies
npm install

# 5. Start PostgreSQL and Redis containers
npm run infra:up

# 6. Run database migrations (creates schema)
npm run migrate

# 7. Seed initial data (admin user, genres, sample stations)
npm run seed

# 8. Start development server with hot reload
npm run dev
```

### Access Points After Startup

| Service | URL | Purpose |
| :--- | :--- | :--- |
| API Server | `http://localhost:3000` | REST API root |
| Health Check | `http://localhost:3000/health` | Service status probe |
| Swagger UI | `http://localhost:3000/api-docs` | Interactive API docs |
| REST API | `http://localhost:3000/api/v1/...` | All routes prefixed here |

### Default Seeded Admin Account

- **Email:** `admin@openconnect.local`
- **Password:** `AdminPass123!`

> ⚠️ **Development only.** Never use these credentials in production. Override the seed password via `SEED_ADMIN_PASSWORD` environment variable.

### Using Docker Compose (Fully Containerized)

To run the entire stack (API + PostgreSQL + Redis) in containers:

```bash
docker compose up --build
# This:
#   1. Builds the Dockerfile (multi-stage: TypeScript compile + slim prod image)
#   2. Spins up postgres:16 and redis:7 containers
#   3. Runs migrations on container startup
#   4. Exposes port 3000 for the API
```

Stop services:
```bash
docker compose down
```

Stop and remove all data (volumes):
```bash
docker compose down -v
```

---

## Environment Variables

All variables are validated at startup using Zod. The app refuses to start if critical values are invalid or unset. Most have sensible defaults for local development.

### Required for Production

| Variable | Default | Description | Security Note |
| :--- | :--- | :--- | :--- |
| `JWT_ACCESS_SECRET` | *(dev placeholder)* | 32+ random characters | ⚠️ **Must be changed in production** |
| `JWT_REFRESH_SECRET` | *(dev placeholder)* | 32+ random characters, different from `JWT_ACCESS_SECRET` | ⚠️ **Must be changed in production** |
| `DATABASE_URL` | `postgres://localhost/openconnect` | PostgreSQL connection string | Use strong password in production |
| `REDIS_URL` or `REDIS_HOST`+`REDIS_PORT` | localhost:6379 | Redis connection | Optional; gracefully degraded if offline |

### Optional / Development

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `3000` | HTTP listen port |
| `HOST` | `0.0.0.0` | HTTP bind address (0.0.0.0 = all interfaces) |
| `API_PREFIX` | `/api/v1` | REST API route prefix |
| `DATABASE_SSL` | `false` | Set `true` for Neon / managed Postgres |
| `DB_POOL_MAX` | `20` | pg pool max connections; increase for high concurrency |
| `REDIS_ENABLED` | `true` | Set `false` to disable Redis entirely (no caching, no queues) |
| `REDIS_PASSWORD` | `` | Redis auth password if required |
| `REDIS_DB` | `0` | Redis logical database index |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Access token lifetime (900 = 15 min) |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime (30 days) |
| `CORS_ORIGIN` | `http://localhost:8081` | Comma-separated allowed origins; `*` = all |
| `LOG_LEVEL` | `info` | Pino log level (`debug`, `info`, `warn`, `error`) |
| `CACHE_TTL_SECONDS` | `300` | Default Redis cache TTL for catalog data (5 min) |
| `SEED_ADMIN_PASSWORD` | `AdminPass123!` | Initial admin password (dev only; change immediately) |

### Generating Secure Secrets

Use the provided script to auto-generate 32+ character random secrets and update `.env`:

```bash
# Auto-generates JWT_ACCESS_SECRET and JWT_REFRESH_SECRET, updates .env
npm run setup:local    # Windows PowerShell
npm run setup:local:unix  # macOS / Linux
```

Or manually (bash):
```bash
openssl rand -hex 32  # generates 64-char hex string
```

---

## Redis Integration

Redis powers three features: **caching**, **background job queues**, and **realtime room management**.

### Redis Optional (Graceful Degradation)

When Redis is unavailable:
- Cache operations become no-ops (all catalog queries hit the DB directly)
- Background job workers are skipped; jobs logged and discarded
- `/health` returns `{ "status": "degraded", "redis": false }`
- The API **continues to function** — just slower without cache

**To disable Redis in development** (e.g., no Docker):

```bash
REDIS_ENABLED=false npm run dev
```

### Redis Setup

**Option 1: Docker Compose (Recommended)**

```bash
npm run infra:up  # Starts postgres:16 + redis:7
npm run infra:down  # Stops both
```

**Option 2: Standalone Redis**

```bash
# Start Redis container only
docker compose -f docker-compose.redis.yml up -d

# Verify connectivity
docker compose -f docker-compose.redis.yml exec redis redis-cli ping
# → PONG

# Inspect data
docker compose -f docker-compose.redis.yml exec redis redis-cli
# redis:6379> KEYS *
# redis:6379> GET <key>
```

**Option 3: Redis Cloud / Managed Service**

Set `REDIS_URL` to your managed instance:
```bash
REDIS_URL=redis://username:password@host.com:6379 npm run dev
```

---

## API Overview

All routes use the prefix `/api/v1` unless noted.

### Authentication Routes — `/api/v1/auth`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **POST** | `/register` | — | `{ email, password, displayName, deviceKey?, platform?, pushToken? }` — Creates account |
| **POST** | `/login` | — | `{ email, password, deviceKey?, platform?, pushToken? }` — Returns access + refresh tokens |
| **POST** | `/refresh` | — | `{ refreshToken }` — Rotates token family, returns new pair |
| **POST** | `/logout` | — | `{ refreshToken }` — Revokes entire token family |
| **GET** | `/me` | Bearer | Returns current user profile (without password hash) |

### Users Routes — `/api/v1/users`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **GET** | `/me` | Bearer | Current user profile |
| **PATCH** | `/me` | Bearer | `{ displayName?, avatarUrl?, bio?, location? }` — Updates selectively |
| **GET** | `/` | Bearer + Admin | Paginated user list; `?q=` searches email/name; admin-only |

### Home Feed — `/api/v1/home`

| Method | Path | Auth | Response |
|---|---|---|---|
| **GET** | `/` | — | Aggregated feed: `{ trendingSongs, newSongs, podcasts, stations, rjs, events, channels, ads }` — Redis cached 60s |

### Catalog Resources (Shared Generic Endpoints)

All catalog endpoints support **pagination** (`?page=`, `?limit=`) and **search** (`?q=`):

| Resource | List | Detail | Notes |
|---|---|---|---|
| **Songs** | `GET /songs` | `GET /songs/:id` | Joins artists, albums, genres; paginated; searchable |
| **Podcasts** | `GET /podcasts` | `GET /podcasts/:id` | Includes episode count; searchable |
| — | `GET /podcasts/:id/episodes` | — | Paginated episodes for a show |
| **Stations** | `GET /stations` | `GET /stations/:id` | Ordered by listener count DESC |
| **RJs** | `GET /rjs` | `GET /rjs/:id` | Joins station; ordered is_live DESC, listeners DESC |
| **Events** | `GET /events` | `GET /events/:id` | Ordered by starts_at ASC (upcoming first) |
| **Channels** | `GET /channels` | *(no detail)* | List only; used for live TV/streams |
| **Ads** | `GET /ads` | *(no detail)* | List only; placement-aware, priority-sorted |

### User Engagement Routes

#### Favorites — `/api/v1/favorites`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **GET** | `/` | Bearer | Returns all saved items grouped by type |
| **POST** | `/:type/:id` | Bearer | `type ∈ { song, podcast, station, rj }` — adds or updates |
| **DELETE** | `/:type/:id` | Bearer | Removes favorite |

#### Play History & Playback Progress — `/api/v1`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **POST** | `/play-history` | Bearer | `{ contentType, contentId, playedSeconds }` — Records play event |
| **GET** | `/play-history` | Bearer | Paginated listening history; newest first |
| **PUT** | `/playback-progress/:episodeId` | Bearer | `{ progressSeconds, completed }` — Saves podcast progress |
| **GET** | `/continue-listening` | Bearer | Unfinished podcast episodes; ready for resume |

### Notifications & Community Routes

#### Notifications — `/api/v1/notifications`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **GET** | `/` | Bearer | User notification inbox; max 100, newest first |
| **POST** | `/subscriptions` | Bearer | `{ eventId? }` or `{ liveSessionId? }` (one required) |
| **PATCH** | `/:id/read` | Bearer | Marks notification as read |

#### Reports & Requests — `/api/v1`

| Method | Path | Auth | Payload / Notes |
|---|---|---|---|
| **POST** | `/reports` | Bearer (required) | `{ targetType, targetId, reason, details? }` — `targetType ∈ { song, podcast, episode, station, rj, message }` |
| **POST** | `/rj-requests` | Optional Bearer | `{ requesterName, rjName, stationName, location?, message? }` — Auth not required |

#### Search — `/api/v1/search`

| Method | Path | Auth | Query Params |
|---|---|---|---|
| **GET** | `/` | — | `?q=QUERY` (1–100 chars) + `?limit=` (1–50, default 10) — Trigram fuzzy search across 5 types |

### System Routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| **GET** | `/health` | — | Health probe; returns `{ status, database, redis }` — Status: `healthy` / `degraded` / `unhealthy` |
| **GET** | `/api-docs` | — | Swagger UI with interactive API explorer |

---

## WebSocket Gateway (Socket.IO)

Real-time live sessions: chat, reactions, listener tracking.

**Handshake Authentication:**
- Supply JWT via `socket.handshake.auth.token` or `Authorization: Bearer <token>` header
- Invalid/missing token → socket rejected

### Socket Events (Client → Server)

| Event | Payload | Server Action |
|---|---|---|
| `live:join` | `{ sessionId: UUID }` | Joins room `live:<sessionId>`; emits back `live:history` (last 100 msgs) |
| `live:leave` | `{ sessionId: UUID }` | Leaves room; broadcasts updated listener count |
| `live:message` | `{ sessionId, message }` | Persists to DB; broadcasts to room with user info |
| `live:reaction` | `{ sessionId, reaction }` | Broadcasts emoji reaction (`like`, `love`, `fire`, `clap`) |

### Socket Events (Server → Client)

| Event | Payload |
|---|---|
| `live:history` | `[{ id, userId, message, createdAt }, ...]` — Last ≤100 messages (chronological) |
| `live:message` | `{ id, userId, message, user: { id, email }, createdAt }` — New message |
| `live:reaction` | `{ sessionId, userId, reaction }` — Emoji reaction broadcast |
| `presence:update` | `{ sessionId, count }` — Updated listener count in room |

**Scaling Tip:** For multiple API instances, configure a Socket.IO Redis adapter and use sticky sessions at your load balancer.

---

## Background Jobs (BullMQ)

Async workers start automatically on app boot. Jobs retry up to 5 times with exponential backoff (1000 ms initial).

| Queue | Purpose | When Triggered |
|---|---|---|
| `notification.queue` | Insert notification record into DB | After follow, new episode, event reminder, etc. |
| `email.queue` | Dispatch transactional email | (No provider wired yet; logs only) |
| `report.queue` | Moderate reported content | After user files a report; transitions `pending` → `reviewing` |

If Redis is unavailable, workers are skipped with warnings; jobs are not processed.

---

## Tech Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| HTTP Framework | Fastify | `^5.8.5` | Lightweight, fast async HTTP server |
| Language & Runtime | TypeScript / Node.js | `^5.8.3` / `≥20` | Type-safe server with modern async/await |
| Dev Execution | `tsx` | `^4.19.4` | Hot-reload TypeScript execution |
| Database | PostgreSQL 16 | `^8.16.0` | Relational DB with full-text search |
| DB Driver | `pg` (node-postgres) | `^8.16.0` | Parameterized queries, connection pooling |
| DB Extensions | `pgcrypto`, `pg_trgm` | — | UUID generation, trigram search |
| Cache Layer | Redis 7 via `ioredis` | `^5.6.1` | Cache-aside pattern (optional, gracefully degraded) |
| Background Jobs | BullMQ | `^5.53.2` | 3 job queues with retry logic |
| Realtime | Socket.IO | `^4.8.1` | WebSocket + polling for live events |
| Input Validation | Zod | `^3.25.56` | Runtime schema validation |
| Authentication | bcrypt + jsonwebtoken | `^6.0.0` / `^9.0.2` | Password hashing + JWT signing |
| Security | `@fastify/*` plugins | latest | Helmet, CORS, Rate-Limiting |
| API Docs | Swagger + OpenAPI 3.0 | latest | Auto-generated interactive `/api-docs` |
| Logging | Pino + pino-pretty | `^9.7.0` | Structured JSON logging |
| Containerization | Docker / Compose | — | Prod-ready multi-stage builds |

---

## npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Start dev server with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/server.js` | Run production build |
| `lint` | `tsc --noEmit` | Type-check without output |
| `test` | `jest --runInBand` | Run unit tests (single thread) |
| `migrate` | `tsx src/database/migrate.ts` | Run pending migrations |
| `migrate:prod` | `node dist/database/migrate.js` | Run migrations from compiled build |
| `seed` | `tsx src/database/seeds/seed.ts` | Seed initial data (admin, genres, stations) |
| `infra:up` | `docker compose up -d` | Start Postgres + Redis containers |
| `infra:down` | `docker compose down` | Stop containers |
| `setup:local` | `powershell -f scripts/setup-local.ps1` | Auto-setup on Windows |
| `setup:local:unix` | `bash scripts/setup-local.sh` | Auto-setup on macOS / Linux |

---

## Frontend Integration

The companion mobile and web app is **Open Connect** (also branded **Melody Meet** on desktop) — a universal Expo SDK 54 / React Native application using Expo Router, NativeWind, and Socket.IO.

**Frontend location:** `c:/Kravix/open-connect/open-connect/`

```bash
cd "open-connect/open-connect"
npm install
npx expo start
# w = web (desktop Spotify layout at localhost:8081)
# a = Android emulator
# i = iOS simulator (macOS only)
# scan QR = Expo Go on physical device
```

The frontend points to `http://localhost:3000/api/v1` (web/iOS) or `http://10.0.2.2:3000/api/v1` (Android emulator). Override with `EXPO_PUBLIC_API_URL`. If the backend is offline, screens fall back automatically to local mock data in `src/data/`.

---

## Production Deployment Checklist

- [ ] Replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with cryptographically random 32+ char strings
- [ ] Change default seeded admin password via `SEED_ADMIN_PASSWORD` env var
- [ ] Replace all example media URLs with real CDN/storage URLs
- [ ] Terminate TLS at ingress (load balancer / reverse proxy)
- [ ] Restrict `CORS_ORIGIN` to actual frontend domains (not `*`)
- [ ] Backup PostgreSQL and Redis volumes regularly
- [ ] Rotate signing secrets on a schedule via secret manager
- [ ] Enable database SSL/TLS for remote connections
- [ ] Configure Socket.IO Redis adapter for multi-instance deployments
- [ ] Set up monitoring, alerting, and log aggregation
- [ ] Run load tests to size infrastructure

---

## Documentation

For comprehensive architecture, API contracts, authentication patterns, and database schema, see:
- **Backend Architecture:** `BACKEND_STRUCTURE.md` — Complete audit with all endpoints, services, repositories, and design patterns
- **Frontend Architecture:** `FRONTEND_STRUCTURE.md` — React Native app structure, contexts, routes, and features
- **Main README:** `README.md` — Quick start guide for both frontend and backend

For interactive API documentation, visit `/api-docs` after starting the backend.
