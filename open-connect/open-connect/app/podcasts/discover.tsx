import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { AdCarousel } from '../../src/components/AdCarousel/AdCarousel';
import { styles } from '../../src/styles/discover.styles';
import {
  AnimatedPressable,
  useFadeSlideAnimation,
  useStaggerAnimation,
} from '../../src/utils/animations';
import { useFavorites } from '../../src/context/FavoritesContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContinueItem {
  id: string; title: string; subtitle: string;
  image: string; progress: number; timeLeft: string; creator: string;
}
interface LivePodcastItem {
  id: string;
  title: string;
  creator: string;
  listeners: string;
  image: string;
}
// ── Static data ───────────────────────────────────────────────────────────────
const trendingPodcasts = [
  { id: 'us2',  title: 'Up First',     episodes: '21 episodes', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop' },
  { id: 'us4',  title: 'Serial',       episodes: '32 episodes', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=300&h=200&fit=crop' },
  { id: 'us12', title: 'Lex Fridman',  episodes: '18 episodes', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop' },
  { id: 'us15', title: 'Huberman Lab', episodes: '24 episodes', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=200&fit=crop' },
  { id: 'us1',  title: 'The Daily',    episodes: '40 episodes', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=200&fit=crop' },
];

const newPodcasts = [
  { id: 'new1', title: 'The Insight Hour', host: 'Dr. Emma Collins', episodes: '8 episodes', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=200&fit=crop', description: 'Deep conversations about science and philosophy' },
  { id: 'new2', title: 'Creative Minds', host: 'Alex Rivera', episodes: '12 episodes', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=200&fit=crop', description: 'Exploring creativity and innovation' },
  { id: 'new3', title: 'Future Forward', host: 'Sarah Mitchell', episodes: '15 episodes', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=200&fit=crop', description: 'Technology trends and predictions' },
  { id: 'new4', title: 'Wellness Talk', host: 'Dr. James Park', episodes: '20 episodes', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop', description: 'Health, fitness, and mental wellness' },
  { id: 'new5', title: 'Business Bytes', host: 'Lisa Chen', episodes: '25 episodes', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop', description: 'Entrepreneurship and business insights' },
  { id: 'new6', title: 'Stories Untold', host: 'Michael Torres', episodes: '18 episodes', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop', description: 'Real stories from real people' },
  { id: 'new7', title: 'Music Theory', host: 'David Kim', episodes: '22 episodes', image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=200&fit=crop', description: 'Understanding music and sound' },
  { id: 'new8', title: 'World Explorer', host: 'Jessica Blake', episodes: '14 episodes', image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=200&fit=crop', description: 'Travel stories and cultural insights' },
];

const genreList = [
  { id: '1', name: 'Technology', icon: 'hardware-chip', count: '245 podcasts' },
  { id: '2', name: 'Business',   icon: 'briefcase',     count: '189 podcasts' },
  { id: '3', name: 'True Crime', icon: 'finger-print',  count: '156 podcasts' },
  { id: '4', name: 'Wellness',   icon: 'fitness',       count: '203 podcasts' },
  { id: '5', name: 'Comedy',     icon: 'happy',         count: '178 podcasts' },
  { id: '6', name: 'News',       icon: 'newspaper',     count: '167 podcasts' },
  { id: '7', name: 'Science',    icon: 'flask',         count: '134 podcasts' },
  { id: '8', name: 'History',    icon: 'time',          count: '145 podcasts' },
  { id: '9', name: 'Education',  icon: 'school',        count: '198 podcasts' },
  { id: '10', name: 'Sports',    icon: 'football',      count: '123 podcasts' },
];

const popularSpeakers = [
  { id: 'sp1', name: 'Lex Fridman',     role: 'AI Researcher',  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', podcasts: 400  },
  { id: 'sp2', name: 'Andrew Huberman', role: 'Neuroscientist', avatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', podcasts: 180  },
  { id: 'sp3', name: 'Sarah Koenig',    role: 'Journalist',     avatar: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', podcasts: 60   },
  { id: 'sp4', name: 'Guy Raz',         role: 'NPR Host',       avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', podcasts: 500  },
  { id: 'sp5', name: 'Michael Barbaro', role: 'NYT Host',       avatar: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', podcasts: 1800 },
  { id: 'sp6', name: 'Tim Ferriss',     role: 'Entrepreneur',   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', podcasts: 700  },
];

const continueListening: ContinueItem[] = [
  { id: 'us15', title: 'Helpful Financial Advice for Creative Types', subtitle: 'Got a side hustle and not sure how to handle yo...', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=200&fit=crop', progress: 0.45, timeLeft: '21 min 30 sec', creator: 'Dr. Andrew Huberman' },
  { id: 'us4',  title: 'True Crime - The Untold Story',               subtitle: 'A deep dive into one of the most baffling cases...', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', progress: 0.7,  timeLeft: '8 min 12 sec',   creator: 'Sarah Koenig' },
  { id: 'us12', title: 'AI and the Future of Humanity',               subtitle: 'Lex speaks with leading researchers about what...',  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', progress: 0.2,  timeLeft: '1 hr 44 min',    creator: 'Lex Fridman' },
];

const livePodcasts: LivePodcastItem[] = [
  { id: 'lv1', title: 'Tech Talk Daily',    creator: 'Lex Fridman',      listeners: '2.4k', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop' },
  { id: 'lv2', title: 'Mind & Body',        creator: 'Andrew Huberman',  listeners: '1.8k', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=200&fit=crop' },
  { id: 'lv3', title: 'Morning Briefing',   creator: 'Michael Barbaro',  listeners: '3.1k', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=200&fit=crop' },
  { id: 'lv4', title: 'Startup Stories',    creator: 'Tim Ferriss',      listeners: '956',  image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop' },
];

// ── Filter options ────────────────────────────────────────────────────────────
const FILTER_STATUS    = ['New', 'Popular', 'Following'];
const FILTER_TIMEFRAME = ['Today', 'This week', 'This month', 'This year'];
const FILTER_LENGTH    = ['Short', 'Medium', 'Long', 'Too long'];
const FILTER_LANGUAGE  = ['English', 'Hindi', 'Bangla', 'Urdu', 'Arabic', 'French', 'Russian', 'Portuguese', 'German'];

// ── PressableCard ─────────────────────────────────────────────────────────────
const PressableCard = ({ children, onPress, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.timing(glow,  { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(220,80,80,0)', 'rgba(220,80,80,0.7)'],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} activeOpacity={1}>
        <Animated.View style={[style, { borderColor, borderWidth: 1 }]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── FilterChip ────────────────────────────────────────────────────────────────
const FilterChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[F.chip, selected && F.chipSelected]}
  >
    <Text style={[F.chipText, selected && F.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const trendingCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 32) / 3
    : Math.min(windowWidth * 0.82, 340);

  const liveCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 48) / 4
    : 160;
  const liveCardHeight = isDesktop ? 130 : 90;

  const newPodcastCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 48) / 4
    : 130;
  const newPodcastImageHeight = isDesktop ? 220 : 130;

  const genreCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 64) / 5
    : 105;

  const speakerCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 80) / 6
    : 110;

  const continueCardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 32 - 32) / 3
    : '100%';

  const params = useLocalSearchParams<{ restoredCountryId?: string; restoredCategoryId?: string }>();
  const getLiveStagger = useStaggerAnimation(livePodcasts.length, 50);
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterVisible,   setFilterVisible]   = useState(false);
  const [selStatus,       setSelStatus]       = useState<string[]>([]);
  const [selTimeframe,    setSelTimeframe]    = useState<string[]>([]);
  const [selLength,       setSelLength]       = useState<string[]>([]);
  const [selLanguage,     setSelLanguage]     = useState<string[]>([]);

  const activeFilterCount = selStatus.length + selTimeframe.length + selLength.length + selLanguage.length;

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const clearAllFilters = () => {
    setSelStatus([]); setSelTimeframe([]); setSelLength([]); setSelLanguage([]);
  };

  const handleApplyFilters = () => {
    setFilterVisible(false);
    router.push({
      pathname: '/podcasts/filtered-results' as any,
      params: {
        status:    selStatus.join(','),
        timeframe: selTimeframe.join(','),
        length:    selLength.join(','),
        language:  selLanguage.join(','),
      },
    });
  };

  // ── Animations ────────────────────────────────────────────────────────────
  const { style: headerEntrance } = useFadeSlideAnimation('down', 20, 350, 0);
  const { style: bodyEntrance }   = useFadeSlideAnimation('up',   24, 420, 80);
  const getTrendingStagger  = useStaggerAnimation(trendingPodcasts.length, 55);
  const getNewPodcastStagger = useStaggerAnimation(newPodcasts.length, 45);
  const getGenreStagger     = useStaggerAnimation(genreList.length, 45);
  const getSpeakerStagger   = useStaggerAnimation(popularSpeakers.length, 50);
  const getContinueStagger  = useStaggerAnimation(continueListening.length, 70);

  const handleBack = () => { 
    if (router.canGoBack()) router.back();
    else router.replace('/podcasts');
  };

  const handleGenrePress = (id: string) => {
    router.push({ 
      pathname: '/podcasts/category/[id]', 
      params: { id } 
    });
  };
  const handleSpeakerPress = (id: string) => router.push({ pathname: '/podcasts/speaker/[id]' as any, params: { id } });

  const handleLivePress = (item: typeof livePodcasts[0]) => {
    router.push({
      pathname: '/podcasts/live-player',
      params: {
        podcastId: item.id,
        podcastTitle: item.title,
        podcastCreator: item.creator,
        podcastImage: item.image,
        listeners: item.listeners,
      },
    });
  };
  const handleTrendingPress = (id: string) => {
    router.push({
      pathname: '/podcasts/player',
      params: { podcastId: id, podcastTitle: '', podcastCreator: '', podcastImage: '', fromCountryId: '', fromCategoryId: '' },
    });
  };

  const handleContinuePress = (item: ContinueItem) => {
    router.push({
      pathname: '/podcasts/player',
      params: { podcastId: item.id, podcastTitle: item.title, podcastCreator: item.creator, podcastImage: item.image, fromCountryId: '', fromCategoryId: '' },
    });
  };

  // ── Renders ───────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <Animated.View style={headerEntrance}>
      <View style={styles.header}>
        <AnimatedPressable onPress={handleBack} style={styles.backButton} scaleTo={0.85}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </AnimatedPressable>

        <Text style={styles.headerTitle}>Explore Podcasts</Text>

        <TouchableOpacity
          style={H.filterBtn}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          {activeFilterCount > 0 && (
            <View style={H.filterBadge}>
              <Text style={H.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderLivePodcasts = () => (
    <View style={styles.genresSection}>
      <View style={styles.sectionRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.sectionTitle}>Live Now</Text>
          <View style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#FF3B3B',
          }} />
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/podcasts/live-all' as any)}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {livePodcasts.map((item, index) => (
            <Animated.View key={item.id} style={getLiveStagger(index)}>
              <PressableCard
                style={[liveCardStyle, { width: liveCardWidth, marginRight: 0, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]}
                onPress={() => handleLivePress(item)}
              >
                <Image source={{ uri: item.image }} style={[liveCardImageStyle, { height: liveCardHeight }]} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={liveCardGradientStyle}
                />
                <View style={liveBadgeStyle}>
                  <View style={liveDotStyle} />
                  <Text style={liveLabelStyle}>LIVE</Text>
                  <Text style={liveListenersStyle}>{item.listeners}</Text>
                </View>
                <View style={liveCardInfoStyle}>
                  <Text style={liveCardTitleStyle} numberOfLines={1}>{item.title}</Text>
                  <Text style={liveCardCreatorStyle} numberOfLines={1}>{item.creator}</Text>
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: item.id, title: item.title, subtitle: item.creator, image: item.image, type: 'podcast', rawData: item }); }}
                >
                  <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(item.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genresScrollContent}
        >
          {livePodcasts.map((item, index) => (
            <Animated.View key={item.id} style={getLiveStagger(index)}>
              <PressableCard
                style={[liveCardStyle, { width: liveCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]}
                onPress={() => handleLivePress(item)}
              >
                <Image source={{ uri: item.image }} style={[liveCardImageStyle, { height: liveCardHeight }]} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={liveCardGradientStyle}
                />
                <View style={liveBadgeStyle}>
                  <View style={liveDotStyle} />
                  <Text style={liveLabelStyle}>LIVE</Text>
                  <Text style={liveListenersStyle}>{item.listeners}</Text>
                </View>
                <View style={liveCardInfoStyle}>
                  <Text style={liveCardTitleStyle} numberOfLines={1}>{item.title}</Text>
                  <Text style={liveCardCreatorStyle} numberOfLines={1}>{item.creator}</Text>
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: item.id, title: item.title, subtitle: item.creator, image: item.image, type: 'podcast', rawData: item }); }}
                >
                  <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(item.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderTrending = () => (
    <View style={styles.trendingSection}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Trending Podcast</Text>
        <TouchableOpacity onPress={() => router.push('/podcasts/trending' as any)} activeOpacity={0.7}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {trendingPodcasts.map((item, index) => (
            <Animated.View key={item.id} style={getTrendingStagger(index)}>
              <PressableCard style={[styles.trendingCard, { width: trendingCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleTrendingPress(item.id)}>
                <View style={styles.trendingHeaderRow}>
                  <Image source={{ uri: item.image }} style={styles.trendingThumb} resizeMode="cover" />
                  <View style={styles.trendingHeaderText}>
                    <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.trendingCreatorRow}>
                      <Ionicons name="play-circle-outline" size={12} color="rgba(255,255,255,0.45)" />
                      <Text style={styles.trendingCreatorText}>Podcast • {item.episodes}</Text>
                    </View>
                  </View>
                </View>
                <Image source={{ uri: item.image }} style={[styles.trendingImage, { height: trendingCardWidth * 0.56 }]} resizeMode="cover" />
                <View style={styles.trendingMeta}>
                  <Text style={styles.trendingMetaLine}>New • {item.episodes}</Text>
                  <Text style={styles.trendingDescription} numberOfLines={3}>
                    Discover the best episodes from {item.title}. Tune in for insightful conversations and stories that matter.
                  </Text>
                </View>
                <View style={styles.trendingActions}>
                  <TouchableOpacity style={styles.trendingPreviewBtn} onPress={() => handleTrendingPress(item.id)} activeOpacity={0.8}>
                    <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.trendingPreviewText}>Preview episode</Text>
                  </TouchableOpacity>
                  <View style={styles.trendingActionIcons}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                    <TouchableOpacity onPress={() => toggleFavorite({ id: item.id, title: item.title, subtitle: item.episodes, image: item.image, type: 'podcast', rawData: item })}>
                      <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={22} color={isFavorite(item.id) ? "#EC4899" : "rgba(255,255,255,0.6)"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.trendingPlayCircle} onPress={() => handleTrendingPress(item.id)} activeOpacity={0.85}>
                      <Ionicons name="play" size={18} color="#1C0505" />
                    </TouchableOpacity>
                  </View>
                </View>
              </PressableCard>
            </Animated.View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScrollContent}
          decelerationRate="fast"
          snapToInterval={trendingCardWidth + 14}
          snapToAlignment="start"
        >
          {trendingPodcasts.map((item, index) => (
            <Animated.View key={item.id} style={getTrendingStagger(index)}>
              <PressableCard style={[styles.trendingCard, { width: trendingCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleTrendingPress(item.id)}>
                <View style={styles.trendingHeaderRow}>
                  <Image source={{ uri: item.image }} style={styles.trendingThumb} resizeMode="cover" />
                  <View style={styles.trendingHeaderText}>
                    <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.trendingCreatorRow}>
                      <Ionicons name="play-circle-outline" size={12} color="rgba(255,255,255,0.45)" />
                      <Text style={styles.trendingCreatorText}>Podcast • {item.episodes}</Text>
                    </View>
                  </View>
                </View>
                <Image source={{ uri: item.image }} style={[styles.trendingImage, { height: trendingCardWidth * 0.56 }]} resizeMode="cover" />
                <View style={styles.trendingMeta}>
                  <Text style={styles.trendingMetaLine}>New • {item.episodes}</Text>
                  <Text style={styles.trendingDescription} numberOfLines={3}>
                    Discover the best episodes from {item.title}. Tune in for insightful conversations and stories that matter.
                  </Text>
                </View>
                <View style={styles.trendingActions}>
                  <TouchableOpacity style={styles.trendingPreviewBtn} onPress={() => handleTrendingPress(item.id)} activeOpacity={0.8}>
                    <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.trendingPreviewText}>Preview episode</Text>
                  </TouchableOpacity>
                  <View style={styles.trendingActionIcons}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                    <TouchableOpacity onPress={() => toggleFavorite({ id: item.id, title: item.title, subtitle: item.episodes, image: item.image, type: 'podcast', rawData: item })}>
                      <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={22} color={isFavorite(item.id) ? "#EC4899" : "rgba(255,255,255,0.6)"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.trendingPlayCircle} onPress={() => handleTrendingPress(item.id)} activeOpacity={0.85}>
                      <Ionicons name="play" size={18} color="#1C0505" />
                    </TouchableOpacity>
                  </View>
                </View>
              </PressableCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderNewPodcasts = () => (
    <View style={styles.genresSection}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>New Podcasts</Text>
        <TouchableOpacity onPress={() => router.push('/podcasts/all-new-podcasts' as any)} activeOpacity={0.7}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {newPodcasts.map((podcast, index) => (
            <Animated.View key={podcast.id} style={getNewPodcastStagger(index)}>
              <PressableCard
                style={[newPodcastCardStyle, { width: newPodcastCardWidth, marginRight: 0, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]}
                onPress={() => router.push({
                  pathname: '/podcasts/player',
                  params: { podcastId: podcast.id, podcastTitle: podcast.title, podcastCreator: podcast.host, podcastImage: podcast.image, fromCountryId: '', fromCategoryId: '' },
                })}
              >
                <Image source={{ uri: podcast.image }} style={[newPodcastImageStyle, { height: newPodcastImageHeight }]} resizeMode="cover" />
                <View style={newPodcastInfoStyle}>
                  <Text style={newPodcastTitleStyle} numberOfLines={1}>{podcast.title}</Text>
                  <Text style={newPodcastHostStyle} numberOfLines={1}>{podcast.host}</Text>
                  <Text style={newPodcastEpisodesStyle}>{podcast.episodes}</Text>
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: podcast.id, title: podcast.title, subtitle: podcast.host, image: podcast.image, type: 'podcast', rawData: podcast }); }}
                >
                  <Ionicons name={isFavorite(podcast.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(podcast.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genresScrollContent}>
          {newPodcasts.map((podcast, index) => (
            <Animated.View key={podcast.id} style={getNewPodcastStagger(index)}>
              <PressableCard
                style={[newPodcastCardStyle, { width: newPodcastCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]}
                onPress={() => router.push({
                  pathname: '/podcasts/player',
                  params: { podcastId: podcast.id, podcastTitle: podcast.title, podcastCreator: podcast.host, podcastImage: podcast.image, fromCountryId: '', fromCategoryId: '' },
                })}
              >
                <Image source={{ uri: podcast.image }} style={[newPodcastImageStyle, { height: newPodcastImageHeight }]} resizeMode="cover" />
                <View style={newPodcastInfoStyle}>
                  <Text style={newPodcastTitleStyle} numberOfLines={1}>{podcast.title}</Text>
                  <Text style={newPodcastHostStyle} numberOfLines={1}>{podcast.host}</Text>
                  <Text style={newPodcastEpisodesStyle}>{podcast.episodes}</Text>
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: podcast.id, title: podcast.title, subtitle: podcast.host, image: podcast.image, type: 'podcast', rawData: podcast }); }}
                >
                  <Ionicons name={isFavorite(podcast.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(podcast.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderGenres = () => (
    <View style={styles.genresSection}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Genres</Text>
        <TouchableOpacity onPress={() => router.push('/podcasts/genres' as any)} activeOpacity={0.7}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {genreList.map((genre, index) => (
            <Animated.View key={genre.id} style={getGenreStagger(index)}>
              <PressableCard style={[styles.genreCard, { width: genreCardWidth, marginRight: 0, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleGenrePress(genre.id)}>
                <View style={styles.genreIconWrapper}>
                  <Ionicons name={genre.icon as any} size={20} color="#E05555" />
                </View>
                <Text style={styles.genreName}>{genre.name}</Text>
                <Text style={styles.genreCount}>{genre.count}</Text>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 6, right: 6 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: `genre_${genre.id}`, title: genre.name, subtitle: genre.count, image: '', type: 'podcast', rawData: genre }); }}
                >
                  <Ionicons name={isFavorite(`genre_${genre.id}`) ? "heart" : "heart-outline"} size={14} color={isFavorite(`genre_${genre.id}`) ? "#EC4899" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genresScrollContent}>
          {genreList.map((genre, index) => (
            <Animated.View key={genre.id} style={getGenreStagger(index)}>
              <PressableCard style={[styles.genreCard, { width: genreCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleGenrePress(genre.id)}>
                <View style={styles.genreIconWrapper}>
                  <Ionicons name={genre.icon as any} size={20} color="#E05555" />
                </View>
                <Text style={styles.genreName}>{genre.name}</Text>
                <Text style={styles.genreCount}>{genre.count}</Text>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 6, right: 6 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: `genre_${genre.id}`, title: genre.name, subtitle: genre.count, image: '', type: 'podcast', rawData: genre }); }}
                >
                  <Ionicons name={isFavorite(`genre_${genre.id}`) ? "heart" : "heart-outline"} size={14} color={isFavorite(`genre_${genre.id}`) ? "#EC4899" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderSpeakers = () => (
    <View style={styles.genresSection}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Popular Speakers</Text>
        <TouchableOpacity onPress={() => router.push('/podcasts/speakers' as any)} activeOpacity={0.7}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {popularSpeakers.map((speaker, index) => (
            <Animated.View key={speaker.id} style={getSpeakerStagger(index)}>
              <PressableCard style={[speakerCardStyle, { width: speakerCardWidth, marginRight: 0, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleSpeakerPress(speaker.id)}>
                <View style={{ width: 68, height: 68, position: 'relative', marginBottom: 4 }}>
                  <Image source={{ uri: speaker.avatar }} style={[speakerAvatarStyle, { marginBottom: 0 }]} resizeMode="cover" />
                  <View style={[speakerOnlineDot, { top: 50, right: 0 }]} />
                </View>
                <Text style={speakerNameStyle} numberOfLines={1}>{speaker.name}</Text>
                <Text style={speakerRoleStyle} numberOfLines={1}>{speaker.role}</Text>
                <Text style={speakerCountStyle}>{speaker.podcasts}+ eps</Text>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: speaker.id, title: speaker.name, subtitle: speaker.role, image: speaker.avatar, type: 'podcast', rawData: speaker }); }}
                >
                  <Ionicons name={isFavorite(speaker.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(speaker.id) ? "#EC4899" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScrollContent}>
          {popularSpeakers.map((speaker, index) => (
            <Animated.View key={speaker.id} style={getSpeakerStagger(index)}>
              <PressableCard style={[speakerCardStyle, { width: speakerCardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleSpeakerPress(speaker.id)}>
                <View style={{ width: 68, height: 68, position: 'relative', marginBottom: 4 }}>
                  <Image source={{ uri: speaker.avatar }} style={[speakerAvatarStyle, { marginBottom: 0 }]} resizeMode="cover" />
                  <View style={[speakerOnlineDot, { top: 50, right: 0 }]} />
                </View>
                <Text style={speakerNameStyle} numberOfLines={1}>{speaker.name}</Text>
                <Text style={speakerRoleStyle} numberOfLines={1}>{speaker.role}</Text>
                <Text style={speakerCountStyle}>{speaker.podcasts}+ eps</Text>
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: speaker.id, title: speaker.name, subtitle: speaker.role, image: speaker.avatar, type: 'podcast', rawData: speaker }); }}
                >
                  <Ionicons name={isFavorite(speaker.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(speaker.id) ? "#EC4899" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
              </PressableCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderContinueListening = () => (
    <View style={styles.continueSection}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Continue Listened</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/podcasts/filtered-results' as any)}>
          <Text style={seeAllStyle}>See all</Text>
        </TouchableOpacity>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 16 }}>
          {continueListening.map((item, index) => (
            <Animated.View key={item.id} style={[getContinueStagger(index), { width: continueCardWidth }]}>
              <TouchableOpacity style={[styles.continueCard, { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)', marginBottom: 0 }]} onPress={() => handleContinuePress(item)} activeOpacity={0.8}>
                <Image source={{ uri: item.image }} style={styles.continueImage} resizeMode="cover" />
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.continueSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.continueProgressBar}>
                    <View style={[styles.continueProgressFill, { width: `${item.progress * 100}%` as any }]} />
                  </View>
                  <Text style={styles.continueTimeText}>{item.timeLeft}</Text>
                </View>
                <View style={styles.continuePlayBtn}>
                  <Ionicons name="play" size={16} color="#E05555" />
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', right: 12, top: 12, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: item.id, title: item.title, subtitle: item.creator, image: item.image, type: 'podcast', rawData: item }); }}
                >
                  <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(item.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View>
          {continueListening.map((item, index) => (
            <Animated.View key={item.id} style={getContinueStagger(index)}>
              <TouchableOpacity style={[styles.continueCard, { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={() => handleContinuePress(item)} activeOpacity={0.8}>
                <Image source={{ uri: item.image }} style={styles.continueImage} resizeMode="cover" />
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.continueSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.continueProgressBar}>
                    <View style={[styles.continueProgressFill, { width: `${item.progress * 100}%` as any }]} />
                  </View>
                  <Text style={styles.continueTimeText}>{item.timeLeft}</Text>
                </View>
                <View style={styles.continuePlayBtn}>
                  <Ionicons name="play" size={16} color="#E05555" />
                </View>
                <TouchableOpacity 
                  style={{ position: 'absolute', right: 12, top: 12, padding: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12 }}
                  onPress={(e) => { e.stopPropagation(); toggleFavorite({ id: item.id, title: item.title, subtitle: item.creator, image: item.image, type: 'podcast', rawData: item }); }}
                >
                  <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={16} color={isFavorite(item.id) ? "#EC4899" : "#FFF"} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Filter Modal ──────────────────────────────────────────────────────────
  const renderFilterModal = () => (
    <Modal animationType="slide" transparent visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
      <View style={F.overlay}>
        <View style={F.sheet}>
          <View style={F.handle} />
          <View style={F.titleRow}>
            <Text style={F.title}>Filters</Text>
            <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
              <Text style={F.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={F.sectionLabel}>Status</Text>
            <View style={F.chipRow}>
              {FILTER_STATUS.map(s => (
                <FilterChip key={s} label={s} selected={selStatus.includes(s)} onPress={() => toggleFilter(selStatus, setSelStatus, s)} />
              ))}
            </View>

            <Text style={F.sectionLabel}>Timeframe</Text>
            <View style={F.chipRow}>
              {FILTER_TIMEFRAME.map(s => (
                <FilterChip key={s} label={s} selected={selTimeframe.includes(s)} onPress={() => toggleFilter(selTimeframe, setSelTimeframe, s)} />
              ))}
            </View>

            <Text style={F.sectionLabel}>Length</Text>
            <View style={F.chipRow}>
              {FILTER_LENGTH.map(s => (
                <FilterChip key={s} label={s} selected={selLength.includes(s)} onPress={() => toggleFilter(selLength, setSelLength, s)} />
              ))}
            </View>

            <Text style={F.sectionLabel}>Language</Text>
            <View style={F.chipRow}>
              {FILTER_LANGUAGE.map(s => (
                <FilterChip key={s} label={s} selected={selLanguage.includes(s)} onPress={() => toggleFilter(selLanguage, setSelLanguage, s)} />
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={F.bottomRow}>
            <TouchableOpacity style={F.cancelBtn} onPress={() => setFilterVisible(false)} activeOpacity={0.8}>
              <Text style={F.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={F.applyBtn} onPress={handleApplyFilters} activeOpacity={0.85}>
              <LinearGradient colors={['#CC0000', '#8B0000']} style={F.applyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={F.applyText}>
                  Apply{activeFilterCount > 0 ? ` (${activeFilterCount} filters)` : ''}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#2a0000', '#1a0000', '#0f0000', '#000000']} style={styles.backgroundGradient} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} />
      <SafeAreaView style={styles.safeArea}>
        {!isDesktop && renderHeader()}
        <Animated.View style={[{ flex: 1 }, bodyEntrance]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={{ width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', paddingHorizontal: isDesktop ? 24 : 12 }}>
              <AdCarousel />
              {renderLivePodcasts()}
              {renderTrending()}
              {renderNewPodcasts()}
              {renderGenres()}
              {renderSpeakers()}
              {renderContinueListening()}
            </View>
          </ScrollView>
        </Animated.View>

        {/* ── Mic FAB REMOVED ── */}

        {renderFilterModal()}
      </SafeAreaView>
    </View>
  );
}

// ── Header styles ─────────────────────────────────────────────────────────────
const H: Record<string, any> = {
  filterBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#CC0000',
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
};

// ── Filter modal styles ───────────────────────────────────────────────────────
const F: Record<string, any> = {
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A0505',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: 'rgba(220,60,60,0.3)',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 18,
  },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  title:      { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  clearText:  { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.8 },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  chipSelected: {
    backgroundColor: 'rgba(204,0,0,0.25)',
    borderColor: '#CC2222',
  },
  chipText:         { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  bottomRow:  { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  applyBtn:   { flex: 2, borderRadius: 14, overflow: 'hidden' },
  applyGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  applyText:  { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
};
const seeAllStyle: any = {
  fontSize: 13,
  fontWeight: '600',
  color: '#E05555',
};

const liveCardStyle: any       = { width: 160, borderRadius: 14, overflow: 'hidden', marginRight: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(220,60,60,0.25)' };
const liveCardImageStyle: any  = { width: '100%', height: 90 };
const liveCardGradientStyle: any = { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70 };
const liveBadgeStyle: any      = { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 };
const liveDotStyle: any        = { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF3B3B' };
const liveLabelStyle: any      = { fontSize: 10, fontWeight: '700', color: '#FF3B3B', letterSpacing: 0.8 };
const liveListenersStyle: any  = { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginLeft: 4 };
const liveCardInfoStyle: any   = { padding: 8 };
const liveCardTitleStyle: any  = { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 };
const liveCardCreatorStyle: any= { fontSize: 10, color: 'rgba(255,255,255,0.45)' };

const speakerCardStyle: any   = { width: 110, alignItems: 'center', marginRight: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, position: 'relative' };
const speakerAvatarStyle: any = { width: 68, height: 68, borderRadius: 34, backgroundColor: '#2A0808', borderWidth: 2, borderColor: 'rgba(220,60,60,0.5)', marginBottom: 4 };
const speakerOnlineDot: any   = { position: 'absolute', top: 50, right: 28, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22CC55', borderWidth: 2, borderColor: '#0a0000' };
const speakerNameStyle: any   = { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginTop: 6, marginBottom: 2 };
const speakerRoleStyle: any   = { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 4 };
const speakerCountStyle: any  = { fontSize: 10, color: '#E05555', fontWeight: '600', textAlign: 'center' };

const newPodcastCardStyle: any = { width: 130, marginRight: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(220,60,60,0.22)' };
const newPodcastImageStyle: any = { width: '100%', height: 130 };
const newPodcastInfoStyle: any = { padding: 10 };
const newPodcastTitleStyle: any = { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 };
const newPodcastHostStyle: any = { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 };
const newPodcastEpisodesStyle: any = { fontSize: 9, color: 'rgba(255,255,255,0.4)' };