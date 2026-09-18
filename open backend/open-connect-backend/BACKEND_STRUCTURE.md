# Open Connect Backend — Architecture & Structure Reference

## 1. Executive Summary

**Open Connect Backend** is a production-oriented, modular REST and Realtime API built in **TypeScript** using **Fastify**. It serves as the primary backend for the **Open Connect** mobile streaming application (built with Expo).

The backend powers:
* **Audio & Media Streaming:** Full catalog management for songs, albums, artists, genres, podcasts, episodes, and live radio stations.
* **Broadcaster & Live Interactions:** Radio Jockey (RJ) profiles, scheduled live sessions, and realtime interactive broadcasts (chat, presence, reaction emojis).
* **Personalized User Features:** Multi-device session tracking, refresh token rotation families, bookmarking/favorites, playback history, and resume playback ("continue listening").
* **Operations & Community:** Event ticketing links, banner ads, in-app notification subscriptions, user reports for content moderation, and listener shoutout requests.

---

## 2. Technology Stack & Dependencies

| Category | Technology | Version | Purpose / Details |
| :--- | :--- | :--- | :--- |
| **HTTP Framework** | Fastify | `^5.8.5` | Fast, low-overhead HTTP web framework |
| **Language & Runtime** | Node.js (>=20) & TypeScript | `^5.8.3` | Strong static typing and modern ECMAScript features |
| **Dev Execution** | `tsx` | `^4.19.4` | Fast TypeScript execution with hot reload |
| **Database** | PostgreSQL 16 via `pg` | `^8.16.0` | Relational database with pooled parameterized SQL queries |
| **DB Extensions** | `pgcrypto`, `pg_trgm` | - | UUID generation (`gen_random_uuid()`) & trigram fuzzy search |
| **Caching** | Redis 7 via `ioredis` | `^5.6.1` | Cache-aside pattern with automatic fallback if offline |
| **Queue / Background Jobs** | BullMQ | `^5.53.2` | Queue workers with exponential backoff retries |
| **Realtime / WebSockets** | Socket.IO | `^4.8.1` | Live listener chat, reactions, and room presence tracking |
| **Data Validation** | Zod | `^3.25.56` | Schema validation for headers, query params, and request bodies |
| **Security & Auth** | `bcrypt` & `jsonwebtoken` | `^6.0.0` / `^9.0.2` | Password hashing (12 rounds) & rotating JWT token families |
| **Security Middleware** | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` | Latest | Security headers, CORS handling, and rate limiting (300 req/min) |
| **API Documentation** | `@fastify/swagger` & `@fastify/swagger-ui` | Latest | OpenAPI 3.0 specs and interactive UI at `/api-docs` |
| **Logging** | Pino & `pino-pretty` | `^9.7.0` | High-performance structured JSON logging |
| **Containerization** | Docker & Docker Compose | - | Isolated local Postgres 16, Redis 7, and Node API containers |

> **Note on Prisma / MongoDB:** Although an empty `prisma/` folder exists as a leftover artifact from earlier scaffolding, **Prisma and MongoDB are not used**. All database operations run via raw parameterized SQL using the `pg` connection pool.

---

## 3. High-Level Architectural Design

The codebase adheres to a modular **3-Layer Architecture** with centralized shared utilities:

```
                  ┌────────────────────────────────────────┐
                  │          HTTP Request / Client         │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         Fastify App (app.ts)           │
                  │  (Helmet, CORS, Rate Limit, Auth, Zod) │
                  └───────────────────┬────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │ Auth Routes  │      │Catalog Routes│      │ Realtime WS  │
        └───────┬──────┘      └───────┬──────┘      └───────┬──────┘
                │                     │                     │
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │ Auth Service │      │CatalogService│      │ Live Service │
        └───────┬──────┘      └───────┬──────┘      └───────┬──────┘
                │                     │                     │
                ▼                     ▼                     │
        ┌──────────────┐      ┌──────────────┐              │
        │AuthRepository│      │Catalog Repo  │              │
        └───────┬──────┘      └───────┬──────┘              │
                │                     │                     │
                ├─────────────────────┴─────────────────────┤
                ▼                                           ▼
       ┌───────────────────┐                      ┌───────────────────┐
       │   PostgreSQL 16   │                      │      Redis 7      │
       │ (Data Persistence)│                      │  (Cache & BullMQ) │
       └───────────────────┘                      └───────────────────┘
