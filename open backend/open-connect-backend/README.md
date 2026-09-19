# Open Connect Backend

Production-oriented TypeScript API for the **Open Connect** Expo mobile and web streaming application. Built on **Fastify 5**, raw parameterized PostgreSQL queries via `pg`, Redis cache-aside caching, rotating JWT refresh-token families, BullMQ background queues, Socket.IO realtime gateway, Zod validation, Pino logging, and OpenAPI 3.0 documentation.

> Prisma and MongoDB are not used. All database operations use parameterized SQL through the `pg` connection pool.

---

## Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| HTTP Framework | Fastify | `^5.8.5` |
| Language & Runtime | TypeScript / Node.js ≥20 | `^5.8.3` |
| Dev Execution | `tsx` | `^4.19.4` |
| Database | PostgreSQL 16 via `pg` | `^8.16.0` |
| DB Extensions | `pgcrypto`, `pg_trgm` | — |
| Caching | Redis 7 via `ioredis` | `^5.6.1` |
| Background Jobs | BullMQ | `^5.53.2` |
| Realtime | Socket.IO | `^4.8.1` |
| Validation | Zod | `^3.25.56` |
| Auth | `bcrypt` / `jsonwebtoken` | `^6.0.0` / `^9.0.2` |
| Security Middleware | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` | Latest |
| API Docs | `@fastify/swagger` + `@fastify/swagger-ui` | Latest |
| Logging | Pino / `pino-pretty` | `^9.7.0` |

---

## Quick Start

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — replace JWT_ACCESS_SECRET and JWT_REFRESH_SECRET with 32+ random chars

# 2. Install dependencies
npm install

# 3. Start PostgreSQL and Redis via Docker
npm run infra:up

# 4. Run database migrations
npm run migrate

# 5. Seed default data (admin user, genres, stations)
npm run seed

# 6. Start development server with hot reload
npm run dev
```

| Endpoint | URL |
| :--- | :--- |
| API Server | `http://localhost:3000` |
| Health Check | `http://localhost:3000/health` |
| Swagger UI | `http://localhost:3000/api-docs` |
| REST prefix | `/api/v1` |

> Default seeded admin: `admin@openconnect.local` / `AdminPass123!`  
> Override the password via `SEED_ADMIN_PASSWORD`. Never use the default in production.

For the fully containerized stack (API + Postgres + Redis): `docker compose up --build`. The API container applies pending migrations before startup.

---

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `HOST` | `0.0.0.0` | Bind address |
| `API_PREFIX` | `/api/v1` | Route prefix |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `DATABASE_SSL` | `false` | Enable SSL for DB |
| `DB_POOL_MAX` | `20` | Max pool connections |
| `REDIS_ENABLED` | `true` | Enable Redis |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis auth password |
| `REDIS_DB` | `0` | Redis DB index |
| `REDIS_URL` | — | Alternative to individual Redis vars |
| `JWT_ACCESS_SECRET` | — | **Replace in production** |
| `JWT_REFRESH_SECRET` | — | **Replace in production** |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Access token lifetime (15 min) |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime |
| `CORS_ORIGIN` | `http://localhost:8081` | Allowed origins (comma-separated) |
| `LOG_LEVEL` | `info` | Pino log level |
| `CACHE_TTL_SECONDS` | `300` | Default Redis cache TTL |

---

## Redis

Redis is optional in development. When unavailable:
- Cache operations become no-ops
- BullMQ queue jobs are skipped with warnings
- `/health` returns `{ "status": "degraded", "redis": false }`

Run Redis standalone:
```bash
docker compose -f docker-compose.redis.yml up -d

# Verify
docker compose -f docker-compose.redis.yml exec redis redis-cli ping
# → PONG

curl http://localhost:3000/health
# → { "status": "healthy", "database": true, "redis": true }
```

Disable Redis for local development without Docker:
```bash
REDIS_ENABLED=false
```

---

## Authentication

- **Access tokens** expire after 15 minutes (configurable via `ACCESS_TOKEN_TTL_SECONDS`), signed with `JWT_ACCESS_SECRET`. Claims: `{ sub, email, role }`.
- **Refresh tokens** are random 48-byte values stored as SHA-256 hashes, grouped in families. Exchanging via `/auth/refresh` atomically revokes the old token and issues a replacement in the same family.
- **Reuse detection:** presenting a revoked refresh token immediately revokes the entire family.
- Register and login accept `deviceKey`, `platform`, and an optional `pushToken` to support multi-device sessions.
- Send access tokens as `Authorization: Bearer <token>`.

---

## API Route Reference

All routes are prefixed with `/api/v1` unless noted.

### Auth
| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Login; returns access + refresh tokens |
| `POST` | `/auth/refresh` | Rotate refresh token; returns new token pair |
| `POST` | `/auth/logout` | Revoke active refresh token family |
| `GET` | `/auth/me` | Current user profile (requires Bearer token) |

