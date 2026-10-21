import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { styles } from './styles';

interface EventCardProps {
  image: any;
  title: string;
  date: string;
  location?: string;
}

export const EventCard = ({ image, title, date, location }: EventCardProps) => {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Clamp the card width dynamically for web/desktop screen sizes
  const cardWidth = Math.min(windowWidth * 0.7, 340);
  const borderCol = theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          width: cardWidth,
          borderWidth: 1.5,
          borderColor: borderCol
        }
      ]} 
      activeOpacity={0.8}
    >
      <Image source={image} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />
      <BlurView intensity={60} tint="dark" style={styles.bookmarkButton}>
        <Ionicons name="bookmark-outline" size={16} color={colors.textPrimary} />
      </BlurView>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={10} color={colors.textSecondary} />
            <Text style={styles.detailText}>{date}</Text>
          </View>
          {location && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={10} color={colors.textSecondary} />
              <Text style={styles.detailText}>{location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};