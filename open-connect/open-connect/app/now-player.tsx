import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../src/constants/colors';
import { useAudio } from '../src/context/AudioContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { styles } from '../src/styles/nowPlaying.styles';

const { width, height } = Dimensions.get('window');

export default function NowPlayingScreen() {
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
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      startRotation();
    } else {
      pauseRotation();
    }
  }, [isPlaying]);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  const pauseRotation = () => {
    rotateValue.stopAnimation();
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = width - 64;
    const percentage = locationX / progressBarWidth;
    const seekPosition = percentage * duration;
    seekTo(seekPosition);
  };

  if (!currentTrack) {
    router.back();
    return null;
  }

  const progress = duration > 0 ? position / duration : 0;

  return (
    <LinearGradient
      colors={['#1A1A1A', '#0A0A0A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>NOW PLAYING</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Album Art with Rotation */}
      <View style={styles.artContainer}>
        <Animated.View
          style={[
            styles.artWrapper,
            {
              transform: [
                { rotate: spin },
                { scale: scaleValue },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'transparent']}
            style={styles.artGradient}
          />
          <Image source={currentTrack.image} style={styles.albumArt} />
        </Animated.View>
        
        {/* Vinyl Effect */}
        <View style={styles.vinylCenter}>
          <View style={styles.vinylInner} />
        </View>
      </View>

      {/* Song Info */}
      <View style={styles.songInfoContainer}>
        <Text style={styles.songTitle}>{currentTrack.title}</Text>
        <Text style={styles.artistName}>{currentTrack.artist}</Text>
      </View>

      {/* Daily Atmos */}
      <View style={styles.atmosContainer}>
        <BlurView intensity={40} tint="dark" style={styles.atmosBadge}>
          <Ionicons name="musical-notes" size={14} color={colors.primary} />
          <Text style={styles.atmosText}>Daily Atmos</Text>
          <Text style={styles.atmosValue}>-1.04</Text>
        </BlurView>
      </View>

      {/* Progress Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleProgressPress}
        style={styles.progressContainer}
      >
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </TouchableOpacity>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={seekBackward} style={styles.seekButton}>
          <Ionicons name="play-back" size={24} color={colors.textSecondary} />
          <Text style={styles.seekText}>10</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? pauseTrack : resumeTrack}
          style={styles.playButton}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.playButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color={colors.textPrimary}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={seekForward} style={styles.seekButton}>
          <Ionicons name="play-forward" size={24} color={colors.textSecondary} />
          <Text style={styles.seekText}>10</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => toggleFavorite({
            id: currentTrack.id,
            title: currentTrack.title,
            subtitle: currentTrack.artist,
            image: currentTrack.image?.uri ?? '',
            type: 'music',
            rawData: currentTrack
          })}
        >
          <Ionicons name={isFavorite(currentTrack.id) ? "heart" : "heart-outline"} size={24} color={isFavorite(currentTrack.id) ? "#EC4899" : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="download-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="list-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}