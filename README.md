# Open Connect

Open Connect is a full-stack streaming platform comprising an Expo/React Native client and a TypeScript/Fastify API. It supports music, podcasts, live radio and channels, radio-jockey (RJ) interactions, personal libraries, playback history, notifications, content reports, and real-time live-session chat and reactions.

**Status:** Production-ready with comprehensive audits and documentation | **Last Updated:** October 13, 2026

---

## Repository Layout

```
.
├── open backend/
│   └── open-connect-backend/              # TypeScript/Fastify REST + Socket.IO API
│       ├── README.md                      # Quick start & complete setup guide
│       ├── .env.example                   # Environment template
│       ├── package.json
│       ├── Dockerfile                     # Multi-stage production build
│       ├── docker-compose.yml             # API + Postgres + Redis orchestration
│       └── src/                           # Source code
│
├── open-connect/
│   └── open-connect/                      # Expo Router frontend
│       ├── README.md                      # Frontend quick start
│       ├── package.json
│       ├── app.json                       # Expo manifest
│       └── src/                           # React Native source code
│
├── BACKEND_STRUCTURE.md                   # Complete backend architecture audit
├── FRONTEND_STRUCTURE.md                  # Complete frontend architecture audit
└── README.md                              # This file: setup & overview
```

The two application directories are intentionally kept separate: each owns its own `package.json`, lockfile, environment configuration, and development workflow.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Frontend** | Expo Router, React Native | 54.x / 0.81 | Cross-platform mobile & web app |
| **Styling** | NativeWind, Tailwind CSS | 4.2 / 3.4 | Responsive component styling |
| **Backend** | Fastify | 5.8 | HTTP REST API framework |
| **Language** | TypeScript | 5.8 | Type-safe server & client |
| **Database** | PostgreSQL 16 | 16 | Relational data store |
| **DB Driver** | `pg` (node-postgres) | 8.16 | Parameterized SQL queries |
| **Cache** | Redis 7 via `ioredis` | 5.6 | Cache-aside + job queue |
| **Queues** | BullMQ | 5.53 | Background job processing |
| **Realtime** | Socket.IO | 4.8 | WebSocket live sessions |
| **Validation** | Zod | 3.25 | Runtime schema validation |
| **Authentication** | JWT + bcrypt | 9.0 / 6.0 | Token-based auth |
| **Security** | Helmet, CORS, Rate-Limit | latest | Security middleware |
| **API Docs** | Swagger + OpenAPI 3.0 | latest | Auto-generated `/api-docs` |
| **Logging** | Pino + pino-pretty | 9.7 | Structured JSON logging |
| **Container** | Docker / Docker Compose | latest | Development & production builds |

---

## Prerequisites

- **Node.js** ≥20 (check: `node --version`)
- **npm** (included with Node.js)
- **Docker** + **Docker Compose** (for database and cache)
- **Git** (for version control)
- **Modern browser** (Chrome 90+, Firefox 88+, Safari 14+) for web version

---

## Quick Start (Full Stack Local Setup)

### 1. Clone / Navigate to Project

```bash
cd c:/Kravix/OpenConnect
# (or your cloned repo path)
```

### 2. Backend Setup

```bash
cd "open backend/open-connect-backend"

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Generate secure JWT secrets (auto-updates .env)
npm run setup:local

# Start Docker services (PostgreSQL + Redis)
npm run infra:up

# Run database migrations
npm run migrate

# Seed initial data (admin user, genres, stations)
npm run seed

# Start dev server with hot reload
npm run dev
```

**Backend will be running at:**
- API: `http://localhost:3000`
- Health: `http://localhost:3000/health`
- Swagger Docs: `http://localhost:3000/api-docs`

### 3. Frontend Setup (in a new terminal)

```bash
# From project root
cd "open-connect/open-connect"

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

**From Expo terminal, press:**
- `w` — Open web version at `http://localhost:8081` (desktop Spotify-style layout)
- `a` — Open Android emulator (if installed)
- `i` — Open iOS simulator (macOS only)
- `Scan QR` — Use Expo Go on physical device

### 4. Verify Setup

#### Backend Health Check
```bash
curl http://localhost:3000/health
# Expected: { "status": "healthy", "database": true, "redis": true }
```

#### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User",
    "deviceKey": "device-001"
  }'

# Or login with seeded admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@openconnect.local",
    "password": "AdminPass123!",
    "deviceKey": "device-admin"
  }'
```

#### Test Catalog
```bash
# Get songs
curl http://localhost:3000/api/v1/songs?page=1&limit=10

# Search
curl "http://localhost:3000/api/v1/search?q=love&limit=5"

# Get home feed
curl http://localhost:3000/api/v1/home
```

---

## Environment Configuration

### Backend (.env)

Create or update `.env` in `open backend/open-connect-backend/`:

```bash
# Required in production
JWT_ACCESS_SECRET=<your-32+-char-random-string>
JWT_REFRESH_SECRET=<your-32+-char-random-string>

