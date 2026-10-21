import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;
const WHITE = '#FFFFFF';
const TEXT2 = 'rgba(255,255,255,0.55)';
const TEXT3 = 'rgba(255,255,255,0.28)';

// ── Genre RJ Database ─────────────────────────────────────────────────────────
const GENRE_RJS: Record<string, {
  id: string; name: string; frequency: string; tag: string;
  listeners: string; image: string; accent: string;
  rjName: string; rjImage: string; timeslot: string;
}[]> = {
  Rock: [
    { id: 'r1', name: 'RJ Rock Nation', frequency: '95.5', tag: 'Rock', listeners: '11.4k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=500&fit=crop', accent: '#F97316', rjName: 'RJ Arjun',   rjImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 AM – 2 PM' },
    { id: 'r2', name: 'Classic Rocks',  frequency: '88.4', tag: 'Rock', listeners: '7.2k',  image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=700&h=500&fit=crop', accent: '#EAB308', rjName: 'RJ Marcus',  rjImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '6 PM – 10 PM' },
    { id: 'r3', name: 'Hard Rock FM',   frequency: '101.3', tag: 'Rock', listeners: '9.1k', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=700&h=500&fit=crop', accent: '#EF4444', rjName: 'RJ Vikram',  rjImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '8 PM – 12 AM' },
    { id: 'r4', name: 'Rock Legends',   frequency: '93.7', tag: 'Rock', listeners: '5.8k',  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&h=500&fit=crop', accent: '#8B5CF6', rjName: 'RJ James',   rjImage: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '2 PM – 6 PM' },
  ],
  Pop: [
    { id: 'p1', name: 'RJ Vibes',       frequency: '92.9', tag: 'Pop', listeners: '8.9k',  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=500&fit=crop', accent: '#3B82F6', rjName: 'RJ Priya',   rjImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '6 AM – 10 AM' },
    { id: 'p2', name: 'Pop Nation',      frequency: '97.1', tag: 'Pop', listeners: '12.3k', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&h=500&fit=crop', accent: '#EC4899', rjName: 'RJ Natalie', rjImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '4 PM – 8 PM' },
    { id: 'p3', name: 'Top 40 FM',       frequency: '104.5', tag: 'Pop', listeners: '15.7k', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=700&h=500&fit=crop', accent: '#06B6D4', rjName: 'RJ Ananya',  rjImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '12 PM – 4 PM' },
    { id: 'p4', name: 'Hits Radio',      frequency: '99.8', tag: 'Pop', listeners: '6.4k',  image: 'https://images.unsplash.com/photo-1549213783-2a9c3b2f6a3d?w=700&h=500&fit=crop', accent: '#10B981', rjName: 'RJ Sofia',   rjImage: 'https://images.unsplash.com/photo-1549213783-2a9c3b2f6a3d?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '8 AM – 12 PM' },
  ],
  Jazz: [
    { id: 'j1', name: 'Smooth RJ',       frequency: '88.1', tag: 'Jazz', listeners: '3.1k', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&h=500&fit=crop', accent: '#8B5CF6', rjName: 'RJ Zara',   rjImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '2 PM – 6 PM' },
    { id: 'j2', name: 'Jazz Café FM',    frequency: '91.7', tag: 'Jazz', listeners: '2.4k', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=700&h=500&fit=crop', accent: '#A78BFA', rjName: 'RJ Leo',    rjImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 PM – 2 AM' },
    { id: 'j3', name: 'Late Night Jazz', frequency: '96.3', tag: 'Jazz', listeners: '1.8k', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&h=500&fit=crop', accent: '#EC4899', rjName: 'RJ Maya',   rjImage: 'https://images.unsplash.com/photo-1542103749-6efb2ab2e5b7?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '12 AM – 4 AM' },
  ],
  EDM: [
    { id: 'e1', name: 'RJ Bass Drop',    frequency: '99.3', tag: 'EDM', listeners: '18.1k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=500&fit=crop', accent: '#EAB308', rjName: 'RJ Natalie', rjImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '8 PM – 12 AM' },
    { id: 'e2', name: 'House Nation',    frequency: '103.7', tag: 'EDM', listeners: '14.2k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=500&fit=crop', accent: '#EC4899', rjName: 'RJ Marcus',  rjImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 PM – 2 AM' },
    { id: 'e3', name: 'Techno FM',       frequency: '107.1', tag: 'EDM', listeners: '9.6k',  image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=700&h=500&fit=crop', accent: '#3B82F6', rjName: 'RJ Vikram',  rjImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '12 AM – 4 AM' },
    { id: 'e4', name: 'Rave Radio',      frequency: '94.9', tag: 'EDM', listeners: '11.3k', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&h=500&fit=crop', accent: '#8B5CF6', rjName: 'RJ Ananya',  rjImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '6 PM – 10 PM' },
  ],
  Metal: [
    { id: 'm1', name: 'Metal Mayhem',  frequency: '96.7',  tag: 'Metal', listeners: '7.4k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=500&fit=crop', accent: '#EAB308', rjName: 'RJ James',  rjImage: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '8 PM – 12 AM' },
    { id: 'm2', name: 'Heavy FM',      frequency: '102.5', tag: 'Metal', listeners: '5.1k', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=700&h=500&fit=crop', accent: '#EF4444', rjName: 'RJ Arjun',  rjImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 PM – 2 AM' },
    { id: 'm3', name: 'Death Metal FM', frequency: '89.5', tag: 'Metal', listeners: '3.2k', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=700&h=500&fit=crop', accent: '#F97316', rjName: 'RJ Vikram', rjImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '12 AM – 4 AM' },
  ],
  'R&B': [
    { id: 'rb1', name: 'RnB Lounge',     frequency: '90.3', tag: 'R&B', listeners: '8.6k', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&h=500&fit=crop', accent: '#06B6D4', rjName: 'RJ Sofia',   rjImage: 'https://images.unsplash.com/photo-1549213783-2a9c3b2f6a3d?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '6 PM – 10 PM' },
    { id: 'rb2', name: 'Soul Station',   frequency: '94.1', tag: 'R&B', listeners: '6.3k', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=700&h=500&fit=crop', accent: '#8B5CF6', rjName: 'RJ Zara',    rjImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '2 PM – 6 PM' },
    { id: 'rb3', name: 'Groove FM',      frequency: '98.7', tag: 'R&B', listeners: '9.2k', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=500&fit=crop', accent: '#EC4899', rjName: 'RJ Priya',   rjImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 AM – 2 PM' },
  ],
  'Hip-Hop': [
    { id: 'h1', name: 'RJ Beats FM',     frequency: '91.1', tag: 'Hip-Hop', listeners: '14.2k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=500&fit=crop', accent: '#8B5CF6', rjName: 'RJ Marcus',  rjImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '10 PM – 2 AM' },
    { id: 'h2', name: 'Urban Beats',     frequency: '105.3', tag: 'Hip-Hop', listeners: '11.8k', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=700&h=500&fit=crop', accent: '#14B8A6', rjName: 'RJ Arjun',   rjImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '8 PM – 12 AM' },
    { id: 'h3', name: 'Trap Nation FM',  frequency: '100.7', tag: 'Hip-Hop', listeners: '16.4k', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&h=500&fit=crop', accent: '#F97316', rjName: 'RJ Vikram',  rjImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&facepad=3', timeslot: '6 PM – 10 PM' },
  ],
};

// ── Genre colors ──────────────────────────────────────────────────────────────
const GENRE_COLORS: Record<string, [string, string]> = {
  Rock:     ['#F97316', '#B45309'],
  Pop:      ['#3B82F6', '#1D4ED8'],
  Jazz:     ['#8B5CF6', '#6D28D9'],
  EDM:      ['#EC4899', '#BE185D'],
  Metal:    ['#EAB308', '#A16207'],
  'R&B':    ['#06B6D4', '#0E7490'],
  'Hip-Hop':['#14B8A6', '#0F766E'],
};

// ── Station Card ──────────────────────────────────────────────────────────────
const CARD_H = 200;

function StationCard({ item, index }: { item: typeof GENRE_RJS['Rock'][0]; index: number }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    router.push({
      pathname: '/rjs/player',
      params: {
        name:      item.name,
        frequency: item.frequency,
        genre:     item.tag,
        listeners: item.listeners,
        image:     encodeURIComponent(item.image),
        accent:    item.accent,
      },
    });
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 16 }}>
      <TouchableOpacity style={[S.card, { width: '100%' }]} onPress={handlePress} activeOpacity={0.92}>
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top row */}
        <View style={S.cardTop}>
          <View style={[S.tagPill, { backgroundColor: item.accent }]}>
            <Text style={S.tagTxt}>{item.tag}</Text>
          </View>
        </View>

        {/* Bottom info */}
        <View style={S.cardBottom}>
          {/* RJ row */}
          <View style={S.rjRow}>
            <Image source={{ uri: item.rjImage }} style={S.rjAvatar} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={S.rjName}>{item.rjName}</Text>
              <Text style={S.rjTime}>{item.timeslot}</Text>
            </View>
          </View>

          <Text style={S.freqTxt}>{item.frequency} FM</Text>
          <Text style={S.stationName} numberOfLines={1}>{item.name}</Text>

          <View style={S.cardFooter}>
            <View style={S.listenerRow}>
              <Ionicons name="headset-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={S.listenerTxt}>{item.listeners}</Text>
            </View>
            <TouchableOpacity
              style={[S.playBtn, { backgroundColor: item.accent }]}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color={WHITE} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function GenreScreen() {
  const params = useLocalSearchParams<{ name: string; stations: string; listeners: string }>();
  const genre = params.name ? decodeURIComponent(params.name) : 'Rock';
  const stations = params.stations ?? '0';
  const listeners = params.listeners ?? '0';
  const rjs   = GENRE_RJS[genre] ?? GENRE_RJS['Pop'];
  const [color1, color2] = GENRE_COLORS[genre] ?? ['#8B5CF6', '#6D28D9'];

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0A0A12', '#07070F', '#05050C']} style={StyleSheet.absoluteFill} />

      <View style={isDesktop ? { width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', flex: 1 } : { flex: 1 }}>
        {/* Header */}
        <View style={[S.header, { paddingTop: SBH + 10 }]}>
          <TouchableOpacity style={S.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={WHITE} />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingLeft: 14 }}>
            <Text style={S.headerTitle}>{genre}</Text>
            <Text style={S.headerSub}>{stations} · {listeners} listeners</Text>
          </View>
          <LinearGradient colors={[color1, color2]} style={S.genreBadge}>
            <Ionicons name="radio-outline" size={14} color={WHITE} />
            <Text style={S.genreBadgeTxt}>{rjs.length} Stations</Text>
          </LinearGradient>
        </View>

        {/* Genre banner */}
        <LinearGradient
          colors={[color1 + '30', color2 + '10', 'transparent']}
          style={S.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={S.bannerTitle}>{genre}</Text>
          <Text style={S.bannerSub}>Radio Stations</Text>
        </LinearGradient>

        {/* Station list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 24, paddingHorizontal: 20 } : { paddingHorizontal: 20 }}>
            {rjs.map((item, index) => (
              <View key={item.id} style={isDesktop ? { width: '48%', minWidth: 320 } : { width: '100%' }}>
                <StationCard item={item} index={index} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12' },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:     { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: WHITE, letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: TEXT2, marginTop: 2 },
  genreBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  genreBadgeTxt: { fontSize: 12, fontWeight: '700', color: WHITE },

  banner:      { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  bannerTitle: { fontSize: 32, fontWeight: '900', color: WHITE, letterSpacing: -1 },
  bannerSub:   { fontSize: 14, color: TEXT2, marginTop: 2 },

  // Station card
  card: {
    height: CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow : '0px 8px 16px rgba(0,0,0,0.4)',
    elevation: 10,
  },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  tagPill:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagTxt:     { fontSize: 11, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  livePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  liveDot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444' },
  liveTxt:    { fontSize: 10, fontWeight: '800', color: WHITE, letterSpacing: 1 },

  cardBottom:   { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  rjRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rjAvatar:     { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  rjName:       { fontSize: 12, fontWeight: '700', color: WHITE },
  rjTime:       { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  freqTxt:      { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, marginBottom: 2 },
  stationName:  { fontSize: 22, fontWeight: '900', color: WHITE, letterSpacing: -0.5, marginBottom: 10 },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listenerRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listenerTxt:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  playBtn:      { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', elevation: 6 },
});