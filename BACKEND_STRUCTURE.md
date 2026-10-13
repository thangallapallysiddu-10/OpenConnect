# Open Connect Backend — Complete Architecture Audit & Reference

> **Source of truth:** This document is generated from reading the actual source files under
> `open backend/open-connect-backend/src/`. Every claim below is traceable to a specific file.
> **Last Audit:** October 13, 2026 | **Status:** Production-Ready

---

## Executive Summary

**Open Connect Backend** is a production-ready, modular REST and Realtime API built in **TypeScript** on **Fastify v5**.
It powers a cross-platform music, podcast, and live radio streaming application with comprehensive features:

### Core Capabilities
- **Audio & Media Catalog** — Songs (with artists, albums, genres), podcasts (with episodes & speakers), radio stations, RJs
- **Realtime Broadcasting** — Socket.IO live sessions with chat, reactions, and listener tracking
- **Personalization** — Favorites (saved content by type), play history, podcast progress tracking, continue-watching
- **Social Features** — Notifications, content reports, RJ song requests, fuzzy full-text search
- **Multi-Device Auth** — JWT token family rotation, device tracking, OAuth 2.0 (Google), reuse attack detection
- **Background Processing** — BullMQ job queues for notifications, emails, and moderation (Redis-backed, gracefully degraded)

### Key Design Principles
- **No ORM** — All data access via parameterized SQL through `pg` connection pool (not Prisma)
- **Scalable Architecture** — Stateless Fastify servers, horizontal scaling-ready, connection pooling
- **Security First** — Password hashing (bcrypt 12 rounds), rotating JWT families, CORS + Helmet, rate limiting (300 req/min)
- **Resilient** — Redis optional; graceful degradation when unavailable; schema auto-sync on boot
- **Observable** — Pino structured logging (JSON in production), OpenAPI 3.0 Swagger docs, health check endpoint

---

## 1. Technology Stack

### Complete Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **HTTP Framework** | Fastify | `^5.8.5` | High-performance async HTTP server |
| **Language / Runtime** | TypeScript + Node.js | `^5.8.3` / `≥20` | Type-safe server runtime |
| **Dev Execution** | `tsx` | `^4.19.4` | Fast TypeScript JIT execution with hot reload |
| **Database** | PostgreSQL 16 via `pg` | `^8.16.0` | Relational DB with raw parameterised SQL |
| **DB Extensions** | `pgcrypto`, `pg_trgm` | — | UUID generation + trigram full-text search |
| **Caching Layer** | Redis 7 via `ioredis` | `^5.6.1` | Cache-aside pattern; gracefully degraded if offline |
| **Background Jobs** | BullMQ | `^5.53.2` | Async task queue: notifications, emails, reports (3 queues) |
| **Realtime** | Socket.IO | `^4.8.1` | WebSocket + polling for live sessions & chat |
| **Validation** | Zod | `^3.25.56` | Runtime schema validation for all inputs |
| **Auth** | bcrypt + jsonwebtoken | `^6.0.0` / `^9.0.2` | Password hashing (12 rounds) + JWT signing |
| **Security** | Helmet, CORS, Rate Limit | latest | `@fastify/` ecosystem plugins |
| **API Documentation** | Swagger + OpenAPI 3.0 | latest | Auto-generated `/api-docs` UI |
| **Logging** | Pino + pino-pretty | `^9.7.0` | Structured JSON logging (pretty-print in dev) |
| **Containerization** | Docker / Docker Compose | — | Multi-stage build; Postgres 16 + Redis 7 |

> **Not Used:** Prisma, MongoDB, ORMs, Sequelize. All database access is via parameterized SQL through the `pg` pool.

---

## 2. High-Level Architecture

