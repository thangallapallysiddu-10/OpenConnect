# Open Connect Frontend — Architecture & Structure Reference

> **Source of truth:** This document is generated from reading the actual source files under
> `open-connect/open-connect/`. Every claim below is traceable to a specific file.

---

## 1. Executive Summary

**Open Connect Frontend** is a universal cross-platform app built with **Expo SDK 54** and
**React Native 0.81**. It delivers a music, podcast, and live radio streaming experience across
iOS, Android, and web (static export).

Key capabilities:
- Music playback via `HTMLAudioElement` (web) with a 6-track built-in sample queue
- Podcast playback via `HTMLAudioElement` with per-episode progress tracking
- Live radio session UI (local state; no Socket.IO connection from the frontend yet)
- Responsive dual-layout: Spotify-style 3-column desktop at ≥900 px, mobile tab bar below
- Full auth lifecycle: register, login, token refresh, session hydration on boot
- Favourites persisted to `localStorage` (`@open_connect_favorites`)
- Resilient data layer: every screen falls back to local mock data if the backend is unavailable

---

## 2. Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Expo SDK | `~54.0.37` |
| Core | React / React Native | `19.1.0` / `0.81.5` |
| Routing | Expo Router | `~6.0.24` |
| Navigation primitives | `@react-navigation/native` | `^7.1.8` |
| Styling | NativeWind + Tailwind CSS | `^4.2.3` / `^3.4.19` |
| Audio engine | `HTMLAudioElement` (browser API) | — |
| Animations | `react-native-reanimated` + `Animated` API | `~4.1.1` |
| Visual effects | `expo-linear-gradient`, `expo-blur` | `~15.0.8` |
| Icons | `@expo/vector-icons` (Ionicons) | `^15.0.3` |
| Media / Files | `expo-file-system`, `expo-image` | latest |
| Haptics | `expo-haptics` | latest |
| TypeScript | — | `^5.9.2` |

> **Audio note:** Neither `expo-av` (`Audio.Sound`) nor `expo-audio` is used for playback logic.
> Both `AudioContext` (music) and `PlayerContext` (podcasts) drive a `new Audio(uri)` browser
> `HTMLAudioElement`. The packages remain in `package.json` but are not imported by any context.

---

## 3. High-Level Architecture

```
app/_layout.tsx  (RootLayout)
│
└── SafeAreaProvider
    └── ThemeProvider
        └── AuthProvider
            └── PremiumProvider
                └── NotificationProvider
                    └── AudioProvider
                        └── PodcastProvider
                            └── PlayerProvider
                                └── FilterProvider
                                    └── FavoritesProvider
                                        └── RJLiveProvider
                                            └── RootLayoutContent
                                                │
                                                ├── width >= 900 → DesktopLayout
                                                │     ├── DesktopSidebar (240 px fixed)
                                                │     ├── Center: DesktopTopNav + AppStack
                                                │     ├── DesktopRightSidebar
                                                │     └── DesktopPlayerBar (full-width bottom)
                                                │
                                                ├── width < 900  → MobileLayout
                                                │     ├── AppStack
                                                │     ├── PodcastMiniPlayer (floating)
                                                │     ├── RJLiveMiniPlayer  (floating)
                                                │     └── MobileTabBar
                                                │
                                                └── Modals (always rendered, outside layouts)
                                                      AuthModal, ProfileModal,
                                                      NotificationsModal, PremiumFeatures
```

`DESKTOP_BREAKPOINT = 900` (px) — sourced from `_layout.tsx`.

---

## 4. Complete Directory & File Structure

