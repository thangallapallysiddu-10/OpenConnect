import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAudio } from '../src/context/AudioContext';
import { useFavorites } from '../src/context/FavoritesContext';

export default function NowPlayingScreen() {
  const { width, height } = useWindowDimensions();

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
    seekTo,
    seekForward,
    seekBackward,
  } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();

  const rotateValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
    }
  }, [isPlaying]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (!currentTrack) router.back();
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  // Responsive art size — fill the available space nicely on both mobile and desktop web
  const isWeb = Platform.OS === 'web';
  const artSize = isWeb
    ? Math.min(width * 0.32, 320)
    : Math.min(width * 0.62, 280);

  return (
    <LinearGradient colors={['#1e1230', '#0A0A0A', '#0a0a14']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>
            NOW PLAYING
          </Text>
          <TouchableOpacity style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Album Art ── */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 28 }}>
          <Animated.View style={{
            width: artSize,
            height: artSize,
            borderRadius: artSize / 2,
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: 'rgba(139,92,246,0.4)',
            transform: [{ rotate: spin }],
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
          }}>
            <Image
              source={currentTrack.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Animated.View>
          {/* Vinyl centre dot */}
          <View style={{
            position: 'absolute',
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: '#8B5CF6',
            borderWidth: 3, borderColor: '#fff',
            top: 16 + artSize / 2 - 11,
          }} />
        </View>

        {/* ── Song Info ── */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}
            numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 15, textAlign: 'center' }}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* ── Progress Bar ── */}
        <View style={{ paddingHorizontal: 28, marginBottom: 8 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={(e: any) => {
              const { locationX } = e.nativeEvent;
              const barWidth = width - 56;
              seekTo((locationX / barWidth) * duration);
            }}
          >
            <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: 4, borderRadius: 2, width: `${progress * 100}%` }}
              />
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(position)}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* ── Playback Controls ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          paddingHorizontal: 24,
          marginTop: 8,
          marginBottom: 28,
        }}>
          {/* Skip Previous */}
          <TouchableOpacity
            onPress={playPrevious}
            style={{ padding: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Seek Back 10s */}
          <TouchableOpacity
            onPress={seekBackward}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              gap: 3,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-back" size={18} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700' }}>10</Text>
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={isPlaying ? pauseTrack : resumeTrack}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{
                width: 70, height: 70, borderRadius: 35,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Ionicons
                name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
                style={(!isPlaying && !isLoading) ? { marginLeft: 4 } : undefined}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Seek Forward 10s */}
          <TouchableOpacity
            onPress={seekForward}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              gap: 3,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-forward" size={18} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700' }}>10</Text>
          </TouchableOpacity>

          {/* Skip Next */}
          <TouchableOpacity
            onPress={playNext}
            style={{ padding: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Bottom Action Buttons ── */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}>
          {/* Favourite */}
          <TouchableOpacity
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}
            activeOpacity={0.7}
            onPress={() => toggleFavorite({
              id: currentTrack.id,
              title: currentTrack.title,
              subtitle: currentTrack.artist,
              image: currentTrack.image?.uri ?? '',
              type: 'song',
              rawData: currentTrack,
            })}
          >
            <Ionicons
              name={isFavorite(currentTrack.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite(currentTrack.id) ? '#EC4899' : '#9CA3AF'}
            />
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Download */}
          <TouchableOpacity
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Queue */}
          <TouchableOpacity
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
