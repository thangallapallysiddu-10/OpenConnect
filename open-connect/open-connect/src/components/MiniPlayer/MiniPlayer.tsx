import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { useAudio } from '../../context/AudioContext';
import {
  AnimatedPressable,
  useBounceAnimation,
  useSlideUpEntrance,
} from '../../utils/animations';
import { styles } from './styles';

export const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    pauseTrack,
    resumeTrack,
    playNext,
    playPrevious,
    seekForward,
    seekBackward,
    position,
    duration,
  } = useAudio();

  // ── Slide-up entrance when MiniPlayer first mounts ──────────────────────
  const entranceStyle = useSlideUpEntrance(70, 320);

  // ── Play button bounce on press ──────────────────────────────────────────
  const { bounceStyle: playBounceStyle, triggerBounce } = useBounceAnimation();

  // ── Pulsing glow behind play button when track is playing ────────────────
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0.4);
    }
  }, [isPlaying]);

  // ── Track image gentle scale on track change ─────────────────────────────
  const imageScale = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    if (currentTrack) {
      Animated.spring(imageScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    triggerBounce();
    isPlaying ? pauseTrack() : resumeTrack();
  };

  return (
    <Animated.View style={[styles.container, entranceStyle]}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        {/* Progress bar at top */}
        <View style={[styles.progressBarTrack]}>
  <LinearGradient
    colors={[colors.primary, colors.primaryLight]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
  />
</View>

        <View style={styles.content}>
          {/* Track info — tapping navigates to full player */}
          <TouchableOpacity
            style={styles.trackInfo}
            activeOpacity={0.7}
            onPress={() => router.push('/now-player')}
          >
            <Animated.View style={{ transform: [{ scale: imageScale }] }}>
              <Image source={currentTrack.image} style={styles.image} />
            </Animated.View>
            <View style={styles.textInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Controls */}
          <View style={styles.controls}>
            <AnimatedPressable
              onPress={playPrevious}
              style={styles.controlButton}
              scaleTo={0.85}
            >
              <Ionicons name="play-skip-back" size={20} color={colors.textPrimary} />
            </AnimatedPressable>

            <AnimatedPressable
              onPress={seekBackward}
              style={styles.seekButton}
              scaleTo={0.88}
            >
              <Ionicons name="play-back" size={16} color={colors.textSecondary} />
              <Text style={styles.seekText}>10</Text>
            </AnimatedPressable>

            {/* Play / Pause with glow + bounce */}
            <View style={styles.playButtonWrapper}>
              <Animated.View
                style={[
                  styles.playButtonGlow,
                  { opacity: glowAnim },
                ]}
              />
              <AnimatedPressable
                onPress={handlePlayPause}
                style={styles.playButton}
                scaleTo={0.9}
              >
                <Animated.View style={playBounceStyle}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={colors.textPrimary}
                  />
                </Animated.View>
              </AnimatedPressable>
            </View>

            <AnimatedPressable
              onPress={seekForward}
              style={styles.seekButton}
              scaleTo={0.88}
            >
              <Ionicons name="play-forward" size={16} color={colors.textSecondary} />
              <Text style={styles.seekText}>10</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={playNext}
              style={styles.controlButton}
              scaleTo={0.85}
            >
              <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
            </AnimatedPressable>
          </View>

          <Text style={styles.timeText}>{formatTime(position)}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};