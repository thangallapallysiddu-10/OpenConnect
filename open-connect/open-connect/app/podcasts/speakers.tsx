import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// ── Data ──────────────────────────────────────────────────────────────────────
const popularSpeakers = [
  { id: 'sp1', name: 'Lex Fridman',      role: 'AI Researcher',      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop', podcasts: 400,  isLive: true  },
  { id: 'sp2', name: 'Andrew Huberman',  role: 'Neuroscientist',     avatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop', podcasts: 180,  isLive: false },
  { id: 'sp3', name: 'Sarah Koenig',     role: 'Journalist',         avatar: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=300&h=300&fit=crop', podcasts: 60,   isLive: true  },
  { id: 'sp4', name: 'Guy Raz',          role: 'NPR Host',           avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop', podcasts: 500,  isLive: false },
  { id: 'sp5', name: 'Michael Barbaro',  role: 'NYT Host',           avatar: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=300&fit=crop', podcasts: 1800, isLive: true  },
  { id: 'sp6', name: 'Tim Ferriss',      role: 'Entrepreneur',       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop', podcasts: 700,  isLive: false },
  { id: 'sp7', name: 'Brené Brown',      role: 'Research Professor', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop', podcasts: 320,  isLive: false },
  { id: 'sp8', name: 'Malcolm Gladwell', role: 'Author & Journalist',avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', podcasts: 210,  isLive: true  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
const SpeakerCard = ({ item, index, onPress, cardWidth }: { item: typeof popularSpeakers[0]; index: number; onPress: () => void; cardWidth: number }) => {
  const scale     = useRef(new Animated.Value(1)).current;
  const glow      = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const [isFollowing, setIsFollowing] = useState(false);
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 420, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.parallel([
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }),
    Animated.timing(glow,  { toValue: 1, duration: 120, useNativeDriver: false }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
    Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: false }),
  ]).start();

  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: ['rgba(220,80,80,0)', 'rgba(220,80,80,0.7)'] });
  
  const avatarSize = cardWidth * 0.52;
  const avatarRadius = cardWidth * 0.26;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale }], width: cardWidth }}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} activeOpacity={1}>
        <Animated.View style={[S.card, { borderColor }]}>
          {/* Avatar */}
          <View style={[S.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
            <Image source={{ uri: item.avatar }} style={[S.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarRadius }]} resizeMode="cover" />
            {/* Live dot */}
            {item.isLive && (
              <View style={S.liveDot}>
                <View style={S.liveDotInner} />
              </View>
            )}
          </View>

          {/* Info */}
          <Text style={S.speakerName} numberOfLines={1}>{item.name}</Text>
          <Text style={S.speakerRole} numberOfLines={1}>{item.role}</Text>

          <View style={S.bottomRow}>
            <Text style={S.episodeCount}>{item.podcasts}+ eps</Text>
            <TouchableOpacity
              style={[S.followBtn, isFollowing && S.followBtnActive]}
              onPress={() => setIsFollowing(p => !p)}
              activeOpacity={0.8}
            >
              <Ionicons name={isFollowing ? 'checkmark' : 'add'} size={14} color={isFollowing ? '#fff' : '#E05555'} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function SpeakersScreen() {
  const { width: windowWidth } = useWindowDimensions();
  
  const handleBack  = () => router.canGoBack() ? router.back() : router.replace('/podcasts/discover');
  const handlePress = (id: string) => router.push({ pathname: '/podcasts/speaker/[id]' as any, params: { id } });

  const isDesktop = windowWidth >= 768;
  const contentWidth = Math.min(windowWidth, 1200);
  const numColumns = isDesktop ? 4 : 2;
  const cardWidth = (contentWidth - 32 - (numColumns - 1) * 12) / numColumns;

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#2a0000', '#1a0000', '#0f0000', '#000000']} style={S.bg} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} />

      <SafeAreaView style={S.safeArea}>
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={S.headerCenter}>
            <Text style={S.headerTitle}>Popular Speakers</Text>
            <Text style={S.headerSub}>{popularSpeakers.length} creators</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        {/* Grid */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.grid}>
          <View style={S.gridContainer}>
            {popularSpeakers.map((item, index) => (
              <SpeakerCard key={item.id} item={item} index={index} onPress={() => handlePress(item.id)} cardWidth={cardWidth} />
            ))}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0000' },
  bg:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safeArea:  { flex: 1, width: '100%', maxWidth: 1200, alignSelf: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4 },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  grid: { paddingHorizontal: 16, paddingTop: 8 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },

  card: {
    borderRadius: 18, padding: 16,
    backgroundColor: '#1C0505',
    borderWidth: 1.5, borderColor: 'rgba(180,30,30,0.3)',
    alignItems: 'center',
  },

  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    backgroundColor: '#2A0808',
    borderWidth: 2.5, borderColor: 'rgba(220,60,60,0.45)',
  },
  liveDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#0a0000',
    justifyContent: 'center', alignItems: 'center',
  },
  liveDotInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22CC55',
  },

  speakerName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 3 },
  speakerRole: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 10 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  episodeCount: { fontSize: 11, color: '#E05555', fontWeight: '600' },
  followBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(224,85,85,0.15)',
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: '#CC0000',
    borderColor: '#CC0000',
  },
});