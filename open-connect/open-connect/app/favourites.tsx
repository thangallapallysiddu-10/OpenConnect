import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

export default function FavouritesScreen() {
  const { theme, colors } = useTheme();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { playTrack } = useAudio();
  const { playPodcast } = usePlayer();
  const { startSession } = useRJLive();

  const handlePlay = (item: FavoriteItem) => {
    if (item.type === 'song') {
      playTrack(item.rawData);
    } else if (item.type === 'podcast') {
      playPodcast(item.rawData);
    } else if (item.type === 'rj') {
      startSession(item.rawData);
    }
  };

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
      <TouchableOpacity>
        <Text style={[styles.sortButton, { color: colors.iconColor }]}>Sort</Text>
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
        <TouchableOpacity style={styles.itemMenu} onPress={() => handlePlay(item)}>
          <Ionicons name="play-circle" size={32} color={colors.iconColor || "#EC4899"} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const filteredFavorites = favorites.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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