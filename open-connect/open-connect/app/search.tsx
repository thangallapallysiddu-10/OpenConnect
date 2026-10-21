import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { styles } from '../src/styles/search.styles';
import { useTheme } from '../src/context/ThemeContext';
import { useAudio } from '../src/context/AudioContext';
import { apiGet } from '../src/services/api';
import { newReleases, perfectForYou, recentlyPlayed as mockSongs } from '../src/data/songs';
import { podcasts as mockPodcasts } from '../src/data/podcasts';
import { liveStations } from '../src/data/liveStations';
import { rjs as mockRjs } from '../src/data/rjs';

const { width } = Dimensions.get('window');

// ── Explore catalog (bundled fallback data) ──────────────────────────────────

const recentlyPlayed = [
  { id: '1', title: 'Midnight Dreams',  artist: 'The Weeknd', plays: '2.1M plays', image: 'https://picsum.photos/seed/mid/400/400' },
  { id: '2', title: 'Golden Hour',      artist: 'JVKE',       plays: '1.8M plays', image: 'https://picsum.photos/seed/gold/400/400' },
  { id: '3', title: 'Smooth Operator',  artist: 'Sade',       plays: '3.2M plays', image: 'https://picsum.photos/seed/sade/400/400' },
  { id: '4', title: 'After Hours',      artist: 'The Weeknd', plays: '2.7M plays', image: 'https://picsum.photos/seed/after/400/400' },
];

const popularArtists = [
  { id: '1', name: 'The Weeknd',   genre: 'R&B/Pop',    followers: '32.5M', image: 'https://picsum.photos/seed/wknd/400/400' },
  { id: '2', name: 'Taylor Swift', genre: 'Pop',         followers: '45.2M', image: 'https://picsum.photos/seed/tswift/400/400' },
  { id: '3', name: 'Dua Lipa',     genre: 'Pop/Dance',  followers: '28.7M', image: 'https://picsum.photos/seed/dua/400/400' },
  { id: '4', name: 'Billie Eilish',genre: 'Alternative',followers: '24.3M', image: 'https://picsum.photos/seed/billie/400/400' },
  { id: '5', name: 'Arijit Singh', genre: 'Bollywood',  followers: '18.9M', image: 'https://picsum.photos/seed/arijit/400/400' },
  { id: '6', name: 'SZA',          genre: 'R&B',         followers: '15.6M', image: 'https://picsum.photos/seed/sza/400/400' },
];

const curatedPlaylists = [
  { id: '1', title: 'Chill Vibes',      description: 'Relax & unwind',       songs: '48 songs', duration: '2h 45m', image: 'https://picsum.photos/seed/chill/400/400', color: '#C5A572' },
  { id: '2', title: 'Late Night Drive', description: 'Smooth R&B',           songs: '52 songs', duration: '3h 10m', image: 'https://picsum.photos/seed/night/400/400', color: '#9B8B7A' },
  { id: '3', title: 'Morning Coffee',   description: 'Acoustic mornings',    songs: '36 songs', duration: '2h 05m', image: 'https://picsum.photos/seed/coffee/400/400', color: '#C5A572' },
  { id: '4', title: 'Focus Flow',       description: 'Deep concentration',   songs: '42 songs', duration: '2h 30m', image: 'https://picsum.photos/seed/focus/400/400', color: '#9B8B7A' },
];

const moodCategories = [
  { id: '1', mood: 'Energize', icon: '⚡', image: 'https://picsum.photos/seed/energy/400/400' },
  { id: '2', mood: 'Relax',    icon: '🌊', image: 'https://picsum.photos/seed/relax/400/400' },
  { id: '3', mood: 'Focus',    icon: '🎯', image: 'https://picsum.photos/seed/focusx/400/400' },
  { id: '4', mood: 'Romance',  icon: '❤️', image: 'https://picsum.photos/seed/romance/400/400' },
];

// ── Unified result model ─────────────────────────────────────────────────────

type ResultKind = 'song' | 'podcast' | 'station' | 'rj' | 'artist' | 'playlist' | 'event';

type UnifiedResult = {
  key: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  image: string;
  track?: { id: string; title: string; artist: string; image: any; uri?: string };
};

const FILTERS: { label: string; kind: 'All' | ResultKind }[] = [
  { label: 'All', kind: 'All' },
  { label: 'Songs', kind: 'song' },
  { label: 'Podcasts', kind: 'podcast' },
  { label: 'Stations', kind: 'station' },
  { label: 'RJs', kind: 'rj' },
];

