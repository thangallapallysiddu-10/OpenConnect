import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
} from 'react-native';
import { styles } from '../src/styles/search.styles';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

// ── All searchable data ──
const ALL_SEARCHABLE_ITEMS = [
  // Songs
  { id: 's1', title: 'Blinding Lights', artist: 'The Weeknd', type: 'song', year: '2020', image: 'https://picsum.photos/seed/bl/200/200' },
  { id: 's2', title: 'After Hours', artist: 'The Weeknd', type: 'song', year: '2020', image: 'https://picsum.photos/seed/ah/200/200' },
  { id: 's3', title: 'Midnight Dreams', artist: 'The Weeknd', type: 'song', year: '2021', image: 'https://picsum.photos/seed/mid/200/200' },
  { id: 's4', title: 'Golden Hour', artist: 'JVKE', type: 'song', year: '2022', image: 'https://picsum.photos/seed/gold/200/200' },
  { id: 's5', title: 'Smooth Operator', artist: 'Sade', type: 'song', year: '1984', image: 'https://picsum.photos/seed/sade/200/200' },
  { id: 's6', title: 'Cruel Summer', artist: 'Taylor Swift', type: 'song', year: '2019', image: 'https://picsum.photos/seed/cruel/200/200' },
  { id: 's7', title: 'Flowers', artist: 'Miley Cyrus', type: 'song', year: '2023', image: 'https://picsum.photos/seed/flowers/200/200' },
  { id: 's8', title: 'Dance The Night', artist: 'Dua Lipa', type: 'song', year: '2023', image: 'https://picsum.photos/seed/dance/200/200' },
  // Artists
  { id: 'a1', title: 'The Weeknd', artist: '32.5M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/wknd2/200/200' },
  { id: 'a2', title: 'Taylor Swift', artist: '45.2M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/tswift/200/200' },
  { id: 'a3', title: 'Dua Lipa', artist: '28.7M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/dua/200/200' },
  { id: 'a4', title: 'Billie Eilish', artist: '24.3M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/billie/200/200' },
  { id: 'a5', title: 'Arijit Singh', artist: '18.9M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/arijit/200/200' },
  { id: 'a6', title: 'SZA', artist: '15.6M monthly listeners', type: 'artist', image: 'https://picsum.photos/seed/sza/200/200' },
  // Playlists
  { id: 'p1', title: 'Chill Vibes', artist: 'Curated playlist', type: 'playlist', songs: '48 songs', image: 'https://picsum.photos/seed/cv/200/200' },
  { id: 'p2', title: 'Late Night Drive', artist: 'Curated playlist', type: 'playlist', songs: '52 songs', image: 'https://picsum.photos/seed/night/200/200' },
  { id: 'p3', title: 'Morning Coffee', artist: 'Curated playlist', type: 'playlist', songs: '36 songs', image: 'https://picsum.photos/seed/coffee/200/200' },
  { id: 'p4', title: 'Focus Flow', artist: 'Curated playlist', type: 'playlist', songs: '42 songs', image: 'https://picsum.photos/seed/focus/200/200' },
  // Albums
  { id: 'al1', title: 'After Hours', artist: 'The Weeknd', type: 'album', year: '2020', image: 'https://picsum.photos/seed/ah2/200/200' },
  { id: 'al2', title: 'Midnights', artist: 'Taylor Swift', type: 'album', year: '2022', image: 'https://picsum.photos/seed/midnights/200/200' },
  { id: 'al3', title: 'Future Nostalgia', artist: 'Dua Lipa', type: 'album', year: '2020', image: 'https://picsum.photos/seed/future/200/200' },
];

// ── Static data for sections ──
const recentlyPlayed = [
  { id: '1', title: 'Midnight Dreams', artist: 'The Weeknd', plays: '2.1M plays', image: 'https://picsum.photos/seed/mid/400/400' },
  { id: '2', title: 'Golden Hour', artist: 'JVKE', plays: '1.8M plays', image: 'https://picsum.photos/seed/gold/400/400' },
  { id: '3', title: 'Smooth Operator', artist: 'Sade', plays: '3.2M plays', image: 'https://picsum.photos/seed/sade/400/400' },
  { id: '4', title: 'After Hours', artist: 'The Weeknd', plays: '2.7M plays', image: 'https://picsum.photos/seed/after/400/400' },
];

const popularArtists = [
  { id: '1', name: 'The Weeknd', genre: 'R&B/Pop', followers: '32.5M', image: 'https://picsum.photos/seed/wknd/400/400' },
  { id: '2', name: 'Taylor Swift', genre: 'Pop', followers: '45.2M', image: 'https://picsum.photos/seed/tswift/400/400' },
  { id: '3', name: 'Dua Lipa', genre: 'Pop/Dance', followers: '28.7M', image: 'https://picsum.photos/seed/dua/400/400' },
  { id: '4', name: 'Billie Eilish', genre: 'Alternative', followers: '24.3M', image: 'https://picsum.photos/seed/billie/400/400' },
  { id: '5', name: 'Arijit Singh', genre: 'Bollywood', followers: '18.9M', image: 'https://picsum.photos/seed/arijit/400/400' },
  { id: '6', name: 'SZA', genre: 'R&B', followers: '15.6M', image: 'https://picsum.photos/seed/sza/400/400' },
];