```
open-connect/open-connect/
│
├── app.json                     # Expo manifest; web.output = "static"
├── package.json
├── tsconfig.json
├── babel.config.js              # Babel preset-expo + NativeWind
├── tailwind.config.js
├── global.css                   # Tailwind base styles (imported by _layout.tsx)
├── metro.config.js              # Metro + NativeWind wrapper
│
├── app/                         # Expo Router file-based routes
│   ├── _layout.tsx              # Root layout: 11 providers + dual-layout switch + global modals
│   ├── index.tsx                # Home screen
│   ├── search.tsx               # Search screen
│   ├── favourites.tsx           # Favourites / library screen
│   ├── now-player.tsx           # Full-screen music player
│   ├── request-rj.tsx           # Route wrapper → RequestRJScreen
│   │
│   ├── podcasts/
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Redirects to discover
│   │   ├── discover.tsx         # Main podcast discovery feed
│   │   ├── trending.tsx         # Trending podcasts
│   │   ├── all-new-podcasts.tsx # Newly released episodes
│   │   ├── genres.tsx           # Browse by podcast category
│   │   ├── filtered-results.tsx # Filtered episode results
│   │   ├── speakers.tsx         # Host / speaker directory
│   │   ├── category/
│   │   │   └── [id].tsx         # Dynamic category episode list
│   │   ├── speaker/
│   │   │   └── [id].tsx         # Dynamic speaker profile & episodes
│   │   ├── live-all.tsx         # All active live podcast streams
│   │   ├── live-player.tsx      # Interactive live podcast room
│   │   ├── player.tsx           # Full-screen podcast player
│   │   ├── recording.tsx        # In-app microphone recording studio
│   │   ├── recording-preview.tsx# Audio preview & publishing
│   │   ├── report.tsx           # Content reporting reason picker
│   │   └── report-option.tsx    # Reporting details form
│   │
│   ├── rjs/
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Redirects to stations
│   │   ├── stations.tsx         # RJ listing & station map
│   │   ├── artist.tsx           # Artist details & top tracks
│   │   ├── topsingers.tsx       # Featured singers list
│   │   ├── album-details.tsx    # Album tracklist & metadata
│   │   ├── genre.tsx            # Genre-specific song collection
│   │   ├── live-radio.tsx       # Live radio broadcast interface
│   │   ├── live-player.tsx      # Live RJ player (chat + reactions)
│   │   ├── live-event.tsx       # Live event viewer
│   │   ├── player.tsx           # Secondary audio player
│   │   └── search.tsx           # RJ & station search
│   │
│   └── livestations/
│       ├── _layout.tsx
│       ├── index.tsx            # Redirects to stations
│       ├── stations.tsx         # Live radio station explorer
│       ├── all-channels.tsx     # Video / live TV channel streams
│       └── local-files.tsx      # On-device audio file browser & player
│
└── src/
    │
    ├── constants/
    │   ├── colors.ts            # Shared color tokens (used by now-player.tsx)
    │   └── spacing.ts           # Spacing / sizing scales
    │
    ├── context/                 # 10 React Context providers (see §5)
    │   ├── ThemeContext.tsx
    │   ├── AuthContext.tsx
    │   ├── AudioContext.tsx
    │   ├── PlayerContext.tsx
    │   ├── RJLiveContext.tsx
    │   ├── FavoritesContext.tsx
    │   ├── FilterContext.tsx
    │   ├── NotificationContext.tsx
    │   ├── PremiumContext.tsx
    │   └── PodcastContext.tsx
    │
    ├── services/
    │   ├── api.ts               # Typed fetch wrapper; base URL from EXPO_PUBLIC_API_URL
    │   ├── auth-session.ts      # Token persistence: localStorage (web) / FileSystem (native)
    │   └── auth.service.ts      # login(), register(), logout(), refresh(), me(), getDeviceKey()
    │
    ├── components/
    │   ├── AdCarousel/          # Sliding banner ad carousel
    │   ├── Auth/
    │   │   ├── AuthModal        # Login / register modal
    │   │   └── ProfileModal     # Logged-in user profile modal
    │   ├── CategoryButtons/     # Horizontal category chip selector
    │   ├── DesktopPlayerBar/    # Persistent bottom player (desktop only)
    │   ├── DesktopRightSidebar/ # Right column: trending tracks + top RJs
    │   ├── DesktopSidebar/      # Left 240 px nav sidebar
    │   ├── DesktopTopNav/       # Top search bar + profile + theme toggle
    │   ├── EventCard/           # Concert / event card
    │   ├── Header/              # Standard mobile header
    │   ├── LiveStationCard/     # Live radio card with waveform visualiser
    │   ├── LiveStationCarousel/ # Horizontal carousel of radio stations
    │   ├── LiveStationPlayer/   # Radio player modal
    │   ├── MelodyMeet/
    │   │   ├── HeroBanner       # Dynamic mood-based hero banner
    │   │   └── MoodSelector     # Mood-based playlist picker
    │   ├── MiniPlayer/          # Generic floating audio mini player
    │   ├── MobileTabBar/        # 5-tab bottom navigation bar (mobile)
    │   ├── Notifications/
    │   │   └── NotificationsModal
    │   ├── PodcastCard/         # Podcast show card
    │   ├── PodcastMiniPlayer/   # Floating podcast player (mobile)
    │   ├── PremiumFeatures/     # Premium subscription upsell modal
    │   ├── RJCard/              # RJ profile card with live badge
    │   ├── RJLiveMiniPlayer/    # Floating live radio mini player (mobile)
    │   ├── SectionHeader/       # Title + "View All" link header
    │   └── SongCard/            # Track card with animated play button
    │
    ├── screens/
    │   └── RequestRJScreen.tsx  # RJ shoutout / song request form
    │
    ├── styles/
    │   ├── discover.styles.ts
    │   ├── favourites.styles.ts
    │   ├── nowPlaying.styles.ts
    │   ├── player.styles.ts
    │   ├── podcasts.styles.ts
    │   └── search.styles.ts
    │
    ├── utils/
    │   └── animations.tsx       # Spring scale helpers and touch feedback
    │
    └── data/                    # Local mock data (resilient fallbacks)
        ├── ads.ts
        ├── channels.ts          # ALL_CHANNELS array + LANGUAGES list (used by home LiveStationPlayer)
        ├── events.ts
        ├── liveStations.ts
        ├── podcasts.ts
        ├── rjs.ts
        ├── rjsLiveStations.ts   # RJSStation type + station list (used by RJLiveContext)
        └── songs.ts             # recentlyPlayed, perfectForYou, newReleases arrays
```