```
HTTP Client / Mobile App
        │
        ▼
Fastify (app.ts)
 ├── @fastify/helmet
 ├── @fastify/cors          ← origin read from env.CORS_ORIGIN (comma-separated list or '*')
 ├── @fastify/rate-limit    ← 300 req / 1 min
 ├── @fastify/swagger-ui    ← GET /api-docs
 ├── GET /health            ← checks pool.query('SELECT 1') + Redis ping
 │
 ├── /api/v1/auth           ← authRoutes
 ├── /api/v1/users          ← userRoutes
 ├── /api/v1/home           ← homeRoutes (direct SQL + Redis cache-aside)
 ├── /api/v1/songs          ← songsRoutes  ─┐
 ├── /api/v1/podcasts       ← podcastsRoutes │  all delegate to
 ├── /api/v1/stations       ← stationsRoutes │  registerCatalogRoutes()
 ├── /api/v1/rjs            ← rjsRoutes     │  from shared/routes/
 ├── /api/v1/events         ← eventsRoutes  ─┘
 ├── /api/v1/channels       ← registerCatalogRoutes(app, 'channels', false)  ← list only, no /:id
 ├── /api/v1/ads            ← registerCatalogRoutes(app, 'ads', false)        ← list only, no /:id
 ├── /api/v1/favorites      ← favoritesRoutes
 ├── /api/v1 (playback)     ← playbackRoutes  (POST /play-history, GET /play-history, etc.)
 ├── /api/v1/notifications  ← notificationsRoutes
 ├── /api/v1 (reports)      ← reportsRoutes   (POST /reports, POST /rj-requests)
 ├── /api/v1/search         ← searchRoutes
 └── Socket.IO gateway      ← createLiveGateway(app)   (websocket.gateway.ts)

Background (in-process):
 ├── notification.queue worker  ← writes to notifications table
 ├── email.queue worker         ← logs dispatch (no provider wired yet)
 └── report.queue worker        ← updates report status pending → reviewing
```

### Layered Module Pattern

Each domain module follows: **Routes → Service → Repository**

- **Routes** (`*.routes.ts`): URL binding, Zod validation middleware, HTTP status codes.
- **Services** (`*.service.ts`): Business logic, Redis cache-aside, queue dispatch.
- **Repositories** (`*.repository.ts`): Parameterised SQL via `pg` pool.

**Generic Catalog Abstraction** — seven resource types (`songs`, `podcasts`, `stations`, `rjs`,
`events`, `channels`, `ads`) share a single `CatalogRepository` + `CatalogService` +
`registerCatalogRoutes`. Each thin module file simply extends/delegates to these:

```typescript
// songs/songs.routes.ts
export const songsRoutes: FastifyPluginAsync = app => registerCatalogRoutes(app, 'songs');

// songs/songs.repository.ts
export class SongsRepository extends CatalogRepository { constructor() { super('songs') } }
```

`registerCatalogRoutes(app, kind, details = true)`:
- Always registers `GET /` (paginated list, optional `?q=` ILIKE search)
- Registers `GET /:id` only when `details = true` (default). Channels and ads pass `false`.

---

## 3. Complete Directory & File Structure