# Database
DATABASE_URL=postgres://user:password@localhost:5432/openconnect
DATABASE_SSL=false

# Redis
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# API
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api/v1

# Logging
LOG_LEVEL=info
CACHE_TTL_SECONDS=300

# CORS
CORS_ORIGIN=http://localhost:8081

# Seed (dev only)
SEED_ADMIN_PASSWORD=AdminPass123!
```

### Frontend (.env)

Create `.env.local` in `open-connect/open-connect/`:

```bash
# Backend API URL (optional — defaults to localhost:3000 or 10.0.2.2:3000 for Android)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## Docker Compose

### Start All Services

```bash
cd "open backend/open-connect-backend"
docker compose up --build
```

This starts:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **API** on `localhost:3000`

The API container auto-runs migrations on startup.

### Stop Services

```bash
docker compose down
```

### Remove All Data (volumes)

```bash
docker compose down -v
```

### View Logs

```bash
docker compose logs -f api
docker compose logs -f postgres
docker compose logs -f redis
```

---

## Development Workflows

### Backend Development

```bash
cd "open backend/open-connect-backend"
npm run dev
```

Changes to TypeScript files auto-reload via `tsx watch`. API restarts immediately.

**Useful endpoints during development:**
- `/api-docs` — Interactive Swagger UI
- `/health` — Service health check
- All `/api/v1/*` routes

### Frontend Development

```bash
cd "open-connect/open-connect"
npx expo start
```

Press `r` to reload, `c` to clear cache. Changes to React components hot-reload.

### Database Migrations

```bash
cd "open backend/open-connect-backend"

# Run pending migrations
npm run migrate

# Seed data
npm run seed

# Reset (dev only)
npm run infra:down && npm run infra:up && npm run migrate && npm run seed
```

### Testing Backend

```bash
cd "open backend/open-connect-backend"
npm run test
```

---

## Debugging

### Backend Logs

Real-time structured JSON logs:
```bash
npm run dev 2>&1 | jq .
```

Or view raw:
```bash
npm run dev
```

### Frontend Logs

Expo logs show in terminal; tap `j` for JavaScript console:
```bash
npx expo start
# Then press 'j' in the Expo terminal
```

### Database Connection

```bash
# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres -d openconnect

# List tables
\dt

# View users
SELECT id, email, display_name, role FROM users;
```

### Redis Connection

```bash
# Access Redis CLI
docker compose exec redis redis-cli

# View all keys
KEYS *

# Get a key
GET <key-name>

# Clear cache
FLUSHDB
```

---

## Production Deployment

### Backend Deployment Checklist