type BackendSearchPayload = {
  songs?: { id: string; title: string; artist_name?: string | null; cover_url?: string | null; image_url?: string | null; audio_url?: string | null }[];
  podcasts?: { id: string; title: string; description?: string | null; cover_url?: string | null; image_url?: string | null }[];
  rjs?: { id: string; name: string; image_url?: string | null }[];
  stations?: { id: string; name: string; logo_url?: string | null; city?: string | null }[];
  events?: { id: string; title: string; image_url?: string | null; venue?: string | null }[];
};

// Bundled catalog used when the API is unreachable (resilient fallback).
function localSearch(query: string): UnifiedResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const match = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));

  const songs: UnifiedResult[] = [...mockSongs, ...perfectForYou, ...newReleases]
    .filter((s) => match(s.title, s.artist))
    .map((s) => ({
      key: `song-${s.id}`, kind: 'song' as const, title: s.title, subtitle: s.artist,
      image: typeof s.image === 'object' ? s.image.uri : String(s.image),
      track: { id: s.id, title: s.title, artist: s.artist, image: s.image },
    }));

  const podcasts: UnifiedResult[] = mockPodcasts
    .filter((p) => match(p.title, p.host))
    .map((p) => ({ key: `pod-${p.id}`, kind: 'podcast' as const, title: p.title, subtitle: `${p.host} • ${p.episodes} episodes`, image: p.image }));

  const stations: UnifiedResult[] = liveStations
    .filter((s) => match(s.name, s.tag, s.city))
    .map((s) => ({ key: `st-${s.id}`, kind: 'station' as const, title: s.name, subtitle: `${s.frequency} FM • ${s.tag}`, image: s.image }));

  const rjs: UnifiedResult[] = mockRjs
    .filter((r) => match(r.name, r.showName))
    .map((r) => ({ key: `rj-${r.id}`, kind: 'rj' as const, title: r.name, subtitle: `${r.showName} • ${r.listeners} listeners`, image: r.image }));

  const artists: UnifiedResult[] = popularArtists
    .filter((a) => match(a.name, a.genre))
    .map((a) => ({ key: `ar-${a.id}`, kind: 'artist' as const, title: a.name, subtitle: `${a.genre} • ${a.followers} followers`, image: a.image }));

  const playlists: UnifiedResult[] = curatedPlaylists
    .filter((p) => match(p.title, p.description))
    .map((p) => ({ key: `pl-${p.id}`, kind: 'playlist' as const, title: p.title, subtitle: `${p.songs} • ${p.description}`, image: p.image }));

  return [...songs, ...podcasts, ...stations, ...rjs, ...artists, ...playlists];
}

function mapBackend(payload: BackendSearchPayload): UnifiedResult[] {
  return [
    ...(payload.songs ?? []).map((s): UnifiedResult => ({
      key: `song-${s.id}`, kind: 'song', title: s.title, subtitle: s.artist_name ?? 'Song',
      image: s.cover_url || s.image_url || 'https://picsum.photos/seed/song/200/200',
      track: { id: s.id, title: s.title, artist: s.artist_name ?? 'Open Connect', image: { uri: s.cover_url || s.image_url || undefined }, uri: s.audio_url || undefined },
    })),
    ...(payload.podcasts ?? []).map((p): UnifiedResult => ({ key: `pod-${p.id}`, kind: 'podcast', title: p.title, subtitle: p.description ?? 'Podcast', image: p.cover_url || p.image_url || 'https://picsum.photos/seed/pod/200/200' })),
    ...(payload.stations ?? []).map((s): UnifiedResult => ({ key: `st-${s.id}`, kind: 'station', title: s.name, subtitle: s.city ?? 'Radio station', image: s.logo_url || 'https://picsum.photos/seed/radio/200/200' })),
    ...(payload.rjs ?? []).map((r): UnifiedResult => ({ key: `rj-${r.id}`, kind: 'rj', title: r.name, subtitle: 'Radio Jockey', image: r.image_url || 'https://picsum.photos/seed/rj/200/200' })),
    ...(payload.events ?? []).map((e): UnifiedResult => ({ key: `ev-${e.id}`, kind: 'event', title: e.title, subtitle: e.venue ?? 'Live event', image: e.image_url || 'https://picsum.photos/seed/event/200/200' })),
  ];
}

