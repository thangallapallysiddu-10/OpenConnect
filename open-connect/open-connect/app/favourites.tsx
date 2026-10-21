import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { confirmAction } from '../src/utils/ui';

export default function FavouritesScreen() {
  const { theme, colors } = useTheme();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null); // null = Recently Added
  
  const { playTrack } = useAudio();
  const { playPodcast } = usePlayer();
  const { startSession } = useRJLive();

  const handlePlay = (item: FavoriteItem) => {
    if (item.type === 'song') {
      playTrack(item.rawData);
    } else if (item.type === 'podcast') {
      const raw = item.rawData?.duration;
      const mins = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
      playPodcast(item.rawData, Number.isFinite(mins) ? mins * 60 : 1800);
    } else if (item.type === 'rj') {
      startSession(item.rawData);
    }
  };

  const handleMenu = (item: FavoriteItem) => {
    confirmAction(
      item.title,
      'Remove this from your favorites?',
      () => removeFavorite(item.id),
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() =>
            confirmAction('Clear Favorites', 'Remove all favorites?', () => clearFavorites())
          }
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
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
      <TouchableOpacity onPress={() => setSortAsc(prev => (prev === null ? true : prev === true ? false : null))}>
        <Text style={[styles.sortButton, { color: colors.iconColor }]}>
          {sortAsc === null ? 'Sort' : sortAsc ? 'A - Z' : 'Z - A'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFavouriteItem = ({ item, index }: { item: FavoriteItem; index: number }) => (
    <View>
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => handlePlay(item)}
      >
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.itemMenu} onPress={() => handleMenu(item)}>
          <Ionicons name="ellipsis-horizontal-circle" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const filteredFavorites = useMemo(() => {
    const list = favorites.filter(f =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortAsc !== null) {
      return [...list].sort((a, b) =>
        sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      );
    }
    return list; // Recently Added order (newest first)
  }, [favorites, searchQuery, sortAsc]);

  const renderContent = () => {
    return (
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavouriteItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={renderSectionHeader}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="heart-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No favorites yet.</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>Like items across the app to see them here.</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      {renderHeader()}
      {renderSearchBar()}
      {renderContent()}
    </SafeAreaView>
  );
}