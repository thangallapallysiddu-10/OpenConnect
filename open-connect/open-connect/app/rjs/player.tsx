import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAudio } from '../../src/context/AudioContext';
import { usePlayer } from '../../src/context/PlayerContext';

const { width, height } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

const BG    = '#0A0A0F';
const WHITE = '#FFFFFF';
const TEXT2 = 'rgba(255,255,255,0.55)';
const TEXT3 = 'rgba(255,255,255,0.28)';

const TOTAL_SEC = 298;
const BAR_COUNT = 40;

function fmt(s: number) {
  const v = Math.max(0, Math.min(TOTAL_SEC, Math.floor(s)));
  return `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, '0')}`;
}

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ playing, progress, contentWidth }: { playing: boolean; progress: number; contentWidth: number }) {
  const anims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(Math.random()))
  ).current;
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  const startAll = () => {
    loopsRef.current.forEach(l => l.stop());
    loopsRef.current = anims.map(anim => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.2 + Math.random() * 0.8, duration: 300 + Math.random() * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.1 + Math.random() * 0.4, duration: 300 + Math.random() * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      loop.start();
      return loop;
    });
  };

  const pauseAll = () => {
    loopsRef.current.forEach(l => l.stop());
    anims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 0.08 + (i % 4) * 0.04, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    playing ? startAll() : pauseAll();
    return () => loopsRef.current.forEach(l => l.stop());
  }, [playing]);

  const BAR_W   = (contentWidth - 80) / BAR_COUNT - 2;
  const MAX_H   = 52;
  const filledCount = Math.floor(progress * BAR_COUNT);

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: MAX_H }}>
        {anims.map((anim, i) => {
          const isFilled = i <= filledCount;
          const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 1] });
          return (
            <Animated.View
              key={i}
              style={{
                width: BAR_W,
                height: MAX_H,
                marginHorizontal: 1,
                borderRadius: 3,
                backgroundColor: isFilled ? '#A855F7' : 'rgba(255,255,255,0.18)',
                transform: [{ scaleY }],
              }}
            />
          );
        })}
      </View>
      {/* Seek triangle marker */}
      <View style={{ alignItems: 'flex-start', paddingLeft: (filledCount / BAR_COUNT) * (contentWidth - 80) }}>
        <View style={S.seekTriangle} />
      </View>
      {/* Time row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={S.timeTxt}>{fmt(progress * TOTAL_SEC)}</Text>
        <Text style={S.timeTxt}>{fmt(TOTAL_SEC)}</Text>
      </View>
    </View>
  );
}

function getStationInfo(name: string, genre: string, frequency: string): string {
  const map: Record<string, string> = {
    'RJ Beats FM':    `RJ Beats FM at ${frequency} FM is the home of hip-hop, trap, and urban beats. Broadcasting 24/7 with the freshest drops, exclusive mixes, and live call-ins from listeners across the city.`,
    'RJ Vibes':       `RJ Vibes at ${frequency} FM brings you the best in pop music — chart-toppers, throwbacks, and exclusive artist interviews. The feel-good station for every mood.`,
    'Smooth RJ':      `Smooth RJ at ${frequency} FM is your destination for jazz, soul, and late-night grooves. Perfect for unwinding with timeless melodies and soothing rhythms.`,
    'RJ Rock Nation': `RJ Rock Nation at ${frequency} FM is the ultimate rock experience — classic anthems, modern rock, and live concert coverage that keeps the energy high all day.`,
    'RJ Bass Drop':   `RJ Bass Drop at ${frequency} FM is where electronic music lives. From progressive house to drum & bass, experience the pulse of the underground scene.`,
  };
  return map[name] ?? `${name} at ${frequency} FM is your go-to station for the best in ${genre} music. Tune in for non-stop hits, live shows, and exclusive content from your favorite artists.`;
}

function getStationTags(genre: string): string[] {
  const map: Record<string, string[]> = {
    'Hip-Hop': ['Hip-Hop', 'Trap', 'Urban', '24/7 Live'],
    'Pop':     ['Pop Hits', 'Top 40', 'Feel Good', 'Live'],
    'Jazz':    ['Jazz', 'Soul', 'R&B', 'Chill'],
    'Rock':    ['Rock', 'Classic Rock', 'Live Concerts'],
    'EDM':     ['EDM', 'House', 'Bass', 'Electronic'],
  };
  return map[genre] ?? ['Music', 'Live Radio', '24/7'];
}

function getRJName(name: string): string {
  const map: Record<string, string> = {
    'RJ Beats FM':    'RJ Marcus',
    'RJ Vibes':       'RJ Priya',
    'Smooth RJ':      'RJ Zara',
    'RJ Rock Nation': 'RJ Arjun',
    'RJ Bass Drop':   'RJ Natalie',
  };
  return map[name] ?? 'RJ Host';
}

function getRJImage(name: string): string {
  const map: Record<string, string> = {
    'RJ Beats FM':    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&facepad=3',
    'RJ Vibes':       'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces&facepad=3',
    'Smooth RJ':      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&facepad=3',
    'RJ Rock Nation': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&facepad=3',
    'RJ Bass Drop':   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&facepad=3',
  };
  return map[name] ?? 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=faces&facepad=3';
}

function getRJShow(name: string, genre: string): string {
  const map: Record<string, string> = {
    'RJ Beats FM':    'Night Frequency Show',
    'RJ Vibes':       'Good Morning Drive',
    'Smooth RJ':      'Afternoon Jazz Hour',
    'RJ Rock Nation': 'Filmy Rock Mornings',
    'RJ Bass Drop':   'Saturday Night Live',
  };
  return map[name] ?? `${genre} Live Show`;
}

function getRJTimeslot(name: string): string {
  const map: Record<string, string> = {
    'RJ Beats FM':    '10 PM – 2 AM',
    'RJ Vibes':       '6 AM – 10 AM',
    'Smooth RJ':      '2 PM – 6 PM',
    'RJ Rock Nation': '10 AM – 2 PM',
    'RJ Bass Drop':   '8 PM – 12 AM',
  };
  return map[name] ?? '12 PM – 4 PM';
}

// ── Episodes Data ─────────────────────────────────────────────────────────────
type Episode = {
  id: number; title: string; date: string; duration: string;
  plays: string; isNew: boolean; isFavourite: boolean;
};

function getEpisodes(name: string): Episode[] {
  const map: Record<string, Episode[]> = {
    'RJ Beats FM': [
      { id: 1, title: 'Late Night Trap Session', date: 'Apr 2, 2025',  duration: '58:12', plays: '14.2k', isNew: true,  isFavourite: false },
      { id: 2, title: 'Hip-Hop Flashback Vol.3', date: 'Mar 28, 2025', duration: '1:02:45', plays: '9.8k',  isNew: false, isFavourite: true  },
      { id: 3, title: 'Underground Drops',        date: 'Mar 20, 2025', duration: '47:30', plays: '6.1k',  isNew: false, isFavourite: false },
      { id: 4, title: 'Drill Vibes Special',      date: 'Feb 14, 2025', duration: '55:00', plays: '4.3k',  isNew: false, isFavourite: true  },
    ],
    'RJ Vibes': [
      { id: 1, title: 'Good Morning Drive – Ep 22', date: 'Apr 3, 2025',  duration: '45:10', plays: '8.9k',  isNew: true,  isFavourite: false },
      { id: 2, title: 'Weekend Pop Countdown',      date: 'Mar 30, 2025', duration: '1:10:00', plays: '12.1k', isNew: false, isFavourite: true  },
      { id: 3, title: 'Throwback Thursday',         date: 'Mar 22, 2025', duration: '50:22', plays: '7.5k',  isNew: false, isFavourite: false },
    ],
    'Smooth RJ': [
      { id: 1, title: 'Midnight Jazz Lounge',    date: 'Apr 1, 2025',  duration: '1:15:00', plays: '3.1k',  isNew: true,  isFavourite: true  },
      { id: 2, title: 'Sunday Soul Sessions',    date: 'Mar 25, 2025', duration: '58:40', plays: '2.8k',  isNew: false, isFavourite: false },
      { id: 3, title: 'Bossa Nova & Beyond',     date: 'Mar 10, 2025', duration: '44:55', plays: '1.9k',  isNew: false, isFavourite: true  },
    ],
    'RJ Rock Nation': [
      { id: 1, title: 'Filmy Rock Mornings Ep.8', date: 'Apr 3, 2025',  duration: '52:18', plays: '11.4k', isNew: true,  isFavourite: false },
      { id: 2, title: 'Classic Rock Rewind',       date: 'Mar 27, 2025', duration: '1:05:30', plays: '9.2k',  isNew: false, isFavourite: true  },
      { id: 3, title: 'Metal vs Punk Showdown',    date: 'Feb 28, 2025', duration: '48:00', plays: '5.6k',  isNew: false, isFavourite: false },
    ],
    'RJ Bass Drop': [
      { id: 1, title: 'Saturday Night Live Set',  date: 'Apr 2, 2025',  duration: '1:20:00', plays: '18.1k', isNew: true,  isFavourite: false },
      { id: 2, title: 'Festival Warm-Up Mix',     date: 'Mar 29, 2025', duration: '58:55', plays: '13.4k', isNew: false, isFavourite: true  },
      { id: 3, title: 'Deep House Diaries',       date: 'Mar 15, 2025', duration: '1:02:10', plays: '8.7k',  isNew: false, isFavourite: false },
    ],
  };
  return map[name] ?? [
    { id: 1, title: 'Latest Episode', date: 'Apr 3, 2025', duration: '45:00', plays: '5k', isNew: true,  isFavourite: false },
    { id: 2, title: 'Episode 2',      date: 'Mar 20, 2025', duration: '40:00', plays: '3k', isNew: false, isFavourite: true  },
  ];
}
const RELATED_RJS = [
  { id: 1, name: 'RJ Priya',   tag: 'Pop',     listeners: '22.5k', isLive: false, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 2, name: 'RJ Marcus',  tag: 'Hip-Hop', listeners: '18.2k', isLive: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 3, name: 'RJ Zara',    tag: 'Jazz',    listeners: '15.1k', isLive: true,  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 4, name: 'RJ Arjun',   tag: 'Rock',    listeners: '9.7k',  isLive: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 5, name: 'RJ Natalie', tag: 'EDM',     listeners: '31.3k', isLive: true,  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces&facepad=3' },
];
// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PlayerScreen() {
  const [episodeFilter, setEpisodeFilter] = useState<'new' | 'old' | 'favourites'>('new');
  const params = useLocalSearchParams<{
    name: string; frequency: string; genre: string;
    listeners: string; image: string; accent: string;
  }>();

  // Stop any currently playing song or podcast when this RJ screen opens
  const { clearTrack } = useAudio();
  const { stopPodcast } = usePlayer();
  useEffect(() => {
    clearTrack();
    stopPodcast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name      = params.name      ?? 'RJ Station';
  const frequency = params.frequency ?? '—';
  const genre     = params.genre     ?? 'Music';
  const listeners = params.listeners ?? '0';
  const accent    = params.accent    ?? '#A855F7';
  const image     = params.image
    ? decodeURIComponent(params.image)
    : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=700&fit=crop';

  const [playing,     setPlaying]     = useState(true);
  const [liked,       setLiked]       = useState(false);
  const [curSec,      setCurSec]      = useState(0);
  const [speedIdx,    setSpeedIdx]    = useState(0);
   const [rjFollowed, setRjFollowed] = useState(
  ['RJ Beats FM', 'RJ Zara Vibes', 'RJ Maya Beats'].includes(name)
);
  const SPEEDS = [1, 1.25, 1.5, 2];
  const speed  = SPEEDS[speedIdx];
  const progress = curSec / TOTAL_SEC;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurSec(s => s >= TOTAL_SEC ? TOTAL_SEC : s + speed);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speed]);

  // Vinyl rotation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinRef  = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (playing) {
      spinRef.current = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
      );
      spinRef.current.start();
    } else {
      spinRef.current?.stop();
    }
  }, [playing]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, 600);
  const IMG_SIZE = Math.min(contentWidth * 0.58, 280);

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Blurred background */}
      <Image source={{ uri: image }} style={[S.bgBlur, { height: windowHeight * 0.55 }]} blurRadius={28}  resizeMode="cover" />
      <LinearGradient
        colors={['rgba(10,10,15,0.55)', 'rgba(10,10,15,0.80)', 'rgba(10,10,15,0.96)', BG]}
        locations={[0, 0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={{ flex: 1, opacity: fade, width: '100%', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} bounces={false}>

          {/* Header */}
          <View style={[S.header, { paddingTop: SBH + 10 }]}>
            <TouchableOpacity onPress={() => router.back()} style={S.hBtn} activeOpacity={0.75}>
              <Ionicons name="chevron-back" size={22} color={WHITE} />
            </TouchableOpacity>
            <View style={S.headerCenter}>
              <Text style={S.hLabel}>NOW PLAYING</Text>
            </View>
            <TouchableOpacity style={S.hBtn} activeOpacity={0.75}>
              <Ionicons name="share-social-outline" size={18} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={[S.hBtn, { marginLeft: 6 }]} activeOpacity={0.75}>
              <Ionicons name="ellipsis-horizontal" size={20} color={WHITE} />
            </TouchableOpacity>
          </View>

          {/* Plays & Likes row */}
          <View style={S.statsRow}>
            <View style={S.statItem}>
              <Ionicons name="play-outline" size={12} color={TEXT3} />
              <Text style={S.statTxt}>{parseInt(listeners) > 1000 ? (parseInt(listeners.replace(/[^0-9.]/g,'')) + 'k') : listeners} Plays</Text>
            </View>
            <View style={S.statItem}>
              <Ionicons name="heart" size={12} color="#EC4899" />
              <Text style={S.statTxt}>32.1K</Text>
            </View>
          </View>

          {/* Vinyl artwork */}
          <View style={[S.artworkArea, { height: contentWidth * 0.72 }]}>
            {/* Outer vinyl ring */}
            <Animated.View style={[S.vinylOuter, {
              width: contentWidth * 0.68,
              height: contentWidth * 0.68,
              borderRadius: (contentWidth * 0.68) / 2,
              transform: [{ rotate: spin }]
            }]}>
              <View style={[S.vinylGrooves, { borderRadius: contentWidth * 0.28 }]} />
            </Animated.View>
            {/* Album art circle */}
            <Animated.View style={[S.artCircle, { width: IMG_SIZE, height: IMG_SIZE, borderRadius: IMG_SIZE / 2, transform: [{ rotate: spin }] }]}>
              <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: IMG_SIZE / 2 }} resizeMode="cover" />
            </Animated.View>
            {/* Center hole */}
            <View style={S.vinylHole} />
          </View>

          {/* Song info */}
          <View style={S.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.songName} numberOfLines={1}>{name}</Text>
              <Text style={S.songSub}>{genre} · {frequency} FM</Text>
            </View>
            <TouchableOpacity
              style={[S.likeBtn, liked && { backgroundColor: 'rgba(236,72,153,0.25)', borderColor: '#EC4899' }]}
              onPress={() => setLiked(l => !l)}
              activeOpacity={0.75}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#EC4899' : TEXT2} />
            </TouchableOpacity>
          </View>

          {/* Waveform */}
          <Waveform playing={playing} progress={progress} contentWidth={contentWidth} />

          {/* Controls */}
          <View style={S.controls}>
            <TouchableOpacity style={S.ctrlBtn} onPress={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)} activeOpacity={0.75}>
              <Ionicons name="repeat-outline" size={22} color={TEXT2} />
            </TouchableOpacity>
            <TouchableOpacity style={S.ctrlBtn} onPress={() => setCurSec(s => Math.max(0, s - 10))} activeOpacity={0.75}>
              <Ionicons name="play-skip-back" size={26} color={TEXT2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.playBtn, { backgroundColor: accent }]}
              onPress={() => setPlaying(p => !p)}
              activeOpacity={0.85}
            >
              <Ionicons name={playing ? 'pause' : 'play'} size={30} color={WHITE} style={{ marginLeft: playing ? 0 : 3 }} />
            </TouchableOpacity>
            <TouchableOpacity style={S.ctrlBtn} onPress={() => setCurSec(s => Math.min(TOTAL_SEC, s + 10))} activeOpacity={0.75}>
              <Ionicons name="play-skip-forward" size={26} color={TEXT2} />
            </TouchableOpacity>
            <TouchableOpacity style={S.ctrlBtn} activeOpacity={0.75}>
              <Ionicons name="shuffle-outline" size={22} color={TEXT2} />
            </TouchableOpacity>
          </View>

          
{/* Listeners row */}
<View style={S.bottomRow}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <Ionicons name="headset" size={13} color={TEXT3} />
    <Text style={{ fontSize: 12, color: TEXT3, fontWeight: '500' }}>{listeners} listeners</Text>
  </View>
  <TouchableOpacity style={S.speedBadge} onPress={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)} activeOpacity={0.75}>
    <Text style={S.speedTxt}>{speed}x</Text>
  </TouchableOpacity>