---

## 5. Context Providers

Provider nesting order is defined in `app/_layout.tsx` (`RootLayout`). The order below is
outermost → innermost.

`SafeAreaProvider` (from `react-native-safe-area-context`) wraps everything but is not a custom
context.

### ThemeContext — `useTheme()`

**File:** `src/context/ThemeContext.tsx`

- Default theme: always `'dark'` (ignores system preference at runtime).
- Exposes `{ theme, isDark, colors, toggleTheme, setTheme }`.
- `colors` object contains full token palette; switches between `lightThemeColors` and
  `darkThemeColors` based on `theme` state.

### AuthContext — `useAuth()`

**File:** `src/context/AuthContext.tsx`

- Session hydration on mount: reads tokens from storage → validates access token expiry
  client-side (JWT payload decode, no network) → calls `GET /users/me` if token looks valid →
  falls back to `POST /auth/refresh` if access token is expired but refresh token is still valid.
- Token storage: `localStorage` on web, `expo-file-system` (`documentDirectory` JSON file) on native.
- Exposes `{ isLoggedIn, loading, accessToken, refreshToken, user, setAuthSession,
  clearAuthSession, logoutSession, showModal, showAuthModal, hideAuthModal,
  showProfileModal, openProfile, closeProfile, setLoading }`.

### PremiumContext — `usePremium()`

**File:** `src/context/PremiumContext.tsx`

- Simple modal open/close state: `{ showPremiumModal, openPremiumModal, closePremiumModal }`.

### NotificationContext — `useNotifications()`

**File:** `src/context/NotificationContext.tsx`

- Simple modal open/close state: `{ showNotificationsModal, openNotifications, closeNotifications }`.
- Note: hook name is **`useNotifications()`** (plural).

### AudioContext — `useAudio()`

**File:** `src/context/AudioContext.tsx`

- Audio engine: **`HTMLAudioElement`** (`new Audio(uri)`). Does not use `expo-av`.
- Contains a built-in `SAMPLE_TRACKS` array of 6 tracks (all Arijit Singh, soundhelix.com URLs):
  Kalank, Apna Bana Le, Raabta, Samjhawan, Dooron Dooron, Varoon.
- Auto-advances to next track in `SAMPLE_TRACKS` when a track ends.
- Exposes `{ currentTrack, isPlaying, isLoaded, isLoading, position, duration,
  playTrack, pauseTrack, resumeTrack, clearTrack, playNext, playPrevious,
  seekTo, seekForward, seekBackward }`.
- `seekForward` / `seekBackward` jump ±10 seconds.
- `playTrack(track)`: if the same track is already loaded, toggles play/pause; otherwise loads
  and plays the new track.