const openResult = (item: UnifiedResult, playTrack: (t: any) => void) => {
  switch (item.kind) {
    case 'song':
      if (item.track) playTrack(item.track);
      break;
    case 'podcast':
      router.push('/podcasts/discover');
      break;
    case 'station':
      router.push('/livestations/stations');
      break;
    case 'rj':
      router.push('/rjs/stations');
      break;
    case 'artist':
      router.push('/rjs/artist');
      break;
    case 'playlist':
      router.push('/rjs/genre');
      break;
    case 'event':
      router.push('/rjs/live-event');
      break;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { theme, colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { playTrack } = useAudio();
  const isDesktop = windowWidth >= 900;
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | ResultKind>('All');
  const [results, setResults] = useState<UnifiedResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  // Deep-link support: /search?mood=Chill pre-fills the query (Home mood chips).
  const { mood } = useLocalSearchParams<{ mood?: string }>();
  useEffect(() => {
    if (typeof mood === 'string' && mood) {
      setSearchQuery(mood);
      setShowResults(true);
    }
  }, [mood]);

  // Query the API (documented /search endpoint); fall back to the bundled catalog.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    let isMounted = true;
    setSearching(true);
    const timer = setTimeout(() => {
      apiGet<BackendSearchPayload>(`/search?q=${encodeURIComponent(q)}&limit=10`)
        .catch(() => null)
        .then((data) => {
          if (!isMounted) return;
          const list = data ? mapBackend(data) : [];
          // Live results are used only when non-empty; otherwise keep local
          // filtering so every bundled artist/station stays discoverable.
          setResults(list.length ? list : localSearch(q));
          setSearching(false);
        });
    }, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [searchQuery]);

  const filteredResults = useMemo(
    () => (activeFilter === 'All' ? results : results.filter((r) => r.kind === activeFilter)),
    [results, activeFilter],
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setShowResults(text.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setActiveFilter('All');
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderSearchResult = ({ item }: { item: UnifiedResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: colors.border }]}
      onPress={() => openResult(item, playTrack)}
      activeOpacity={0.75}
    >
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        <View style={styles.resultMeta}>
          <View style={styles.resultType}>
            <Text style={styles.resultTypeText}>{item.kind}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderRecentlyPlayed = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.recentlyPlayedItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSearch(item.title)}
      activeOpacity={0.75}
    >
      <Image source={{ uri: item.image }} style={styles.recentlyPlayedImage} />
      <View style={styles.recentlyPlayedInfo}>
        <Text style={[styles.recentlyPlayedTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.recentlyPlayedArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
      </View>
      <Text style={[styles.recentlyPlayedPlays, { color: colors.textMuted }]}>{item.plays}</Text>
    </TouchableOpacity>
  );

  const renderArtist = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.artistCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push(`/rjs/artist?name=${encodeURIComponent(item.name)}`)}
      activeOpacity={0.8}
    >
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
    <TouchableOpacity
      style={[styles.playlistCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleSearch(item.title)}
      activeOpacity={0.8}
    >
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
    <TouchableOpacity
      style={[styles.moodCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleSearch(item.mood)}
      activeOpacity={0.8}
    >
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
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/'))} style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
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
        <View style={{ flex: 1 }}>
          {/* Type filter chips */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
            {FILTERS.map((f) => {
              const active = activeFilter === f.kind;
              return (
                <TouchableOpacity
                  key={f.label}
                  onPress={() => setActiveFilter(f.kind)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: active ? colors.iconColor : colors.border,
                    backgroundColor: active ? colors.iconColor : 'transparent',
                  }}
                >
                  <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {searching ? (
            <ActivityIndicator size="large" color={colors.iconColor} style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={filteredResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.key}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingTop: 50 }}>
                  <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                  <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 15 }}>
                    No results for “{searchQuery}”
                  </Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 13 }}>
                    Try a different title, artist or station.
                  </Text>
                </View>
              }
            />
          )}
        </View>
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
              <TouchableOpacity onPress={() => setShowAllRecent((v) => !v)}>
                <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>
                  {showAllRecent ? 'Show Less' : 'View All'}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={showAllRecent ? recentlyPlayed : recentlyPlayed.slice(0, 3)}
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
              <TouchableOpacity onPress={() => router.push('/rjs/topsingers')}>
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
              <TouchableOpacity onPress={() => router.push('/rjs/genre')}>
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
