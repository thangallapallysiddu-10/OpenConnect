import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

const WHITE = '#FFFFFF';
const TEXT2 = 'rgba(255,255,255,0.60)';
const TEXT3 = 'rgba(255,255,255,0.32)';
const BG    = '#0D0D0D';
const RED   = '#EF4444';

// ── Data ──────────────────────────────────────────────────────────────────────
export const LIVE_NOW = [
  {
    id: '1',
    title:    'Live Coldplay Performance',
    subtitle: 'My Universe',
    image:    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop',
    viewers:  '234k',
    duration: '1:45:08',
  },
  {
    id: '2',
    title:    'Ed Sheeran Live',
    subtitle: "'Perfect' Performance",
    image:    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
    viewers:  '189k',
    duration: '58:22',
  },
  {
    id: '3',
    title:    'The Weeknd Live',
    subtitle: 'Blinding Lights Tour',
    image:    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop',
    viewers:  '312k',
    duration: '2:10:00',
  },
  {
    id: '4',
    title:    'Billie Eilish',
    subtitle: 'Happier Than Ever',
    image:    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop',
    viewers:  '276k',
    duration: '1:30:00',
  },
  {
    id: '5',
    title:    'Ariana Grande',
    subtitle: 'Sweetener World Tour',
    image:    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop',
    viewers:  '456k',
    duration: '2:00:00',
  },
  {
    id: '6',
    title:    'Bruno Mars',
    subtitle: '24K Magic Live',
    image:    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    viewers:  '198k',
    duration: '1:55:00',
  },
];

