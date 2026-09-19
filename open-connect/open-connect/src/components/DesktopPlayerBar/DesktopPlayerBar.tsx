import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import { useAudio } from '../../context/AudioContext';
import { useRJLive } from '../../context/RJLiveContext';

export default function DesktopPlayerBar() {
  const pathname = usePathname();
  
  const {
    currentPodcast,
    isPlaying: podcastIsPlaying,
    progress: podcastProgress,
    duration: podcastDuration,
    pausePodcast,
    resumePodcast,
    stopPodcast,
    formatTime: formatPodcastTime,
  } = usePlayer();

  const {
    currentTrack,
    isPlaying: audioIsPlaying,
    position: audioPosition,
    duration: audioDuration,
    pauseTrack,
    resumeTrack,
    clearTrack,
  } = useAudio();

  const {
    currentStation,
    isPlaying: rjIsPlaying,
    pauseLive,
    resumeLive,
    stopLive,
  } = useRJLive();

  // ── DETERMINE WHAT'S LOADED ──
  const hasSong = !!currentTrack;
  const hasPodcast = !!currentPodcast;
  const hasRJ = !!currentStation;

  const isPlaying = audioIsPlaying || podcastIsPlaying || rjIsPlaying;

  let currentItem = null;
  let progress = 0;
  let duration = 0;
  let title = '';
  let subtitle = '';
  let image = null;

  if (hasSong) {
    currentItem = currentTrack;
    progress = audioPosition;
    duration = audioDuration;
    title = currentTrack.title;
    subtitle = currentTrack.artist;
    image = currentTrack.image;
  } else if (hasPodcast) {
    currentItem = currentPodcast;
    progress = podcastProgress;
    duration = podcastDuration;
    title = currentPodcast.title;
    subtitle = currentPodcast.creator;
    image = currentPodcast.image;
  } else if (hasRJ) {
    currentItem = currentStation;
    progress = 0;
    duration = 0;
    title = currentStation.rjName || 'RJ Live';
    subtitle = currentStation.currentShow || 'Live';
    image = currentStation.thumbnail;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (hasSong) {
      audioIsPlaying ? pauseTrack() : resumeTrack();
    } else if (hasPodcast) {
      podcastIsPlaying ? pausePodcast() : resumePodcast();
    } else if (hasRJ) {
      rjIsPlaying ? pauseLive() : resumeLive();
    }
  };

  const stopPlayback = () => {
    if (hasSong) {
      clearTrack();
    } else if (hasPodcast) {
      stopPodcast();
    } else if (hasRJ) {
      stopLive();
    }
  };

  const goToPlayer = () => {
    if (hasSong) {
      router.push('/now-player');
    } else if (hasPodcast) {
      router.push('/podcasts/player');
    } else if (hasRJ) {
      router.push('/rjs/live-radio');
    }
  };

  const progressWidth = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!currentItem) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentItem]);

  useEffect(() => {
    const pct = duration > 0 ? (progress / duration) * 100 : 0;
    Animated.timing(progressWidth, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, duration]);

  const hidePaths = ['/podcasts/player', '/podcasts/live-player', '/now-player', '/rjs/live-radio'];
  if (hidePaths.includes(pathname)) return null;

  if (!currentItem) {
    return (
      <Animated.View style={[S.barContainer, { transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
          <BlurView intensity={80} tint="dark" style={S.bar}>
            <View style={S.idleCenter}>
              <View style={S.idleArt}>
                <Ionicons name="musical-notes" size={20} color="rgba(255,255,255,0.3)" />
              </View>
              <View>
                <Text style={S.idleTitle}>Nothing playing</Text>
                <Text style={S.idleSub}>Pick a song, podcast, or live station</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    );
  }

  const getImage = () => {
    if (!image) return null;
    if (typeof image === 'string') return { uri: image };
    if (image.uri) return { uri: image.uri };
    return image;
  };

  return (
    <Animated.View style={[S.barContainer, { transform: [{ translateY: slideAnim }] }]}>
      <BlurView intensity={80} tint="dark" style={S.bar}>
        <View style={S.progressTrack}>
          <Animated.View
            style={[
              S.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <TouchableOpacity style={S.left} onPress={goToPlayer} activeOpacity={0.8}>
          {getImage() ? (
            <Image source={getImage()} style={S.artwork} resizeMode="cover" />
          ) : (
            <View style={[S.artwork, { backgroundColor: '#2A0808', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={S.meta}>
            <Text style={S.title} numberOfLines={1}>{title}</Text>
            <Text style={S.creator} numberOfLines={1}>{subtitle}</Text>
          </View>
        </TouchableOpacity>

        <View style={S.center}>
          <Text style={S.timeText}>{formatTime(progress)}</Text>

          <TouchableOpacity style={S.iconBtn} activeOpacity={0.7}>
            <Ionicons name="play-back" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={S.playBtn}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              style={S.playGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={S.iconBtn} activeOpacity={0.7}>
            <Ionicons name="play-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <Text style={S.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={S.right}>
          <TouchableOpacity style={S.iconBtn} onPress={goToPlayer} activeOpacity={0.7}>
            <Ionicons name="expand-outline" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity style={S.iconBtn} onPress={stopPlayback} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const BAR_HEIGHT = 80;

const S = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: 24,
    left: '16%',
    right: '21%',
    alignItems: 'center',
    zIndex: 100,
  },
  bar: {
    height: BAR_HEIGHT,
    width: '100%',
    maxWidth: 1200,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
    gap: 0,
  },
  progressTrack: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  artwork: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: '#2A0808',
    flexShrink: 0,
  },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  creator: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  playBtn: {
    width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6,
    elevation: 8,
  },
  playGradient: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  timeText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500', minWidth: 38, textAlign: 'center' },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  idleCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  idleArt: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  idleTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  idleSub:   { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});