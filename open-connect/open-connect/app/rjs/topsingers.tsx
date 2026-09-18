import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
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

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

// ── Grid math ─────────────────────────────────────────────────────────────────
const COLS     = 3;
const H_PAD    = 28;
const COL_GAP  = 16;
const ITEM_W   = (width - H_PAD * 2 - COL_GAP * (COLS - 1)) / COLS;
const IMG_SIZE = ITEM_W * 0.82; // circle is 82% of column width — compact & neat

// ── Colours ───────────────────────────────────────────────────────────────────
const WHITE = '#FFFFFF';
const TEXT1 = '#1A1A2E';
const TEXT2 = '#9898B8';

// Gradient ring pairs cycling per avatar
const RINGS: [string, string][] = [
  ['#F9A8D4', '#EC4899'],
  ['#FCA5A5', '#EF4444'],
  ['#FDBA74', '#F97316'],
  ['#C4B5FD', '#8B5CF6'],
  ['#6EE7B7', '#10B981'],
  ['#93C5FD', '#3B82F6'],
];

// ── Singers data ──────────────────────────────────────────────────────────────
const SINGERS = [
  { id:  1, name: 'MD Girls',     listeners: '12.5k', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  2, name: 'Sara',         listeners: '9.7k',  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  3, name: 'Faith Of Love',listeners: '8.2k',  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  4, name: 'Sarah Wade',   listeners: '7.1k',  image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  5, name: 'Carol',        listeners: '5.8k',  image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  6, name: 'Maxwell',      listeners: '14.3k', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  7, name: 'Patricia',     listeners: '6.2k',  image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  8, name: 'Loretta',      listeners: '11.0k', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id:  9, name: 'Cheryl',       listeners: '4.4k',  image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 10, name: 'Crystal',      listeners: '9.1k',  image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 11, name: 'Alisha',       listeners: '17.6k', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 12, name: 'Erin Flores',  listeners: '8.9k',  image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 13, name: 'Marcus',       listeners: '21.3k', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 14, name: 'Leslie Vega',  listeners: '13.8k', image: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 15, name: 'Sampson',      listeners: '6.7k',  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 16, name: 'DJ W',         listeners: '15.1k', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 17, name: 'Mike Chen',    listeners: '21.3k', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 18, name: 'Nina Ray',     listeners: '10.2k', image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=300&h=300&fit=crop&crop=faces&facepad=3' },
];

// ── Single avatar cell ────────────────────────────────────────────────────────
function AvatarCell({ item, index }: { item: typeof SINGERS[0]; index: number }) {
  const [c1, c2] = RINGS[index % RINGS.length];
  const R = IMG_SIZE / 2;

  return (
    <TouchableOpacity
  style={{ width: ITEM_W, alignItems: 'center', marginBottom: 20 }}
  activeOpacity={0.82}
  onPress={() => router.push({
    pathname: '/rjs/artist',
    params: {
      name:      item.name,
      image:     encodeURIComponent(item.image),
      listeners: item.listeners,
    },
  })}
>
      {/* Gradient ring */}
      <View style={{
        width: IMG_SIZE + 5,
        height: IMG_SIZE + 5,
        borderRadius: R + 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        {/* Gradient background acts as the border */}
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            width: IMG_SIZE + 5,
            height: IMG_SIZE + 5,
            borderRadius: R + 3,
          }}
        />
        {/* White gap between gradient ring and photo */}
        <View style={{
          width: IMG_SIZE + 1,
          height: IMG_SIZE + 1,
          borderRadius: R + 1,
          backgroundColor: WHITE,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image
            source={{ uri: item.image }}
            style={{
              width: IMG_SIZE - 3,
              height: IMG_SIZE - 3,
              borderRadius: R - 1,
            }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Name */}
      <Text style={S.name} numberOfLines={1}>{item.name}</Text>

      {/* Listener count */}
      <View style={S.listenRow}>
        <Ionicons name="headset-outline" size={10} color={TEXT2} />
        <Text style={S.listenTxt}>{item.listeners}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Chunk helper ──────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function TopSingersScreen() {
  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── Same background as stations screen ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#F7F5EF', '#EEF0F8', '#F3EFF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={S.orb1} />
        <View style={S.orb2} />
        <View style={S.orb3} />
        <LinearGradient
          colors={['rgba(255,255,255,0.60)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ── White card sheet ── */}
      <View style={S.sheet}>

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={S.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT1} />
          </TouchableOpacity>
          <Text style={S.title}>Top Singers</Text>
          {/* Spacer keeps title centred */}
          <View style={{ width: 40 }} />
        </View>

        {/* Divider */}
        <View style={S.divider} />

        {/* Scrollable grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.grid}
        >
          {chunk(SINGERS, COLS).map((row, ri) => (
            <View key={ri} style={S.row}>
              {row.map((singer, ci) => (
                <AvatarCell key={singer.id} item={singer} index={ri * COLS + ci} />
              ))}
              {/* Pad incomplete last row */}
              {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, ei) => (
                <View key={`pad-${ei}`} style={{ width: ITEM_W }} />
              ))}
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5EF' },

  // Background orbs
  orb1: { position: 'absolute', top: -100, right: -80,  width: 280, height: 280, borderRadius: 140, backgroundColor: '#FBCFE8', opacity: 0.55 },
  orb2: { position: 'absolute', top: 280,  left: -100,  width: 250, height: 250, borderRadius: 125, backgroundColor: '#DDD6FE', opacity: 0.45 },
  orb3: { position: 'absolute', bottom: 0, right: -60,  width: 200, height: 200, borderRadius: 100, backgroundColor: '#A7F3D0', opacity: 0.38 },

  // White card that sits over the background
  sheet: {
    flex: 1,
    backgroundColor: WHITE,
    overflow: 'hidden',
    elevation: 8,
  },

  // Header inside card
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: TEXT1,
    letterSpacing: -0.4,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 20,
    marginBottom: 8,
  },

  // Grid
  grid: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Avatar text
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT1,
    textAlign: 'center',
    marginBottom: 3,
    paddingHorizontal: 2,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listenTxt: {
    fontSize: 10,
    color: TEXT2,
    fontWeight: '500',
  },
});