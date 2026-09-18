import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayer } from '../../src/context/PlayerContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { styles as playerStyles } from '../../src/styles/player.styles';

const { width } = Dimensions.get('window');

const generateWaveform = () => {
  const bars: number[] = [];
  for (let i = 0; i < 35; i++) bars.push(Math.floor(Math.random() * 24) + 8);
  return bars;
};
const waveform = generateWaveform();

const LIVE_QUEUE = [
  { id: 'lv1', title: 'Tech Talk Daily', creator: 'Lex Fridman', listeners: '2.4k', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' },
  { id: 'lv2', title: 'Mind & Body', creator: 'Andrew Huberman', listeners: '1.8k', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop' },
  { id: 'lv3', title: 'Morning Briefing', creator: 'Michael Barbaro', listeners: '3.1k', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop' },
  { id: 'lv4', title: 'Startup Stories', creator: 'Tim Ferriss', listeners: '956', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop' },
  { id: 'lv5', title: 'Serial Investigations', creator: 'Sarah Koenig', listeners: '4.2k', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=600&h=400&fit=crop' },
  { id: 'lv6', title: 'The Learning Curve', creator: 'Guy Raz', listeners: '1.2k', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop' },
];

const INITIAL_MESSAGES = [
  { id: 'm1', user: 'alex_k',      text: 'This is so insightful 🔥',          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop' },
  { id: 'm2', user: 'priya_s',     text: 'Been waiting for this episode!',     avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop' },
  { id: 'm3', user: 'techguy99',   text: 'Great point about neural networks',  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop' },
  { id: 'm4', user: 'sara_m',      text: 'Love the energy today ❤️',           avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' },
  { id: 'm5', user: 'ravi_d',      text: 'Can you talk more about AGI?',       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
];

const BOT_MESSAGES = [
  'Amazing podcast! 👏', 'First time here, loving it!', 'So true!!',
  'This changed my perspective', '🔥🔥🔥', 'Can\'t believe I found this',
  'Taking notes rn 📝', 'Subscribed!', 'Mind blown 🤯', '❤️❤️',
];
const BOT_USERS = ['user_231', 'listener_7', 'nova_k', 'deep_t', 'anon_99', 'mike_r', 'zara_p'];
const BOT_AVATARS = [
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop',
];

interface ChatMessage {
  id: string; user: string; text: string; avatar: string; isOwn?: boolean;
}

interface FloatingReaction { id: string; emoji: string; x: number; anim: Animated.Value; }

export default function LivePlayerScreen() {
  const params = useLocalSearchParams<{
    podcastId: string; podcastTitle: string;
    podcastCreator: string; podcastImage: string; listeners: string;
  }>();
  const {
    currentPodcast,
    isPlaying,
    progress,
    duration,
    playPodcast,
    pausePodcast,
    resumePodcast,
    formatTime,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  const parseListeners = (value?: string) => {
    const raw = value?.toLowerCase?.() ?? '';
    const num = parseFloat(raw.replace(/[^0-9.]/g, '') || '0');
    if (raw.includes('k')) return Math.round(num * 1000);
    if (raw.includes('m')) return Math.round(num * 1000000);
    return Math.round(num || 0);
  };

  useEffect(() => {
    if (params.podcastId) {
      playPodcast({
        id: params.podcastId,
        title: params.podcastTitle || 'Live Podcast',
        creator: params.podcastCreator || 'Unknown Host',
        image: params.podcastImage,
      }, 3600);
    }
  }, [params.podcastCreator, params.podcastId, params.podcastImage, params.podcastTitle, playPodcast]);

  const [messages,   setMessages]   = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText,  setInputText]  = useState('');
  const [listenerCount, setListenerCount] = useState(() => {
    const parsed = parseListeners(params.listeners);
    return parsed > 0 ? parsed : 1000;
  });
  const [reactions,  setReactions]  = useState<FloatingReaction[]>([]);
  const [isRaised,   setIsRaised]   = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPodcastMenu, setShowPodcastMenu] = useState(false);

  const flatListRef  = useRef<FlatList>(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const msgCounter   = useRef(INITIAL_MESSAGES.length);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const parsed = parseListeners(params.listeners);
    if (parsed > 0) setListenerCount(parsed);
  }, [params.listeners]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMsg: ChatMessage = {
        id:     `m${++msgCounter.current}`,
        user:   BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)],
        text:   BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
        avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      };
      setMessages(prev => [...prev.slice(-40), newMsg]);
      setListenerCount(prev => prev + Math.floor(Math.random() * 3 - 1));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: `m${++msgCounter.current}`,
      user: 'You', text: inputText.trim(),
      avatar: '', isOwn: true,
    };
    setMessages(prev => [...prev, msg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendReaction = (emoji: string) => {
    const id   = `r${Date.now()}`;
    const x    = Math.random() * 60 + 10;
    const anim = new Animated.Value(0);
    setReactions(prev => [...prev, { id, emoji, x, anim }]);
    Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }).start(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[MC.row, item.isOwn && MC.rowOwn]}>
      {!item.isOwn && (
        item.avatar
          ? <Image source={{ uri: item.avatar }} style={MC.avatar} />
          : <View style={[MC.avatar, MC.avatarPlaceholder]} />
      )}
      <View style={[MC.bubble, item.isOwn && MC.bubbleOwn]}>
        {!item.isOwn && <Text style={MC.username}>{item.user}</Text>}
        <Text style={[MC.text, item.isOwn && MC.textOwn]}>{item.text}</Text>
      </View>
    </View>
  );

  const podcastImage = useMemo(
    () =>
      params.podcastImage ||
      currentPodcast?.image ||
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop',
    [currentPodcast?.image, params.podcastImage]
  );

  const title = params.podcastTitle || currentPodcast?.title || 'Live Podcast';
  const creator = params.podcastCreator || currentPodcast?.creator || 'Unknown Host';

  const totalSecs = duration > 0 ? duration : 3600;
  const playedBars = totalSecs > 0 ? Math.floor((progress / totalSecs) * waveform.length) : 0;
  const remaining = Math.max(totalSecs - progress, 0);
  const TAB_WIDTH = width - 32;

  const topBg = isDarkMode ? '#1A0505' : '#F5F0F0';
  const topIcon = isDarkMode ? '#FFFFFF' : '#1A0505';
  const topBtnBg = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const topTitle = isDarkMode ? '#FFFFFF' : '#1A0505';
  const topSub = isDarkMode ? 'rgba(255,255,255,0.65)' : '#8B3A3A';
  const cardBg = isDarkMode ? '#130404' : '#FFFFFF';
  const timeColor = isDarkMode ? 'rgba(255,255,255,0.55)' : '#999';
  const inactiveWave = isDarkMode ? 'rgba(255,255,255,0.18)' : '#E0D0D0';
  const controlAccent = isDarkMode ? 'rgba(255,255,255,0.65)' : '#8B3A3A';

  const returnHref = useMemo(() => {
    const id = encodeURIComponent(String(params.podcastId ?? ''));
    const t = encodeURIComponent(String(title ?? ''));
    const c = encodeURIComponent(String(creator ?? ''));
    const img = encodeURIComponent(String(podcastImage ?? ''));
    const listeners = encodeURIComponent(String(params.listeners ?? ''));
    return `/podcasts/live-player?podcastId=${id}&podcastTitle=${t}&podcastCreator=${c}&podcastImage=${img}&listeners=${listeners}`;
  }, [creator, params.listeners, params.podcastId, podcastImage, title]);

  const currentLiveIndex = useMemo(() => {
    const idx = LIVE_QUEUE.findIndex(p => p.id === params.podcastId);
    return idx >= 0 ? idx : 0;
  }, [params.podcastId]);

  const goToLive = (direction: 'prev' | 'next') => {
    if (LIVE_QUEUE.length === 0) return;
    const delta = direction === 'next' ? 1 : -1;
    const nextIndex = (currentLiveIndex + delta + LIVE_QUEUE.length) % LIVE_QUEUE.length;
    const next = LIVE_QUEUE[nextIndex];
    playPodcast(
      {
        id: next.id,
        title: next.title,
        creator: next.creator,
        image: next.image,
      },
      3600
    );
    setListenerCount(parseListeners(next.listeners) || 1000);
    router.replace({
      pathname: '/podcasts/live-player',
      params: {
        podcastId: next.id,
        podcastTitle: next.title,
        podcastCreator: next.creator,
        podcastImage: next.image,
        listeners: next.listeners,
      },
    });
  };

  const handlePlayPause = () => {
    if (!currentPodcast) {
      if (params.podcastId) {
        playPodcast(
          {
            id: params.podcastId,
            title,
            creator,
            image: podcastImage,
          },
          3600
        );
      }
      return;
    }
    if (isPlaying) pausePodcast();
    else resumePodcast();
  };

  const handleBackward = () => goToLive('prev');
  const handleForward = () => goToLive('next');

  return (
    <View style={S.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={topBg} />

      <View style={[playerStyles.topSection, { backgroundColor: topBg }]}>
        <SafeAreaView style={playerStyles.safeArea}>
          <View style={playerStyles.header}>
            <TouchableOpacity onPress={() => router.back()} style={[playerStyles.backButton, { backgroundColor: topBtnBg }]} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={22} color={topIcon} />
            </TouchableOpacity>
            <View style={S.livePill}>
              <View style={S.liveDot} />
              <Text style={S.liveText}>LIVE</Text>
              <Text style={S.liveMeta}>{listenerCount.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={[playerStyles.shareButton, { backgroundColor: topBtnBg }]} 
                activeOpacity={0.8}
                onPress={() => toggleFavorite({ id: params.podcastId, title, subtitle: `Podcast • ${creator}`, image: podcastImage, type: 'podcast', rawData: { id: params.podcastId, title, creator, image: podcastImage } })}
              >
                <Ionicons name={isFavorite(params.podcastId) ? "heart" : "heart-outline"} size={22} color={isFavorite(params.podcastId) ? "#EC4899" : topIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={[playerStyles.shareButton, { backgroundColor: topBtnBg }]} activeOpacity={0.8}>
                <Ionicons name="share-outline" size={22} color={topIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={S.podcastRow}>
            <View style={S.avatarWrapper}>
              <Animated.View style={[S.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <Image source={{ uri: podcastImage }} style={S.podcastAvatar} />
            </View>
            <View style={S.podcastMeta}>
              <Text style={[S.podcastTitle, { color: topTitle }]} numberOfLines={2}>{title}</Text>
              <Text style={[S.podcastCreator, { color: topSub }]} numberOfLines={1}>{creator}</Text>
            </View>
          </View>

          <View style={S.actionsRow}>
            <TouchableOpacity
              style={[
                S.followBtn,
                { borderColor: topIcon },
                isFollowing && S.followBtnActive,
                isFollowing && isDarkMode && { backgroundColor: '#FFFFFF' },
              ]}
              onPress={() => setIsFollowing(v => !v)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  S.followText,
                  { color: topIcon },
                  isFollowing && S.followTextActive,
                  isFollowing && isDarkMode && { color: '#1A0505' },
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.iconBtn, { backgroundColor: topBtnBg }, isNotified && S.iconBtnActive]}
              onPress={() => setIsNotified(v => !v)}
              activeOpacity={0.85}
            >
              <Ionicons name={isNotified ? 'notifications' : 'notifications-outline'} size={22} color={isNotified ? '#CC2222' : topIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[S.iconBtn, { backgroundColor: topBtnBg }]} activeOpacity={0.85}>
              <Ionicons name="settings-outline" size={22} color={topIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[S.iconBtn, { backgroundColor: topBtnBg }]} activeOpacity={0.85} onPress={() => setShowPodcastMenu(true)}>
              <Ionicons name="ellipsis-horizontal" size={22} color={topIcon} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              playerStyles.playerCard,
              {
                marginBottom: 12,
                marginHorizontal: 16,
                backgroundColor: cardBg,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(200,50,50,0.08)',
              },
            ]}
          >
            <View style={playerStyles.waveformContainer}>
              <View style={playerStyles.timeRow}>
                <Text style={[playerStyles.timeText, { color: timeColor }]}>{formatTime(progress)}</Text>
                <Text style={[playerStyles.timeText, { color: timeColor }]}>-{formatTime(remaining)}</Text>
              </View>
              <View style={[playerStyles.waveform, { width: TAB_WIDTH }]}>
                {waveform.map((barHeight, index) => {
                  const isActive = index < playedBars;
                  return (
                    <View
                      key={index}
                      style={[
                        playerStyles.waveformBar,
                        { height: barHeight, backgroundColor: isActive ? '#CC2222' : inactiveWave },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
            <View style={playerStyles.controlsRow}>
              <TouchableOpacity style={playerStyles.controlButton} activeOpacity={0.8}>
                <Ionicons name="repeat" size={20} color={controlAccent} />
              </TouchableOpacity>
              <TouchableOpacity style={playerStyles.controlButton} onPress={handleBackward} activeOpacity={0.8}>
                <Ionicons name="play-skip-back" size={22} color={topIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={playerStyles.playButton} onPress={handlePlayPause} activeOpacity={1}>
                <LinearGradient colors={['#CC0000', '#8B0000']} style={playerStyles.playButtonGradient}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={playerStyles.controlButton} onPress={handleForward} activeOpacity={0.8}>
                <Ionicons name="play-skip-forward" size={22} color={topIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={playerStyles.controlButton} onPress={() => setIsDarkMode(v => !v)} activeOpacity={0.8}>
                <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={20} color={controlAccent} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <Modal transparent animationType="fade" visible={showPodcastMenu} onRequestClose={() => setShowPodcastMenu(false)}>
        <TouchableOpacity style={SM.overlay} activeOpacity={1} onPress={() => setShowPodcastMenu(false)}>
          <View style={SM.sheet}>
            <TouchableOpacity
              style={SM.sheetItem}
              activeOpacity={0.85}
              onPress={() => {
                setShowPodcastMenu(false);
                router.push({
                  pathname: '/podcasts/report',
                  params: { podcastName: title, returnHref },
                });
              }}
            >
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
              <Text style={SM.sheetText}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[playerStyles.bottomSection, S.bottomSection]}>
        <View style={playerStyles.handleBarContainer}>
          <View style={playerStyles.handleBar} />
        </View>

        <View style={S.commentsHeader}>
          <Text style={S.commentsTitle}>Comments</Text>
          <View style={S.commentsMetaRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="rgba(255,255,255,0.45)" />
            <Text style={S.commentsMetaText}>{messages.length}</Text>
          </View>
        </View>

        <View style={S.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {reactions.map(r => (
            <Animated.Text
              key={r.id}
              style={[
                S.floatingReaction,
                {
                  left: `${r.x}%` as any,
                  opacity: r.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                  transform: [{ translateY: r.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }],
                },
              ]}
            >
              {r.emoji}
            </Animated.Text>
          ))}
        </View>

        <View style={S.reactionBar}>
          {['❤️', '🔥', '👏', '😂', '🤯'].map(emoji => (
            <TouchableOpacity key={emoji} onPress={() => sendReaction(emoji)} activeOpacity={0.7} style={S.reactionBtn}>
              <Text style={S.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[S.raiseHandBtn, isRaised && S.raiseHandActive]}
            onPress={() => setIsRaised(p => !p)}
            activeOpacity={0.8}
          >
            <Text style={S.raiseHandEmoji}>✋</Text>
            <Text style={S.raiseHandText}>{isRaised ? 'Raised' : 'Raise hand'}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={S.inputRow}>
            <TextInput
              style={S.input}
              placeholder="Say something..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[S.sendBtn, !inputText.trim() && S.sendBtnDisabled]}
              onPress={handleSend}
              activeOpacity={0.85}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const S: Record<string, any> = {
  container: { flex: 1, backgroundColor: '#1A0505' },
  bottomSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#CC0000', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },
  liveText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  liveMeta: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  podcastRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10, gap: 16 },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 2.5, borderColor: '#FF3B3B', opacity: 0.35 },
  podcastAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(204,0,0,0.35)' },
  podcastMeta: { flex: 1 },
  podcastTitle: { fontSize: 18, fontWeight: '700', color: '#1A0505', marginBottom: 4, lineHeight: 23 },
  podcastCreator: { fontSize: 13, color: '#8B3A3A', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 6, gap: 12 },
  followBtn: { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#1A0505', backgroundColor: 'transparent' },
  followBtnActive: { backgroundColor: '#1A0505' },
  followText: { fontSize: 14, fontWeight: '700', color: '#1A0505' },
  followTextActive: { color: '#FFFFFF' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  iconBtnActive: { backgroundColor: 'rgba(204, 34, 34, 0.1)' },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  commentsTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  commentsMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentsMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  chatContainer: { flex: 1, position: 'relative' },
  floatingReaction: { position: 'absolute', bottom: 0, fontSize: 26 },
  reactionBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 6 },
  reactionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  reactionEmoji: { fontSize: 18 },
  raiseHandBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' as any, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  raiseHandActive: { backgroundColor: 'rgba(204,0,0,0.35)', borderWidth: 1, borderColor: '#CC0000' },
  raiseHandEmoji: { fontSize: 16 },
  raiseHandText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  input: { flex: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, paddingHorizontal: 16, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CC0000', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(204,0,0,0.35)' },
};

const MC: Record<string, any> = {
  row:              { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  rowOwn:           { flexDirection: 'row-reverse' },
  avatar:           { width: 28, height: 28, borderRadius: 14 },
  avatarPlaceholder:{ backgroundColor: '#CC0000' },
  bubble:           { maxWidth: '75%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleOwn:        { backgroundColor: 'rgba(204,0,0,0.35)', borderBottomLeftRadius: 14, borderBottomRightRadius: 4 },
  username:         { fontSize: 11, fontWeight: '700', color: '#E05555', marginBottom: 2 },
  text:             { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  textOwn:          { color: '#fff' },
};

const SM: Record<string, any> = {
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1A0505', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderColor: 'rgba(220,60,60,0.3)' },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  sheetText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
};
