import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DesktopPlayerBar from '../src/components/DesktopPlayerBar/DesktopPlayerBar';
import DesktopSidebar from '../src/components/DesktopSidebar/DesktopSidebar';
import DesktopRightSidebar from '../src/components/DesktopRightSidebar/DesktopRightSidebar';
import DesktopTopNav from '../src/components/DesktopTopNav/DesktopTopNav';
import MobileTabBar from '../src/components/MobileTabBar/MobileTabBar';
import { MiniPlayer } from '../src/components/MiniPlayer/MiniPlayer';
import PodcastMiniPlayer from '../src/components/PodcastMiniPlayer/PodcastMiniPlayer';
import RJLiveMiniPlayer from '../src/components/RJLiveMiniPlayer/RJLiveMiniPlayer';
import { AudioProvider } from '../src/context/AudioContext';
import { FilterProvider } from '../src/context/FilterContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { PlayerProvider } from '../src/context/PlayerContext';
import { PodcastProvider } from '../src/context/PodcastContext';
import { RJLiveProvider } from '../src/context/RJLiveContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { AuthModal } from '../src/components/Auth/AuthModal';
import { ProfileModal } from '../src/components/Auth/ProfileModal';
import { NotificationProvider } from '../src/context/NotificationContext';
import { NotificationsModal } from '../src/components/Notifications/NotificationsModal';
import { PremiumProvider } from '../src/context/PremiumContext';
import { PremiumFeatures } from '../src/components/PremiumFeatures/PremiumFeatures';

// ─── Breakpoint ──────────────────────────────────────────────────────────────
const DESKTOP_BREAKPOINT = 900;

// ─── Stack screens shared by both layouts ────────────────────────────────────
function AppStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="favourites" />
      <Stack.Screen name="now-player" />
      <Stack.Screen name="podcasts" />
      <Stack.Screen name="rjs" />
      <Stack.Screen name="livestations" />
      <Stack.Screen name="request-rj" />
    </Stack>
  );
}

// ─── Desktop layout (Spotify-style) ──────────────────────────────────────────
function DesktopLayout() {
  const { colors, theme } = useTheme();
  const mainBg = colors.background;

  return (
    <View style={[S.desktopRoot, { backgroundColor: '#0A0A0A' }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* ── Sidebar + Content row ── */}
      <View style={S.desktopBody}>

        {/* Left sidebar — fixed 240 px */}
        <DesktopSidebar />

        {/* Center column — top nav + scrollable screen content */}
        <View style={[S.desktopMain, { backgroundColor: mainBg }]}>
          <DesktopTopNav />
          <View style={S.desktopContent}>
            <AppStack />
          </View>
        </View>

        {/* Right column — trending tracks & top rjs */}
        <DesktopRightSidebar />
      </View>

      {/* Bottom player bar — full width, always visible */}
      <DesktopPlayerBar />
    </View>
  );
}

// ─── Mobile layout (original) ─────────────────────────────────────────────────
function MobileLayout() {
  const { colors, theme } = useTheme();

  return (
    <View style={[S.mobileRoot, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Screen stack */}
      <View style={S.mobileContent}>
        <AppStack />
      </View>

      {/* Floating mini players (slide up from bottom on mobile) */}
      <MiniPlayer />
      <PodcastMiniPlayer />
      <RJLiveMiniPlayer />

      {/* Bottom tab bar */}
      <MobileTabBar />
    </View>
  );
}

// ─── Responsive root ──────────────────────────────────────────────────────────
function RootLayoutContent() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <>
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      <AuthModal />
      <ProfileModal />
      <NotificationsModal />
      <PremiumFeatures />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PremiumProvider>
            <NotificationProvider>
              <AudioProvider>
                <PodcastProvider>
                  <PlayerProvider>
                    <FilterProvider>
                      <FavoritesProvider>
                        <RJLiveProvider>
                          <RootLayoutContent />
                        </RJLiveProvider>
                      </FavoritesProvider>
                    </FilterProvider>
                  </PlayerProvider>
                </PodcastProvider>
              </AudioProvider>
            </NotificationProvider>
          </PremiumProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // ── Desktop ──
  desktopRoot: {
    flex: 1,
    flexDirection: 'column',
  },
  desktopBody: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  desktopMain: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  desktopContent: {
    flex: 1,
    overflow: 'hidden',
  },

  // ── Mobile ──
  mobileRoot: {
    flex: 1,
    flexDirection: 'column',
  },
  mobileContent: {
    flex: 1,
  },
});