### Users
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/users/me` | Current user profile |
| `PATCH` | `/users/me` | Update display name, bio, location, avatar |
| `GET` | `/users` | Admin only — paginated user list |

### Home Feed
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/home` | Aggregated home payload (trending songs, new releases, podcasts, active stations, live RJs, upcoming events, channels, active ads) — Redis cached |

### Catalog
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/songs` | Paginated song list with optional search |
| `GET` | `/songs/:id` | Single song |
| `GET` | `/podcasts` | Paginated podcast list |
| `GET` | `/podcasts/:id` | Single podcast |
| `GET` | `/podcasts/:id/episodes` | Paginated episodes for a podcast |
| `GET` | `/stations` | Radio station list |
| `GET` | `/stations/:id` | Single station |
| `GET` | `/rjs` | Radio Jockey list |
| `GET` | `/rjs/:id` | Single RJ |
| `GET` | `/events` | Events & concerts list |
| `GET` | `/events/:id` | Single event |
| `GET` | `/channels` | Active streaming channels |
| `GET` | `/ads` | Active banner advertisements |

### Playback & Engagement
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/favorites` | All favorites grouped by type |
| `POST` | `/favorites/:type/:id` | Add favorite (`song`, `podcast`, `station`, `rj`) |
| `DELETE` | `/favorites/:type/:id` | Remove favorite |
| `POST` | `/play-history` | Record play event for song / episode / station |
| `GET` | `/play-history` | Paginated user playback history |
| `PUT` | `/playback-progress/:episodeId` | Save podcast episode position |
| `GET` | `/continue-listening` | Unfinished episodes for resume playback |

### Notifications, Reports & Search
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/notifications` | User notification inbox |
| `POST` | `/notifications/subscriptions` | Subscribe to live session or event reminder |
| `PATCH` | `/notifications/:id/read` | Mark notification as read |
| `POST` | `/reports` | File a content or message report |
| `POST` | `/rj-requests` | Submit a song request or shoutout to an RJ |
| `GET` | `/search?q=&limit=` | Trigram fuzzy search across songs, podcasts, stations, RJs, events |

### System
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check — returns `healthy`, `degraded`, or `unhealthy` |
| `GET` | `/api-docs` | Swagger UI |

---

## Realtime Gateway (Socket.IO)

Clients authenticate during handshake with `auth: { token }` or `Authorization: Bearer <token>`.

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `live:join` | Client → Server | `{ sessionId }` | Join live room; receives `live:history` |
| `live:leave` | Client → Server | `{ sessionId }` | Leave live room |
| `live:message` | Client → Server | `{ sessionId, message }` | Send chat message; persisted and broadcast |
| `live:reaction` | Client → Server | `{ sessionId, reaction }` | Broadcast emoji (`like`, `love`, `fire`, `clap`) |
| `presence:update` | Server → Room | `{ count }` | Updated listener count after join/leave |

When scaling across multiple API instances, configure a Socket.IO Redis adapter and use sticky sessions at the load balancer.

---

## Background Jobs (BullMQ)

Workers start automatically on app boot. All queues retry up to 5 times with exponential backoff starting at 1 000 ms.

| Queue | Purpose |
| :--- | :--- |
| `notification.queue` | Asynchronously writes notification records to PostgreSQL |
| `email.queue` | Dispatches transactional emails |
| `report.queue` | Transitions new reports from `pending` → `reviewing` |

---

## Database Schema

Schema is applied via `src/database/migrations/001_initial.sql`. `compatibility.ts` runs idempotent checks at boot to keep the schema in sync without re-running migrations.

### Enums
- `user_role`: `user`, `admin`
- `user_status`: `active`, `suspended`, `deleted`
- `report_status`: `pending`, `reviewing`, `resolved`, `rejected`

### Tables

| Table | Description |
| :--- | :--- |
| `users` | User accounts with role and status |
| `user_devices` | Per-device keys and push notification tokens |
| `refresh_tokens` | SHA-256 hashed rotating token families |
| `genres` | Music genre taxonomy |
| `artists` | Musical artists |
| `albums` | Albums linked to artists |
| `songs` | Audio tracks with play counts and trending flag |
| `podcast_categories` | Podcast taxonomy |
| `speakers` | Podcast hosts and guests |
| `podcasts` | Podcast shows |
| `podcast_speakers` | Many-to-many junction for podcasts ↔ speakers |
| `podcast_episodes` | Individual podcast episodes |
| `radio_stations` | Live internet radio stations |
| `rjs` | Radio Jockey profiles |
| `live_sessions` | Scheduled and active broadcast sessions |
| `live_chat_messages` | Chat messages scoped to live sessions |
| `events` | Concerts, meetups, and live events |
| `channels` | Live stream and video channels |
| `ads` | Targeted banner advertisements |
| `favorite_songs` | User bookmarked songs |
| `favorite_podcasts` | User bookmarked podcasts |
| `favorite_stations` | User bookmarked radio stations |
| `favorite_rjs` | User bookmarked RJs |
| `play_history` | Historical listening log per user |
| `playback_progress` | Podcast episode resume checkpoints |
| `notifications` | User notification inbox |
| `notification_subscriptions` | Event and live session reminders |
| `reports` | Inappropriate content reports |
| `rj_requests` | Listener song requests and shoutouts |

### Indexes
- **GIN trigram** on `songs.title`, `artists.name`, `podcasts.title`, `radio_stations.name`, `rjs.name`, `events.title` — powers `/search`
- **B-tree** on `users(lower(email))`, `refresh_tokens(user_id, family_id)`, `play_history(user_id, played_at DESC)`, `notifications(user_id, created_at DESC)`, and others

---

## Project Structure

```
src/
├── server.ts                   # Entrypoint — builds app and calls listen()
├── app.ts                      # Fastify setup: plugins, routes, error handlers
│
├── config/
│   ├── env.ts                  # Zod-validated environment variables
│   ├── database.ts             # DB pool connection config
│   ├── redis.ts                # Redis client and health check
│   └── logger.ts               # Pino logger instance
│
├── database/
│   ├── pool.ts                 # pg Pool + transaction helper
│   ├── migrate.ts              # Migration runner (schema_migrations table)
│   ├── compatibility.ts        # Boot-time idempotent schema sync
│   ├── migrations/001_initial.sql
│   └── seeds/seed.ts           # Default admin, genres, stations
│
├── shared/
│   ├── cache/                  # cacheAside() + invalidation helpers
│   ├── http/                   # AppError classes + response formatters
│   ├── middleware/             # JWT auth hooks + Zod validation middleware
│   ├── repositories/           # Generic CatalogRepository
│   ├── routes/                 # Generic catalog route generator
│   ├── security/               # bcrypt helpers + JWT utils
│   ├── services/               # Generic CatalogService with Redis caching
│   └── utils/                  # Pagination parsing + SQL helpers
│
├── queues/
│   ├── connection.ts           # BullMQ Redis connection
│   ├── index.ts                # Queue registry + addQueueJob()
│   └── workers.ts              # Worker handlers
│
├── plugins/
│   ├── auth.ts                 # Auth plugin hook
│   ├── swagger.ts              # Swagger + Swagger UI
│   └── websocket.ts            # Socket.IO gateway export
│
└── modules/
    ├── auth/                   # /auth/* — register, login, refresh, logout, me
    ├── users/                  # /users/* — profile management
    ├── home/                   # /home — aggregated home feed
    ├── songs/                  # /songs
    ├── podcasts/               # /podcasts + /podcasts/:id/episodes
    ├── stations/               # /stations
    ├── rjs/                    # /rjs
    ├── events/                 # /events
    ├── favorites/              # /favorites
    ├── playback/               # /play-history, /playback-progress, /continue-listening
    ├── live/                   # Socket.IO gateway + chat persistence
    ├── notifications/          # /notifications
    ├── reports/                # /reports, /rj-requests
    └── search/                 # /search
