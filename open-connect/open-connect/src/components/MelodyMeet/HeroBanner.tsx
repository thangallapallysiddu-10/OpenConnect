import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { useFavorites } from '../../context/FavoritesContext';

// The featured trending track — wired into the shared audio engine so
// "Play Now" streams real audio and the mini/full player becomes reachable.
const HERO_TRACK = {
  id: 'hero-midnight-vibes',
  title: 'Midnight Vibes',
  artist: 'The Weeknd',
  image: { uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop' },
  uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

export default function HeroBanner() {
  const { colors } = useTheme();
  const { isLoggedIn, showAuthModal } = useAuth();
  const { playTrack, currentTrack } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handlePlay = () => {
    playTrack(HERO_TRACK);
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      showAuthModal();
      return;
    }
    toggleFavorite({
      id: HERO_TRACK.id,
      title: HERO_TRACK.title,
      subtitle: HERO_TRACK.artist,
      image: HERO_TRACK.image,
      type: 'song',
      rawData: HERO_TRACK,
    });
  };

  const handleMore = () => {
    if (!currentTrack) playTrack(HERO_TRACK);
    router.push('/now-player');
  };

  return (
    <View style={[S.container, { backgroundColor: colors.backgroundGradient[1], borderColor: colors.border }]}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={S.content}>
        <View style={S.imageWrapper}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop' }} 
            style={S.image} 
          />
          <View style={S.glassOverlay}>
            <Ionicons name="play" size={48} color="white" />
          </View>
        </View>

        <View style={S.details}>
          <Text style={S.badge}>TRENDING NOW</Text>
          <Text style={[S.title, { color: colors.text }]}>Midnight Vibes</Text>
          
          <View style={S.meta}>
            <Text style={[S.artist, { color: '#8B5CF6' }]}>The Weeknd</Text>
            <Text style={[S.metaText, { color: colors.textSecondary }]}> • Album • 2024 • </Text>
            <View style={S.rating}>
              <Text style={S.ratingText}>4.9 ★</Text>
            </View>
          </View>
          
          <Text style={[S.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            Experience the latest synth-wave masterpiece that takes you on a journey through the neon-lit streets of a retro-futuristic city.
          </Text>
          
          <View style={S.actions}>
            <TouchableOpacity style={S.playBtn} activeOpacity={0.8} onPress={handlePlay}>
              <Ionicons name="play" size={20} color="white" />
              <Text style={S.playBtnText}>Play Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[S.glassBtn, { borderColor: colors.border }]} activeOpacity={0.8} onPress={handleSave}>
              <Ionicons name={isFavorite(HERO_TRACK.id) ? 'heart' : 'heart-outline'} size={20} color={isFavorite(HERO_TRACK.id) ? '#EC4899' : 'white'} />
              <Text style={S.glassBtnText}>{isFavorite(HERO_TRACK.id) ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[S.glassBtnIcon, { borderColor: colors.border }]} activeOpacity={0.8} onPress={handleMore}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 32, // Added top margin so it comes down
    marginBottom: 32,
    borderWidth: 1,
    minHeight: 300,
  },
  content: {
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 32,
  },
  imageWrapper: {
    width: 220,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  details: {
    flex: 1,
    minWidth: 300,
    justifyContent: 'center',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#EC4899',
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  artist: {
    fontWeight: '700',
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
  },
  rating: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 12,
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 500,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  playBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  glassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  glassBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  glassBtnIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
