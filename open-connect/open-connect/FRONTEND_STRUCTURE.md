# Open Connect Frontend — Architecture & Structure Reference

## 1. Executive Summary

**Open Connect Frontend** (also branded as **Melody Meet** in the desktop layout) is a universal, cross-platform mobile and web application built with **React Native**, **Expo (SDK 54)**, and **Expo Router (v6)**.

The frontend delivers a music, podcast, and live radio streaming experience across:
* **Mobile Platforms:** iOS and Android via React Native native runtime.
* **Web / Desktop Platforms:** Responsive desktop web interface featuring a 3-column layout matching desktop Spotify.
* **Audio & Broadcast Streaming:** Background audio playback, full-screen audio player with rotating vinyl art, podcast playback with speed/sleep timers, and interactive live radio sessions.
* **Creator & Community Tools:** In-app audio recording studio for podcasts, listener shoutouts/RJ requests, multi-entity favorites, and content reporting.

---

## 2. Technology Stack & Dependencies

| Category | Technology | Version | Purpose / Details |
| :--- | :--- | :--- | :--- |
| **Framework & Engine** | Expo SDK | `~54.0.34` | Universal React Native application framework |
| **Core Libraries** | React & React Native | `19.1.0` / `0.81.5` | Component model, hooks, and mobile primitives |
| **Routing & Navigation**| Expo Router | `~6.0.23` | File-based typed navigation built on `@react-navigation` |
| **Navigation Primitives**| `@react-navigation/*` | `v7` | Bottom tabs, native stacks, and navigation containers |
| **Styling** | NativeWind & Tailwind CSS | `^4.2.3` / `^3.4.19`| Utility-first styling adapted for React Native |
| **Visual Effects** | `expo-linear-gradient`, `expo-blur` | `~15.0.8` | Glassmorphic blurs and gradient overlays |
| **Audio Playback** | `expo-av` & `expo-audio` | `~16.0.8` / `~1.1.1`| Audio engine: streaming, playback progress, seeking, and recording |
| **Animations** | `react-native-reanimated` & `Animated` | `~4.1.1` | 60fps UI animations, gestures, and scale feedback |
| **Vector Icons** | `@expo/vector-icons` (Ionicons) | `^15.0.3` | Comprehensive icon set across all screens |
| **Media & Files** | `expo-file-system`, `expo-image` | Latest | Device key persistence and cached image rendering |
| **Haptics & System** | `expo-haptics`, `expo-status-bar` | Latest | Tactile touch feedback and dynamic status bar styling |

---

## 3. High-Level Architectural Design

The frontend implements a **Responsive Dual-Layout Engine** based on a screen width breakpoint (`DESKTOP_BREAKPOINT = 900px`):

```
                        ┌─────────────────────────────────────┐
                        │      Expo Root (_layout.tsx)        │
                        │  9 Context Providers + Root Modals  │
                        └──────────────────┬──────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                 Width >= 900px                         Width < 900px
                        ▼                                     ▼
        ┌───────────────────────────────┐     ┌───────────────────────────────┐
        │        DesktopLayout          │     │         MobileLayout          │
        │  ┌─────────┬────────┬───────┐ │     │  ┌─────────────────────────┐  │
        │  │ Left    │ Center │ Right │ │     │  │ AppStack (Screen Content│  │
        │  │ Sidebar │ Content│ Side- │ │     │  ├─────────────────────────┤  │
        │  │ (240px) │ + Top  │ bar   │ │     │  │ Floating Mini Players   │  │
        │  │         │ Nav    │       │ │     │  ├─────────────────────────┤  │
        │  ├─────────┴────────┴───────┤ │     │  │ MobileTabBar (5 Tabs)   │  │
        │  │ Persistent Desktop Player│ │     │  └─────────────────────────┘  │
        │  └──────────────────────────┘ │     └───────────────────────────────┘
        └───────────────────────────────┘
```

