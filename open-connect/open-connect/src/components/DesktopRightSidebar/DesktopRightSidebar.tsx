import React, { useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';
import { useRouter } from 'expo-router';

const trendingTracks = [
  {
    id: 'trending-1',
    title: 'Neon Skyline',
    artist: 'Cyber Drift',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'trending-2',
    title: 'Midnight Rain',
    artist: 'Luna Echoes',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'trending-3',
    title: 'Lost in Tokyo',
    artist: 'The Wanderers',
    image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5294b?w=100&q=80',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'trending-4',
    title: 'Electric Pulse',
    artist: 'Nova Drive',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&q=80',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
];

const topRJs = [
  { id: '1', name: 'DJ Nova', image: 'https://i.pravatar.cc/150?img=47' },
  { id: '2', name: 'RJ Mia', image: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'RJ Alex', image: 'https://i.pravatar.cc/150?img=33' },
  { id: '4', name: 'RJ Sam', image: 'https://i.pravatar.cc/150?img=12' },
];

export default function DesktopRightSidebar() {
  const { theme, colors } = useTheme();
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useAudio();

  // ── TAP LOCK to prevent double taps ──
  const isTapping = useRef(false);

  // ── Handle Play/Pause ──
  const handlePlayPause = (track: any) => {
    if (isTapping.current) return;
    isTapping.current = true;

    // ✅ Create a properly formatted track object
    const trackData = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      image: { uri: track.image },
      uri: track.uri,
    };

    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
    
    if (isThisPlaying) {
      console.log('⏸️ Pausing:', track.title);
      pauseTrack();
    } else if (currentTrack?.id === track.id && !isPlaying) {
      console.log('▶️ Resuming:', track.title);
      resumeTrack();
    } else {
      console.log('🎵 Playing:', track.title);
      playTrack(trackData);
    }

    setTimeout(() => {
      isTapping.current = false;
    }, 500);
  };

  // ── Check if track is playing ──
  const isTrackPlaying = (track: any) => {
    return currentTrack?.id === track.id && isPlaying;
  };

  return (
    <View style={[S.container, { backgroundColor: colors.background }]}>
      <BlurView
        intensity={theme === 'dark' ? 40 : 80}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={S.glassPanel}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Trending Tracks */}
          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: colors.text }]}>Trending Tracks</Text>
            {trendingTracks.map((track) => {
              const isPlayingNow = isTrackPlaying(track);
              return (
                <View
                  key={track.id}
                  style={[S.trackItem, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                >
                  <Image source={{ uri: track.image }} style={S.trackImage} />
                  <View style={S.trackInfo}>
                    <Text style={[S.trackTitle, { color: colors.text }]} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={[S.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  
                  {/* ✅ Play/Pause Button */}
                  <TouchableOpacity 
                    style={[S.playBtn, { 
                      backgroundColor: isPlayingNow ? 'rgba(236, 72, 153, 0.2)' : 'rgba(139, 92, 246, 0.15)' 
                    }]}
                    onPress={() => handlePlayPause(track)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isPlayingNow ? 'pause' : 'play'} 
                      size={16} 
                      color={isPlayingNow ? '#EC4899' : (theme === 'dark' ? '#fff' : '#000')} 
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Top RJs */}
          <View style={[S.section, { marginTop: 24 }]}>
            <Text style={[S.sectionTitle, { color: colors.text }]}>Top RJs</Text>
            <View style={S.rjGrid}>
              {topRJs.map((rj) => (
                <TouchableOpacity key={rj.id} style={S.rjItem} activeOpacity={0.8}>
                  <View style={S.rjAvatarBorder}>
                    <Image source={{ uri: rj.image }} style={S.rjImage} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </BlurView>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    width: '20%',
    minWidth: 280,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  glassPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(24, 24, 31, 0.4)',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  trackImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 12,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rjGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rjItem: {
    alignItems: 'center',
  },
  rjAvatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  rjImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0a0510',
  },
});