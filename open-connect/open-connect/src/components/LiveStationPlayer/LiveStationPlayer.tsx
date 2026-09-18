import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { colors } from '../../constants/colors';
import { useAudio } from '../../context/AudioContext';
import type { LiveStation } from '../../data/liveStations';
import { AnimatedPressable, useBounceAnimation, useFadeSlideAnimation } from '../../utils/animations';
import { styles } from './styles';
interface LiveStationPlayerProps {
  item: LiveStation;
}

export const LiveStationPlayer = ({ item }: LiveStationPlayerProps) => {
  const {
    currentTrack,
    isPlaying,
    isLoaded,
    isLoading,
    playTrack,
    pauseTrack,
    resumeTrack,
    playNext,
    playPrevious,
    seekTo,
    seekForward,
    seekBackward,
    position,
    duration,
  } = useAudio();

  const progressBarRef = useRef<View>(null);
  const isCurrentTrack = currentTrack?.id === item.id;
  const isThisPlaying = isCurrentTrack && isPlaying;
  const isThisLoading = isCurrentTrack && isLoading;

  // ── Card entrance animation ──────────────────────────────────────────────
  const { style: entranceStyle } = useFadeSlideAnimation('up', 28, 420);

  // ── Play button bounce ───────────────────────────────────────────────────
  const { bounceStyle: playBounceStyle, triggerBounce } = useBounceAnimation();

  // ── Listener dot pulse when playing ─────────────────────────────────────
  const dotPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isThisPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, { toValue: 1.6, duration: 600, useNativeDriver: true }),
          Animated.timing(dotPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      dotPulse.setValue(1);
    }
  }, [isThisPlaying]);

  // ── Progress bar animated width ──────────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressValue =
    isCurrentTrack && duration > 0 && isLoaded
      ? position / duration
      : item.progress ?? 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false, // width can't use native driver
    }).start();
  }, [progressValue]);

  const handlePlayPause = async () => {
    triggerBounce();
    try {
      if (isCurrentTrack) {
        isPlaying ? await pauseTrack() : await resumeTrack();
      } else {
        await playTrack({
          id: item.id,
          title: item.name,
          artist: item.city,
          image: item.image,
          uri: item.uri,
        });
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
    }
  };

  const handleProgressPress = async (event: any) => {
    if (!isCurrentTrack || !isLoaded) return;
    const { locationX } = event.nativeEvent;
    progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const percentage = Math.max(0, Math.min(1, locationX / width));
      seekTo(percentage * duration);
    });
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Animated.View style={entranceStyle}>
      <BlurView intensity={40} tint="dark" style={styles.container}>
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
          style={styles.gradientOverlay}
        />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image }} style={styles.stationImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageOverlay}
              />
              {isThisLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                </View>
              )}
            </View>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{item.name}</Text>
              <View style={styles.listenersContainer}>
                {/* Animated live dot */}
                <Animated.View
                  style={[
                    styles.listenerDot,
                    { transform: [{ scale: dotPulse }] },
                  ]}
                />
                <Text style={styles.listenersText}>{item.listeners} listening</Text>
              </View>
            </View>
          </View>

          {/* Song info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{item.tag}</Text>
            <Text style={styles.artistName}>{item.city}</Text>
          </View>

          {/* Progress bar — animated width */}
          <TouchableWithoutFeedback onPress={handleProgressPress}>
            <View
              ref={progressBarRef}
              style={styles.progressContainer}
              collapsable={false}
            >
              <View style={styles.progressBar}>
                <Animated.View
  style={[
    styles.progressFillWrapper,
    {
      width: progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }),
    },
  ]}
>
  <LinearGradient
    colors={[colors.primary, colors.primaryLight]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={StyleSheet.absoluteFillObject}
  />
</Animated.View>
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>
                  {isCurrentTrack && isLoaded ? formatTime(position) : item.currentTime ?? '0:00'}
                </Text>
                <Text style={styles.timeText}>
                  {isCurrentTrack && isLoaded ? formatTime(duration) : item.duration ?? '0:00'}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* Controls */}
          <View style={styles.controls}>
            <AnimatedPressable
              style={styles.controlButton}
              onPress={playPrevious}
              scaleTo={0.85}
              disabled={isThisLoading}
            >
              <Ionicons
                name="play-skip-back"
                size={22}
                color={isThisLoading ? colors.textTertiary : colors.textSecondary}
              />
            </AnimatedPressable>

            <AnimatedPressable
              style={styles.seekButton}
              onPress={seekBackward}
              scaleTo={0.88}
              disabled={!isCurrentTrack || isThisLoading}
            >
              <Ionicons
                name="play-back"
                size={20}
                color={!isCurrentTrack || isThisLoading ? colors.textTertiary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.seekText,
                  { color: !isCurrentTrack || isThisLoading ? colors.textTertiary : colors.textSecondary },
                ]}
              >
                10
              </Text>
            </AnimatedPressable>

            {/* Central play button with bounce */}
            <TouchableOpacity
  style={styles.playButton}
  onPress={handlePlayPause}
  disabled={isThisLoading}
  activeOpacity={1}
>
  <LinearGradient
    colors={isThisLoading ? [colors.textTertiary, colors.textTertiary] : [colors.primary, colors.primaryLight]}
    style={styles.playButtonGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Animated.View style={[playBounceStyle, { justifyContent: 'center', alignItems: 'center' }]}>
      {isThisLoading ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : (
        <Ionicons name={isThisPlaying ? 'pause' : 'play'} size={28} color={colors.textPrimary} />
      )}
    </Animated.View>
  </LinearGradient>
</TouchableOpacity>

            <AnimatedPressable
              style={styles.seekButton}
              onPress={seekForward}
              scaleTo={0.88}
              disabled={!isCurrentTrack || isThisLoading}
            >
              <Ionicons
                name="play-forward"
                size={20}
                color={!isCurrentTrack || isThisLoading ? colors.textTertiary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.seekText,
                  { color: !isCurrentTrack || isThisLoading ? colors.textTertiary : colors.textSecondary },
                ]}
              >
                10
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={styles.controlButton}
              onPress={playNext}
              scaleTo={0.85}
              disabled={isThisLoading}
            >
              <Ionicons
                name="play-skip-forward"
                size={22}
                color={isThisLoading ? colors.textTertiary : colors.textSecondary}
              />
            </AnimatedPressable>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};