### Key Architectural Characteristics:
1. **Adaptive Desktop Mode (Spotify-style):**
   * **Left Sidebar (`DesktopSidebar`):** Fixed 240px navigation column (Home, Favourites, Podcasts, RJ Live, Live Stations) with user authentication state and premium upsell.
   * **Center Column (`DesktopTopNav` + Screen Stack):** Search bar, theme switcher, quick notifications, and scrollable screen area.
   * **Right Sidebar (`DesktopRightSidebar`):** Quick-glance trending tracks and active RJs.
   * **Persistent Bottom Player (`DesktopPlayerBar`):** Full-width music/podcast player with playback controls, progress scrubber, and volume controls.
2. **Mobile Mode:**
   * Standard single-column view with bottom navigation (`MobileTabBar`).
   * Floating slide-up mini players (`PodcastMiniPlayer` and `RJLiveMiniPlayer`) that appear seamlessly whenever playback is initiated.
3. **Resilient Data Layer (Backend API + Local Fallbacks):**
   * Network requests go through [`src/services/api.ts`](file:///c:/Kravix/open-connect/open-connect/src/services/api.ts), pointing to `http://localhost:3000/api/v1` (or `http://10.0.2.2:3000/api/v1` on Android).
   * If the backend server is offline, screens fall back automatically to rich mock datasets in [`src/data/`](file:///c:/Kravix/open-connect/open-connect/src/data/), ensuring the app remains fully functional and testable without infrastructure.

---

## 4. Complete Directory & File Structure

```
c:/Kravix/open-connect/open-connect/
│
├── package.json                    # Dependencies & Expo scripts
├── tsconfig.json                   # TypeScript config
├── app.json                        # Expo app manifest (icons, splash, orientation)
├── babel.config.js                 # Babel preset with NativeWind
├── tailwind.config.js              # Tailwind styling definitions
├── global.css                      # Tailwind base styles
├── metro.config.js                 # Metro bundler config with NativeWind wrapper
│
├── app/                            # Expo Router File-Based Routing
│   ├── _layout.tsx                 # Root layout, 9 providers, adaptive desktop/mobile switch
│   ├── index.tsx                   # Home screen (Hero, live radio wave, trending, categories)
│   ├── search.tsx                  # Full-screen search with filters
│   ├── favourites.tsx              # Bookmarked items (songs, podcasts, stations, RJs)
│   ├── now-player.tsx              # Full-screen vinyl record music player
│   ├── request-rj.tsx              # Route wrapper for RJ shoutout screen
│   │
│   ├── livestations/               # Live Radio & Channels Section
│   │   ├── _layout.tsx             # Nested stack layout
│   │   ├── index.tsx               # Redirects to stations
│   │   ├── stations.tsx            # Live radio station explorer with filters
│   │   └── all-channels.tsx        # Video/live TV channel streams
│   │
│   ├── podcasts/                   # Podcasts Section
│   │   ├── _layout.tsx             # Nested stack layout
│   │   ├── index.tsx               # Redirects to discover
│   │   ├── discover.tsx            # Main podcast discovery feed
│   │   ├── trending.tsx            # Trending podcasts list
│   │   ├── all-new-podcasts.tsx    # Newly released episodes
│   │   ├── genres.tsx              # Browse by podcast category
│   │   ├── filtered-results.tsx    # Filtered episode results
│   │   ├── speakers.tsx            # Host / speaker directory
│   │   ├── speaker/[id].tsx        # Dynamic speaker profile & episodes
│   │   ├── category/[id].tsx       # Dynamic category episode list
│   │   ├── live-all.tsx            # All active live podcast streams
│   │   ├── live-player.tsx         # Interactive live podcast room
│   │   ├── player.tsx              # Full-screen podcast player (speed, sleep timer)
│   │   ├── recording.tsx           # In-app podcast microphone recording studio
│   │   ├── recording-preview.tsx   # Audio preview & publishing screen
│   │   ├── report.tsx              # Content reporting reason selector
│   │   └── report-option.tsx       # Additional reporting details form
│   │
│   └── rjs/                        # Radio Jockeys & Live Radio Section
│       ├── _layout.tsx             # Nested stack layout
│       ├── index.tsx               # Redirects to stations
│       ├── stations.tsx            # RJ listing & station map
│       ├── artist.tsx              # Artist details & top tracks
│       ├── topsingers.tsx          # Featured singers list
│       ├── album-details.tsx       # Album tracklist & metadata
│       ├── genre.tsx               # Genre-specific song collection
│       ├── live-radio.tsx          # Live radio broadcast interface
│       ├── live-player.tsx         # Live RJ player with realtime chat & reactions
│       ├── live-event.tsx          # Live event viewer
│       ├── player.tsx              # Secondary audio player
│       └── search.tsx              # RJ & station search
│
└── src/                            # Shared Source Code
    ├── assets/                     # Local imagery & logos
    │
    ├── constants/                  # Color palettes & spacing scales
    │   ├── colors.ts               # Theme colors, gradients, and accents
    │   └── spacing.ts              # Spacing & sizing scales
    │
    ├── context/                    # React Context State Providers
    │   ├── ThemeContext.tsx        # Light/dark mode state & dynamic colors
    │   ├── AuthContext.tsx         # User session, JWT tokens, login/register modals
    │   ├── AudioContext.tsx        # expo-av music playback engine
    │   ├── PlayerContext.tsx       # Podcast playback progress & timer tracking
    │   ├── RJLiveContext.tsx       # Radio live broadcast session state
    │   ├── FavoritesContext.tsx    # Bookmarked items toggling
    │   ├── FilterContext.tsx       # Language & category filters
    │   ├── NotificationContext.tsx # User notification alerts
    │   ├── PodcastContext.tsx      # Active podcast metadata
    │   └── PremiumContext.tsx      # Premium subscription modal state
    │
    ├── components/                 # Reusable UI Components
    │   ├── AdCarousel/             # Promotional & ad banner slider
    │   ├── Auth/                   # LoginModal, RegisterModal, ProfileModal, AuthModal
    │   ├── CategoryButtons/        # Horizontal category chip selector
    │   ├── DesktopPlayerBar/       # Persistent bottom player on desktop
    │   ├── DesktopRightSidebar/    # Desktop trending tracks & RJs column
    │   ├── DesktopSidebar/         # Desktop left 240px navigation bar
    │   ├── DesktopTopNav/          # Desktop top search & profile bar
    │   ├── EventCard/              # Upcoming concert / event card
    │   ├── Header/                 # Standard mobile header
    │   ├── LiveStationCard/        # Live radio station card with visualizer
    │   ├── LiveStationCarousel/    # Horizontal carousel of radio stations
    │   ├── LiveStationPlayer/      # Radio player modal
    │   ├── MelodyMeet/             # HeroBanner & MoodSelector components
    │   ├── MiniPlayer/             # General floating mini audio player
    │   ├── MobileTabBar/           # Fixed 5-tab bottom navigation bar
    │   ├── Notifications/          # In-app notifications drop-down modal
    │   ├── PodcastCard/            # Podcast show card
    │   ├── PodcastMiniPlayer/      # Floating podcast player on mobile
    │   ├── PremiumFeatures/        # Subscription tier upsell modal
    │   ├── RJCard/                 # Radio Jockey profile card with live badge
    │   ├── RJLiveMiniPlayer/       # Floating live radio mini player
    │   ├── SectionHeader/          # Title + "View All" link header
    │   └── SongCard/               # Track card with animated play button
    │
    ├── services/                   # Backend Communication Layer
    │   ├── api.ts                  # Typed fetch wrapper with error handling
    │   ├── auth-session.ts         # Secure local storage for JWT tokens
    │   └── auth.service.ts         # Login, register, token refresh, and user profile APIs
    │
    ├── screens/                    # Standalone Screen Components
    │   └── RequestRJScreen.tsx     # Form for listener shoutouts & song requests
    │
    ├── styles/                     # Dedicated StyleSheet modules
    │   ├── discover.styles.ts
    │   ├── favourites.styles.ts
    │   ├── nowPlaying.styles.ts
    │   ├── player.styles.ts
    │   ├── podcasts.styles.ts
    │   └── search.styles.ts
    │
    ├── utils/                      # Helper Functions
    │   └── animations.tsx          # Spring scale animations and touch feedback
    │
    └── data/                       # Local Mock Data (Resilient Fallbacks)
        ├── ads.ts                  # Banner advertisement items
        ├── channels.ts             # Video & streaming channels
        ├── events.ts               # Concerts & live events
        ├── liveStations.ts         # FM & internet radio stations
        ├── podcasts.ts             # Featured podcasts and categories
        ├── rjs.ts                  # RJ profiles
        ├── rjsLiveStations.ts      # Active live broadcast sessions
        └── songs.ts                # Tracks, new releases, and recently played
```

---

## 5. State Management & Context Architecture

The application coordinates global state through **10 specialized React Context Providers** nested inside [`app/_layout.tsx`](file:///c:/Kravix/open-connect/open-connect/app/_layout.tsx):

| Context Provider | Hook | Primary Responsibilities |
| :--- | :--- | :--- |
| **`ThemeProvider`** | `useTheme()` | Toggles between `dark` and `light` mode; provides color palette tokens. |
| **`AuthProvider`** | `useAuth()` | Manages logged-in user profile, access token, refresh token, session restoration, and triggers `AuthModal` or `ProfileModal`. |
| **`AudioContext`** | `useAudio()` | Direct audio controller using `expo-av` (`Audio.Sound`): maintains `currentTrack`, `isPlaying`, `position`, `duration`, `playTrack()`, `pauseTrack()`, `seekTo()`, `playNext()`, and `playPrevious()`. |
| **`PlayerContext`** | `usePlayer()` | Dedicated podcast player state: tracks playback time, duration in seconds, interval timers, and formatting (`formatTime`). |
| **`RJLiveContext`** | `useRJLive()` | Coordinates live radio station listening, active broadcast session state, and toggles the `RJLiveMiniPlayer`. |
| **`FavoritesContext`**| `useFavorites()` | Maintains set of bookmarked items (`isFavorite(id)`, `toggleFavorite(item)`). |
| **`FilterContext`** | `useFilter()` | Manages active language filters (`Hindi`, `English`, `Punjabi`, etc.) and genre categories. |
| **`NotificationContext`**| `useNotification()` | In-app notification alerts count and modal visibility. |
| **`PremiumContext`** | `usePremium()` | Premium feature gates and trigger for `PremiumFeatures` subscription modal. |
| **`PodcastContext`** | `usePodcast()` | Selected podcast category, episode list, and category filtering. |

---

## 6. Screen & Route Catalog

### Core Navigation Routes

#### 1. Home Feed ([`app/index.tsx`](file:///c:/Kravix/open-connect/open-connect/app/index.tsx))
* **Hero Banner & Mood Selector:** Dynamic mood-based playlist picker.
* **Live Radio Banner:** Pulsing animated visualizer waves for current broadcast (`Radio Mirchi 98.3 FM`).
* **Ad Carousel:** Auto-sliding banner advertisements.
* **Song Shelves:** Horizontal scrolling rows for *Recently Played*, *Perfect For You*, and *New Releases*.
* **Podcasts & Live RJs:** Quick access to popular podcast episodes and currently on-air RJs.
* **Live Events:** Upcoming concerts with dates, venues, and ticket purchasing links.

#### 2. Search ([`app/search.tsx`](file:///c:/Kravix/open-connect/open-connect/app/search.tsx))
* Fast search with live filter chips (All, Songs, Podcasts, Stations, RJs).
* Connects to `/search` API with local fallback filtering.

#### 3. Favourites & Library ([`app/favourites.tsx`](file:///c:/Kravix/open-connect/open-connect/app/favourites.tsx))
* Tabbed view allowing users to switch between their saved Songs, Podcasts, Radio Stations, and RJs.

#### 4. Now Playing Full Player ([`app/now-player.tsx`](file:///c:/Kravix/open-connect/open-connect/app/now-player.tsx))
* Full-screen music playback interface.
* Rotating vinyl record album art animation that syncs with `isPlaying` state.
* Interactive scrub bar with elapsed/remaining timestamps, repeat, shuffle, and favorite toggles.

---

### Podcasts Sub-App ([`app/podcasts/`](file:///c:/Kravix/open-connect/open-connect/app/podcasts/))

* **Discover & Trending (`discover.tsx`, `trending.tsx`):** Featured podcast shows, editorial picks, top charts.
* **Category & Speaker Exploration (`genres.tsx`, `category/[id].tsx`, `speaker/[id].tsx`):** Detailed taxonomy drilldowns.
* **Full Podcast Player (`player.tsx`):**
  * 15-second skip backward / 30-second skip forward.
  * Playback speed multiplier adjustment (`1.0x`, `1.25x`, `1.5x`, `2.0x`).
  * Configurable sleep timer (`15m`, `30m`, `45m`, end-of-episode).
  * In-player report trigger.
* **Creator Studio (`recording.tsx` & `recording-preview.tsx`):**
  * Live microphone recording studio with visual waveform animations.
  * Pause, resume, and review recorded audio clips before saving/sharing.
* **Content Reporting (`report.tsx` & `report-option.tsx`):**
  * Reason picker (Spam, Harassment, Copyright, Misleading) with submission to backend `/reports`.

---

### Live Stations & Live Video Section ([`app/livestations/`](file:///c:/Kravix/open-connect/open-connect/app/livestations/))

* **Radio Stations (`stations.tsx`):** Categorized directory of FM and digital stations with live listener counts.
* **All Channels (`all-channels.tsx`):** Live video and streaming music channels.
* **Local Audio Files (`local-files.tsx`):** Scans and plays offline audio files stored on the physical device.

---

### Radio Jockeys & Live Broadcasts ([`app/rjs/`](file:///c:/Kravix/open-connect/open-connect/app/rjs/))

* **RJ Directory (`stations.tsx`):** Profile list showing station affiliations and online/on-air badges.
* **Live Broadcast Room (`live-player.tsx`):**
  * Live streaming audio connection.
  * Realtime listener chat feed with message submission.
  * Animated floating emoji reactions (`like`, `love`, `fire`, `clap`).
  * Realtime audience presence indicator.
* **RJ Song Request / Shoutout (`app/request-rj.tsx` & `RequestRJScreen.tsx`):** Form allowing listeners to send song dedication requests and messages directly to RJs.

---

## 7. Backend Integration & Authentication Lifecycle

```
       React Native App                          Backend Server
     (open-connect/open-connect)             (open-connect-backend)
             │                                         │
             ├────── Ensure unique deviceKey ─────────┤ (Persisted in file / storage)
             │                                         │
             ├────── POST /api/v1/auth/login ─────────►│
             │       { email, password, deviceKey }    │
             │                                         │
             │◄───── 200 OK + Tokens ──────────────────┤
             │       { accessToken, refreshToken }     │
             │                                         │
             ├────── Save tokens in auth-session.ts ───┤ (Local / AsyncStorage)
             │                                         │
             ├────── GET /api/v1/home ────────────────►│
             │       Authorization: Bearer <token>     │
             │                                         │
             │◄───── 200 OK (Home Payload) ────────────┤
             │                                         │
      (Token Expires)                                  │
             ├────── POST /api/v1/auth/refresh ───────►│
             │       { refreshToken, deviceKey }       │
             │                                         │
             │◄───── 200 OK (New Token Pair) ──────────┤
```

* **Network Configuration:** Handled in [`src/services/api.ts`](file:///c:/Kravix/open-connect/open-connect/src/services/api.ts):
  * Web & iOS Simulator: `http://localhost:3000/api/v1`
  * Android Emulator: `http://10.0.2.2:3000/api/v1`
  * Production: Configured via `EXPO_PUBLIC_API_URL`
* **Device Identification:** Unique hardware device key generated via `FileSystem` or `localStorage` to participate in rotating refresh-token families.
* **Token Storage:** Encapsulated in [`src/services/auth-session.ts`](file:///c:/Kravix/open-connect/open-connect/src/services/auth-session.ts).

---

## 8. How to Run the Frontend Locally

```bash
# 1. Navigate to the frontend directory
cd "c:/Kravix/open-connect/open-connect"

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Expo development server
npx expo start
```

### Launch Options:
* **Web / Desktop Browser:** Press `w` in terminal (opens at `http://localhost:8081` with desktop 3-column Spotify layout).
* **Android Emulator:** Press `a` in terminal (requires Android Studio).
* **iOS Simulator:** Press `i` in terminal (macOS only).
* **Physical Device:** Install **Expo Go** from App Store / Google Play and scan the terminal QR code.
