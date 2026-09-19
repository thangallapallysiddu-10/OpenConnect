import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../src/styles/favourites.styles';
import { useTheme } from '../src/context/ThemeContext';
import { useFavorites, FavoriteItem } from '../src/context/FavoritesContext';
import { useAudio } from '../src/context/AudioContext';
import { usePlayer } from '../src/context/PlayerContext';
import { useRJLive } from '../src/context/RJLiveContext';

interface RowProps {
  item: FavoriteItem;
  isPlaying: boolean;
  isLoaded: boolean;
  onPlayPause: (item: FavoriteItem) => void;
  colors: any;
}

const FavouriteRow = React.memo(
  ({ item, isPlaying, isLoaded, onPlayPause, colors }: RowProps) => {
    const handlePress = () => {
      onPlayPause(item);
    };

    const iconName: any = isPlaying ? 'pause-circle' : 'play-circle';
    const iconColor = isLoaded
      ? colors.iconColor || '#8B5CF6'
      : colors.textSecondary || '#6B7280';

    return (
      <View style={styles.itemContainer}>
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text
            style={[
              styles.itemTitle,
              { color: isLoaded ? colors.iconColor || '#8B5CF6' : colors.text },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.itemSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.itemMenu}
          onPress={handlePress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name={iconName} size={32} color={iconColor} />
        </TouchableOpacity>
      </View>
    );
  },
  (prev, next) =>
    prev.isPlaying === next.isPlaying &&
    prev.isLoaded === next.isLoaded &&
    prev.item.id === next.item.id &&
    prev.colors === next.colors
);

export default function FavouritesScreen() {
  const { theme, colors } = useTheme();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentTrack,
    isPlaying: audioIsPlaying,
    playTrack,
    pauseTrack,
    resumeTrack,
    clearTrack,
  } = useAudio();

  const {
    currentPodcast,
    isPlaying: podcastIsPlaying,
    playPodcast,
    pausePodcast,
    resumePodcast,
    clearPodcast,
  } = usePlayer();

  const {
    currentStation,
    isPlaying: rjIsPlaying,
    startSession,
    pauseLive,
    resumeLive,
  } = useRJLive();

  const handlePlayPause = useCallback(
    (item: FavoriteItem) => {
      // ── SONG ──
      if (item.type === 'song') {
        if (currentPodcast) {
          clearPodcast();
        }
        if (rjIsPlaying) {
          pauseLive();
        }
        
        const isSame = currentTrack?.id === item.id;
        if (isSame) {
          audioIsPlaying ? pauseTrack() : resumeTrack();
        } else {
          playTrack(item.rawData);
        }
      }
      
      // ── PODCAST ──
      else if (item.type === 'podcast') {
        if (currentTrack) {
          clearTrack();
        }
        if (rjIsPlaying) {
          pauseLive();
        }
        
        const isSame = currentPodcast?.id === item.id;
        if (isSame) {
          podcastIsPlaying ? pausePodcast() : resumePodcast();
        } else {
          playPodcast(item.rawData, item.rawData?.duration ?? 0);
        }
      }
      
      // ── RJ ──
      else if (item.type === 'rj') {
        if (currentTrack) clearTrack();
        if (currentPodcast) clearPodcast();
        
        if (!item.rawData) return;
        
        const isSame = currentStation?.id === item.id;
        if (isSame) {
          rjIsPlaying ? pauseLive() : resumeLive();
        } else {
          startSession(item.rawData);
        }
      }
    },
    [
      currentTrack, audioIsPlaying, playTrack, pauseTrack, resumeTrack, clearTrack,
      currentPodcast, podcastIsPlaying, playPodcast, pausePodcast, resumePodcast, clearPodcast,
      currentStation, rjIsPlaying, startSession, pauseLive, resumeLive,
    ]
  );

  const renderItem = useCallback(
    ({ item }: { item: FavoriteItem }) => {
      let isPlaying = false;
      let isLoaded = false;

      if (item.type === 'song') {
        isLoaded = currentTrack?.id === item.id;
        isPlaying = isLoaded && audioIsPlaying;
      } else if (item.type === 'podcast') {
        isLoaded = currentPodcast?.id === item.id;
        isPlaying = isLoaded && podcastIsPlaying;
      } else if (item.type === 'rj') {
        isLoaded = currentStation?.id === item.id;
        isPlaying = isLoaded && rjIsPlaying;
      }

      return (
        <FavouriteRow
          item={item}
          isPlaying={isPlaying}
          isLoaded={isLoaded}
          onPlayPause={handlePlayPause}
          colors={colors}
        />
      );
    },
    [
      currentTrack, audioIsPlaying,
      currentPodcast, podcastIsPlaying,
      currentStation, rjIsPlaying,
      handlePlayPause, colors,
    ]
  );

  const filteredFavorites = favorites.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Find in Favorites"
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>YOUR FAVORITES</Text>
      <TouchableOpacity>
        <Text style={[styles.sortButton, { color: colors.iconColor }]}>Sort</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredFavorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={renderSectionHeader}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons
              name="heart-outline"
              size={48}
              color={colors.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No favorites yet.</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
              Like items across the app to see them here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}