- [ ] Generate new JWT secrets (don't use dev defaults)
- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL (RDS, Neon, etc.) with SSL
- [ ] Use managed Redis (ElastiCache, Upstash, etc.)
- [ ] Set restrictive `CORS_ORIGIN` (not `*`)
- [ ] Enable database backups and point-in-time recovery
- [ ] Set up monitoring, logging, and alerting
- [ ] Use load balancer with SSL/TLS termination
- [ ] Configure Docker with health checks
- [ ] Test failover and recovery procedures

### Backend Deployment Example (Docker)

```bash
# Build production image
docker build -t myapp:latest .

# Run container
docker run -d \
  --name openconnect \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgres://... \
  -e JWT_ACCESS_SECRET=... \
  -e JWT_REFRESH_SECRET=... \
  -e REDIS_URL=redis://... \
  myapp:latest
```

### Frontend Deployment (Static Web Export)

```bash
cd "open-connect/open-connect"

# Build static web assets
npx expo export --platform web

# Deploy dist/ folder to static host (Netlify, Vercel, S3, etc.)
# Update EXPO_PUBLIC_API_URL to production API
```

---

## Troubleshooting

### Backend won't start

```bash
# Check Node version
node --version  # Must be ≥20

# Check port 3000 is free
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Check env vars
cat .env | grep JWT

# Verify Docker services
docker compose ps

# Rebuild
npm install
npm run build
```

### Database migration fails

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View migration logs
npm run migrate -- --verbose

# Reset (dev only)
docker compose down -v
docker compose up -d postgres
npm run migrate
npm run seed
```

### Frontend can't reach backend

```bash
# Check backend is running
curl http://localhost:3000/health

# Check EXPO_PUBLIC_API_URL
echo $EXPO_PUBLIC_API_URL

# For Android emulator, use 10.0.2.2 instead of localhost
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 npx expo start --android
```

### Redis connection errors

```bash
# Check Redis is running
docker compose logs redis

# Test connection
docker compose exec redis redis-cli ping

# Disable Redis temporarily
REDIS_ENABLED=false npm run dev
```

---

## Project Structure & Documentation

### Architecture Audits

Comprehensive architecture documents for code review:

- **[BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)** — Complete backend audit
  - All 50+ API endpoints with HTTP methods and payloads
  - Every service function and repository method
  - Database schema, indexes, and design patterns
  - Authentication & token lifecycle
  - WebSocket gateway and background jobs
  - Technology stack and performance considerations

- **[FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md)** — Complete frontend audit
  - All 40+ screens and routes
  - 30+ React components with purposes
  - 10 Context providers (state management)
  - API client integration patterns
  - Layout system (desktop + mobile)
  - Authentication lifecycle
  - Local mock data for resilience

### Backend

- **Backend README:** `open backend/open-connect-backend/README.md` — Quick start, setup, API overview
- **Source:** `open backend/open-connect-backend/src/`
  - `app.ts` — Fastify setup
  - `modules/` — Domain modules (auth, songs, podcasts, etc.)
  - `shared/` — Reusable layers (services, repositories, middleware)
  - `database/` — Migrations, seeds, pool management
  - `queues/` — BullMQ job workers

### Frontend

- **Frontend README:** `open-connect/open-connect/README.md` — Quick start, setup, development
- **Source:** `open-connect/open-connect/`
  - `app/` — Expo Router file-based routes
  - `src/screens/` — Full-screen views
  - `src/components/` — Reusable UI components
  - `src/context/` — React Context providers
  - `src/services/` — API client functions
  - `src/data/` — Local mock data

---

## Key Features

### Authentication & Security
- Registration with email/password
- Google OAuth 2.0 integration
- Rotating JWT refresh-token families
- Token reuse attack detection
- Multi-device session support
- Password hashing (bcrypt 12 rounds)
- Role-based access control (user, admin)

### Content & Playback
- 8 catalog types: songs, podcasts, episodes, stations, RJs, events, channels, ads
- Personalised playlists (favorites, history, continue-listening)
- Playback progress tracking per episode
- Full-text fuzzy search (trigram indexes)
- Trending & recommended content

### Community & Live
- Real-time live broadcasts with chat
- Emoji reactions (like, love, fire, clap)
- Listener presence tracking
- Event & live session notifications
- Content reporting (songs, podcasts, messages, etc.)
- RJ song requests and shoutouts

### Admin & Moderation
- User management dashboard
- Content moderation workflow
- Background job queue for reports
- Admin-only endpoints for user & content management

### Developer Experience
- Hot-reload dev servers (TypeScript & React)
- Comprehensive OpenAPI documentation
- Structured JSON logging
- Graceful Redis degradation
- Local mock data fallback
- Docker-based local development

---

## Architecture Philosophy

- **Modular:** Each domain (auth, songs, favorites) owns routes, service, and repository
- **Type-Safe:** End-to-end TypeScript + Zod validation
- **Scalable:** Stateless, horizontally-scalable architecture; connection pooling; caching layer
- **Resilient:** Graceful degradation (Redis optional); fallback mock data (frontend)
- **Observable:** Structured logging, health checks, Swagger docs
- **Secure:** CORS, rate limiting, bcrypt, JWT rotation, SQL parameterization
- **Testable:** Decoupled layers; unit test support for services and repositories

---

## Performance Considerations

- **Database:** Indexes on full-text search, timestamps, foreign keys
- **Cache:** Redis cache-aside pattern for home feed and catalog listings (default TTL 300s)
- **Queries:** Pagination on all list endpoints; lazy-load related data via JOINs
- **Frontend:** NativeWind for CSS-in-JS; React Context for state; local fallback data
- **Realtime:** Socket.IO with graceful degradation; optional Redis adapter for scaling

---

## Security Checklist

- [ ] Never commit `.env`, `.env.local`, or credentials
- [ ] Replace JWT secrets before production deployment
- [ ] Use HTTPS/TLS in production
- [ ] Restrict CORS origins (not `*`)
- [ ] Enable database SSL/TLS
- [ ] Rotate secrets on a regular schedule
- [ ] Monitor logs for suspicious activity
- [ ] Back up database and Redis regularly
- [ ] Test authentication & authorization flows
- [ ] Run dependency audit regularly

```bash
npm audit
npm audit fix
npm update
```

---

## Contributing

(Add contribution guidelines, code style, PR process, etc.)

---

## License

(Specify license once determined — e.g., MIT, Apache 2.0, etc.)

---

## Support & Documentation

- **API Documentation:** Visit `http://localhost:3000/api-docs` (Swagger UI)
- **Backend Architecture:** See `BACKEND_STRUCTURE.md`
- **Frontend Architecture:** See `FRONTEND_STRUCTURE.md`
- **Issues:** Create GitHub issues for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions

---

**Last Audit:** October 13, 2026 | **Status:** Production-Ready | **Version:** 1.0.0
