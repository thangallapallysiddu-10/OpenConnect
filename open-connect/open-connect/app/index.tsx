import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdCarousel } from '../src/components/AdCarousel/AdCarousel';
import { CategoryButtons } from '../src/components/CategoryButtons/CategoryButtons';
import { EventCard } from '../src/components/EventCard/EventCard';
import { Header } from '../src/components/Header/Header';
import { SectionHeader } from '../src/components/SectionHeader/SectionHeader';
import { SongCard } from '../src/components/SongCard/SongCard';
import { events as fallbackEvents } from '../src/data/events';
import { newReleases as fallbackNewReleases, perfectForYou as fallbackPerfectForYou, recentlyPlayed as fallbackRecentlyPlayed } from '../src/data/songs';
import { RequestRJScreen } from '../src/screens/RequestRJScreen';
import { useTheme } from '../src/context/ThemeContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import HeroBanner from '../src/components/MelodyMeet/HeroBanner';
import MoodSelector from '../src/components/MelodyMeet/MoodSelector';
import { PremiumFeatures } from '../src/components/PremiumFeatures/PremiumFeatures';
import { ALL_CHANNELS, LANGUAGES } from '../src/data/channels';
import { useFilter } from '../src/context/FilterContext';
import { apiGet } from '../src/services/api';

const liveStation = {
  id: 'ls1',
  stationName: 'Radio Mirchi 98.3 FM',
  nowPlaying: 'Kesariya – Arijit Singh',
  genre: 'Bollywood Hits',
  listeners: '12.4k',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  waveColor: ['#7B2FF7', '#F107A3'],
};