```

### Key Architectural Patterns:
1. **Separation of Concerns:**
   * **Routes (`*.routes.ts`):** Handles URL matching, parameter parsing, schema validation, and HTTP status responses.
   * **Services (`*.service.ts`):** Encapsulates business logic, data transformation, caching strategies, and queue dispatch.
   * **Repositories (`*.repository.ts`):** Executes direct, parameterized SQL statements via PostgreSQL pool.
2. **Generic Catalog Abstraction:**
   Entities with standard CRUD patterns (`songs`, `podcasts`, `stations`, `rjs`, `events`, `channels`, `ads`) share a single reusable `CatalogRepository` and `CatalogService` that uniformly handle pagination, trigram text filtering, relational joins, and Redis caching.
3. **Resilient Degradation:**
   Redis is treated as optional in development and degraded in production. If Redis disconnects or fails, cache operations seamlessly fall back to querying PostgreSQL directly, and BullMQ jobs log warnings rather than crashing the HTTP request cycle.

---

## 4. Complete Directory & File Structure

```
c:/Kravix/open backend/open-connect-backend/
│
├── Dockerfile                      # Production multi-stage Docker build
├── docker-compose.yml              # Production/local orchestration (API, Postgres, Redis)
├── docker-compose.redis.yml        # Standalone Redis service for local development
├── package.json                    # Project metadata, dependencies, and npm scripts
├── tsconfig.json                   # Strict TypeScript compiler configuration
├── jest.config.ts                  # Test runner settings
├── .env.example                    # Environment variable template
├── scripts/
│   ├── generate-env.ts             # Generates secure random 32-character JWT secrets
│   ├── setup-local.ps1             # Windows PowerShell automated local setup script
│   └── setup-local.sh              # Unix/macOS automated local setup script
│
├── src/
│   ├── server.ts                   # Main entrypoint: builds app and calls app.listen()
│   ├── app.ts                      # Core Fastify setup: plugins, routes, global error handlers
│   │
│   ├── config/                     # Configuration & Infrastructure Singletons
│   │   ├── env.ts                  # Zod-validated environment variables
│   │   ├── database.ts             # Database pool connection config
│   │   ├── redis.ts                # Redis client instance and health checks
│   │   └── logger.ts               # Pino logger instance
│   │
│   ├── database/                   # PostgreSQL Data Access & Migrations
│   │   ├── pool.ts                 # pg Pool instance and transaction helper
│   │   ├── migrate.ts              # Migration runner with `schema_migrations` tracking
│   │   ├── compatibility.ts        # Boot-time idempotent schema synchronization
│   │   ├── migrations/
│   │   │   └── 001_initial.sql     # Baseline DDL: tables, indexes, and enums
│   │   └── seeds/
│   │       └── seed.ts             # Database seeding (default admin, genres, stations)
│   │
│   ├── shared/                     # Reusable Cross-Cutting Utilities
│   │   ├── cache/
│   │   │   ├── cache.ts            # `cacheAside(key, ttl, fetcher)` implementation
│   │   │   └── cache.service.ts    # Cache invalidation helpers
│   │   ├── http/
│   │   │   ├── errors.ts           # Standard AppError, NotFoundError, UnauthorizedError classes
│   │   │   └── response.ts         # Response formatters (`ok`, `created`, `paginated`)
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT `authenticate`, `optionalAuth`, and `requireRole`
│   │   │   └── validate.ts         # Zod schema validation middleware for Fastify
│   │   ├── repositories/
│   │   │   └── catalog.repository.ts # Generic repository for catalog resources
│   │   ├── routes/
│   │   │   └── catalog.routes.ts   # Generic list & get-by-id Fastify route generator
│   │   ├── security/
│   │   │   ├── password.ts         # Bcrypt password hashing & verification
│   │   │   └── tokens.ts           # JWT generation, verification, and SHA-256 hash
│   │   ├── services/
│   │   │   └── catalog.service.ts  # Generic service with Redis caching
│   │   └── utils/
│   │       ├── pagination.ts       # Pagination query parsing (`limit`, `page`, `offsetOf`)
│   │       └── sql.ts              # SQL helper utilities
│   │
│   ├── queues/                     # Asynchronous Background Job System
│   │   ├── connection.ts           # BullMQ Redis connection wrapper
│   │   ├── index.ts                # Queue registry & `addQueueJob` dispatcher
│   │   └── workers.ts              # BullMQ worker handlers (notifications, emails, reports)
│   │
│   ├── plugins/                    # Fastify Plugin Wrappers
│   │   ├── auth.ts                 # Auth plugin hook
│   │   ├── swagger.ts              # Swagger & Swagger UI integration
│   │   └── websocket.ts            # Re-exports live websocket gateway
│   │
│   └── modules/                    # Domain Features
│       ├── auth/                   # Authentication & Token Management
│       │   ├── auth.repository.ts  # User & refresh token queries
│       │   ├── auth.routes.ts      # /register, /login, /refresh, /logout, /me
│       │   ├── auth.schemas.ts     # Zod DTO validation schemas
│       │   └── auth.service.ts     # Token rotation, credentials verification
│       ├── users/                  # User Profile Management
│       │   ├── users.repository.ts # User CRUD SQL
│       │   ├── users.routes.ts     # GET /me, PATCH /me, GET / (admin list)
│       │   ├── users.schemas.ts    # Profile update schemas
│       │   └── users.service.ts    # Profile updates & retrieval
│       ├── home/                   # Aggregated Home Screen
│       │   └── home.routes.ts      # GET /api/v1/home (cached aggregate feed)
│       ├── songs/                  # Songs Management
│       │   ├── songs.repository.ts
│       │   ├── songs.routes.ts     # Generic catalog endpoints
│       │   └── songs.service.ts
│       ├── podcasts/               # Podcasts & Episodes
│       │   ├── podcasts.repository.ts
│       │   ├── podcasts.routes.ts  # Catalog endpoints + GET /:id/episodes
│       │   └── podcasts.service.ts
│       ├── stations/               # Radio Stations
│       │   ├── stations.repository.ts
│       │   ├── stations.routes.ts
│       │   └── stations.service.ts
│       ├── rjs/                    # Radio Jockeys
│       │   ├── rjs.repository.ts
│       │   ├── rjs.routes.ts
│       │   └── rjs.service.ts
│       ├── events/                 # Events & Concerts
│       │   ├── events.repository.ts
│       │   ├── events.routes.ts
│       │   └── events.service.ts
│       ├── favorites/              # Multi-resource Favorites
│       │   ├── favorites.repository.ts
│       │   ├── favorites.routes.ts # GET /, POST /:type/:id, DELETE /:type/:id
│       │   └── favorites.service.ts
│       ├── playback/               # Play History & Resume
│       │   ├── playback.repository.ts
│       │   ├── playback.routes.ts  # /play-history, /playback-progress/:id, /continue-listening
│       │   └── playback.service.ts
│       ├── live/                   # Realtime Live Sessions & Chat
│       │   ├── live.service.ts     # Chat history & message persistence
│       │   └── websocket.gateway.ts# Socket.IO event handler & room state
│       ├── notifications/          # Notifications & Subscriptions
│       │   ├── notifications.repository.ts
│       │   ├── notifications.routes.ts # GET /, POST /subscriptions, PATCH /:id/read
│       │   └── notifications.service.ts
│       ├── reports/                # User Reports & Shoutout Requests
│       │   ├── reports.repository.ts
│       │   ├── reports.routes.ts   # POST /reports, POST /rj-requests
│       │   └── reports.service.ts
│       └── search/                 # Multi-entity Fuzzy Search
│           ├── search.repository.ts# Trigram SQL queries across 5 tables
│           ├── search.routes.ts    # GET /api/v1/search?q=
│           └── search.service.ts
```

---

## 5. Database Architecture & Schema

The schema is defined in [`001_initial.sql`](file:///c:/Kravix/open%20backend/open-connect-backend/src/database/migrations/001_initial.sql) and kept compatible via [`compatibility.ts`](file:///c:/Kravix/open%20backend/open-connect-backend/src/database/compatibility.ts).

### Database Enums
* `user_role`: `'user'`, `'admin'`
* `user_status`: `'active'`, `'suspended'`, `'deleted'`
* `report_status`: `'pending'`, `'reviewing'`, `'resolved'`, `'rejected'`

### Tables & Relationships

| Table Name | Primary Key | Key Columns / Foreign Keys | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | `email` (unique), `password_hash`, `role`, `status` | User accounts |
| `user_devices` | `id` (UUID) | `user_id` -> `users(id)`, `device_key`, `push_token` | Client hardware and push notification tokens |
| `refresh_tokens` | `id` (UUID) | `user_id`, `family_id`, `token_hash` (unique), `replaced_by` | Cryptographically hashed rotating refresh tokens |
| `genres` | `id` (UUID) | `name` (unique), `image_url` | Music genres |
| `artists` | `id` (UUID) | `name`, `verified`, `image_url` | Musical artists |
| `albums` | `id` (UUID) | `artist_id` -> `artists(id)`, `title`, `cover_url` | Music albums |
| `songs` | `id` (UUID) | `artist_id`, `album_id`, `genre_id`, `audio_url`, `play_count` | Audio tracks |
| `podcast_categories` | `id` (UUID) | `name` (unique), `image_url` | Podcast taxonomy |
| `speakers` | `id` (UUID) | `name`, `bio`, `image_url` | Podcast hosts / guests |
| `podcasts` | `id` (UUID) | `category_id` -> `podcast_categories(id)`, `title` | Podcast shows |
| `podcast_speakers` | `(podcast_id, speaker_id)` | Foreign keys to `podcasts` and `speakers` | Many-to-many junction |
| `podcast_episodes` | `id` (UUID) | `podcast_id` -> `podcasts(id)`, `audio_url`, `duration_seconds`| Individual episodes |
| `radio_stations` | `id` (UUID) | `name`, `stream_url`, `city`, `genre`, `listeners` | Live internet radio stations |
| `rjs` | `id` (UUID) | `station_id` -> `radio_stations(id)`, `name`, `is_live` | Radio Jockey profiles |
| `live_sessions` | `id` (UUID) | `station_id`, `rj_id`, `stream_url`, `starts_at`, `is_live` | Scheduled/active live broadcast sessions |
| `live_chat_messages`| `id` (UUID) | `session_id` -> `live_sessions(id)`, `user_id`, `message` | Chat messages posted during live sessions |
| `events` | `id` (UUID) | `title`, `venue`, `city`, `starts_at`, `ticket_url` | Concerts, meetups, and live events |
| `channels` | `id` (UUID) | `name`, `stream_url`, `channel_number`, `is_active` | Live stream / video channels |
| `ads` | `id` (UUID) | `title`, `image_url`, `target_url`, `placement`, `priority` | Targeted banner advertisements |
| `favorite_songs` | `(user_id, song_id)` | Foreign keys to `users` and `songs` | User bookmarked songs |
| `favorite_podcasts` | `(user_id, podcast_id)` | Foreign keys to `users` and `podcasts` | User bookmarked podcasts |
| `favorite_stations` | `(user_id, station_id)` | Foreign keys to `users` and `radio_stations` | User bookmarked radio stations |
| `favorite_rjs` | `(user_id, rj_id)` | Foreign keys to `users` and `rjs` | User bookmarked RJs |
| `play_history` | `id` (UUID) | `user_id`, `content_type` (`song`/`episode`/`station`), `content_id` | Historical listening logs |
| `playback_progress`| `(user_id, episode_id)`| `progress_seconds`, `completed` | Checkpoint for resuming podcast playback |
| `notifications` | `id` (UUID) | `user_id`, `type`, `title`, `body`, `data`, `read_at` | User notification inbox |
| `notification_subscriptions`| `id` (UUID) | `user_id`, `event_id`, `live_session_id` | Subscriptions to receive reminders |
| `reports` | `id` (UUID) | `user_id`, `target_type`, `target_id`, `reason`, `status` | Inappropriate content / user reports |
| `rj_requests` | `id` (UUID) | `requester_name`, `rj_name`, `station_name`, `message` | Listener requests and shoutouts |

### Database Indexes & Performance
* **Trigram Fuzzy Search Indexes (GIN):**
  * `songs_title_trgm_idx` on `songs(title gin_trgm_ops)`
  * `artists_name_trgm_idx` on `artists(name gin_trgm_ops)`
  * `podcasts_title_trgm_idx` on `podcasts(title gin_trgm_ops)`
  * `stations_name_trgm_idx` on `radio_stations(name gin_trgm_ops)`
  * `rjs_name_trgm_idx` on `rjs(name gin_trgm_ops)`
  * `events_title_trgm_idx` on `events(title gin_trgm_ops)`
* **B-Tree Lookups:**
  * Lowercase email lookup: `users_email_lower_idx` on `users(lower(email))`
  * Token families: `refresh_tokens_user_family_idx` on `refresh_tokens(user_id, family_id)`
  * Trending & History: Partial indexes on trending songs/podcasts and sorted play history

---

## 6. API Route Directory

All endpoints (except `/health` and `/api-docs`) are prefixed with `env.API_PREFIX` (default: `/api/v1`).

### Authentication (`/api/v1/auth`)
* `POST /api/v1/auth/register` — Register a new user account
* `POST /api/v1/auth/login` — Login with email/password; receives access token and refresh token
* `POST /api/v1/auth/refresh` — Exchange refresh token for a new token pair (rotates refresh token)
* `POST /api/v1/auth/logout` — Revoke active refresh token family
* `GET  /api/v1/auth/me` — Retrieve current authenticated user profile (requires Bearer token)

### User Management (`/api/v1/users`)
* `GET   /api/v1/users/me` — Retrieve current user profile
* `PATCH /api/v1/users/me` — Update display name, bio, location, avatar
* `GET   /api/v1/users` — Admin only: Paginated list of all users

### Home Feed (`/api/v1/home`)
* `GET /api/v1/home` — Aggregated dashboard payload cached in Redis (trending songs, new releases, podcasts, active stations, live RJs, upcoming events, channels, active banner ads)

### Catalog Resources (Standard Generic CRUD)
* `GET /api/v1/songs` & `GET /api/v1/songs/:id`
* `GET /api/v1/podcasts` & `GET /api/v1/podcasts/:id`
* `GET /api/v1/podcasts/:id/episodes` — Paginated episodes for a podcast show
* `GET /api/v1/stations` & `GET /api/v1/stations/:id`
* `GET /api/v1/rjs` & `GET /api/v1/rjs/:id`
* `GET /api/v1/events` & `GET /api/v1/events/:id`
* `GET /api/v1/channels` — List active streaming channels
* `GET /api/v1/ads` — List active advertisement banners

### User Playback & Engagement
* `GET    /api/v1/favorites` — List all user favorites grouped by entity
* `POST   /api/v1/favorites/:type/:id` — Add favorite (`song`, `podcast`, `station`, `rj`)
* `DELETE /api/v1/favorites/:type/:id` — Remove favorite
* `POST   /api/v1/play-history` — Record played seconds for song/episode/station
* `GET    /api/v1/play-history` — Paginated user playback history
* `PUT    /api/v1/playback-progress/:episodeId` — Save listening position for podcast episodes
* `GET    /api/v1/continue-listening` — Returns unfinished podcast episodes for resume playback

### Notifications, Reports & Search
* `GET   /api/v1/notifications` — List user notifications
* `POST  /api/v1/notifications/subscriptions` — Subscribe to live session or event reminder
* `PATCH /api/v1/notifications/:id/read` — Mark notification as read
* `POST  /api/v1/reports` — File a report on content or a message
* `POST  /api/v1/rj-requests` — Submit a song request or shoutout to an RJ
* `GET   /api/v1/search?q=&limit=` — Trigram multi-entity search across songs, podcasts, stations, RJs, events

### Health & Monitoring
* `GET /health` — Returns status (`healthy`, `degraded`, or `unhealthy`) with database and Redis statuses
* `GET /api-docs` — Swagger UI interactive documentation

---

## 7. Realtime WebSocket Gateway (Socket.IO)

* **Initialization:** Handled in [`src/modules/live/websocket.gateway.ts`](file:///c:/Kravix/open%20backend/open-connect-backend/src/modules/live/websocket.gateway.ts).
* **Authentication:** Sockets authenticate during handshake via `auth: { token }` or `Authorization: Bearer <token>`.
* **Events:**
  * `live:join` `({ sessionId })`: Joins room `live:<sessionId>`, emits back `live:history`, and broadcasts updated `presence:update` count to the room.
  * `live:leave` `({ sessionId })`: Leaves room and broadcasts updated `presence:update`.
  * `live:message` `({ sessionId, message })`: Persists message into `live_chat_messages` table and broadcasts `live:message` to the room.
  * `live:reaction` `({ sessionId, reaction })`: Broadcasts animated emoji reaction (`'like' | 'love' | 'fire' | 'clap'`) to other listeners in the room.

---

## 8. Background Queue System (BullMQ)

* **Location:** [`src/queues/index.ts`](file:///c:/Kravix/open%20backend/open-connect-backend/src/queues/index.ts) and [`src/queues/workers.ts`](file:///c:/Kravix/open%20backend/open-connect-backend/src/queues/workers.ts).
* **Retry Strategy:** 5 attempts with exponential backoff starting at 1000ms.
* **Queues:**
  1. `notification.queue`: Asynchronously writes notification records to PostgreSQL.
  2. `email.queue`: Dispatches transactional emails (templated).
  3. `report.queue`: Updates newly filed reports from `pending` to `reviewing`.

---

## 9. Authentication & Token Lifecycle

1. **Access Token:**
   * Short-lived JWT (default 15 minutes / 900s).
   * Signed with `JWT_ACCESS_SECRET`.
   * Contains claims: `{ sub: userId, email, role }`.
2. **Rotating Refresh Token Family:**
   * Generated with `crypto.randomBytes(48)` and stored in `refresh_tokens` as a SHA-256 hash.
   * Associated with a unique `family_id`.
   * When exchanged via `/auth/refresh`, the old token is revoked (`revoked_at`), and a new token is created with the same `family_id` and linked via `replaced_by`.
   * **Reuse Detection:** If a previously revoked refresh token is presented, the entire family is immediately revoked, protecting against token theft.

---

## 10. How to Run Locally

```bash
# 1. Navigate to backend directory
cd "c:/Kravix/open backend/open-connect-backend"

# 2. Copy environment file and configure
cp .env.example .env

# 3. Spin up PostgreSQL and Redis with Docker
npm run infra:up

# 4. Run database migrations and seed default data
npm run migrate
npm run seed

# 5. Start development server with live reload
npm run dev
```
* **API Server:** `http://localhost:4000` (or configured `PORT`)
* **Health Check:** `http://localhost:4000/health`
* **Swagger Documentation:** `http://localhost:4000/api-docs`
* **Default Seeded Admin:** `admin@openconnect.local` / `AdminPass123!`
