import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface LiveStationCardProps {
  frequency: string;
  name: string;
  tag: string;
  city: string;
  listeners: string;
  image: string;
  accent: string;
}

export const LiveStationCard = ({ 
  frequency, 
  name, 
  tag, 
  city, 
  listeners, 
  image, 
  accent 
}: LiveStationCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={[styles.frequencyBadge, { backgroundColor: accent }]}>
            <Text style={styles.frequencyText}>{frequency} FM</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.stationName} numberOfLines={1}>{name}</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tag}>{tag}</Text>
            <View style={styles.dot} />
            <Text style={styles.city} numberOfLines={1}>{city}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.listenerContainer}>
              <Text style={styles.listenerIcon}>🎧</Text>
              <Text style={styles.listenerCount}>{listeners}</Text>
            </View>
            
            <TouchableOpacity style={styles.playButton}>
              <LinearGradient
                colors={[accent, `${accent}CC`]}
                style={styles.playGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.playText}>▶</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};