const fallbackLiveRJs = [
  {
    id: 'rj1',
    name: 'DJ Aryan',
    listeners: '2.4k',
    image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&q=80',
  },
  {
    id: 'rj2',
    name: 'RJ Meera',
    listeners: '620',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces&facepad=3',
  },
  {
    id: 'rj3',
    name: 'DJ Nova',
    listeners: '1.1k',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
  },
  {
    id: 'rj4',
    name: 'RJ Priya',
    listeners: '890',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  {
    id: 'rj5',
    name: 'RJ Kabir',
    listeners: '3.2k',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
];

const fallbackPodcasts = [
  {
    id: 'p1',
    title: 'The Music Lab',
    host: 'Arjun Sharma',
    episodes: 42,
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&q=80',
  },
  {
    id: 'p2',
    title: 'Beat Drop',
    host: 'Naina Kapoor',
    episodes: 28,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&q=80',
  },
  {
    id: 'p3',
    title: 'Sound Diaries',
    host: 'Rohan Verma',
    episodes: 65,
    image: 'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=300&q=80',
  },
  {
    id: 'p4',
    title: 'Frequency',
    host: 'Ananya Das',
    episodes: 19,
    image: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=300&q=80',
  },
];

const listRowClass =
  'pl-3 pr-2 sm:pl-5 sm:pr-3 md:pl-6 md:pr-4 lg:pl-8 lg:pr-6';

type BackendSong = {
  id: string;
  title: string;
  cover_url?: string | null;
  image_url?: string | null;
  artist_name?: string | null;
  artist?: { name?: string | null } | null;
};

type BackendPodcast = {
  id: string;
  title: string;
  cover_url?: string | null;
  image_url?: string | null;
  host?: string | null;
  speaker_name?: string | null;
  episodes?: number | null;
  episode_count?: number | null;
};

type BackendEvent = {
  id: string;
  title: string;
  image_url?: string | null;
  starts_at?: string | null;
  venue?: string | null;
  city?: string | null;
};

type BackendRJ = {
  id: string;
  name: string;
  image_url?: string | null;
  listeners?: number | null;
};

type HomePayload = {
  trendingSongs?: BackendSong[];
  newSongs?: BackendSong[];
  podcasts?: BackendPodcast[];
  events?: BackendEvent[];
  rjs?: BackendRJ[];
};

type SongItem = (typeof fallbackRecentlyPlayed)[number];
type EventItem = (typeof fallbackEvents)[number];
type PodcastItem = (typeof fallbackPodcasts)[number];
type RJItem = (typeof fallbackLiveRJs)[number];

const fallbackSongImage = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
const fallbackPodcastImage = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&q=80';
const fallbackEventImage = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop';
const fallbackRJImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80';

const imageSource = (url?: string | null, fallback = fallbackSongImage) => ({
  uri: url || fallback,
});

const formatEventDate = (value?: string | null) => {
  if (!value) return 'Upcoming';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Upcoming';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

const formatListeners = (listeners?: number | null) => {
  if (!listeners) return '0';
  if (listeners >= 1000) return `${(listeners / 1000).toFixed(1)}k`;
  return String(listeners);
};

const mapSong = (song: BackendSong): SongItem => ({
  id: song.id,
  title: song.title,
  artist: song.artist_name || song.artist?.name || 'Open Connect',
  image: imageSource(song.cover_url || song.image_url),
});

const mapPodcast = (podcast: BackendPodcast): PodcastItem => ({
  id: podcast.id,
  title: podcast.title,
  host: podcast.host || podcast.speaker_name || 'Open Connect',
  episodes: podcast.episodes || podcast.episode_count || 0,
  image: podcast.cover_url || podcast.image_url || fallbackPodcastImage,
});

const mapEvent = (event: BackendEvent): EventItem => ({
  id: event.id,
  title: event.title,
  date: formatEventDate(event.starts_at),
  location: [event.venue, event.city].filter(Boolean).join(', '),
  image: imageSource(event.image_url, fallbackEventImage),
});

const mapRJ = (rj: BackendRJ): RJItem => ({
  id: rj.id,
  name: rj.name,
  listeners: formatListeners(rj.listeners),
  image: rj.image_url || fallbackRJImage,
});

function useHomeCatalog() {
  const [home, setHome] = useState({
    events: fallbackEvents,
    liveRJs: fallbackLiveRJs,
    podcasts: fallbackPodcasts,
    recentlyPlayed: fallbackRecentlyPlayed,
    perfectForYou: fallbackPerfectForYou,
    newReleases: fallbackNewReleases,
  });

  useEffect(() => {
    let isMounted = true;

    apiGet<HomePayload>('/home')
      .then((data) => {
        if (!isMounted) return;

        const trendingSongs = data.trendingSongs?.map(mapSong) ?? [];
        const newSongs = data.newSongs?.map(mapSong) ?? [];

        setHome({
          events: data.events?.length ? data.events.map(mapEvent) : fallbackEvents,
          liveRJs: data.rjs?.length ? data.rjs.map(mapRJ) : fallbackLiveRJs,
          podcasts: data.podcasts?.length ? data.podcasts.map(mapPodcast) : fallbackPodcasts,
          recentlyPlayed: trendingSongs.length ? trendingSongs : fallbackRecentlyPlayed,
          perfectForYou: trendingSongs.length ? trendingSongs : fallbackPerfectForYou,
          newReleases: newSongs.length ? newSongs : fallbackNewReleases,
        });
      })
      .catch(() => {
        // The bundled catalog keeps the app usable when the local API is not running.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return home;
}

const LiveStationPlayer = () => {
  const { theme, colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [barHeights, setBarHeights] = useState([12, 18, 25, 30, 22, 15, 28, 35, 20, 14, 25, 32, 18, 12]);

  const { globalLanguage: selectedLanguage, setGlobalLanguage: setSelectedLanguage } = useFilter();
  const [tempLanguage, setTempLanguage] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const sheetWidth = Math.min(windowWidth, 480);
  const sheetLeft = windowWidth > 480 ? (windowWidth - 480) / 2 : 0;

  const filterBackdropOpacity = useRef(new Animated.Value(0)).current;
  const filterSheetTranslateY = useRef(new Animated.Value(600)).current;

  const { isLoggedIn, showAuthModal } = useAuth();

  const openFilter = () => {
    setTempLanguage(selectedLanguage);
    setShowFilter(true);
    Animated.parallel([
      Animated.timing(filterBackdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(filterSheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }),
    ]).start();
  };

  const closeFilter = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(filterBackdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(filterSheetTranslateY, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilter(false);
      cb?.();
    });
  };

  const filteredChannels = React.useMemo(() => {
    if (!selectedLanguage) return ALL_CHANNELS;
    return ALL_CHANNELS.filter(c => c.language === selectedLanguage);
  }, [selectedLanguage]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentChannelObj = filteredChannels[currentIndex] || filteredChannels[0];
  const channel = currentChannelObj.channelNumber;
  const frequency = currentChannelObj.frequency;

  const handleNextChannel = () => {
    setCurrentIndex((prev) => (prev === filteredChannels.length - 1 ? 0 : prev + 1));
  };

  const handlePrevChannel = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredChannels.length - 1 : prev - 1));
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLanguage]);

  // Waveform animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBarHeights(
        Array.from({ length: 18 }, () => Math.floor(Math.random() * 30) + 6)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Pulse animation for the Radio icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View
      className="mx-3 mb-4 overflow-hidden rounded-[28px]"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(20, 10, 30, 0.4)' : '#FFFFFF',
        borderColor: theme === 'dark' ? 'rgba(157, 78, 221, 0.3)' : 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#9d4edd',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: theme === 'dark' ? 0.3 : 0.08,
        shadowRadius: 12,
        padding: 20,
      }}
    >
      <TouchableOpacity
        onPress={openFilter}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 8, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 20 }}
      >
        <Ionicons name="filter" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
      </TouchableOpacity>

      {showFilter && (
        <Modal
          transparent={true}
          animationType="none"
          onRequestClose={() => closeFilter()}
        >
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => closeFilter()}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: filterBackdropOpacity,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                },
              ]}
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: filterSheetTranslateY }],
                backgroundColor: colors.cardBackground,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderWidth: 1,
                borderColor: colors.border,
                width: sheetWidth,
                left: sheetLeft,
                right: windowWidth > 480 ? 'auto' : 0,
              },
            ]}
          >
            {/* Top Orange Indicator Bar */}
            <View style={{ height: 4, backgroundColor: '#D97706', borderTopLeftRadius: 28, borderTopRightRadius: 28 }} />

            {/* Drag Handle Indicator */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => closeFilter()}
              className="py-2.5 items-center justify-center"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} className="h-1.5 w-12 rounded-full" />
            </TouchableOpacity>

            {/* Filter Title */}
            <View className="px-5 pb-3 flex-row justify-between items-center">
              <Text style={{ color: colors.textSecondary }} className="text-[11px] font-extrabold tracking-wider uppercase">
                FILTER CHANNELS
              </Text>
              {tempLanguage !== '' && (
                <TouchableOpacity onPress={() => setTempLanguage('')}>
                  <Text style={{ color: '#F59E0B' }} className="text-[11px] font-bold uppercase tracking-wider">
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Divider line */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Languages List */}
            <ScrollView showsVerticalScrollIndicator={false} className="px-2 mt-2" contentContainerStyle={{ paddingBottom: 24 }}>
              <TouchableOpacity
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => setTempLanguage('')}
              >
                 <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide flex-1">All Languages</Text>
                 {tempLanguage === '' && <Ionicons name="checkmark" size={20} color="#F59E0B" />}
              </TouchableOpacity>
              
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                  className="flex-row items-center justify-between px-4 py-4"
                  onPress={() => setTempLanguage(lang)}
                >
                   <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide flex-1">{lang}</Text>
                   {tempLanguage === lang && <Ionicons name="checkmark" size={20} color="#F59E0B" />}
                </TouchableOpacity>
              ))}

              {/* Submit button placed inside the sheet at the bottom */}
              <View className="px-4 mt-6">
                <TouchableOpacity
                  style={{ backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                  onPress={() => {
                    setSelectedLanguage(tempLanguage);
                    closeFilter();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}

      <View className="items-center justify-center">
        {/* Waves Badge at the top */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="mb-4">
          <LinearGradient
            colors={['#EC4899', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Ionicons name="radio" size={24} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* Tuned Label */}
        <Text className="text-[11px] font-extrabold tracking-[2px] text-cyan-400 mb-1 uppercase">
          TUNED TO CHANNEL
        </Text>

        {/* Frequency Title */}
        <Text 
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
          className="text-4xl font-black tracking-tight"
        >
          MM {frequency.toFixed(3)}
        </Text>

        {/* Channel Description */}
        <Text 
          style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#475569' }}
          className="text-xs font-semibold mt-1"
        >
          Channel {channel} • {currentChannelObj.language}
        </Text>

        {/* Controls Row */}
        <View className="flex-row items-center justify-center gap-6 my-6">
          {/* Previous Channel */}
          <TouchableOpacity
            onPress={handlePrevChannel}
            activeOpacity={0.6}
            style={{
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={28} color={theme === 'dark' ? '#22D3EE' : '#0891B2'} />
          </TouchableOpacity>

          {/* Play / Pause button */}
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            activeOpacity={0.85}
          >
            <View
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: theme === 'dark' ? 0.5 : 0.3,
                shadowRadius: 10,
                elevation: 8,
                borderRadius: 32,
                borderWidth: 1.5,
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <LinearGradient
                colors={['#EC4899', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-16 w-16 items-center justify-center rounded-full"
              >
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={28} 
                  color="#FFFFFF" 
                  style={!isPlaying ? { marginLeft: 3 } : undefined} 
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Next Channel */}
          <TouchableOpacity
            onPress={handleNextChannel}
            activeOpacity={0.6}
            style={{
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-forward" size={28} color={theme === 'dark' ? '#22D3EE' : '#0891B2'} />
          </TouchableOpacity>
        </View>

        {/* Now Playing capsule / pill */}
        <View
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.05)',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderWidth: 1,
          }}
          className="flex-row items-center justify-between px-4 py-2.5 rounded-full w-full max-w-[280px] mb-2"
        >
          <View className="flex-row items-center gap-2">
            <View className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
            <Text 
              style={{ color: theme === 'dark' ? '#E2E8F0' : '#1E293B' }}
              className="text-xs font-bold"
            >
              {isPlaying ? 'Now Playing' : 'Paused'}
            </Text>
          </View>
          <Text 
            style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}
            className="text-xs font-extrabold"
          >
            {currentIndex + 1} / {filteredChannels.length}
          </Text>
        </View>

        {/* Waveform Visualizer (Appears ONLY when playing) */}
        {isPlaying && (
          <View className="flex-row items-end justify-center gap-1 h-10 mt-4">
            {barHeights.map((h, i) => (
              <View
                key={i}
                style={{
                  width: 3,
                  height: h,
                  backgroundColor: '#06B6D4',
                  borderRadius: 1.5,
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const LiveRJCard = ({ rj }: { rj: RJItem }) => {
  const { theme, colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/rjs/stations')}
      className="mr-3 mt-2 w-[88px] items-center sm:mr-3.5 sm:w-24 md:w-28 md:mr-4"
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="mb-1.5">
        <View className="relative h-[76px] w-[76px] overflow-hidden rounded-[38px] p-[2.5px] sm:h-20 sm:w-20 md:h-[84px] md:w-[84px]">
          <LinearGradient
            colors={theme === 'dark' ? ['#ffffff', '#000000', '#808080'] : ['#E2E8F0', '#94A3B8', '#475569']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ backgroundColor: colors.background }} className="z-10 h-full w-full overflow-hidden rounded-[35px] bg-[#0C0C0C] p-0.5 border border-white/20 dark:border-white/20 light:border-black/20">
            <Image source={{ uri: rj.image }} className="h-full w-full rounded-[33px]" />
          </View>
        </View>
      </Animated.View>

      <View className="mb-1 rounded-md bg-red-500 px-1.5 py-0.5">
        <Text className="text-[9px] font-extrabold tracking-wide text-white">LIVE</Text>
      </View>

      <Text style={{ color: colors.text }} className="mb-0.5 text-center text-xs font-semibold sm:text-sm" numberOfLines={1}>
        {rj.name}
      </Text>

      <View className="flex-row items-center gap-1">
        <Text className="text-[10px]">👥</Text>
        <Text style={{ color: colors.textSecondary }} className="text-[11px]">{rj.listeners}</Text>
      </View>
    </TouchableOpacity>
  );
};

const PodcastCard = ({ podcast }: { podcast: PodcastItem }) => {
  const { theme, colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/podcasts/discover')} className="mr-3 w-[118px] sm:mr-3.5 sm:w-[130px] md:w-36 md:mr-4">
      <View 
        className="relative mb-2 h-[118px] w-full overflow-hidden rounded-2xl sm:h-[130px] md:h-36 border-2"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <Image source={{ uri: podcast.image }} className="h-full w-full" />
        <View
          className="absolute bottom-0 left-0 right-0 h-[60px]"
          style={{ pointerEvents: 'none' }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>

      <Text style={{ color: colors.text }} className="mb-0.5 text-[13px] font-semibold leading-[18px] sm:text-sm" numberOfLines={2}>
        {podcast.title}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mb-0.5 text-[11px] sm:text-xs" numberOfLines={1}>
        {podcast.host}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [showRJScreen, setShowRJScreen] = useState(false);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const home = useHomeCatalog();

  if (showRJScreen) {
    return <RequestRJScreen onBack={() => setShowRJScreen(false)} />;
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView className="relative z-10 flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="pb-20 sm:pb-24 md:pb-28 lg:pb-32"
        >
          <View className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6">
            {!isDesktop && <Header onRequestRJ={() => setShowRJScreen(true)} />}
            <AdCarousel />
            
            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="Upcoming Events" onSeeAllPress={() => router.push('/rjs/live-event')} />
              <FlatList
                data={home.events}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <EventCard image={item.image} title={item.title} date={item.date} location={item.location} />
                )}
                contentContainerClassName={listRowClass}
              />
            </View>

            <HeroBanner />
            <MoodSelector />

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader 
                title="Live Station" 
                onSeeAllPress={() => router.push('/livestations/all-channels')}
              />
              <LiveStationPlayer />
            </View>

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="Live RJs" onSeeAllPress={() => router.push('/rjs/stations')} />
              <FlatList
                data={home.liveRJs}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LiveRJCard rj={item} />}
                contentContainerClassName={listRowClass}
              />
            </View>

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="Podcasts" onSeeAllPress={() => router.push('/podcasts/discover')} />
              <FlatList
                data={home.podcasts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PodcastCard podcast={item} />}
                contentContainerClassName={listRowClass}
              />
            </View>

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="Recently Played" onSeeAllPress={() => router.push('/search')} />
              <FlatList
                data={home.recentlyPlayed}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongCard id={item.id} image={item.image} title={item.title} artist={item.artist} trackData={item} />
                )}
                contentContainerClassName={listRowClass}
              />
            </View>

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="Perfect For You" onSeeAllPress={() => router.push('/search')} />
              <FlatList
                data={home.perfectForYou}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongCard id={item.id} image={item.image} title={item.title} artist={item.artist} trackData={item} />
                )}
                contentContainerClassName={listRowClass}
              />
            </View>

            <View className="mt-5 sm:mt-6 md:mt-8 lg:mt-10">
              <SectionHeader title="New Releases" onSeeAllPress={() => router.push('/search')} />
              <FlatList
                data={home.newReleases}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongCard id={item.id} image={item.image} title={item.title} artist={item.artist} trackData={item} />
                )}
                contentContainerClassName={listRowClass}
              />
            </View>
          </View>
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});
