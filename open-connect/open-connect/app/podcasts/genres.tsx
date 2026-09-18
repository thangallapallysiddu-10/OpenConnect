// app>podcasts>genres.tsx - Updated with search functionality and proper NEW badge positioning

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// ── Genre Data (same as before) ─────────────────────────────────────────────────
interface Genre {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: string;
  gradient: [string, string];
  accent: string;
  image: string;
  description: string;
  listeners: string;
  isPopular?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  trendValue?: string;
  newEpisodes?: string;
  borderColor: string;
}

const genres: Genre[] = [
  {
    id: '1',
    name: 'Technology',
    icon: 'hardware-chip',
    count: '245 podcasts',
    gradient: ['#1A2A3A', '#0F1A24'],
    accent: '#5F9EA0',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    description: 'Latest in tech, AI, and innovation',
    listeners: '1.2M listeners',
    isPopular: true,
    isTrending: true,
    isRecommended: true,
    trendValue: '+24%',
    newEpisodes: '12 new',
    borderColor: 'rgba(95, 158, 160, 0.3)',
  },
  {
    id: '2',
    name: 'Business',
    icon: 'briefcase',
    count: '189 podcasts',
    gradient: ['#1A2A1A', '#0F1A0F'],
    accent: '#8FBC8F',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop',
    description: 'Entrepreneurship, leadership, finance',
    listeners: '890K listeners',
    isPopular: true,
    isRecommended: true,
    trendValue: '+18%',
    borderColor: 'rgba(143, 188, 143, 0.3)',
  },
  {
    id: '3',
    name: 'True Crime',
    icon: 'finger-print',
    count: '156 podcasts',
    gradient: ['#2A1A1A', '#1A0F0F'],
    accent: '#CD5C5C',
    image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=400&h=400&fit=crop',
    description: 'Investigative stories & mysteries',
    listeners: '2.1M listeners',
    isPopular: true,
    isTrending: true,
    trendValue: '+31%',
    borderColor: 'rgba(205, 92, 92, 0.3)',
  },
  {
    id: '4',
    name: 'Wellness',
    icon: 'heart',
    count: '203 podcasts',
    gradient: ['#1A2A24', '#0F1A17'],
    accent: '#9ACD32',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop',
    description: 'Mental health, fitness, mindfulness',
    listeners: '750K listeners',
    isNew: true,
    isRecommended: true,
    newEpisodes: '8 new',
    borderColor: 'rgba(154, 205, 50, 0.3)',
  },
  {
    id: '5',
    name: 'Comedy',
    icon: 'happy',
    count: '178 podcasts',
    gradient: ['#2A241A', '#1A170F'],
    accent: '#DAA520',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=400&fit=crop',
    description: 'Stand-up, improv, funny stories',
    listeners: '1.5M listeners',
    isPopular: true,
    trendValue: '+12%',
    borderColor: 'rgba(218, 165, 32, 0.3)',
  },
  {
    id: '6',
    name: 'News',
    icon: 'newspaper',
    count: '167 podcasts',
    gradient: ['#1A242A', '#0F171A'],
    accent: '#6A5ACD',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=400&fit=crop',
    description: 'Daily news, politics, analysis',
    listeners: '3.2M listeners',
    isPopular: true,
    isTrending: true,
    trendValue: '+15%',
    borderColor: 'rgba(106, 90, 205, 0.3)',
  },
  {
    id: '7',
    name: 'Science',
    icon: 'flask',
    count: '134 podcasts',
    gradient: ['#1A1A2A', '#0F0F1A'],
    accent: '#9370DB',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
    description: 'Space, biology, physics, discoveries',
    listeners: '680K listeners',
    isNew: true,
    isRecommended: true,
    newEpisodes: '5 new',
    borderColor: 'rgba(147, 112, 219, 0.3)',
  },
  {
    id: '8',
    name: 'History',
    icon: 'time',
    count: '145 podcasts',
    gradient: ['#2A1A24', '#1A0F17'],
    accent: '#B8860B',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=400&fit=crop',
    description: 'Ancient to modern, world history',
    listeners: '920K listeners',
    isTrending: true,
    trendValue: '+8%',
    borderColor: 'rgba(184, 134, 11, 0.3)',
  },
  {
    id: '9',
    name: 'Education',
    icon: 'school',
    count: '198 podcasts',
    gradient: ['#1A2A2A', '#0F1A1A'],
    accent: '#66CDAA',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
    description: 'Learning, courses, tutorials',
    listeners: '1.1M listeners',
    isNew: true,
    newEpisodes: '15 new',
    borderColor: 'rgba(102, 205, 170, 0.3)',
  },
  {
    id: '10',
    name: 'Sports',
    icon: 'football',
    count: '123 podcasts',
    gradient: ['#2A3A1A', '#1A2A0F'],
    accent: '#9ACD32',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
    description: 'Football, basketball, analysis',
    listeners: '890K listeners',
    isPopular: true,
    trendValue: '+21%',
    borderColor: 'rgba(154, 205, 50, 0.3)',
  },
];

