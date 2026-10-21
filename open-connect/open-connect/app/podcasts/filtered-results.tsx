import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Full podcast database for filtering ───────────────────────────────────────
const ALL_PODCASTS = [
  { id: 'lv1', title: 'Tech Talk Daily',  creator: 'Lex Fridman',     category: 'News', language: 'English', status: 'Popular', length: 'Long',   image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop', isLive: true },
{ id: 'lv2', title: 'Mind & Body',      creator: 'Andrew Huberman', category: 'News', language: 'English', status: 'Popular', length: 'Medium', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=200&fit=crop', isLive: true },
{ id: 'lv3', title: 'Morning Briefing', creator: 'Michael Barbaro', category: 'News', language: 'English', status: 'New',     length: 'Short',  image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=200&fit=crop', isLive: true },
{ id: 'lv4', title: 'Startup Stories',  creator: 'Tim Ferriss',     category: 'News', language: 'English', status: 'New',     length: 'Long',   image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop', isLive: true },
  { id: 'us1',  title: 'The Daily',            creator: 'Michael Barbaro',    studio: 'The New York Times',  image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', language: 'English', length: 'Medium', status: 'Popular',  timeframe: 'This week',  category: 'News' },
  { id: 'us2',  title: 'Up First',             creator: 'NPR',                studio: 'NPR',                 image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop', language: 'English', length: 'Short',  status: 'New',      timeframe: 'Today',      category: 'News' },
  { id: 'us4',  title: 'Serial',               creator: 'Sarah Koenig',       studio: 'This American Life',  image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', language: 'English', length: 'Long',   status: 'Popular',  timeframe: 'This month', category: 'True Crime' },
  { id: 'us5',  title: 'My Favorite Murder',   creator: 'Karen Kilgariff',    studio: 'Exactly Right',       image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop', language: 'English', length: 'Long',   status: 'Popular',  timeframe: 'This month', category: 'True Crime' },
  { id: 'us6',  title: 'Crime Junkie',         creator: 'Ashley Flowers',     studio: 'audiochuck',          image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop', language: 'English', length: 'Medium', status: 'New',      timeframe: 'This week',  category: 'True Crime' },
  { id: 'us7',  title: 'How I Built This',     creator: 'Guy Raz',            studio: 'NPR',                 image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', language: 'English', length: 'Long',   status: 'Popular',  timeframe: 'This year',  category: 'Business' },
  { id: 'us8',  title: 'The Tim Ferriss Show', creator: 'Tim Ferriss',        studio: 'Tim Ferriss',         image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', language: 'English', length: 'Too long', status: 'Popular', timeframe: 'This year', category: 'Business' },
  { id: 'us12', title: 'Lex Fridman Podcast',  creator: 'Lex Fridman',        studio: 'MIT',                 image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', language: 'English', length: 'Too long', status: 'Popular', timeframe: 'This week', category: 'Technology' },
  { id: 'us13', title: 'Waveform',             creator: 'Marques Brownlee',   studio: 'MKBHD',               image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop', language: 'English', length: 'Medium', status: 'New',      timeframe: 'Today',      category: 'Technology' },
  { id: 'us15', title: 'Huberman Lab',         creator: 'Dr. Andrew Huberman',studio: 'Sciocomm Media',      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', language: 'English', length: 'Too long', status: 'Popular', timeframe: 'This week', category: 'Health' },
  { id: 'in1',  title: 'The Seen and Unseen',  creator: 'Amit Varma',         studio: 'IVM Podcasts',        image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop', language: 'Hindi',   length: 'Long',   status: 'New',      timeframe: 'This month', category: 'News' },
  { id: 'in2',  title: 'Cyrus Says',           creator: 'Cyrus Broacha',      studio: 'IVM Podcasts',        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', language: 'Hindi',   length: 'Medium', status: 'Popular',  timeframe: 'This week',  category: 'Comedy' },
  { id: 'in3',  title: 'Desi Tech Podcast',    creator: 'Rajiv Mehta',        studio: 'Desi Tech',           image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', language: 'Hindi',   length: 'Medium', status: 'New',      timeframe: 'Today',      category: 'Technology' },
  { id: 'fr1',  title: 'Le Monde Podcast',     creator: 'Le Monde',           studio: 'Le Monde',            image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop', language: 'French',  length: 'Short',  status: 'Popular',  timeframe: 'Today',      category: 'News' },
  { id: 'de1',  title: 'Deutschlandfunk',      creator: 'DLF',                studio: 'Deutschlandfunk',     image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', language: 'German',  length: 'Short',  status: 'Popular',  timeframe: 'This week',  category: 'News' },
  { id: 'ar1',  title: 'Kerning Cultures',     creator: 'Hebah Fisher',       studio: 'Kerning Cultures',    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', language: 'Arabic',  length: 'Medium', status: 'New',      timeframe: 'This month', category: 'Culture' },
  { id: 'ru1',  title: 'Медуза',               creator: 'Meduza',             studio: 'Meduza',              image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop', language: 'Russian', length: 'Short',  status: 'New',      timeframe: 'Today',      category: 'News' },
  { id: 'pt1',  title: 'Nerdcast',             creator: 'Jovem Nerd',         studio: 'Jovem Nerd',          image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop', language: 'Portuguese', length: 'Long', status: 'Popular', timeframe: 'This month', category: 'Technology' },
];

export default function FilteredResultsScreen() {
  const params = useLocalSearchParams<{ status: string; timeframe: string; length: string; language: string }>();

  const selStatus    = params.status    ? params.status.split(',').filter(Boolean)    : [];
  const selTimeframe = params.timeframe ? params.timeframe.split(',').filter(Boolean) : [];
  const selLength    = params.length    ? params.length.split(',').filter(Boolean)    : [];
  const selLanguage  = params.language  ? params.language.split(',').filter(Boolean)  : [];

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = ALL_PODCASTS.filter(p => {
    const matchStatus    = selStatus.length    === 0 || selStatus.includes(p.status);
    const matchTimeframe = selTimeframe.length === 0 || selTimeframe.includes(p.timeframe ?? '');
    const matchLength    = selLength.length    === 0 || selLength.includes(p.length);
    const matchLanguage  = selLanguage.length  === 0 || selLanguage.includes(p.language);
    return matchStatus && matchTimeframe && matchLength && matchLanguage;
  });

  // ── Entrance animations ───────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerY     = useRef(new Animated.Value(-16)).current;
  const listFade    = useRef(new Animated.Value(0)).current;
  const listY       = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 320, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(headerY,    { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(listFade,   { toValue: 1, duration: 400, delay: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(listY,      { toValue: 0, duration: 400, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Active filter summary tags ────────────────────────────────────────────
  const allActive = [...selStatus, ...selTimeframe, ...selLength, ...selLanguage];

  const handlePodcastPress = (podcast: any) => {
  if (podcast.isLive) {
    router.push({
      pathname: '/podcasts/live-player',
      params: {
        podcastId:      podcast.id,
        podcastTitle:   podcast.title,
        podcastCreator: podcast.creator,
        podcastImage:   podcast.image,
        listeners:      '1.2k',
      },
    });
  } else {
    router.push({
      pathname: '/podcasts/player',
      params: {
        podcastId:      podcast.id,
        podcastTitle:   podcast.title,
        podcastCreator: podcast.creator,
        podcastImage:   podcast.image,
        fromCountryId:  '',
        fromCategoryId: '',
      },
    });
  }
};

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={S.bg} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <Animated.View style={[S.header, { opacity: headerFade, transform: [{ translateY: headerY }] }]}>
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={S.headerCenter}>
            <Text style={S.headerTitle}>Filtered Results</Text>
            <Text style={S.headerSub}>{filtered.length} podcast{filtered.length !== 1 ? 's' : ''} found</Text>
          </View>
          <View style={{ width: 42 }} />
        </Animated.View>

        {/* Active filter tags */}
        {allActive.length > 0 && (
          <Animated.View style={{ opacity: headerFade }}>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={S.tagsRow}
            >
              {allActive.map(tag => (
                <View key={tag} style={S.tag}>
                  <Text style={S.tagText}>{tag}</Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Results */}
        <Animated.View style={[{ flex: 1 }, { opacity: listFade, transform: [{ translateY: listY }] }]}>
          {filtered.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="search-outline" size={56} color="rgba(220,80,80,0.4)" />
              <Text style={S.emptyTitle}>No podcasts found</Text>
              <Text style={S.emptySub}>Try adjusting your filters</Text>
              <TouchableOpacity style={S.backToFilter} onPress={() => router.back()} activeOpacity={0.8}>
                <Text style={S.backToFilterText}>← Adjust Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.list}>
              {filtered.map((podcast, index) => (
                <PodcastRow key={podcast.id} podcast={podcast} index={index} onPress={() => handlePodcastPress(podcast)} />
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ── Animated podcast row card ─────────────────────────────────────────────────
const PodcastRow = ({ podcast, index, onPress }: { podcast: any; index: number; onPress: () => void }) => {
  const scale    = useRef(new Animated.Value(1)).current;
  const rowFade  = useRef(new Animated.Value(0)).current;
  const rowY     = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rowFade, { toValue: 1, duration: 320, delay: index * 50, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(rowY,    { toValue: 0, duration: 320, delay: index * 50, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Animated.View style={{ opacity: rowFade, transform: [{ translateY: rowY }, { scale }] }}>
      <TouchableOpacity
        style={S.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Image source={{ uri: podcast.image }} style={S.cardImage} resizeMode="cover" />
        <View style={S.cardInfo}>
          <View style={S.cardTopRow}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Text style={S.cardCategory}>{podcast.category}</Text>
    {podcast.isLive && (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#CC0000', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' }} />
        <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.8 }}>LIVE</Text>
      </View>
    )}
  </View>
  <View style={[S.lengthBadge, { backgroundColor: lengthColor(podcast.length) }]}>
    <Text style={S.lengthText}>{podcast.length}</Text>
  </View>
</View>
          <Text style={S.cardTitle} numberOfLines={1}>{podcast.title}</Text>
          <Text style={S.cardCreator} numberOfLines={1}>{podcast.creator}{podcast.studio ? ` · ${podcast.studio}` : ''}</Text>
          <View style={S.cardBottomRow}>
            <View style={S.langBadge}>
              <Ionicons name="globe-outline" size={10} color="rgba(255,255,255,0.5)" />
              <Text style={S.langText}>{podcast.language}</Text>
            </View>
            <View style={S.statusBadge}>
              <Text style={S.statusText}>{podcast.status}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={S.playBtn} onPress={onPress} activeOpacity={0.85}>
          <LinearGradient colors={['#CC0000', '#8B0000']} style={S.playGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const lengthColor = (l: string) => {
  switch (l) {
    case 'Short':    return 'rgba(34,180,80,0.25)';
    case 'Medium':   return 'rgba(80,120,220,0.25)';
    case 'Long':     return 'rgba(220,140,30,0.25)';
    case 'Too long': return 'rgba(220,60,60,0.25)';
    default:         return 'rgba(255,255,255,0.1)';
  }
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, any> = {
  container:    { flex: 1, backgroundColor: '#0a0000' },
  bg:           { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  tagsRow:      { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(204,0,0,0.25)',
    borderWidth: 1, borderColor: 'rgba(204,0,0,0.5)',
  },
  tagText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  list:    { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(220,60,60,0.15)',
  },
  cardImage:   { width: 68, height: 68, borderRadius: 12, backgroundColor: '#2A0808', flexShrink: 0 },
  cardInfo:    { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTopRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardCategory:{ fontSize: 10, color: '#E05555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  lengthBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  lengthText:  { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  cardTitle:   { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 3 },
  cardCreator: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  langText:    { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText:  { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  playBtn:     { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', flexShrink: 0 },
  playGradient:{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptySub:    { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  backToFilter: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, backgroundColor: 'rgba(204,0,0,0.25)', borderWidth: 1, borderColor: '#CC2222' },
  backToFilterText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
};