### PodcastContext — `usePodcastContext()`

**File:** `src/context/PodcastContext.tsx`

- Note: hook name is **`usePodcastContext()`** (not `usePodcast`).
- Stores `{ selectedCountry, selectedCategory, podcasts, setSelectedCountry,
  setSelectedCategory, setPodcasts }`.
- `selectedCountry` and `selectedCategory` have their own `{ id, name, ... }` interfaces.

### PlayerContext — `usePlayer()`

**File:** `src/context/PlayerContext.tsx`

- Podcast-specific playback engine using **`HTMLAudioElement`**. Does not use `expo-av`.
- Uses a `PODCAST_AUDIO_URLS` map (only `default` key wired) for audio URLs.
- Exposes `{ currentPodcast, isPlaying, isLoading, progress, duration,
  playPodcast, pausePodcast, resumePodcast, stopPodcast, clearPodcast,
  seekTo, formatTime }`.
- `progress` is the elapsed seconds (not a 0–1 ratio).
- `stopPodcast()` clears everything; `clearPodcast()` also clears but is a softer reset.
- `formatTime(seconds)` → `"m:ss"` string.

### FilterContext — `useFilter()`

**File:** `src/context/FilterContext.tsx`

- Stores a single `globalLanguage: string` (empty string = no filter).
- Exposes `{ globalLanguage, setGlobalLanguage }`.
- Used by the home screen's inline `LiveStationPlayer` to filter `ALL_CHANNELS` from `data/channels.ts`.

### FavoritesContext — `useFavorites()`

**File:** `src/context/FavoritesContext.tsx`

- Persists to `localStorage` under key `@open_connect_favorites` (web).
- `FavoriteType = 'song' | 'podcast' | 'rj' | 'station'`.
- `FavoriteItem: { id, title, subtitle, image, type: FavoriteType, rawData }`.
- Exposes `{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }`.

### RJLiveContext — `useRJLive()`

**File:** `src/context/RJLiveContext.tsx`

- **No Socket.IO connection.** Purely local UI state for tracking which live station is active.
- Uses `RJSStation` type from `src/data/rjsLiveStations.ts`.
- `showMiniPlayer` is a computed property: `currentStation !== null && sessionActive && !isLiveRadioFocused`.
- Exposes `{ currentStation, isPlaying, isLiveRadioFocused, showMiniPlayer,
  setLiveRadioFocused, startSession, updateStation, pauseLive, resumeLive,
  toggleLive, stopLive }`.

---

## 6. Backend Communication Layer

**File:** `src/services/api.ts`

```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackHost;
// fallbackHost: 'http://10.0.2.2:3000' (Android emulator) or 'http://localhost:3000' (others)
export const API_PREFIX = '/api/v1';
```

- `apiGet<T>(path, init?)` — typed GET request
- `apiPost<T, TBody>(path, body?, init?)` — typed POST request
- Throws `ApiRequestError(status, message, details)` on non-2xx responses.
- Passes `Authorization: Bearer <token>` when `init.accessToken` is provided.

**File:** `src/services/auth.service.ts`

| Function | API call | Notes |
|---|---|---|
| `login(input)` | `POST /auth/login` | Auto-generates `deviceKey` if not supplied |
| `register(input)` | `POST /auth/register` | Auto-generates `deviceKey` if not supplied |
| `logout(refreshToken)` | `POST /auth/logout` | |
| `refresh(input)` | `POST /auth/refresh` | Auto-generates `deviceKey` if not supplied |
| `me(accessToken)` | `GET /users/me` | Note: `/users/me`, not `/auth/me` |
| `getDeviceKey()` | — | localStorage (web) or FileSystem JSON file (native) |

**File:** `src/services/auth-session.ts`

- Web: `localStorage` key `open-connect-auth-session`
- Native: `FileSystem.readAsStringAsync` / `writeAsStringAsync` to `documentDirectory + 'open-connect-auth-session.json'`

**Device key persistence**

- Web: `localStorage` key `open-connect-device-key`
- Native: `FileSystem.readAsStringAsync` / `writeAsStringAsync` to `documentDirectory + 'open-connect-device-key.txt'`

---

## 7. Screen Catalogue

