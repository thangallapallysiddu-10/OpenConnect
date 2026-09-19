/**
 * SongMiniPlayer.tsx
 *
 * A bottom-anchored mini player for songs (AudioContext).
 * - Slides up when a track is loaded, slides down when stopped.
 * - Matches the visual style of PodcastMiniPlayer.
 * - Tapping the bar navigates to /now-player (full screen player).
 * - Hidden on /now-player itself so it doesn't overlap.
 * - Stacks above PodcastMiniPlayer when both are visible
 *   (handled by _layout.tsx render order + bottom offset).
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudio } from '../../context/AudioContext';

// Pages where the mini player should NOT appear
const HIDDEN_ON = ['/now-player'];

export default function SongMiniPlayer() {
  const pathname = usePathname();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    pauseTrack,
    resumeTrack,
    playNext,
    playPrevious,
  } = useAudio();

  // ── Slide animation ─────────────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentTrack ? 0 : 100,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [currentTrack]);

  // ── Progress bar width animation ────────────────────────────────────────────
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pct = duration > 0 ? (position / duration) * 100 : 0;
    Animated.timing(progressWidth, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [position, duration]);

  // ── Hide guard ──────────────────────────────────────────────────────────────
  if (!currentTrack) return null;
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + '/')))
    return null;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Tapping the bar body opens the full player */}
      <TouchableOpacity
        style={styles.playerContent}
        onPress={() => router.push('/now-player')}
        activeOpacity={0.9}
      >
        {/* Album art */}
        <Image source={currentTrack.image} style={styles.artwork} />

        {/* Info + progress */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Time stamps */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{fmt(position)}</Text>
            <Text style={styles.timeText}>{fmt(duration)}</Text>
          </View>
        </View>

        {/* Controls — stopPropagation via their own onPress */}
        <View style={styles.controls}>
          {/* Previous */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              playPrevious();
            }}
            style={styles.skipButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-back" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              isPlaying ? pauseTrack() : resumeTrack();
            }}
            style={styles.playButton}
          >
            <LinearGradient
              colors={['#7C3AED', '#4C1D95']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isLoading ? (
                <Ionicons name="hourglass" size={16} color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              playNext();
            }}
            style={styles.skipButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0520',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.35)',
    elevation: 12,
    zIndex: 1001, // sits above PodcastMiniPlayer (1000) when both visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1E0A3C',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  artist: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skipButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});