</View>

{/* About this Station */}
<View style={S.infoCard}>
  <View style={S.infoCardHeader}>
    <View style={[S.infoCardDot, { backgroundColor: accent }]} />
    <Text style={S.infoCardTitle}>About this Station</Text>
  </View>
  <Text style={S.infoCardBody}>
    {getStationInfo(name, genre, frequency)}
  </Text>
  <View style={S.infoTagsRow}>
    {getStationTags(genre).map(tag => (
      <View key={tag} style={[S.infoTag, { borderColor: accent + '50', backgroundColor: accent + '15' }]}>
        <Text style={[S.infoTagTxt, { color: accent }]}>{tag}</Text>
      </View>
    ))}
  </View>
</View>

{/* On Air RJ Card */}
<View style={S.rjCard}>
  <Image source={{ uri: getRJImage(name) }} style={S.rjAvatar} resizeMode="cover" />
  <View style={S.rjInfo}>
    <Text style={S.rjLabel}>ON AIR NOW</Text>
    <Text style={S.rjName}>{getRJName(name)}</Text>
    <Text style={S.rjShow}>{getRJShow(name, genre)}</Text>
    <View style={S.rjStats}>
      <Ionicons name="time-outline" size={12} color={TEXT2} />
      <Text style={S.rjStatTxt}>{getRJTimeslot(name)}</Text>
      <View style={S.rjDot} />
      <Ionicons name="headset-outline" size={12} color={TEXT2} />
      <Text style={S.rjStatTxt}>{listeners} live</Text>
    </View>
  </View>
  <TouchableOpacity
  style={[
    S.rjFollowBtn,
    {
      borderColor: accent,
      backgroundColor: rjFollowed ? accent : 'transparent',
    },
  ]}
  onPress={() => setRjFollowed(f => !f)}
  activeOpacity={0.85}