```
open backend/open-connect-backend/
│
├── Dockerfile                        # Multi-stage build: build → production
│                                     #   CMD: node dist/database/migrate.js && node dist/server.js
├── docker-compose.yml                # API + Postgres 16 + Redis 7 orchestration
├── docker-compose.redis.yml          # Standalone Redis for local dev
├── package.json
├── tsconfig.json
├── jest.config.ts
├── .env.example                      # All env var keys with example values
│
├── scripts/
│   ├── generate-env.ts               # Generates 32-char random JWT secrets
│   ├── setup-local.ps1               # Windows automated local setup
│   └── setup-local.sh                # Unix automated local setup
│
└── src/
    ├── server.ts                     # Entry point: buildApp() → app.listen(PORT, HOST)
    ├── app.ts                        # Fastify instance: registers all plugins + routes
    │
    ├── config/
    │   ├── env.ts                    # Zod-validated env schema (all process.env reads)
    │   ├── database.ts               # (config reference; pool lives in database/pool.ts)
    │   ├── redis.ts                  # Redis singleton, connectRedis(), isRedisReady()
    │   └── logger.ts                 # Pino logger instance
    │
    ├── database/
    │   ├── pool.ts                   # pg.Pool; query() and transaction() helpers
    │   ├── migrate.ts                # Migration runner with schema_migrations tracking
    │   ├── compatibility.ts          # Boot-time idempotent schema sync
    │   ├── migrations/
    │   │   └── 001_initial.sql       # Full DDL: all tables, indexes, enums, extensions
    │   └── seeds/
    │       └── seed.ts               # Seeds admin user, genres, stations
    │
    ├── plugins/
    │   ├── auth.ts                   # Auth plugin hook (attaches authenticate preHandler)
    │   ├── swagger.ts                # Swagger + SwaggerUI registration
    │   └── websocket.ts              # Re-exports createLiveGateway
    │
    ├── queues/
    │   ├── connection.ts             # BullMQ Redis connection wrapper; canUseQueues()
    │   ├── index.ts                  # Queue registry (3 queues); addQueueJob() dispatcher
    │   └── workers.ts                # 3 BullMQ Worker instances; startWorkers() / closeWorkers()
    │
    ├── shared/
    │   ├── cache/
    │   │   ├── cache.ts              # cacheAside(key, ttlSeconds, fetcher) — Redis GET/SET
    │   │   └── cache.service.ts      # Cache invalidation helpers
    │   ├── http/
    │   │   ├── errors.ts             # AppError, BadRequestError, UnauthorizedError,
    │   │   │                         #   ForbiddenError, NotFoundError, ConflictError
    │   │   └── response.ts           # ok(), created(), paginated() envelope helpers
    │   ├── middleware/
    │   │   ├── auth.ts               # authenticate(), optionalAuth(), requireRole(...roles)
    │   │   └── validate.ts           # Zod schema validation preHandler factory
    │   ├── repositories/
    │   │   └── catalog.repository.ts # CatalogRepository: list(pagination) + find(id)
    │   │                             #   Definitions for: songs, podcasts, stations, rjs,
    │   │                             #   events, channels, ads (joins, search col, sort)
    │   ├── routes/
    │   │   └── catalog.routes.ts     # registerCatalogRoutes(app, kind, details=true)
    │   ├── security/
    │   │   ├── password.ts           # hashPassword() / verifyPassword() — bcrypt 12 rounds
    │   │   └── tokens.ts             # signAccessToken(), signRefreshToken(),
    │   │                             #   verifyAccessToken(), verifyRefreshToken(), hashToken()
    │   ├── services/
    │   │   └── catalog.service.ts    # CatalogService: list() + find() with Redis cache-aside
    │   └── utils/
    │       ├── pagination.ts         # paginationSchema (page, limit, q); offsetOf(); pageMeta()
    │       └── sql.ts                # SQL helper utilities
    │
    └── modules/
        ├── auth/
        │   ├── auth.routes.ts        # POST /register /login /refresh /logout; GET /me
        │   ├── auth.repository.ts    # byEmail(), byId(), create(), storeDevice(), storeToken()
        │   │                         #   Compatibility shim: resolves 'user_devices' vs 'devices'
        │   ├── auth.schema.ts        # (secondary schema file — also present in module)
        │   ├── auth.schemas.ts       # Zod DTOs: registerSchema, loginSchema, refreshSchema,
        │   │                         #   logoutSchema
        │   └── auth.service.ts       # register(), login(), refresh(), logout(), safeUser()
        │
        ├── users/
        │   ├── users.routes.ts       # GET /me; PATCH /me; GET / (admin only)
        │   ├── users.repository.ts   # find(), update(), list()
        │   ├── users.schemas.ts      # updateMeSchema
        │   └── users.service.ts      # get(), update(), list()
        │
        ├── home/
        │   └── home.routes.ts        # GET /  — 8 parallel SQL queries, Redis cached 60s
        │                             #   Returns: trendingSongs, newSongs, podcasts, stations,
        │                             #            rjs, events, channels, ads
        │
        ├── songs/
        │   ├── songs.routes.ts       # Delegates to registerCatalogRoutes(app, 'songs')
        │   ├── songs.repository.ts   # extends CatalogRepository('songs')
        │   └── songs.service.ts      # extends CatalogService('songs')
        │
        ├── podcasts/
        │   ├── podcasts.routes.ts    # registerCatalogRoutes + GET /:id/episodes
        │   ├── podcasts.repository.ts# extends CatalogRepository; adds episodes(id, pagination)
        │   └── podcasts.service.ts   # extends CatalogService; adds episodes() with find() guard
        │
        ├── stations/
        │   ├── stations.routes.ts    # Delegates to registerCatalogRoutes(app, 'stations')
        │   ├── stations.repository.ts# extends CatalogRepository('stations')
        │   └── stations.service.ts   # extends CatalogService('stations')
        │
        ├── rjs/
        │   ├── rjs.routes.ts         # Delegates to registerCatalogRoutes(app, 'rjs')
        │   ├── rjs.repository.ts     # extends CatalogRepository('rjs')
        │   └── rjs.service.ts        # extends CatalogService('rjs')
        │
        ├── events/
        │   ├── events.routes.ts      # Delegates to registerCatalogRoutes(app, 'events')
        │   ├── events.repository.ts  # extends CatalogRepository('events')
        │   └── events.service.ts     # extends CatalogService('events')
        │
        ├── favorites/
        │   ├── favorites.routes.ts   # GET /; POST /:type/:id; DELETE /:type/:id
        │   │                         #   type ∈ { song, podcast, station, rj }
        │   ├── favorites.repository.ts
        │   └── favorites.service.ts
        │
        ├── playback/
        │   ├── playback.routes.ts    # POST /play-history; GET /play-history;
        │   │                         #   PUT /playback-progress/:episodeId;
        │   │                         #   GET /continue-listening
        │   ├── playback.repository.ts
        │   └── playback.service.ts
        │
        ├── notifications/
        │   ├── notifications.routes.ts # GET /; POST /subscriptions; PATCH /:id/read
        │   ├── notifications.repository.ts
        │   └── notifications.service.ts
        │
        ├── reports/
        │   ├── reports.routes.ts     # POST /reports (requires auth)
        │   │                         # POST /rj-requests (optionalAuth — auth NOT required)
        │   ├── reports.repository.ts
        │   └── reports.service.ts
        │
        ├── search/
        │   ├── search.routes.ts      # GET /?q=&limit=  (no page param)
        │   ├── search.repository.ts  # Trigram ILIKE across songs, artists, podcasts,
        │   │                         #   radio_stations, rjs
        │   └── search.service.ts
        │
        ├── live/
        │   ├── websocket.gateway.ts  # createLiveGateway(app): Socket.IO server setup
        │   │                         #   CORS origin hardcoded to `true` (all origins)
        │   └── live.service.ts       # saveMessage(), history() — last 100 msgs, reversed
        │
        ├── catalog/                  # EMPTY — placeholder directory, no files
        └── interactions/             # EMPTY — placeholder directory, no files
```

