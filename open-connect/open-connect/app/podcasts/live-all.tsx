import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Image, SafeAreaView,
    ScrollView, StatusBar, Text,
    TouchableOpacity, View,
} from 'react-native';

const ALL_LIVE_PODCASTS = [
  {
    id: 'lv1', title: 'Tech Talk Daily', creator: 'Lex Fridman',
    listeners: '2.4k', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    category: 'Technology', duration: 'Live • 1h 24m in',
    description: 'Deep dive into the latest in AI, robotics, and the future of human civilization.',
    tags: ['AI', 'Tech', 'Science'],
  },
  {
    id: 'lv2', title: 'Mind & Body', creator: 'Andrew Huberman',
    listeners: '1.8k', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop',
    category: 'Wellness', duration: 'Live • 45m in',
    description: 'Science-based tools for everyday life — sleep, focus, stress, and performance.',
    tags: ['Health', 'Neuroscience', 'Wellness'],
  },
  {
    id: 'lv3', title: 'Morning Briefing', creator: 'Michael Barbaro',
    listeners: '3.1k', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop',
    category: 'News', duration: 'Live • 22m in',
    description: 'What you need to know to start your day. The biggest stories explained.',
    tags: ['News', 'Politics', 'World'],
  },
  {
    id: 'lv4', title: 'Startup Stories', creator: 'Tim Ferriss',
    listeners: '956', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
    category: 'Business', duration: 'Live • 2h 5m in',
    description: 'World-class performers share their strategies, tools, and morning routines.',
    tags: ['Business', 'Entrepreneurship', 'Productivity'],
  },
  {
    id: 'lv5', title: 'Serial Investigations', creator: 'Sarah Koenig',
    listeners: '4.2k', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=600&h=400&fit=crop',
    category: 'True Crime', duration: 'Live • 33m in',
    description: 'A real-life mystery told week by week. Journalism at its most gripping.',
    tags: ['Crime', 'Mystery', 'Journalism'],
  },
  {
    id: 'lv6', title: 'The Learning Curve', creator: 'Guy Raz',
    listeners: '1.2k', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
    category: 'Education', duration: 'Live • 58m in',
    description: 'How I built this — stories behind the most successful companies and movements.',
    tags: ['Education', 'Stories', 'Inspiration'],
  },
];

// ── Single Card ───────────────────────────────────────────────────────────────
const LiveCard = ({ item, index, onPress }: { item: typeof ALL_LIVE_PODCASTS[0]; index: number; onPress: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
const [notifOn,     setNotifOn]     = useState(false);
const [shareActive, setShareActive] = useState(false);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={C.card} onPress={onPress} activeOpacity={0.9}>
        {/* Cover Image */}
        <View style={C.imageWrapper}>
          <Image source={{ uri: item.image }} style={C.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={C.imageGradient}
          />
          {/* Live badge on image */}
          <View style={C.liveBadge}>
            <View style={C.liveDot} />
            <Text style={C.liveText}>LIVE</Text>
          </View>
          {/* Duration on image */}
          <Text style={C.durationText}>{item.duration}</Text>
        </View>

        {/* Card Body */}
        <View style={C.body}>
          <View style={C.topRow}>
            <View style={C.categoryPill}>
              <Text style={C.categoryText}>{item.category}</Text>
            </View>
            <View style={C.listenerRow}>
              <Ionicons name="headset-outline" size={12} color="rgba(255,255,255,0.45)" />
              <Text style={C.listenerText}>{item.listeners} listening</Text>
            </View>
          </View>

          <Text style={C.title}>{item.title}</Text>
          <Text style={C.creator}>{item.creator}</Text>
          <Text style={C.description} numberOfLines={2}>{item.description}</Text>

          {/* Tags */}
          <View style={C.tagsRow}>
            {item.tags.map(tag => (
              <View key={tag} style={C.tag}>
                <Text style={C.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={C.actionsRow}>
  <TouchableOpacity style={C.joinBtn} onPress={onPress} activeOpacity={0.85}>
    <LinearGradient colors={['#CC0000', '#8B0000']} style={C.joinGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Ionicons name="radio-outline" size={14} color="#fff" />
      <Text style={C.joinText}>Join Live</Text>
    </LinearGradient>
  </TouchableOpacity>
  <TouchableOpacity
    style={[C.iconActionBtn, notifOn && C.iconActionBtnActive]}
    onPress={() => setNotifOn(p => !p)}
    activeOpacity={0.8}
  >
    <Ionicons name={notifOn ? 'notifications' : 'notifications-outline'} size={16} color={notifOn ? '#fff' : 'rgba(255,255,255,0.6)'} />
  </TouchableOpacity>
  <TouchableOpacity
    style={[C.iconActionBtn, shareActive && C.iconActionBtnActive]}
    onPress={() => setShareActive(p => !p)}
    activeOpacity={0.8}
  >
    <Ionicons name="share-outline" size={16} color={shareActive ? '#fff' : 'rgba(255,255,255,0.6)'} />
  </TouchableOpacity>
  <TouchableOpacity style={C.iconActionBtn} activeOpacity={0.8}>
    <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.6)" />
  </TouchableOpacity>
</View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LiveAllScreen() {
  const handleJoin = (item: typeof ALL_LIVE_PODCASTS[0]) => {
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

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={S.bg}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <SafeAreaView style={S.safe}>
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={S.headerTitle}>Live Now</Text>
            <Text style={S.headerSub}>{ALL_LIVE_PODCASTS.length} podcasts streaming</Text>
          </View>
          <View style={S.livePill}>
            <View style={S.livePillDot} />
            <Text style={S.livePillText}>LIVE</Text>
          </View>
        </View>

        {/* List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.scrollContent}
        >
          {ALL_LIVE_PODCASTS.map((item, index) => (
            <LiveCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleJoin(item)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Screen Styles ─────────────────────────────────────────────────────────────
import { StyleSheet } from 'react-native';

const S: Record<string, any> = {
  container:    { flex: 1 },
  bg:           { ...StyleSheet.absoluteFillObject },
  safe:         { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, marginTop: 30 
   },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  livePill:     { marginLeft: 'auto' as any, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#CC0000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  livePillDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  livePillText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  scrollContent:{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
};

// ── Card Styles ───────────────────────────────────────────────────────────────
const C: Record<string, any> = {
  card:          { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(220,60,60,0.2)' },
  imageWrapper:  { position: 'relative' },
  image:         { width: '100%', height: 140 },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  liveBadge:     { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#CC0000', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText:      { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  durationText:  { position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  body:          { padding: 10 },
  topRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryPill:  { backgroundColor: 'rgba(204,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(204,0,0,0.4)' },
  categoryText:  { fontSize: 11, color: '#FF6B6B', fontWeight: '600' },
  listenerRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listenerText:  { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  title:         { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 },
  creator:       { fontSize: 13, color: '#E05555', marginBottom: 6, fontWeight: '500' },
  description:   { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17, marginBottom: 8 },
  tagsRow:       { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  tag:           { backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText:       { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  actionsRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinBtn:       { flex: 1, borderRadius: 12, overflow: 'hidden' },
  joinGradient:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9 },
  joinText:      { fontSize: 13, fontWeight: '700', color: '#fff' },
  iconActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  iconActionBtnActive: {
  backgroundColor: 'rgba(204,0,0,0.35)',
  borderWidth: 1,
  borderColor: '#CC0000',
},
};