>
  <Ionicons
    name={rjFollowed ? 'checkmark' : 'add'}
    size={13}
    color={rjFollowed ? WHITE : accent}
  />
  <Text style={[S.rjFollowTxt, { color: rjFollowed ? WHITE : accent }]}>
    {rjFollowed ? 'Following' : 'Follow'}
  </Text>
</TouchableOpacity>
</View>
{/* ── Episodes ── */}
<View style={S.episodesCard}>

  {/* Header */}
  <View style={S.episodesHeader}>
    <Ionicons name="headset-outline" size={16} color={accent} />
    <Text style={S.episodesTitle}>Episodes</Text>
  </View>

  {/* Filter chips */}
  <View style={S.filterRow}>
    {(['new', 'old', 'favourites'] as const).map(f => (
      <TouchableOpacity
        key={f}
        style={[S.filterChip, episodeFilter === f && { backgroundColor: accent, borderColor: accent }]}
        onPress={() => setEpisodeFilter(f)}
        activeOpacity={0.8}
      >
        <Text style={[S.filterChipTxt, episodeFilter === f && { color: WHITE }]}>
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>

  {/* Episode list */}
  {getEpisodes(name)
    .filter(ep => {
      if (episodeFilter === 'new')        return ep.isNew;
      if (episodeFilter === 'favourites') return ep.isFavourite;
      return !ep.isNew; // old
    })
    .map((ep, i, arr) => (
      <TouchableOpacity
  key={ep.id}
  activeOpacity={0.8}
  style={[
    S.episodeRow,
    i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  ]}
  onPress={() => router.push({
  pathname: '/rjs/player',
  params: {
    name:      ep.title,
    frequency: frequency,
    genre:     genre,
    listeners: ep.plays,
    image:     encodeURIComponent(image),
    accent:    accent,
  },
})}
>
        {/* Play icon */}
        <View style={[S.epPlayIcon, { backgroundColor: accent + '20', borderColor: accent + '50' }]}>
          <Ionicons name="play" size={12} color={accent} style={{ marginLeft: 2 }} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={S.epTitle} numberOfLines={1}>{ep.title}</Text>
            {ep.isNew && (
              <View style={[S.newBadge, { backgroundColor: accent }]}>
                <Text style={S.newBadgeTxt}>NEW</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="calendar-outline" size={10} color={TEXT3} />
              <Text style={S.epMeta}>{ep.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="time-outline" size={10} color={TEXT3} />
              <Text style={S.epMeta}>{ep.duration}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="headset-outline" size={10} color={TEXT3} />
              <Text style={S.epMeta}>{ep.plays}</Text>
            </View>
          </View>
        </View>

        {/* Favourite heart */}
        <Ionicons
          name={ep.isFavourite ? 'heart' : 'heart-outline'}
          size={16}
          color={ep.isFavourite ? '#EC4899' : TEXT3}
        />
      </TouchableOpacity>
    ))}
</View>

{/* ── Related RJs ── */}
<View style={S.relatedCard}>
  <View style={S.episodesHeader}>
    <Ionicons name="people-outline" size={16} color={accent} />
    <Text style={S.episodesTitle}>Related RJs</Text>
  </View>

  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingVertical: 4 }}>
    {RELATED_RJS.filter(r => r.name !== getRJName(name)).map((rj, i) => (
      <TouchableOpacity
        key={rj.id}
        style={S.relatedRjItem}
        activeOpacity={0.85}
        onPress={() => router.push({
  pathname: '/rjs/artist',
  params: {
    name:        rj.name,
    image:       encodeURIComponent(rj.image),
    listeners:   rj.listeners,
    isFollowing: 'false',
    ...(rj.isLive ? { isLive: 'true' } : {}),
  },
})}
      >
        <View style={[S.relatedRjRing, { borderColor: accent + '80' }]}>
          <Image source={{ uri: rj.image }} style={S.relatedRjImg} resizeMode="cover" />
        </View>
        <Text style={S.relatedRjName} numberOfLines={1}>{rj.name}</Text>
        <Text style={S.relatedRjTag}>{rj.tag}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const S = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  bgBlur: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55 },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  hBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.10)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  hLabel:       { fontSize: 11, fontWeight: '700', color: TEXT2, letterSpacing: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statTxt:  { fontSize: 12, color: TEXT3, fontWeight: '500' },

  // Vinyl
  artworkArea: { alignItems: 'center', justifyContent: 'center', marginBottom: 24, height: width * 0.72 },
  vinylOuter:  {
    position: 'absolute',
    width: width * 0.68,
    height: width * 0.68,
    borderRadius: width * 0.34,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vinylGrooves: {
    position: 'absolute',
    top: 12, left: 12, right: 12, bottom: 12,
    borderRadius: width * 0.28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  artCircle: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.12)',
    boxShadow : '0px 12px 24px rgba(0,0,0,0.6)',
    elevation: 18,
  },
  vinylHole: {
    position: 'absolute',
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
// About Station card
infoCard:       { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
infoCardDot:    { width: 8, height: 8, borderRadius: 4 },
infoCardTitle:  { fontSize: 14, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
infoCardBody:   { fontSize: 13, color: TEXT2, lineHeight: 20, marginBottom: 12 },
infoTagsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
infoTag:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
infoTagTxt:     { fontSize: 11, fontWeight: '600' },

// RJ Card
rjCard:      { marginHorizontal: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
rjAvatar:    { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
rjInfo:      { flex: 1 },
rjLabel:     { fontSize: 9, fontWeight: '700', color: '#EF4444', letterSpacing: 1.5, marginBottom: 2 },
rjName:      { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 2 },
rjShow:      { fontSize: 12, color: TEXT2, marginBottom: 5 },
rjStats:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
rjStatTxt:   { fontSize: 11, color: TEXT2 },
rjDot:       { width: 3, height: 3, borderRadius: 1.5, backgroundColor: TEXT3, marginHorizontal: 2 },
rjFollowBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5 },
rjFollowTxt: { fontSize: 12, fontWeight: '700' },

// Now Playing card
nowPlayingCard:   { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
nowPlayingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
nowPlayingTitle:  { fontSize: 14, fontWeight: '700', color: WHITE },
trackRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
trackNum:         { fontSize: 13, fontWeight: '700', width: 20, textAlign: 'center' },
trackTitle:       { fontSize: 13, fontWeight: '600', color: TEXT2, marginBottom: 2 },
trackArtist:      { fontSize: 11, color: TEXT3 },
trackDur:         { fontSize: 11, color: TEXT3, minWidth: 36, textAlign: 'right' },
  infoRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  songName: { fontSize: 22, fontWeight: '800', color: WHITE, letterSpacing: -0.5, marginBottom: 4 },
  songSub:  { fontSize: 13, color: TEXT2, fontWeight: '500' },
  likeBtn:  { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },

  seekTriangle: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: WHITE, marginTop: 2 },
  timeTxt:      { fontSize: 11, color: TEXT3, fontWeight: '500' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 },
  ctrlBtn:  { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  playBtn:  { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 16px rgba(168, 85, 247, 0.5)', elevation: 10 },

  bottomRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, marginBottom: 16 },
  speedBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  speedTxt:   { fontSize: 13, fontWeight: '800', color: TEXT2 },

  lyricsPanel: { marginHorizontal: 24, marginTop: 8, padding: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  lyricLine:   { fontSize: 14, color: TEXT3, lineHeight: 26, textAlign: 'center' },
  lyricActive: { color: WHITE, fontSize: 16, fontWeight: '700' },
  lyricClose:  { color: TEXT2, fontSize: 14, opacity: 0.7 },
  lyricFar:    { color: TEXT3, fontSize: 13, opacity: 0.35 },
  // Episodes card
episodesCard:   { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
episodesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
episodesTitle:  { fontSize: 14, fontWeight: '700', color: WHITE },

filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
filterChip:     { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
filterChipTxt:  { fontSize: 12, fontWeight: '600', color: TEXT2 },

episodeRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
epPlayIcon:     { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
epTitle:        { fontSize: 13, fontWeight: '600', color: WHITE, flex: 1 },
epMeta:         { fontSize: 10, color: TEXT3, fontWeight: '500' },
newBadge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
newBadgeTxt:    { fontSize: 9, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },

// Related RJs card
relatedCard:    { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
relatedRjItem:  { alignItems: 'center', width: 72 },
relatedRjRing:  { width: 60, height: 60, borderRadius: 30, borderWidth: 2, overflow: 'hidden', marginBottom: 8 },
relatedRjImg:   { width: '100%', height: '100%' },
relatedRjName:  { fontSize: 11, fontWeight: '700', color: WHITE, textAlign: 'center', marginBottom: 2 },
relatedRjTag:   { fontSize: 10, color: TEXT2, fontWeight: '500' },
});