import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Image, Text, Pressable, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { colors } from '../../constants/colors';
import { useScaleAnimation } from '../../utils/animations';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { styles } from './styles';

interface SongCardProps {
  id: string;
  image: any;
  title: string;
  artist: string;
  trackData: any;
  index?: number; // for stagger delay
}

export const SongCard = ({ id, image, title, artist, trackData, index = 0 }: SongCardProps) => {
  const { scaleValue, onPressIn, onPressOut } = useScaleAnimation(1, 0.93);
  const { theme, colors: themeColors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width: windowWidth } = useWindowDimensions();

  // Clamp the card width dynamically for web/desktop screen sizes
  const cardWidth = Math.min(windowWidth * 0.28, 140);

  // ── Entrance: fade + slide up with stagger delay ─────────────────────────
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

  // ── Play overlay fades in on press ───────────────────────────────────────
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
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // ── Hover Animations (Web) ────────────────────────────────────────────────
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
          
          {/* Like Button overlay */}
          <TouchableOpacity 
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 20, padding: 4 }}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite({ id, title, subtitle: artist, image, type: 'song', rawData: trackData });
            }}
          >
             <Ionicons name={isFavorite(id) ? "heart" : "heart-outline"} size={22} color={isFavorite(id) ? "#EC4899" : "rgba(255,255,255,0.8)"} />
          </TouchableOpacity>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={[styles.imageOverlay, { height: cardWidth * 0.4 }]}
          />
          {/* Play overlay — appears on press */}
          <Animated.View style={[styles.playOverlay, { opacity: overlayOpacity }]}>
            <BlurView intensity={60} tint="dark" style={styles.playOverlayBlur}>
              <Ionicons name="play" size={16} color={colors.textPrimary} />
            </BlurView>
          </Animated.View>
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