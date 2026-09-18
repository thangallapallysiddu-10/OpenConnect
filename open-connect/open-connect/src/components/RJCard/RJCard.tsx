import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface RJCardProps {
  name: string;
  showName: string;
  timeSlot: string;
  image: string;
  isLive: boolean;
  listeners?: string;
}

export const RJCard = ({ 
  name, 
  showName, 
  timeSlot, 
  image, 
  isLive,
  listeners 
}: RJCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <LinearGradient
        colors={['#1E1E2E', '#151520']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.image} />
          {isLive && (
            <View style={styles.waveContainer}>
              <View style={styles.wave} />
              <View style={[styles.wave, styles.waveDelay1]} />
              <View style={[styles.wave, styles.waveDelay2]} />
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.showName} numberOfLines={1}>
            {showName}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeSlot}>{timeSlot}</Text>
          </View>
          
          {listeners && (
            <View style={styles.listenersContainer}>
              <Text style={styles.listenerIcon}>🎧</Text>
              <Text style={styles.listenerCount}>{listeners}</Text>
            </View>
          )}
          
          {isLive && (
            <View style={styles.liveIndicator}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.listenGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.listenText}>Listen Now →</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};