### Home (`app/index.tsx`)

- Fetches `GET /home` via `apiGet` on mount inside `useHomeCatalog()` hook.
- Maps backend response fields: `trendingSongs` → `recentlyPlayed` + `perfectForYou`; `newSongs` → `newReleases`.
- Falls back silently to local data from `src/data/songs.ts`, `src/data/events.ts` on any error.
- Inline **`LiveStationPlayer`** component: channel switcher driven by `ALL_CHANNELS` from
  `data/channels.ts`; filtered by `FilterContext.globalLanguage`; language filter presented via
  bottom-sheet `Modal` with animated spring slide-up.
- Inline **`LiveRJCard`**: pulsing avatar, LIVE badge, listener count.
- Sections rendered: Upcoming Events, Live Station, Live RJs, Podcasts, Recently Played,
  Perfect For You, New Releases.

### Search (`app/search.tsx`)

- **Does not call the backend `/search` API.**
- Filters a hardcoded `ALL_SEARCHABLE_ITEMS` array client-side (songs, artists, playlists, albums).
- When no query is entered, shows static sections: Mood (Energize/Relax/Focus/Romance),
  Recently Played, Popular Artists, Curated Playlists.
- Desktop hides back button (`isDesktop = windowWidth >= 900`).

### Favourites (`app/favourites.tsx`)

- Reads `FavoritesContext.favorites` (localStorage-backed, no backend calls).
- Inline search bar filters by `title` or `subtitle`.
- Integrates `AudioContext` (songs), `PlayerContext` (podcasts), `RJLiveContext` (RJ stations)
  for play/pause toggling directly from the list.
- Uses `React.memo` on `FavouriteRow` with a custom equality check.

### Now Playing (`app/now-player.tsx`)

- Consumes `AudioContext`: `currentTrack`, `isPlaying`, `position`, `duration`,
  `pauseTrack`, `resumeTrack`, `playNext`, `playPrevious`, `seekTo`, `seekForward`, `seekBackward`.
- Rotating vinyl record art animation driven by `Animated.loop` — pauses when not playing.
- Progress bar: tappable; calculates seek position from `locationX / barWidth * duration`.
- `seekForward` / `seekBackward`: ±10 s (shown as "10" labels next to seek icons).
- "Daily Atmos" badge using `expo-blur` `BlurView`.
- `useEffect` redirects to previous screen if `currentTrack` becomes null.
- Bottom actions: favourite toggle (`FavoritesContext`), share, download, queue (icons only — no logic wired beyond favourite).

### Request RJ (`app/request-rj.tsx`)

- Pure wrapper: renders `<RequestRJScreen onBack={...} />` from `src/screens/RequestRJScreen.tsx`.
- `onBack` calls `router.back()` or falls back to `router.replace('/')`.

### Podcasts sub-app (`app/podcasts/`)

| File | Description |
|---|---|
| `discover.tsx` | Main podcast discovery feed |
| `trending.tsx` | Trending podcasts list |
| `all-new-podcasts.tsx` | Newly released episodes |
| `genres.tsx` | Browse by podcast category |
| `filtered-results.tsx` | Filtered episode results |
| `speakers.tsx` | Host / speaker directory |
| `category/[id].tsx` | Dynamic category episode list |
| `speaker/[id].tsx` | Dynamic speaker profile & episodes |
| `live-all.tsx` | All active live podcast streams |
| `live-player.tsx` | Interactive live podcast room |
| `player.tsx` | Full-screen podcast player (speed, sleep timer) |
| `recording.tsx` | Microphone recording studio with waveform |
| `recording-preview.tsx` | Audio preview & publishing screen |
| `report.tsx` | Reporting reason picker |
| `report-option.tsx` | Reporting details form |

### Live Stations sub-app (`app/livestations/`)

| File | Description |
|---|---|
| `stations.tsx` | Categorised directory of FM & digital stations |
| `all-channels.tsx` | Live video and streaming music channels |
| `local-files.tsx` | On-device audio file browser & player |

### RJs sub-app (`app/rjs/`)