---

## 4. API Route Reference

All routes use prefix `env.API_PREFIX` (default `/api/v1`) except `/health` and `/api-docs`.

### Authentication — `/api/v1/auth`

| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/register` | — | `{ email, password, displayName, deviceKey?, platform?, pushToken? }` |
| POST | `/login` | — | `{ email, password, deviceKey?, platform?, pushToken? }` |
| POST | `/refresh` | — | `{ refreshToken }` — rotates token family |
| POST | `/logout` | — | `{ refreshToken }` — revokes family |
| GET | `/me` | Bearer | Returns `safeUser` object |

### Users — `/api/v1/users`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/me` | Bearer | Current user profile |
| PATCH | `/me` | Bearer | Update displayName, bio, location, avatarUrl |
| GET | `/` | Bearer + admin role | Paginated user list |

### Home Feed — `/api/v1/home`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | — | 8 parallel SQL queries, Redis cached 60 s. Returns `{ trendingSongs, newSongs, podcasts, stations, rjs, events, channels, ads }` |

### Catalog Resources (Generic)

All catalog endpoints support `?page=&limit=&q=` (ILIKE on the resource's title/name column).

| Resource | List | Detail | Notes |
|---|---|---|---|
| Songs | `GET /api/v1/songs` | `GET /api/v1/songs/:id` | Joins artists, albums, genres |
| Podcasts | `GET /api/v1/podcasts` | `GET /api/v1/podcasts/:id` | Includes episode_count |
| | `GET /api/v1/podcasts/:id/episodes` | — | Paginated episodes for a show |
| Stations | `GET /api/v1/stations` | `GET /api/v1/stations/:id` | Ordered by listeners DESC |
| RJs | `GET /api/v1/rjs` | `GET /api/v1/rjs/:id` | Joins station name; ordered is_live DESC |
| Events | `GET /api/v1/events` | `GET /api/v1/events/:id` | Ordered starts_at ASC |
| Channels | `GET /api/v1/channels` | — | List only (no /:id endpoint) |
| Ads | `GET /api/v1/ads` | — | List only (no /:id endpoint) |

### Favourites — `/api/v1/favorites`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | Bearer | All saved items grouped by type |
| POST | `/:type/:id` | Bearer | `type ∈ { song, podcast, station, rj }` |
| DELETE | `/:type/:id` | Bearer | |

### Playback — `/api/v1`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/play-history` | Bearer | `{ contentType, contentId, playedSeconds }` — `contentType ∈ { song, episode, station }` |
| GET | `/play-history` | Bearer | Paginated |
| PUT | `/playback-progress/:episodeId` | Bearer | `{ progressSeconds, completed }` |
| GET | `/continue-listening` | Bearer | Unfinished podcast episodes |

### Notifications — `/api/v1/notifications`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | Bearer | User notification inbox |
| POST | `/subscriptions` | Bearer | `{ eventId? }` or `{ liveSessionId? }` (one required) |
| PATCH | `/:id/read` | Bearer | Mark as read |

### Reports & RJ Requests — `/api/v1`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/reports` | Bearer (required) | `{ targetType, targetId, reason, details? }` — `targetType ∈ { song, podcast, episode, station, rj, message }` |
| POST | `/rj-requests` | Optional Bearer | `{ requesterName, rjName, stationName, location?, message? }` |

### Search — `/api/v1/search`

| Method | Path | Auth | Query params |
|---|---|---|---|
| GET | `/` | — | `?q=` (1–100 chars) + `?limit=` (1–50, default 10). No `page` param. |

### Health & Docs

| Path | Notes |
|---|---|
| `GET /health` | Returns `{ status, database, redis }`. Status: `healthy` / `degraded` / `unhealthy` |
| `GET /api-docs` | Swagger UI |

---

## 5. WebSocket Gateway (Socket.IO)

**File:** `src/modules/live/websocket.gateway.ts`

- Attached to the Fastify HTTP server via `new Server(app.server, { ... })`
- **Transports:** `['websocket', 'polling']`
- **CORS:** `origin: true` (hardcoded — accepts all origins regardless of `CORS_ORIGIN` env var)
- **Authentication:** Socket handshake must supply JWT via `socket.handshake.auth.token` or
  `Authorization: Bearer <token>` header. Sockets without a valid access token are rejected.

| Event (client → server) | Payload | Server action |
|---|---|---|
| `live:join` | `{ sessionId: UUID }` | Joins room `live:<sessionId>`, emits `live:history` (last 100 messages) back, broadcasts `presence:update` count to room |
| `live:leave` | `{ sessionId: UUID }` | Leaves room, broadcasts updated `presence:update` |
| `live:message` | `{ sessionId, message }` | Persists to `live_chat_messages`, broadcasts `live:message` to room with user info, acks `{ ok, id }` |
| `live:reaction` | `{ sessionId, reaction }` | Broadcasts `live:reaction` to all others in room (not sender) — `reaction ∈ { like, love, fire, clap }` |

| Event (server → client) | Notes |
|---|---|
| `live:history` | Array of last ≤100 messages (chronological), emitted on join |
| `live:message` | New chat message with user `{ id, email }` |
| `live:reaction` | Emoji reaction with `userId` |
| `presence:update` | `{ sessionId, count }` — current listener count in room |

---

## 6. Background Queue System (BullMQ)

**Files:** `src/queues/index.ts`, `src/queues/workers.ts`, `src/queues/connection.ts`

Workers are started by `startWorkers()` in `app.ts`. If Redis is not ready at boot, workers are
skipped and a warning is logged. If Redis becomes unavailable later, job dispatches via
`addQueueJob()` are silently skipped with a warning log (no HTTP error thrown).

**Job retry:** 5 attempts, exponential backoff starting at 1000 ms.

| Queue | Worker action |
|---|---|
| `notification.queue` | Inserts row into `notifications` table (`userId, type, title, body, data`) |
| `email.queue` | Logs `{ jobId, to, template }` — no email provider is wired yet |
| `report.queue` | `UPDATE reports SET status='reviewing' WHERE id=$1 AND status='pending'` |

---

## 7. Authentication & Token Lifecycle

### Access Token
- Short-lived JWT signed with `JWT_ACCESS_SECRET` (default TTL: 900 s / 15 min).
- Claims: `{ sub: userId, email, role }`.
- Verified by `verifyAccessToken()` in `authenticate` preHandler.

### Refresh Token Family (Rotation)
1. On login/register: `crypto.randomBytes`-style refresh token signed with `JWT_REFRESH_SECRET`,
   stored in `refresh_tokens` as a **SHA-256 hash** (`hashToken()`).
2. Each token belongs to a `family_id` (UUID).
3. On `/auth/refresh`: old token is revoked (`revoked_at = now()`), new token issued in same family,
   linked via `replaced_by`.
4. **Reuse detection:** If a revoked token is presented, the **entire family** is immediately
   revoked → protects against token theft.
5. Device lookup in `refresh()` queries the `devices` table directly (not `user_devices`). The
   `AuthRepository.storeDevice()` compatibility shim detects which table exists at runtime.

### Device Key
- Sent by client on login/register as `deviceKey` (string).
- Stored in `user_devices` (or `devices` — shim resolves at runtime).
- Used to associate refresh tokens with a specific client device.

---

## 8. Database Schema

Defined in `src/database/migrations/001_initial.sql`. Extensions: `pgcrypto`, `pg_trgm`.

### Enums
- `user_role`: `user` | `admin`
- `user_status`: `active` | `suspended` | `deleted`
- `report_status`: `pending` | `reviewing` | `resolved` | `rejected`

### Tables

| Table | PK | Key columns |
|---|---|---|
| `users` | uuid | `email` UNIQUE, `password_hash`, `display_name`, `role`, `status` |
| `refresh_tokens` | uuid | `user_id → users`, `family_id`, `token_hash` UNIQUE (char 64), `device_id`, `revoked_at`, `replaced_by` |
| `user_devices` | uuid | `user_id → users`, `device_key`, `platform`, `push_token`, UNIQUE(`user_id, device_key`) |
| `genres` | uuid | `name` UNIQUE |
| `artists` | uuid | `name`, `verified`, `image_url` |
| `albums` | uuid | `artist_id → artists`, `title`, `cover_url` |
| `songs` | uuid | `artist_id`, `album_id`, `genre_id`, `title`, `audio_url`, `duration_seconds`, `play_count`, `is_trending` |
| `podcast_categories` | uuid | `name` UNIQUE |
| `speakers` | uuid | `name`, `bio`, `image_url` |
| `podcasts` | uuid | `category_id → podcast_categories`, `title`, `is_trending` |
| `podcast_speakers` | `(podcast_id, speaker_id)` | Junction table |
| `podcast_episodes` | uuid | `podcast_id → podcasts`, `audio_url`, `duration_seconds`, `episode_number`, `published_at`, `play_count` |
| `radio_stations` | uuid | `name`, `stream_url`, `city`, `genre`, `language`, `listeners`, `is_active` |
| `rjs` | uuid | `station_id → radio_stations`, `name`, `is_live`, `listeners` |
| `live_sessions` | uuid | `station_id → radio_stations`, `rj_id → rjs`, `title`, `stream_url`, `starts_at`, `ends_at`, `is_live` |
| `live_chat_messages` | uuid | `session_id → live_sessions`, `user_id → users`, `message` (varchar 1000) |
| `events` | uuid | `title`, `venue`, `city`, `event_type`, `starts_at`, `ticket_url` |
| `channels` | uuid | `name`, `stream_url`, `channel_number`, `language`, `is_active` |
| `ads` | uuid | `title`, `image_url`, `target_url`, `placement`, `priority`, `starts_at`, `ends_at`, `is_active` |
| `favorite_songs` | `(user_id, song_id)` | |
| `favorite_podcasts` | `(user_id, podcast_id)` | |
| `favorite_rjs` | `(user_id, rj_id)` | |
| `favorite_stations` | `(user_id, station_id)` | |
| `play_history` | uuid | `user_id`, `content_type ∈ { song, episode, station }`, `content_id`, `played_seconds`, `played_at` |
| `playback_progress` | `(user_id, episode_id)` | `progress_seconds`, `completed` |
| `notifications` | uuid | `user_id`, `type`, `title`, `body`, `data` (jsonb), `read_at` |
| `notification_subscriptions` | uuid | `user_id`, `event_id?`, `live_session_id?` — unique partial indexes per type |
| `reports` | uuid | `user_id`, `target_type`, `target_id`, `reason`, `details`, `status` |
| `rj_requests` | uuid | `user_id?` (nullable), `requester_name`, `rj_name`, `station_name`, `location?`, `message?`, `status` |

### Indexes

| Index | Type | On |
|---|---|---|
| `users_email_lower_idx` | B-Tree | `users(lower(email))` |
| `refresh_tokens_user_family_idx` | B-Tree | `refresh_tokens(user_id, family_id)` |
| `songs_published_idx` | B-Tree | `songs(published_at DESC)` |
| `songs_trending_idx` | B-Tree partial | `songs(play_count DESC) WHERE is_trending` |
| `songs_title_trgm_idx` | GIN | `songs(title gin_trgm_ops)` |
| `artists_name_trgm_idx` | GIN | `artists(name gin_trgm_ops)` |
| `podcasts_title_trgm_idx` | GIN | `podcasts(title gin_trgm_ops)` |
| `podcasts_trending_idx` | B-Tree | `podcasts(is_trending, created_at DESC)` |
| `rjs_name_trgm_idx` | GIN | `rjs(name gin_trgm_ops)` |
| `stations_name_trgm_idx` | GIN | `radio_stations(name gin_trgm_ops)` |
| `events_title_trgm_idx` | GIN | `events(title gin_trgm_ops)` |
| `events_start_idx` | B-Tree | `events(starts_at)` |
| `history_user_played_idx` | B-Tree | `play_history(user_id, played_at DESC)` |
| `notifications_user_idx` | B-Tree | `notifications(user_id, created_at DESC)` |
| `chat_session_created_idx` | B-Tree | `live_chat_messages(session_id, created_at DESC)` |
| `ads_active_idx` | B-Tree partial | `ads(placement, priority DESC) WHERE is_active` |
| `notification_event_unique` | Unique partial | `notification_subscriptions(user_id, event_id)` |
| `notification_live_unique` | Unique partial | `notification_subscriptions(user_id, live_session_id)` |

---

## 9. Environment Variables

Validated at startup by `src/config/env.ts` (Zod). The app refuses to start if required values
are invalid. All have defaults so development works without a `.env` file — **override these in
production**.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `4000` | HTTP listen port |
| `HOST` | `0.0.0.0` | HTTP listen host |
| `API_PREFIX` | `/api/v1` | Route prefix |
| `DATABASE_URL` | local PG URL | Full Postgres connection string |
| `DATABASE_SSL` | `false` | Set `true` for Neon / hosted Postgres |
| `DB_POOL_MAX` | `20` | pg pool max connections |
| `REDIS_ENABLED` | `true` | Set `false` to disable Redis entirely |
| `REDIS_URL` | — | Full Redis URL (takes priority over host/port) |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `` | Redis password |
| `REDIS_DB` | `0` | Redis DB index |
| `JWT_ACCESS_SECRET` | dev placeholder | **Must be ≥32 chars in production** |
| `JWT_REFRESH_SECRET` | dev placeholder | **Must be ≥32 chars in production, different from access** |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Access token lifetime (15 min) |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins (or `*`). Note: Socket.IO always allows all origins. |
| `LOG_LEVEL` | `info` | Pino log level |
| `CACHE_TTL_SECONDS` | `300` | Default catalog cache TTL |

---

## 10. Local Development & npm Scripts

```bash
cd "open backend/open-connect-backend"
cp .env.example .env          # fill in secrets

npm run infra:up               # docker compose up -d postgres redis
npm run migrate                # run migrations
npm run seed                   # seed admin + genres + stations
npm run dev                    # tsx watch src/server.ts

# API:       http://localhost:4000
# Health:    http://localhost:4000/health
# Swagger:   http://localhost:4000/api-docs
# Admin:     admin@openconnect.local / AdminPass123!  (seeded, dev only)
```

### npm Scripts

| Script | Command |
|---|---|
| `dev` | `tsx watch src/server.ts` |
| `build` | `tsc` |
| `start` | `node dist/server.js` |
| `migrate` | `tsx src/database/migrate.ts` |
| `migrate:prod` | `node dist/database/migrate.js` |
| `seed` | `tsx src/database/seeds/seed.ts` |
| `test` | `jest --runInBand` |
| `infra:up` | `docker compose up -d postgres redis` |
| `infra:down` | `docker compose down` |
