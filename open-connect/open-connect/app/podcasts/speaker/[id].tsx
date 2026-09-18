import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Interfaces ────────────────────────────────────────
interface SpeakerPodcast {
  id: string;
  title: string;
  category: string;
  image: string;
  duration: string;
  rank: number;
}

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  totalEpisodes: number;
  podcasts: SpeakerPodcast[];
}

// ── Speaker database ──────────────────────────────────
// Each key matches the id passed from discover.tsx popularSpeakers
const speakerDatabase: Record<string, Speaker> = {
  sp1: {
    id: 'sp1',
    name: 'Lex Fridman',
    role: 'AI Researcher · MIT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    bio: 'Research scientist at MIT, host of the Lex Fridman Podcast covering AI, science, technology, history and the nature of intelligence.',
    totalEpisodes: 400,
    podcasts: [
      { id: 'us12', title: 'Lex Fridman Podcast',        category: 'Technology', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', duration: '3:24 hr', rank: 1 },
      { id: 'lf2',  title: '#400 - Future of AI',         category: 'Technology', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop', duration: '3:10 hr', rank: 2 },
      { id: 'lf3',  title: '#399 - Human Consciousness',  category: 'Science',    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop', duration: '2:45 hr', rank: 3 },
      { id: 'lf4',  title: '#398 - War & Peace',          category: 'History',    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop', duration: '4:02 hr', rank: 4 },
      { id: 'lf5',  title: '#397 - Elon Musk Interview',  category: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', duration: '2:30 hr', rank: 5 },
    ],
  },
  sp2: {
    id: 'sp2',
    name: 'Andrew Huberman',
    role: 'Neuroscientist · Stanford',
    avatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop',
    bio: 'Professor of Neurobiology at Stanford School of Medicine. Shares science-based tools for everyday life on the Huberman Lab podcast.',
    totalEpisodes: 180,
    podcasts: [
      { id: 'us15', title: 'Huberman Lab',                  category: 'Health',   image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', duration: '1:52 hr', rank: 1 },
      { id: 'ah2',  title: 'How to Optimize Your Sleep',    category: 'Health',   image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop', duration: '1:45 hr', rank: 2 },
      { id: 'ah3',  title: 'Cold Exposure & Mental Health', category: 'Wellness', image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300&h=300&fit=crop', duration: '1:30 hr', rank: 3 },
      { id: 'ah4',  title: 'The Science of Focus',          category: 'Science',  image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop', duration: '2:10 hr', rank: 4 },
      { id: 'ah5',  title: 'Controlling Stress & Anxiety',  category: 'Health',   image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', duration: '1:55 hr', rank: 5 },
    ],
  },
  sp3: {
    id: 'sp3',
    name: 'Sarah Koenig',
    role: 'Journalist · This American Life',
    avatar: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=300&h=300&fit=crop',
    bio: 'Award-winning journalist and creator of Serial, the true crime podcast that completely changed the podcasting landscape.',
    totalEpisodes: 60,
    podcasts: [
      { id: 'us4', title: 'Serial — Season 1',      category: 'True Crime',  image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop', duration: '52:18', rank: 1 },
      { id: 'sk2', title: 'Serial — Season 2',      category: 'True Crime',  image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop', duration: '48:30', rank: 2 },
      { id: 'sk3', title: 'Serial — Season 3',      category: 'True Crime',  image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop', duration: '55:12', rank: 3 },
      { id: 'sk4', title: 'S-Town',                 category: 'Documentary', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop', duration: '1:02 hr', rank: 4 },
    ],
  },
  sp4: {
    id: 'sp4',
    name: 'Guy Raz',
    role: 'Host · NPR',
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop',
    bio: 'One of the most popular podcast hosts in the world. Creator of How I Built This, Wow in the World, and TED Radio Hour on NPR.',
    totalEpisodes: 500,
    podcasts: [
      { id: 'us7', title: 'How I Built This',             category: 'Business',   image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', duration: '58:00', rank: 1 },
      { id: 'gr2', title: 'TED Radio Hour',               category: 'Education',  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop', duration: '52:00', rank: 2 },
      { id: 'gr3', title: 'Wow in the World',             category: 'Education',  image: 'https://images.unsplash.com/photo-1532094349884-543559c0853b?w=200&h=200&fit=crop', duration: '30:00', rank: 3 },
      { id: 'gr4', title: 'How I Built This: Resilience', category: 'Business',   image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', duration: '44:00', rank: 4 },
    ],
  },
  sp5: {
    id: 'sp5',
    name: 'Michael Barbaro',
    role: 'Host · The New York Times',
    avatar: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=300&fit=crop',
    bio: 'Host of The Daily, the most listened-to news podcast in the world produced by The New York Times, covering today\'s biggest stories.',
    totalEpisodes: 1800,
    podcasts: [
      { id: 'us1', title: 'The Daily',                   category: 'News',     image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop', duration: '25:00', rank: 1 },
      { id: 'mb2', title: 'The Daily — Special Edition', category: 'News',     image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop', duration: '42:00', rank: 2 },
      { id: 'mb3', title: 'The Run-Up',                  category: 'Politics', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop', duration: '38:00', rank: 3 },
    ],
  },
  sp6: {
    id: 'sp6',
    name: 'Tim Ferriss',
    role: 'Author · Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    bio: 'Author of The 4-Hour Workweek. Host of The Tim Ferriss Show, named best podcast of the year by Apple in 2015.',
    totalEpisodes: 700,
    podcasts: [
      { id: 'us8', title: 'The Tim Ferriss Show',   category: 'Business',  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', duration: '1:30 hr', rank: 1 },
      { id: 'tf2', title: 'Tools of Titans',        category: 'Self Help', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', duration: '45:00',  rank: 2 },
      { id: 'tf3', title: 'Tribe of Mentors',       category: 'Business',  image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop', duration: '55:00',  rank: 3 },
      { id: 'tf4', title: 'Fear-Setting Exercise',  category: 'Wellness',  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', duration: '20:00',  rank: 4 },
    ],
  },
};

// ── Screen ────────────────────────────────────────────
export default function SpeakerScreen() {
  // ✅ useLocalSearchParams reads 'id' param set by discover.tsx
  const { id } = useLocalSearchParams<{ id: string }>();
// To:
const [isFollowing,  setIsFollowing]  = useState(false);
const [notifEnabled, setNotifEnabled] = useState(false);
  const speaker = speakerDatabase[id];

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/podcasts/discover');
  };

  const handlePodcastPress = (podcast: SpeakerPodcast) => {
    router.push({
      pathname: '/podcasts/player',
      params: {
        podcastId: podcast.id,
        podcastTitle: podcast.title,
        podcastCreator: speaker.name,
        podcastImage: podcast.image,
        fromCountryId: '',
        fromCategoryId: '',
      },
    });
  };

  // ── Not found ─────────────────────────────────────────
  if (!speaker) {
    return (
      <View style={s.container}>
        <LinearGradient colors={['#2a0000', '#000000']} style={s.bg} />
        <SafeAreaView style={s.centered}>
          <Ionicons name="person-outline" size={56} color="#E05555" />
          <Text style={s.notFoundText}>Speaker not found</Text>
          <Text style={s.notFoundSub}>id: {id}</Text>
          <TouchableOpacity onPress={handleBack} style={s.goBackBtn}>
            <Text style={s.goBackText}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={s.bg}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <SafeAreaView style={s.safeArea}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleBack} style={s.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Speaker</Text>
          <View style={s.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

          {/* ── Profile card ─────────────────────────── */}
          <View style={s.profileCard}>
  <Image source={{ uri: speaker.avatar }} style={s.avatar} resizeMode="cover" />
  <View style={s.profileInfo}>
    <Text style={s.speakerName}>{speaker.name}</Text>
    <Text style={s.speakerRole}>{speaker.role}</Text>
    <View style={s.statRow}>
      <View style={s.statItem}>
        <Text style={s.statNumber}>{speaker.totalEpisodes}+</Text>
        <Text style={s.statLabel}>Episodes</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statNumber}>{speaker.podcasts.length}</Text>
        <Text style={s.statLabel}>Shows</Text>
      </View>
    </View>

    {/* ── Action buttons ── */}
    <View style={s.actionRow}>
      <TouchableOpacity
        style={[s.followBtn, isFollowing && s.followBtnActive]}
        onPress={() => setIsFollowing(p => !p)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isFollowing ? 'checkmark' : 'add'}
          size={14}
          color={isFollowing ? '#fff' : '#E05555'}
        />
        <Text style={[s.followBtnText, isFollowing && s.followBtnTextActive]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.notifBtn, notifEnabled && s.notifBtnActive]}
        onPress={() => setNotifEnabled(p => !p)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={notifEnabled ? 'notifications' : 'notifications-outline'}
          size={16}
          color={notifEnabled ? '#fff' : 'rgba(255,255,255,0.6)'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={s.shareBtn} activeOpacity={0.85}>
        <Ionicons name="share-outline" size={16} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </View>
  </View>
</View>
          {/* ── Bio ──────────────────────────────────── */}
          <View style={s.bioCard}>
            <Text style={s.bioText}>{speaker.bio}</Text>
          </View>

          {/* ── Podcast list ─────────────────────────── */}
          <Text style={s.sectionLabel}>
            Podcasts by {speaker.name.split(' ')[0]}
          </Text>

          {speaker.podcasts.map(podcast => (
            <TouchableOpacity
              key={podcast.id}
              style={s.podcastItem}
              onPress={() => handlePodcastPress(podcast)}
              activeOpacity={0.8}
            >
              <Text style={s.rankNumber}>{podcast.rank}</Text>
              <Image
                source={{ uri: podcast.image }}
                style={s.podcastImage}
                resizeMode="cover"
              />
              <View style={s.podcastInfo}>
                <Text style={s.podcastTitle}>{podcast.title}</Text>
                <View style={s.podcastMeta}>
                  <View style={s.categoryPill}>
                    <Text style={s.categoryPillText}>{podcast.category}</Text>
                  </View>
                  <Text style={s.podcastDuration}>{podcast.duration}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={s.playButton}
                onPress={() => handlePodcastPress(podcast)}
              >
                <Ionicons name="play-circle" size={34} color="#E05555" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0a0000' },
  bg:           { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safeArea:     { flex: 1, zIndex: 5, width: '100%', maxWidth: 800, alignSelf: 'center' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },

  notFoundText: { color: '#fff', fontSize: 16, marginTop: 12 },
  notFoundSub:  { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
  goBackBtn:    { marginTop: 20, padding: 12 },
  goBackText:   { color: '#E05555', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4 },
  headerRight:  { width: 42, height: 42 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 80 },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.2)',
    gap: 14, alignItems: 'center',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#2A0808',
    borderWidth: 2, borderColor: 'rgba(220,60,60,0.4)',
  },
  profileInfo:  { flex: 1 },
  speakerName:  { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  speakerRole:  { fontSize: 13, color: '#E05555', marginBottom: 12, fontWeight: '500' },
  statRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statItem:     { alignItems: 'center' },
  statNumber:   { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  statLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statDivider:  { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
actionRow: {
  flexDirection: 'row', alignItems: 'center',
  gap: 8, marginTop: 12,
},
followBtn: {
  flexDirection: 'row', alignItems: 'center', gap: 5,
  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  backgroundColor: 'rgba(224,85,85,0.12)',
  borderWidth: 1, borderColor: 'rgba(220,80,80,0.4)',
},
followBtnActive: {
  backgroundColor: '#CC0000',
  borderColor: '#CC0000',
},
followBtnText: {
  fontSize: 12, fontWeight: '700', color: '#E05555',
},
followBtnTextActive: {
  color: '#fff',
},
notifBtn: {
  width: 36, height: 36, borderRadius: 18,
  justifyContent: 'center', alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
},
notifBtnActive: {
  backgroundColor: 'rgba(204,0,0,0.35)',
  borderColor: '#CC0000',
},
shareBtn: {
  width: 36, height: 36, borderRadius: 18,
  justifyContent: 'center', alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
},
  // Bio
  bioCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.12)',
  },
  bioText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 20 },

  // Podcast list
  sectionLabel: {
    fontSize: 14, fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  podcastItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.18)',
  },
  rankNumber: {
    width: 28, fontSize: 15, fontWeight: '700',
    color: '#E05555', textAlign: 'center', marginRight: 4,
  },
  podcastImage: {
    width: 52, height: 52, borderRadius: 10,
    marginRight: 12, backgroundColor: '#2A0808',
  },
  podcastInfo:  { flex: 1 },
  podcastTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  podcastMeta:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryPill: {
    backgroundColor: 'rgba(220,60,60,0.2)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.3)',
  },
  categoryPillText: { fontSize: 10, color: '#E05555', fontWeight: '600' },
  podcastDuration:  { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  playButton:       { padding: 6 },
});