| File | Description |
|---|---|
| `stations.tsx` | RJ profile list with station affiliations and on-air badges |
| `artist.tsx` | Artist details & top tracks |
| `topsingers.tsx` | Featured singers list |
| `album-details.tsx` | Album tracklist & metadata |
| `genre.tsx` | Genre-specific song collection |
| `live-radio.tsx` | Live radio broadcast interface |
| `live-player.tsx` | Live RJ player with realtime chat & emoji reactions |
| `live-event.tsx` | Live event viewer |
| `player.tsx` | Secondary audio player |
| `search.tsx` | RJ & station search |

---

## 8. Layout System

### Desktop Layout (`DesktopLayout` in `_layout.tsx`)

Activated when `useWindowDimensions().width >= 900`.

```
┌──────────────────────────────────────────────────────────┐
│  DesktopSidebar (240 px)  │  DesktopTopNav               │
│                           ├──────────────────────────────│
│  - Home                   │  AppStack (scrollable)       │
│  - Favourites             │                              │
│  - Podcasts               │               DesktopRight   │
│  - RJ Live                │               Sidebar        │
│  - Live Stations          │               (trending +    │
│  - Auth state             │                top RJs)      │
│  - Premium upsell         │                              │
├───────────────────────────┴──────────────────────────────┤
│  DesktopPlayerBar  (full width, always visible)          │
└──────────────────────────────────────────────────────────┘
```

Root background: `#0A0A0A` (dark, fixed — not from theme).

### Mobile Layout (`MobileLayout` in `_layout.tsx`)

Activated when width < 900.

```
┌──────────────────────────┐
│  AppStack                │
├──────────────────────────┤
│  PodcastMiniPlayer       │  (floating, slide-up, visible when podcast active)
│  RJLiveMiniPlayer        │  (floating, visible when RJLiveContext.showMiniPlayer)
├──────────────────────────┤
│  MobileTabBar (5 tabs)   │
└──────────────────────────┘
```

### Global Modals (rendered in `RootLayoutContent`, outside both layouts)

- `AuthModal` — login / register
- `ProfileModal` — logged-in user profile
- `NotificationsModal` — notification inbox
- `PremiumFeatures` — subscription upsell

---

## 9. Auth Lifecycle

```
App boot (AuthContext useEffect)
       │
       ▼
Load tokens from storage
  (localStorage on web / FileSystem JSON on native)
       │
       ├── No tokens → loading = false, unauthenticated
       │
       ├── Access token present & not expired?
       │     └── Call GET /users/me
       │           ├── Success → hydrate user state, done
       │           └── Fail   → fall through to refresh
       │
       └── Refresh token present & not expired?
             └── Call POST /auth/refresh (with deviceKey)
                   ├── Success → save new tokens, hydrate user state
                   └── Fail   → clearAuthSessionStorage(), unauthenticated
```

Token expiry is determined client-side by decoding the JWT payload (`atob`) — no network call just
to check validity.

---

## 10. Local Mock Data

All screens fall back to the arrays in `src/data/` if the backend is unreachable. These are also
used directly by some components that have not yet been wired to the API.

| File | Contents |
|---|---|
| `songs.ts` | `recentlyPlayed`, `perfectForYou`, `newReleases` arrays |
| `podcasts.ts` | Featured podcast shows and categories |
| `events.ts` | Concerts and live events |
| `liveStations.ts` | FM & internet radio stations |
| `rjs.ts` | RJ profiles |
| `rjsLiveStations.ts` | `RJSStation` type + active live broadcast list (used by `RJLiveContext`) |
| `channels.ts` | `ALL_CHANNELS` array + `LANGUAGES` list (used by home `LiveStationPlayer` and `FilterContext`) |
| `ads.ts` | Banner advertisement items |

---

## 11. Local Development

```bash
cd "open-connect/open-connect"
npm install
npx expo start
```

| Key | Action |
|---|---|
| `w` | Open in browser at `http://localhost:8081` (desktop 3-column layout) |
| `a` | Android emulator (API URL auto-switches to `http://10.0.2.2:3000`) |
| `i` | iOS simulator (macOS only) |
| QR code | Scan with Expo Go on physical device |

### Production web build (static export)

```bash
npx expo export --platform web
# Output: dist/   (configured in app.json: "web": { "output": "static" })
```

### Environment variable

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL (e.g. `https://your-backend.onrender.com`). If not set, defaults to `http://localhost:3000` (iOS/web) or `http://10.0.2.2:3000` (Android emulator). |