const curatedPlaylists = [
  { id: '1', title: 'Chill Vibes', description: 'Relax & unwind', songs: '48 songs', duration: '2h 45m', image: 'https://picsum.photos/seed/chill/400/400', color: '#C5A572' },
  { id: '2', title: 'Late Night Drive', description: 'Smooth R&B', songs: '52 songs', duration: '3h 10m', image: 'https://picsum.photos/seed/night/400/400', color: '#9B8B7A' },
  { id: '3', title: 'Morning Coffee', description: 'Acoustic mornings', songs: '36 songs', duration: '2h 05m', image: 'https://picsum.photos/seed/coffee/400/400', color: '#C5A572' },
  { id: '4', title: 'Focus Flow', description: 'Deep concentration', songs: '42 songs', duration: '2h 30m', image: 'https://picsum.photos/seed/focus/400/400', color: '#9B8B7A' },
];

const moodCategories = [
  { id: '1', mood: 'Energize', icon: '⚡', image: 'https://picsum.photos/seed/energy/400/400' },
  { id: '2', mood: 'Relax', icon: '🌊', image: 'https://picsum.photos/seed/relax/400/400' },
  { id: '3', mood: 'Focus', icon: '🎯', image: 'https://picsum.photos/seed/focusx/400/400' },
  { id: '4', mood: 'Romance', icon: '❤️', image: 'https://picsum.photos/seed/romance/400/400' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { theme, colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 900;
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // ✅ FILTER search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return ALL_SEARCHABLE_ITEMS.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.artist.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setShowResults(text.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderSearchResult = ({ item }: any) => (
    <TouchableOpacity style={[styles.resultItem, { borderBottomColor: colors.border }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.resultImage}
      />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{item.artist}</Text>
        <View style={styles.resultMeta}>
          <View style={styles.resultType}>
            <Text style={styles.resultTypeText}>{item.type}</Text>
          </View>
          {item.year ? <Text style={[styles.resultYear, { color: colors.textMuted }]}>{item.year}</Text> : null}
          {item.songs ? <Text style={[styles.resultYear, { color: colors.textMuted }]}>{item.songs}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderRecentlyPlayed = ({ item }: any) => (
    <TouchableOpacity style={[styles.recentlyPlayedItem, { borderBottomColor: colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.recentlyPlayedImage} />
      <View style={styles.recentlyPlayedInfo}>
        <Text style={[styles.recentlyPlayedTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.recentlyPlayedArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
      </View>
      <Text style={[styles.recentlyPlayedPlays, { color: colors.textMuted }]}>{item.plays}</Text>
    </TouchableOpacity>
  );

  const renderArtist = ({ item }: any) => (
    <TouchableOpacity style={[styles.artistCard, { backgroundColor: colors.cardBackground }]}>
      <Image source={{ uri: item.image }} style={styles.artistImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.artistGradient}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.artistGenre}>{item.genre}</Text>
        <View style={styles.artistFollowers}>
          <Ionicons name="people" size={12} color="#E0E0E0" />
          <Text style={styles.artistFollowersText}>{item.followers}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }: any) => (
    <TouchableOpacity style={[styles.playlistCard, { backgroundColor: colors.cardBackground }]}>
      <Image source={{ uri: item.image }} style={styles.playlistImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.playlistOverlay}
      />
      <View style={styles.playlistContent}>
        <View style={[styles.playlistBadge, { backgroundColor: item.color }]}>
          <Text style={styles.playlistBadgeText}>{item.songs}</Text>
        </View>
        <Text style={styles.playlistTitle}>{item.title}</Text>
        <Text style={styles.playlistDescription}>{item.description}</Text>
        <Text style={styles.playlistDuration}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMood = ({ item }: any) => (
    <TouchableOpacity style={[styles.moodCard, { backgroundColor: colors.cardBackground }]}>
      <Image source={{ uri: item.image }} style={styles.moodImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.moodOverlay}
      />
      <View style={styles.moodContent}>
        <Text style={styles.moodIcon}>{item.icon}</Text>
        <Text style={styles.moodText}>{item.mood}</Text>
      </View>
    </TouchableOpacity>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        {!isDesktop && (
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        )}

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search songs, artists, podcasts..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results or Explore */}
      {showResults ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 16, marginTop: 12 }}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Mood */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood</Text>
            </View>
            <FlatList
              data={moodCategories}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderMood}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.moodList}
            />
          </View>

          {/* Recently Played */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Played</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentlyPlayed.slice(0, 3)}
              renderItem={renderRecentlyPlayed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.recentlyPlayedList}
            />
          </View>

          {/* Popular Artists */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Artists</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={popularArtists}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderArtist}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.artistsList}
            />
          </View>

          {/* Curated Playlists */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Curated Playlists</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={curatedPlaylists}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderPlaylist}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.playlistsList}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}