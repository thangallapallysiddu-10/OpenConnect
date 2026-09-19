import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Image, Text, Pressable, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { colors } from '../../constants/colors';
import { useScaleAnimation } from '../../utils/animations';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAudio } from '../../context/AudioContext';
import { usePlayer } from '../../context/PlayerContext';
import { styles } from './styles';

interface SongCardProps {
  id: string;
  image: any;
  title: string;
  artist: string;
  trackData: any;
  index?: number;
}

export const SongCard = ({ id, image, title, artist, trackData, index = 0 }: SongCardProps) => {
  const { scaleValue, onPressIn, onPressOut } = useScaleAnimation(1, 0.93);
  const { theme, colors: themeColors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width: windowWidth } = useWindowDimensions();

  // ── Audio Context (Songs) ──
  const { 
    currentTrack, 
    isPlaying: audioIsPlaying, 
    playTrack, 
    pauseTrack, 
    resumeTrack 
  } = useAudio();

  // ── Player Context (Podcasts) ──
  const {
    currentPodcast,
    isPlaying: podcastIsPlaying,
    playPodcast,
    pausePodcast,
    resumePodcast
  } = usePlayer();

  // ── LOCAL STATE for play/pause ──
  const [isThisPlaying, setIsThisPlaying] = useState(false);

  // ── UPDATE when player state changes ──
  useEffect(() => {
    let playing = false;
    
    if (trackData?.type === 'podcast' || trackData?.episodes !== undefined) {
      playing = currentPodcast?.id === id && podcastIsPlaying;
    } else {
      playing = currentTrack?.id === id && audioIsPlaying;
    }
    
    setIsThisPlaying(playing);
  }, [currentTrack, audioIsPlaying, currentPodcast, podcastIsPlaying, id]);

  const cardWidth = Math.min(windowWidth * 0.28, 140);

  // ── Entrance animation ──
  const entranceProgress = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(entranceProgress, {
      toValue: 1,
      duration: 380,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const entranceStyle = {
    opacity: entranceProgress,
    transform: [
      {
        translateY: entranceProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      { scale: scaleValue },
    ],
  };

  // ── Play overlay ──
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    onPressIn();
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    onPressOut();
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // ── Hover Animations ──
  const hoverScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.05, useNativeDriver: false, speed: 20 }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: false })
    ]).start();
  };

  const handleHoverOut = () => {
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: false, speed: 20 }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 200, useNativeDriver: false })
    ]).start();
  };

  // ── HANDLE PLAY/PAUSE ──
  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    
    console.log(`🎯 CLICKED: ${title}`);
    
    // ── TOGGLE LOCAL STATE IMMEDIATELY ──
    setIsThisPlaying(!isThisPlaying);
    
    // ── PODCAST ──
    if (trackData?.type === 'podcast' || trackData?.episodes !== undefined) {
      const isSame = currentPodcast?.id === id;
      if (isSame) {
        podcastIsPlaying ? pausePodcast() : resumePodcast();
      } else {
        const podcastData = trackData || { 
          id, 
          title, 
          creator: artist, 
          image: typeof image === 'object' ? image.uri : image,
          duration: '0'
        };
        playPodcast(podcastData, 0);
      }
      return;
    }
    
    // ── SONG ──
    const isSame = currentTrack?.id === id;
    if (isSame) {
      audioIsPlaying ? pauseTrack() : resumeTrack();
    } else {
      if (podcastIsPlaying) {
        pausePodcast();
      }
      
      const track = {
        id,
        title,
        artist,
        image,
        uri: trackData?.uri || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      };
      
      playTrack(track);
    }
  };

  const borderCol = theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={[styles.container, { width: cardWidth }]}
    >
      <Animated.View style={[entranceStyle, { transform: [...entranceStyle.transform, { scale: hoverScale }] }]}>
        <Animated.View 
          style={[
            styles.imageContainer, 
            { 
              width: cardWidth, 
              height: cardWidth, 
              borderWidth: 1.5, 
              borderColor: glowOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [borderCol, 'rgba(157, 78, 221, 0.8)']
              }),
              shadowColor: '#9d4edd',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
              shadowRadius: 10,
              elevation: 8,
            }
          ]}
        >
          <Image source={image} style={styles.image} />
          
          <TouchableOpacity 
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 20, padding: 4 }}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite({ 
  id: id,
  title: title,
  subtitle: artist,
  image: image,
  type: 'song', 
  rawData: {     
    id: id,
    title: title,
    artist: artist,
    image: image,
    uri: trackData?.uri || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  }
});
            }}
          >
            <Ionicons 
              name={isFavorite(id) ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite(id) ? "#EC4899" : "rgba(255,255,255,0.8)"} 
            />
          </TouchableOpacity>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={[styles.imageOverlay, { height: cardWidth * 0.4 }]}
          />
          
          <Animated.View style={[styles.playOverlay, { opacity: overlayOpacity }]}>
            <BlurView intensity={60} tint="dark" style={styles.playOverlayBlur}>
              <Ionicons 
                name={isThisPlaying ? 'pause' : 'play'} 
                size={16} 
                color={colors.textPrimary} 
              />
            </BlurView>
          </Animated.View>

          {/* ✅ PLAY/PAUSE BUTTON */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: '#1DB954',
              borderRadius: 20,
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handlePlayPause}
          >
            <Ionicons 
              name={isThisPlaying ? 'pause' : 'play'} 
              size={16} 
              color="#fff" 
              style={isThisPlaying ? undefined : { marginLeft: 2 }}
            />
          </TouchableOpacity>
        </Animated.View>
        
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.artist, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {artist}
        </Text>
      </Animated.View>
    </Pressable>
  );
};