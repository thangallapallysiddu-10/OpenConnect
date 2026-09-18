# Open Connect

Open Connect is a full-stack streaming platform comprising an Expo/React Native client and a TypeScript/Fastify API. It supports music, podcasts, live radio and channels, radio-jockey (RJ) interactions, personal libraries, playback history, notifications, content reports, and real-time live-session chat and reactions.

## Repository layout

```text
.
├── open-connect/open-connect/              # Expo Router frontend
├── open backend/open-connect-backend/       # Fastify REST and Socket.IO backend
├── FRONTEND_STRUCTURE.md                    # Frontend architecture reference
└── BACKEND_STRUCTURE.md                     # Backend architecture reference
```

The two application directories are intentionally kept separate: each owns its own `package.json`, lockfile, environment configuration, and development workflow.

## Stack

| Area | Technology |
| --- | --- |
| Client | Expo, React Native, Expo Router, TypeScript, NativeWind |
| API | Node.js 20+, TypeScript, Fastify, Zod, Pino |
| Data | PostgreSQL 16 via `pg`; Redis 7 for caching and queues |
| Realtime | Socket.IO |
| Background work | BullMQ |
| Security | Helmet, CORS, rate limiting, bcrypt, JWT refresh-token rotation |

## Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop (recommended for PostgreSQL and Redis)

## Run the backend

```bash
cd "open backend/open-connect-backend"
copy .env.example .env
npm install
docker compose up -d postgres redis
npm run migrate
npm run seed
npm run dev
```

The local API runs at `http://localhost:3000`. Useful endpoints include:

- Health check: `GET /health`
- API documentation: `http://localhost:3000/api-docs`
- API base path: `/api/v1`

For the complete containerized stack, run `docker compose up --build` from the backend directory.

Redis is optional during development. If unavailable, cached reads and queue dispatches degrade gracefully; the API remains usable as long as PostgreSQL is available.

## Run the frontend

```bash
cd "open-connect/open-connect"
npm install
npx expo start
```

From the Expo terminal, press `w` for web or `a` for an Android emulator. For a physical device, scan the Expo QR code using Expo Go.

The app chooses its API base URL by platform:

- Web and iOS simulator: `http://localhost:3000/api/v1`
- Android emulator: `http://10.0.2.2:3000/api/v1`
- Production: set `EXPO_PUBLIC_API_URL`

## Application architecture

The frontend uses Expo Router file-based routes and React Context providers for theme, authentication, audio and podcast playback, live RJ sessions, favourites, filters, notifications, premium state, and podcasts. It includes responsive mobile and desktop interfaces, with local fallback data for resilience.

The backend follows a layered route → service → repository design. PostgreSQL persists catalog, identity, playback, notification, reporting, and live-session data. Redis provides cache-aside reads and BullMQ job infrastructure. Socket.IO handles live presence, messages, and reactions.

See [FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md) and [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md) for the detailed route, component, schema, API, and deployment references.

## API capabilities

- Authentication: registration, login, logout, profile retrieval, and rotating refresh tokens.
- Catalog: home feed, songs, podcasts and episodes, stations, RJs, events, channels, and ads.
- Listener features: favourites, listening history, playback progress, and continue-listening.
- Community and operations: notifications, reports, RJ shoutout requests, fuzzy search, and real-time live broadcasts.

## Security notes

Never commit `.env`, `.env.test`, credentials, signing keys, or device tokens. Copy `.env.example` for local configuration and replace example JWT secrets before deployment. The seeded development administrator documented by the backend is for local use only and must not be used in production.

## Validation

Run these from the relevant project directory:

```bash
# Backend
npm run build

# Frontend
npx expo start
```

## License

No license has been specified yet. Add one before distributing the project publicly.