```

> `modules/catalog/` and `modules/interactions/` are empty placeholder folders for future features. Catalog logic is implemented in `src/shared/`.

---

## npm Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run lint` | Type-check without emitting files |
| `npm run migrate` | Run pending SQL migrations |
| `npm run migrate:prod` | Same, from compiled dist |
| `npm run seed` | Seed default data |
| `npm run test` | Run Jest tests |
| `npm run infra:up` | Start Postgres + Redis via Docker Compose |
| `npm run infra:down` | Stop Docker Compose services |
| `npm run setup:local` | Automated Windows local setup (PowerShell) |
| `npm run setup:local:unix` | Automated Unix/macOS local setup |

---

## Frontend

The companion mobile and web app is **Open Connect** (also branded **Melody Meet** on desktop) — a universal Expo SDK 54 / React Native application using Expo Router, NativeWind, and Socket.IO.

**Frontend location:** `c:/Kravix/open-connect/open-connect/`

```bash
cd "c:/Kravix/open-connect/open-connect"
npm install
npx expo start
# w = web (desktop Spotify layout at localhost:8081)
# a = Android emulator
# i = iOS simulator (macOS only)
# scan QR = Expo Go on physical device
```

The frontend points to `http://localhost:3000/api/v1` (web/iOS) or `http://10.0.2.2:3000/api/v1` (Android emulator). Override with `EXPO_PUBLIC_API_URL`. If the backend is offline, screens fall back automatically to local mock data in `src/data/`.

---

## Production Checklist

- Replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with cryptographically random 32+ character strings (`npm run setup:local` or `scripts/generate-env.ts`)
- Change the default seeded admin password via `SEED_ADMIN_PASSWORD`
- Replace all example media URLs with real CDN/storage URLs
- Terminate TLS at the ingress (load balancer / reverse proxy)
- Restrict `CORS_ORIGIN` to your actual frontend domains
- Back up PostgreSQL and Redis volumes regularly
- Rotate signing secrets through your secret manager on a schedule
- Add a Socket.IO Redis adapter when running multiple API instances
