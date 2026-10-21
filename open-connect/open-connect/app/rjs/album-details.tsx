import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 44) : 44;

export default function AlbumDetailsScreen() {
  const params = useLocalSearchParams();
  const album = {
    id: params.id,
    title: params.title,
    subtitle: params.subtitle,
    description: params.description,
    coverImage: decodeURIComponent(params.coverImage as string),
    songs: JSON.parse(params.songs as string),
    artist: params.artist,
  };

  // Calculate total duration
  const totalDuration = album.songs.reduce((total: number, song: any) => {
    const [minutes, seconds] = song.duration.split(':').map(Number);
    return total + minutes;
  }, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: SBH + 20 }]}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Album Cover */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: album.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.coverGradient}
          />
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          <Text style={styles.albumDescription}>{album.description}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.libraryButton}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Add to Library</Text>
            </TouchableOpacity>
          </View>

          {/* Play Album Button */}
          <TouchableOpacity style={styles.playAlbumButton} activeOpacity={0.85}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playAlbumGradient}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.playAlbumText}>Play Album</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Songs List - Premium Layout */}
        <View style={styles.songsContainer}>
          <View style={styles.songsHeader}>
            <Text style={styles.songsTitle}>Tracklist</Text>
            <View style={styles.songsStats}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.songsDurationText}>{album.songs.length} songs • {totalDuration} min</Text>
            </View>
          </View>

          {album.songs.map((song: any, index: number) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              activeOpacity={0.7}
              onPress={() => {
                router.push({
                  pathname: '/rjs/player',
                  params: {
                    name: song.name,
                    artist: song.artist,
                    duration: song.duration,
                    image: encodeURIComponent(album.coverImage),
                  },
                });
              }}
            >
              <View style={styles.songNumberContainer}>
                <Text style={styles.songNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.songInfo}>
                <Text style={styles.songName}>{song.name}</Text>
                <View style={styles.songArtistContainer}>
                  <Ionicons name="musical-notes" size={12} color="#8B5CF6" />
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
              </View>
              
              <View style={styles.songRightContainer}>
                <Text style={styles.songDuration}>{song.duration}</Text>
                <Ionicons name="play-circle" size={22} color="#8B5CF6" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0E1A',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    width: '100%',
    height: width,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 10,
    
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  albumArtist: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  albumDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  libraryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playAlbumButton: {
    marginBottom: 32,
  },
  playAlbumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    boxShadow: '0 5px 15px rgba(139,92,246,0.4)',
    elevation: 8,
  },
  playAlbumText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  songsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 8,
  },
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  songsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  songsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  songsDurationText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  songNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139,92,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  songInfo: {
    flex: 1,
    gap: 4,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  songArtistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  songArtist: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  songRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songDuration: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
  },
});