// ── Genre Card Component ────────────────────────────────────────────────────
const GenreCard = ({ genre, index, onPress, cardWidth }: { genre: Genre; index: number; onPress: () => void; cardWidth: number }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          width: cardWidth,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <LinearGradient
          colors={genre.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, { borderColor: genre.borderColor }]}
        >
          {/* Background Pattern */}
          <View style={styles.cardPattern}>
            <Ionicons name={genre.icon} size={80} color="rgba(255,255,255,0.03)" />
          </View>

          {/* NEW Badge - Only shows for genres with isNew: true */}
          {genre.isNew && (
            <View style={[styles.newBadge, { backgroundColor: genre.accent }]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}

          <View style={styles.cardContent}>
            {/* Header with Icon and Title */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${genre.accent}25` }]}>
                <Ionicons name={genre.icon} size={22} color={genre.accent} />
              </View>
              <Text style={styles.genreName}>{genre.name}</Text>
            </View>

            {/* Description */}
            <Text style={styles.genreDescription}>{genre.description}</Text>

            {/* Stats - Stacked Vertically */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="headset-outline" size={12} color={genre.accent} />
                <Text style={styles.statText}>{genre.count}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={12} color={genre.accent} />
                <Text style={styles.statText}>{genre.listeners}</Text>
              </View>
            </View>

            {/* Explore Link */}
            <View style={styles.exploreContainer}>
              <Text style={[styles.exploreText, { color: genre.accent }]}>Explore</Text>
              <Ionicons name="arrow-forward" size={14} color={genre.accent} />
            </View>

            {/* Accent Border */}
            <View style={[styles.accentBorder, { backgroundColor: genre.accent }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
export default function GenresScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Genre[]>([]);
  
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  
  const handleBack = () => router.canGoBack() ? router.back() : router.replace('/podcasts/discover');
  
  const handleGenrePress = (genreId: string) => {
    router.push({
      pathname: '/podcasts/category/[id]',
      params: { id: genreId }
    });
  };

  // Toggle search bar
  const toggleSearch = () => {
    if (searchVisible) {
      // Close search
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setSearchVisible(false);
        setSearchQuery('');
        setSearchResults([]);
      });
    } else {
      // Open search
      setSearchVisible(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
    }
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const filtered = genres.filter(genre => 
      genre.name.toLowerCase().includes(text.toLowerCase()) ||
      genre.description.toLowerCase().includes(text.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const filters = ['All', 'Popular', 'New', 'Trending', 'Recommended'];

  // Filter genres based on active filter
  const getFilteredGenres = () => {
    switch (activeFilter) {
      case 'Popular':
        return genres.filter(genre => genre.isPopular);
      case 'New':
        return genres.filter(genre => genre.isNew);
      case 'Trending':
        return genres.filter(genre => genre.isTrending);
      case 'Recommended':
        return genres.filter(genre => genre.isRecommended);
      case 'All':
      default:
        return genres;
    }
  };

  const { width: windowWidth } = useWindowDimensions();
  const filteredGenres = getFilteredGenres();
  
  // Determine which genres to display (search results or filtered genres)
  const displayedGenres = searchQuery.trim() !== '' ? searchResults : filteredGenres;

  const isDesktop = windowWidth >= 768;
  const contentWidth = Math.min(windowWidth, 1200);
  const numColumns = isDesktop ? 4 : 2;
  const cardWidth = (contentWidth - 40 - (numColumns - 1) * 16) / numColumns;

  // Animated search bar width
  const searchBarWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [42, contentWidth - 100],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1A1A1A', '#0A0A0A', '#000000']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Search */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          {!searchVisible ? (
            <Text style={styles.headerTitle}>Genres</Text>
          ) : (
            <Animated.View style={[styles.searchContainer, { width: searchBarWidth }]}>
              <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.5)" />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search genres..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
          
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={toggleSearch}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={searchVisible ? "close" : "search-outline"} 
              size={22} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs - Hide when searching */}
        {!searchVisible && (
          <>
            <View style={styles.filterTabsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTabsScroll}
              >
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterTab,
                      activeFilter === filter && styles.filterTabActive
                    ]}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterTabText,
                      activeFilter === filter && styles.filterTabTextActive
                    ]}>
                      {filter}
                    </Text>
                    {filter === 'New' && (
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{genres.filter(g => g.isNew).length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Results Info */}
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {filteredGenres.length} genres • Based on your {activeFilter.toLowerCase()} picks
              </Text>
            </View>
          </>
        )}

        {/* Search Results Info */}
        {searchVisible && searchQuery !== '' && (
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {`Found ${searchResults.length} ${searchResults.length === 1 ? 'genre' : 'genres'} for "${searchQuery}"`}
            </Text>
          </View>
        )}

        {/* Genre Grid */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        >
          {displayedGenres.length > 0 ? (
            <View style={styles.gridWrapper}>
              {displayedGenres.map((genre, index) => (
                <GenreCard
                  key={genre.id}
                  genre={genre}
                  index={index}
                  onPress={() => handleGenrePress(genre.id)}
                  cardWidth={cardWidth}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No genres found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery !== '' 
                  ? `No results for "${searchQuery}"` 
                  : 'Try selecting a different filter'}
              </Text>
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 0,
  },
  filterTabsContainer: {
    marginBottom: 12,
  },
  filterTabsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: 'rgba(224,85,85,0.15)',
    borderColor: '#E05555',
  },
  filterTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  filterTabTextActive: {
    color: '#E05555',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#E05555',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  cardWrapper: {
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cardGradient: {
    borderRadius: 20,
    padding: 16,
    paddingTop: 32, // Increased padding to make room for the NEW badge
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.5,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  genreDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
    marginBottom: 8,
  },
  statsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  exploreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  exploreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: 40,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    opacity: 0.5,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  bottomSpacer: {
    height: 32,
  },
});