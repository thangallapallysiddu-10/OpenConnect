# Open Connect Backend

Production-oriented TypeScript API for the Open Connect Expo application. It uses Fastify, raw parameterized PostgreSQL queries through `pg`, Redis cache-aside caching, JWT access tokens with rotating refresh-token families, BullMQ, Socket.io, Zod, Pino, and OpenAPI. Prisma and MongoDB are not used.

## Quick start

Copy `.env.example` to `.env`, replace both JWT secrets, then run:

```bash
npm install
docker compose up -d postgres redis
npm run migrate
npm run seed
npm run dev
```

The local `.env` in this workspace uses `PORT=3000`, so the API listens on `http://localhost:3000`; health is at `/health`, Swagger UI at `/api-docs`, and REST routes use `/api/v1`.

For the complete containerized stack, run `docker compose up --build`. The API container applies pending SQL migrations before startup. Migration files are recorded in `schema_migrations` and applied exactly once.

## Redis

Redis is optional in development. When Redis is running, the backend enables cache-aside reads and BullMQ queues. When Redis is unavailable, startup continues, cache operations become no-ops, queue jobs are skipped with warnings, and `/health` reports `status: "degraded"` with `redis: false`.

Configure Redis with either a URL:

```bash
REDIS_URL=redis://127.0.0.1:6379
```

or individual connection settings:

```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

Install and run Redis locally with Docker:

```bash
docker compose -f docker-compose.redis.yml up -d
```

Verify Redis:

```bash
docker compose -f docker-compose.redis.yml exec redis redis-cli ping
curl http://localhost:3000/health
```

The expected Redis CLI response is `PONG`. With Redis available, health returns `{"status":"healthy","database":true,"redis":true}`. Without Redis, health returns `{"status":"degraded","database":true,"redis":false}`.

Disable Redis in development:

```bash
REDIS_ENABLED=false
```

## Authentication

Register and login accept `deviceKey`, `platform`, and an optional `pushToken`. Access tokens expire after 15 minutes by default. Refreshing atomically revokes the old refresh token and creates its replacement in the same token family. Reuse causes the family to be revoked. Send access tokens as `Authorization: Bearer <token>`.

Seeded local admin: `admin@openconnect.local` / `AdminPass123!`. Override this with `SEED_ADMIN_PASSWORD`; never use the default in production.

## API groups

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- Catalog: `/home`, `/songs`, `/podcasts`, `/stations`, `/rjs`, `/events`, `/channels`, `/ads`
- User actions: `/favorites`, `/play-history`, `/playback-progress/:episodeId`, `/continue-listening`
- Other: `/notifications`, `/reports`, `/rj-requests`, `/search?q=`

Socket.io clients authenticate with `auth: { token }`. Supported events are `live:join`, `live:leave`, `live:message`, `live:reaction`, and `presence:update`. Join and message payloads use a `sessionId` UUID.

## Operations

`npm run build` performs the strict TypeScript production build. Redis cache failures do not break reads. PostgreSQL failures return an unhealthy readiness response. Queues retry jobs five times with exponential backoff. Run multiple API instances behind a load balancer with sticky sessions and configure a Socket.io Redis adapter when scaling realtime traffic across nodes.

Back up PostgreSQL and Redis volumes, rotate signing secrets through your secret manager, terminate TLS at the ingress, restrict CORS, and replace example media URLs before production deployment.
