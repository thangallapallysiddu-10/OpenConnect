import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Podcast {
  id: string;
  title: string;
  creator: string;
  studio: string;
  image: string;
  rank: number;
}

const genrePodcastData: Record<string, {
  name: string;
  icon: string;
  color: string;
  podcasts: Podcast[];
}> = {
  '1': { // Technology
    name: 'Technology', 
    icon: 'hardware-chip', 
    color: '#004080',
    podcasts: [
      { id: 'us12', title: 'Lex Fridman Podcast',   creator: 'Lex Fridman',      studio: 'MIT',          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us13', title: 'Waveform',              creator: 'Marques Brownlee', studio: 'MKBHD',        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop', rank: 2 },
      { id: 'us14', title: 'Reply All',             creator: 'PJ Vogt',         studio: 'Gimlet',       image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop', rank: 3 },
      { id: 'in3',  title: 'The Desi Tech Podcast', creator: 'Rajiv Mehta',     studio: 'Desi Tech',    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', rank: 4 },
      { id: 'jp1',  title: 'Japan Tech Talk',       creator: 'Kenji Tanaka',    studio: 'Tokyo Digital',image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', rank: 5 },
    ],
  },
  '2': { // Business
    name: 'Business & Finance', 
    icon: 'briefcase', 
    color: '#B8860B',
    podcasts: [
      { id: 'us7',  title: 'How I Built This',     creator: 'Guy Raz',     studio: 'NPR',         image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us8',  title: 'The Tim Ferriss Show', creator: 'Tim Ferriss', studio: 'Tim Ferriss', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', rank: 2 },
      { id: 'us9',  title: 'Planet Money',         creator: 'NPR',         studio: 'NPR',         image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop', rank: 3 },
      { id: 'au1',  title: 'The Business Brief',   creator: 'Alan Kohler', studio: 'ABC News',    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=200&fit=crop', rank: 4 },
    ],
  },
  '3': { // True Crime
    name: 'True Crime', 
    icon: 'finger-print', 
    color: '#8B0000',
    podcasts: [
      { id: 'us4',  title: 'Serial',             creator: 'Sarah Koenig',    studio: 'This American Life', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us5',  title: 'My Favorite Murder', creator: 'Karen Kilgariff', studio: 'Exactly Right',      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop', rank: 2 },
      { id: 'us6',  title: 'Crime Junkie',       creator: 'Ashley Flowers',  studio: 'audiochuck',         image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop', rank: 3 },
      { id: 'uk3',  title: 'They Walk Among Us', creator: 'Benjamin Fitton', studio: 'They Walk Among Us', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', rank: 4 },
      { id: 'uk4',  title: 'RedHanded',          creator: 'Suruthi Bala',    studio: 'RedHanded',          image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop', rank: 5 },
    ],
  },
  '4': { // Wellness
    name: 'Health & Wellness', 
    icon: 'fitness', 
    color: '#1A6B3A',
    podcasts: [
      { id: 'us15', title: 'Huberman Lab',          creator: 'Dr. Andrew Huberman', studio: 'Sciocomm Media',  image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us16', title: 'The Model Health Show', creator: 'Shawn Stevenson',     studio: 'Shawn Stevenson', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop', rank: 2 },
      { id: 'ca2',  title: 'The Doctor Is In',      creator: 'Dr. Danielle Martin', studio: 'CBC',             image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
  '5': { // Comedy
    name: 'Comedy & Arts', 
    icon: 'happy', 
    color: '#6A0572',
    podcasts: [
      { id: 'us10', title: "Conan O'Brien Needs A Friend", creator: "Conan O'Brien", studio: 'Team Coco',       image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us11', title: 'SmartLess',                   creator: 'Jason Bateman', studio: 'SmartLess Media', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop', rank: 2 },
      { id: 'br1',  title: 'Comédia Brazil',              creator: 'Rafael Silva',  studio: 'Spotify Brasil',  image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
  '6': { // News
    name: 'News & Politics', 
    icon: 'newspaper', 
    color: '#CC2222',
    podcasts: [
      { id: 'us1',  title: 'The Daily',               creator: 'Michael Barbaro', studio: 'The New York Times', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', rank: 1 },
      { id: 'us2',  title: 'Up First',                creator: 'NPR',             studio: 'NPR',                image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop', rank: 2 },
      { id: 'us3',  title: 'The Ezra Klein Show',     creator: 'Ezra Klein',      studio: 'New York Times',     image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop', rank: 3 },
      { id: 'uk1',  title: 'The News Agents',         creator: 'Emily Maitlis',   studio: 'Global',             image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop', rank: 4 },
      { id: 'in1',  title: 'The Seen and the Unseen', creator: 'Amit Varma',      studio: 'IVM Podcasts',       image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', rank: 5 },
    ],
  },
  '7': { // Science
    name: 'Education & Science', 
    icon: 'school', 
    color: '#2C4A7C',
    podcasts: [
      { id: 'edu1', title: 'Radiolab',              creator: 'WNYC Studios', studio: 'WNYC',         image: 'https://images.unsplash.com/photo-1532094349884-543559c0853b?w=200&h=200&fit=crop', rank: 1 },
      { id: 'edu2', title: 'Stuff You Should Know', creator: 'Josh Clark',   studio: 'iHeart Media', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop', rank: 2 },
      { id: 'edu3', title: 'TED Talks Daily',       creator: 'TED',          studio: 'TED',          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
  '8': { // History
    name: 'History', 
    icon: 'time', 
    color: '#5C4033',
    podcasts: [
      { id: 'hi1',  title: 'Hardcore History',    creator: 'Dan Carlin', studio: 'Dan Carlin', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop', rank: 1 },
      { id: 'hi2',  title: 'Revolutions',         creator: 'Mike Duncan', studio: 'Mike Duncan',image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=200&h=200&fit=crop', rank: 2 },
      { id: 'hi3',  title: 'The History of Rome', creator: 'Mike Duncan', studio: 'Mike Duncan',image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
  '9': { // Education
    name: 'Education', 
    icon: 'school', 
    color: '#2C4A7C',
    podcasts: [
      { id: 'edu1', title: 'Radiolab',              creator: 'WNYC Studios', studio: 'WNYC',         image: 'https://images.unsplash.com/photo-1532094349884-543559c0853b?w=200&h=200&fit=crop', rank: 1 },
      { id: 'edu2', title: 'Stuff You Should Know', creator: 'Josh Clark',   studio: 'iHeart Media', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop', rank: 2 },
      { id: 'edu3', title: 'TED Talks Daily',       creator: 'TED',          studio: 'TED',          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
  '10': { // Sports
    name: 'Sports & Recreation', 
    icon: 'football', 
    color: '#7B3F00',
    podcasts: [
      { id: 'sp1',  title: 'The Bill Simmons Podcast', creator: 'Bill Simmons',   studio: 'The Ringer', image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=200&h=200&fit=crop', rank: 1 },
      { id: 'sp2',  title: 'Pardon My Take',           creator: 'Barstool Sports',studio: 'Barstool',   image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=200&h=200&fit=crop', rank: 2 },
      { id: 'sp3',  title: 'The Athletic Football',    creator: 'The Athletic',   studio: 'The Athletic',image:'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=200&h=200&fit=crop', rank: 3 },
    ],
  },
};

// ── Animated podcast row ──────────────────────────────────────────────────────
const PodcastRow = ({
  podcast, index, onPress,
}: { podcast: Podcast; index: number; onPress: () => void }) => {
  const rowFade  = useRef(new Animated.Value(0)).current;
  const rowY     = useRef(new Animated.Value(20)).current;
  const scale    = useRef(new Animated.Value(1)).current;
  const glow     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rowFade, {
        toValue: 1, duration: 350, delay: index * 55,
        easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      Animated.timing(rowY, {
        toValue: 0, duration: 350, delay: index * 55,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(220,80,80,0.18)', 'rgba(220,80,80,0.7)'],
  });

  return (
    <Animated.View style={{ opacity: rowFade, transform: [{ translateY: rowY }, { scale }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <Animated.View style={[s.podcastItem, { borderColor }]}>
          <Text style={s.rankNumber}>{podcast.rank}</Text>
          <Image source={{ uri: podcast.image }} style={s.podcastImage} resizeMode="cover" />
          <View style={s.podcastInfo}>
            <Text style={s.podcastTitle}>{podcast.title}</Text>
            <Text style={s.podcastCreator}>{podcast.creator} · {podcast.studio}</Text>
          </View>
          <TouchableOpacity style={s.playButton} onPress={onPress}>
            <Ionicons name="play-circle" size={34} color="#E05555" />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const genre   = genrePodcastData[id as string];

  // ── Entrance animations ───────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerY     = useRef(new Animated.Value(-20)).current;
  const bannerScale = useRef(new Animated.Value(0.88)).current;
  const bannerFade  = useRef(new Animated.Value(0)).current;
  const labelFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      // Header slides down
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 320, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(headerY,    { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Banner springs in
      Animated.parallel([
        Animated.spring(bannerScale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 8 }),
        Animated.timing(bannerFade,  { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      // Section label fades
      Animated.timing(labelFade, { toValue: 1, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/podcasts/discover');
  };

  const handlePodcastPress = (podcast: Podcast) => {
    router.push({
      pathname: '/podcasts/player',
      params: {
        podcastId: podcast.id,
        podcastTitle: podcast.title,
        podcastCreator: podcast.creator,
        podcastImage: podcast.image,
        fromCountryId: '',
        fromCategoryId: id,
      },
    });
  };

  if (!genre) {
    return (
      <View style={s.container}>
        <LinearGradient colors={['#2a0000', '#000000']} style={s.bg} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="sad-outline" size={56} color="#E05555" />
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 12 }}>Genre not found</Text>
          <TouchableOpacity onPress={handleBack} style={s.backFallback}>
            <Text style={{ color: '#E05555' }}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={s.bg} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
      />

      <SafeAreaView style={s.safeArea}>

        {/* Header — slides down from top */}
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerY }] }}>
          <View style={s.header}>
            <TouchableOpacity onPress={handleBack} style={s.backButton}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>{genre.name}</Text>
            <View style={s.headerRight} />
          </View>
        </Animated.View>

        {/* Banner — springs in */}
        <Animated.View style={{ opacity: bannerFade, transform: [{ scale: bannerScale }] }}>
          <View style={s.banner}>
            <View style={[s.bannerIcon, { backgroundColor: `${genre.color}33` }]}>
              <Ionicons name={genre.icon as any} size={32} color={genre.color} />
            </View>
            <View style={s.bannerInfo}>
              <Text style={s.bannerTitle}>{genre.name}</Text>
              <Text style={s.bannerCount}>{genre.podcasts.length} Podcasts</Text>
            </View>
          </View>
        </Animated.View>

        {/* List — staggered per row */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

          <Animated.Text style={[s.sectionLabel, { opacity: labelFade }]}>
            All Podcasts
          </Animated.Text>

          {genre.podcasts.map((podcast, index) => (
            <PodcastRow
              key={podcast.id}
              podcast={podcast}
              index={index}
              onPress={() => handlePodcastPress(podcast)}
            />
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0a0000' },
  bg:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safeArea:    { flex: 1, zIndex: 5, width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
  },
  backButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '700', color: '#FFFFFF',
    letterSpacing: 0.4, flex: 1, textAlign: 'center',
  },
  headerRight:  { width: 42, height: 42 },
  backFallback: { marginTop: 20, padding: 12 },

  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 20, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(220,80,80,0.2)', gap: 14,
  },
  bannerIcon:  { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  bannerInfo:  { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  bannerCount: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },

  // List
  scrollContent: { paddingHorizontal: 16, paddingBottom: 80 },
  sectionLabel: {
    fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.4)',
    marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  podcastItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1,
  },
  rankNumber:    { width: 28, fontSize: 15, fontWeight: '700', color: '#E05555', textAlign: 'center', marginRight: 4 },
  podcastImage:  { width: 52, height: 52, borderRadius: 10, marginRight: 12, backgroundColor: '#2A0808' },
  podcastInfo:   { flex: 1 },
  podcastTitle:  { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 3 },
  podcastCreator:{ fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  playButton:    { padding: 6 },
});