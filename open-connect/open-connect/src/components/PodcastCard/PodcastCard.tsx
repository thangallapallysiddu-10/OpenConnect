import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface PodcastCardProps {
  title: string;
  host: string;
  episodes: number;
  image: string;
}

export const PodcastCard = ({ title, host, episodes, image }: PodcastCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <LinearGradient
        colors={['#16213E', '#1A1A2E']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.micOverlay}>
            <Text style={styles.micIcon}>🎙️</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.host} numberOfLines={1}>by {host}</Text>
          
          <View style={styles.episodeContainer}>
            <Text style={styles.episodeIcon}>📻</Text>
            <Text style={styles.episodeCount}>{episodes} eps</Text>
          </View>
          
          <TouchableOpacity style={styles.playButton}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>▶ Play</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};