const UPCOMING = [
  { id: 'u1', title: "Post Malone — World Tour",     date: 'Tomorrow · 8:00 PM', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=120&h=120&fit=crop' },
  { id: 'u2', title: "Drake — It's All A Blur",      date: 'Sat · 9:30 PM',      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop' },
  { id: 'u3', title: "Dua Lipa — Future Nostalgia",  date: 'Sun · 7:00 PM',      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&h=120&fit=crop' },
];

const TABS = [
  { icon: 'home-outline',           label: 'Home'      },
  { icon: 'search-outline',         label: 'Search'    },
  { icon: 'play-circle-outline',    label: 'Videos'    },
  { icon: 'musical-notes-outline',  label: 'My Music'  },
  { icon: 'radio-outline',          label: 'Streaming' },
];

// ── Navigate to player ────────────────────────────────────────────────────────
function goPlayer(item: typeof LIVE_NOW[0]) {
  router.push({
    pathname: '/rjs/live-player',
    params: {
      title:    item.title,
      subtitle: item.subtitle,
      image:    encodeURIComponent(item.image),
      viewers:  item.viewers,
      duration: item.duration,
      allCards: encodeURIComponent(JSON.stringify(LIVE_NOW)),
    },
  });
}

// ── Hero Carousel Card ─────────────────────────────────────────────────────────
const CAROUSEL_W = width;
const CAROUSEL_H = height * 0.5;

function CarouselCard({ item, index, scrollX }: { item: typeof LIVE_NOW[0]; index: number; scrollX: Animated.Value }) {
  const inputRange = [(index - 1) * CAROUSEL_W, index * CAROUSEL_W, (index + 1) * CAROUSEL_W];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.95, 1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      style={{ width: CAROUSEL_W, height: CAROUSEL_H }}
      activeOpacity={0.95}
      onPress={() => goPlayer(item)}
    >
      <Animated.View style={[S.carouselCard, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Live badge */}
        <View style={S.carouselLiveBadge}>
          <View style={S.liveDot} />
          <Text style={S.liveTxt}>LIVE</Text>
          <View style={S.viewerCount}>
            <Ionicons name="people-outline" size={10} color={WHITE} />
            <Text style={S.viewerText}>{item.viewers}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={S.carouselContent}>
          <Text style={S.carouselTitle}>{item.title}</Text>
          <Text style={S.carouselSubtitle}>{item.subtitle}</Text>
          <View style={S.watchNowBtn}>
            <Text style={S.watchNowText}>Watch Now</Text>
            <Ionicons name="play-circle" size={18} color={WHITE} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Live Card (for horizontal list) ─────────────────────────────────────────────
const CARD_W = width * 0.44;
const CARD_H = CARD_W * 1.08;

function LiveCard({ item }: { item: typeof LIVE_NOW[0] }) {
  return (
    <TouchableOpacity
      style={[S.card, { width: CARD_W, height: CARD_H }]}
      activeOpacity={0.88}
      onPress={() => goPlayer(item)}
    >
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.84)']} style={StyleSheet.absoluteFill} />

      <View style={S.liveBadgeSmall}>
        <View style={S.liveDot} />
        <Text style={S.liveTxt}>Live</Text>
      </View>

      <View style={S.cardBottom}>
        <Text style={S.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={S.cardSub} numberOfLines={1}>{item.subtitle}</Text>
        <View style={S.viewerRow}>
          <Ionicons name="people-outline" size={10} color={TEXT2} />
          <Text style={S.viewerSmall}>{item.viewers}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LiveEventScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = React.useState(4);
  const flatListRef = useRef<FlatList>(null);

  const handleBackPress = () => {
    router.replace('/rjs/stations');
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

        {/* ── CAROUSEL SECTION ── */}
        <View style={S.carouselContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={LIVE_NOW}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <CarouselCard item={item} index={index} scrollX={scrollX} />
            )}
          />
          
          {/* Back Button Overlay */}
          <TouchableOpacity 
            style={[S.backButton, { top: SBH + 16 }]} 
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={WHITE} />
          </TouchableOpacity>

          {/* Pagination Dots */}
          <View style={S.paginationContainer}>
            {LIVE_NOW.map((_, i) => {
              const inputRange = [(i - 1) * CAROUSEL_W, i * CAROUSEL_W, (i + 1) * CAROUSEL_W];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [6, 20, 6],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[
                    S.dot,
                    {
                      width: dotWidth,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* ── LIVE NOW SECTION ── */}
        <View style={S.section}>
          <View style={S.sectionHead}>
            <Text style={S.sectionTitle}>Trending Live</Text>
            <TouchableOpacity activeOpacity={0.75}>
              <Text style={S.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LIVE_NOW}
            horizontal
            keyExtractor={i => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
            renderItem={({ item }) => <LiveCard item={item} />}
          />
        </View>

        {/* ── UPCOMING ── */}
        <View style={[S.section, { marginTop: 10 }]}>
          <View style={S.sectionHead}>
            <Text style={S.sectionTitle}>Upcoming</Text>
            <TouchableOpacity activeOpacity={0.75}>
              <Text style={S.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {UPCOMING.map(ev => (
            <TouchableOpacity key={ev.id} style={S.upcomingRow} activeOpacity={0.82}>
              <Image source={{ uri: ev.image }} style={S.upcomingImg} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={S.upcomingTitle} numberOfLines={1}>{ev.title}</Text>
                <Text style={S.upcomingDate}>{ev.date}</Text>
              </View>
              <View style={S.remindBtn}>
                <Ionicons name="alarm-outline" size={13} color={TEXT2} />
                <Text style={S.remindTxt}>Remind</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  carouselContainer: {
    height: CAROUSEL_H,
    marginBottom: 8,
    position: 'relative',
  },
  carouselCard: {
    width: CAROUSEL_W,
    height: CAROUSEL_H,
    borderRadius: 0,
    overflow: 'hidden',
  },
  carouselLiveBadge: {
    position: 'absolute',
    top: SBH + 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  viewerText: {
    fontSize: 11,
    color: WHITE,
    fontWeight: '600',
  },
  carouselContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  carouselTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  carouselSubtitle: {
    fontSize: 16,
    color: TEXT2,
    fontWeight: '500',
    marginBottom: 16,
  },
  watchNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: RED,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  watchNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: WHITE,
  },

  liveBadgeSmall: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: RED,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: WHITE },
  liveTxt: { fontSize: 10, fontWeight: '800', color: WHITE, letterSpacing: 0.2 },

  section: { marginTop: 22 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: WHITE, letterSpacing: -0.3 },
  seeAll: { fontSize: 13, color: RED, fontWeight: '600' },

  card: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  cardBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: WHITE, lineHeight: 16, marginBottom: 2 },
  cardSub: { fontSize: 11, color: TEXT2, fontWeight: '500', marginBottom: 4 },
  viewerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewerSmall: { fontSize: 10, color: TEXT2, fontWeight: '500' },

  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, marginBottom: 14 },
  upcomingImg: { width: 58, height: 58, borderRadius: 10 },
  upcomingTitle: { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 4 },
  upcomingDate: { fontSize: 12, color: TEXT2, fontWeight: '500' },
  remindBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  remindTxt: { fontSize: 11, color: TEXT2, fontWeight: '600' },

  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#111', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, color: TEXT3, fontWeight: '600' },
  streamingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: RED, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  streamingTxt: { fontSize: 10, fontWeight: '800', color: WHITE },
});