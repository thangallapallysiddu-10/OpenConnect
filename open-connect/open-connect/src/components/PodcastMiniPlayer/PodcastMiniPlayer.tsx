import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';

const { width } = Dimensions.get('window');

export default function PodcastMiniPlayer() {
  const pathname = usePathname();
  const {
    currentPodcast,
    isPlaying,
    progress,
    duration,
    pausePodcast,
    resumePodcast,
    stopPodcast,
    formatTime,
  } = usePlayer();

  const slideAnim = useRef(new Animated.Value(100)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentPodcast) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    }
  }, [currentPodcast]);

  useEffect(() => {
    const percentage = duration > 0 ? (progress / duration) * 100 : 0;
    
    // Use Animated.timing with useNativeDriver: false for width animation
    Animated.timing(progressWidth, {
      toValue: percentage,
      duration: 200,
      useNativeDriver: false, // Required for width animations
    }).start();
  }, [progress, duration]);

  const handlePlayerPress = () => {
    if (currentPodcast) {
      const id = encodeURIComponent(String(currentPodcast.id));
      const title = encodeURIComponent(String(currentPodcast.title));
      const creator = encodeURIComponent(String(currentPodcast.creator));
      const image = encodeURIComponent(String(currentPodcast.image));
      router.push(`/podcasts/player?podcastId=${id}&podcastTitle=${title}&podcastCreator=${creator}&podcastImage=${image}`);
    }
  };

  if (!currentPodcast) return null;
  if (
    pathname === '/podcasts/player' ||
    pathname === '/podcasts/live-player' ||
    pathname === '/podcasts/report' ||
    pathname === '/podcasts/report-option' ||
    pathname === '/now-player'
  ) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.playerContent}
        onPress={handlePlayerPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: currentPodcast.image }} style={styles.artwork} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentPodcast.title}
          </Text>
          <Text style={styles.creator} numberOfLines={1}>
            {currentPodcast.creator}
          </Text>
          
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
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(progress)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={isPlaying ? pausePodcast : resumePodcast}
            style={styles.playButton}
          >
            <LinearGradient
              colors={['#CC0000', '#8B0000']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={16}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopPodcast} style={styles.closeButton}>
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
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
    backgroundColor: '#1A0505',
    borderTopWidth: 1,
    borderTopColor: 'rgba(220,60,60,0.3)',
    boxShadow: '0 -3px 5px rgba(0,0,0,0.3)',
    elevation: 10,
    zIndex: 1000,
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
    backgroundColor: '#2A0808',
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
  creator: {
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
    backgroundColor: '#CC2222',
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
    gap: 8,
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
