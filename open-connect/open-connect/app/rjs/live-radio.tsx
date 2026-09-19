import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RJS_LIVE_STATIONS, RJSStation } from '../../src/data/rjsLiveStations';
import { useRJLive } from '../../src/context/RJLiveContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  stationId: string;
  name?: string;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 44;

function formatListeners(count: number): string {
  if (count >= 100000) return `${(count / 100000).toFixed(1)}L`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// ─── Equalizer ────────────────────────────────────────────────────────────────

const EqualizerBars: React.FC<{ color: string; isActive: boolean }> = ({ color, isActive }) => {
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.7)).current;
  const bar3 = useRef(new Animated.Value(0.5)).current;
  const bar4 = useRef(new Animated.Value(0.9)).current;
  const bar5 = useRef(new Animated.Value(0.4)).current;
  const bars = [bar1, bar2, bar3, bar4, bar5];

  useEffect(() => {
    if (!isActive) {
      bars.forEach(bar =>
        Animated.timing(bar, { toValue: 0.15, duration: 300, useNativeDriver: false }).start()
      );
      return;
    }
    const animations = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: 0.4 + (i % 3) * 0.2, duration: 200 + i * 80, useNativeDriver: false }),
          Animated.timing(bar, { toValue: 0.1 + (i % 2) * 0.15, duration: 200 + i * 60, useNativeDriver: false }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [isActive]);

  return (
    <View style={styles.equalizerContainer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.equalizerBar,
            { backgroundColor: color, height: bar.interpolate({ inputRange: [0, 1], outputRange: [4, 28] }) },
          ]}
        />
      ))}
    </View>
  );
};

// ─── Live Badge ───────────────────────────────────────────────────────────────

const LiveBadge: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.liveBadgeWrapper}>
      <Animated.View style={[styles.livePulse, { backgroundColor: accentColor, transform: [{ scale: pulse }] }]} />
      <View style={[styles.liveBadge, { backgroundColor: accentColor }]}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
};

// ─── Heart Burst ──────────────────────────────────────────────────────────────

const HeartBurst: React.FC<{ visible: boolean; accentColor: string }> = ({ visible, accentColor }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      opacity.setValue(1);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, tension: 60, friction: 5 }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.heartBurst, { transform: [{ scale }], opacity }]}>
      <Ionicons name="heart" size={90} color={accentColor} />
    </Animated.View>
  );
};

// ─── Station Card ─────────────────────────────────────────────────────────────

interface StationCardProps {
  station: RJSStation;
  isActive: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  itemHeight: number;
  onPlayPause: () => void;
  onLike: () => void;
  onShare: () => void;
  onComment: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station, isActive, isPlaying, isLiked, itemHeight, onPlayPause, onLike, onShare, onComment,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const [showHeart, setShowHeart] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const lastTap = useRef<number>(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true, tension: 80, friction: 4 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
    ]).start();
  }, [isLiked]);

  const handleScreenTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      lastTap.current = 0;
      setShowHeart(false);
      setTimeout(() => setShowHeart(true), 10);
      onLike();
    } else {
      lastTap.current = now;
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      tapTimeout.current = setTimeout(() => {
        onPlayPause();
      }, DOUBLE_TAP_DELAY + 50);
    }
  }, [onPlayPause, onLike]);

  return (
    <View style={[styles.cardOuter, { height: itemHeight }]}>
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ImageBackground
          source={{ uri: station.thumbnail }}
          style={styles.thumbnail}
          imageStyle={styles.thumbnailImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.95)']}
            locations={[0.2, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            locations={[0, 0.35]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Full screen tap zone — single tap = play/pause, double tap = like */}
          <TouchableOpacity activeOpacity={1} style={styles.tapArea} onPress={handleScreenTap} />

          <HeartBurst visible={showHeart} accentColor={station.accentColor} />

          <View style={styles.topRow} pointerEvents="none">
            <LiveBadge accentColor={station.accentColor} />
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{station.frequency}</Text>
            </View>
          </View>

          {/* Right side actions */}
<View style={styles.rightActions}>

  {/* Like Button */}
  <View style={styles.actionItem}>
    <TouchableOpacity onPress={onLike} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.actionIconCircle,
          {
            backgroundColor: isLiked ? station.accentColor : 'rgba(255,255,255,0.15)',
            transform: [{ scale: likeScale }],
          },
        ]}
      >
        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
    <Text style={styles.actionLabel}>{isLiked ? 'Liked' : 'Like'}</Text>
  </View>

  {/* Comment Button */}
  <View style={styles.actionItem}>
    <TouchableOpacity onPress={onComment} activeOpacity={0.8}>
      <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
      </View>
    </TouchableOpacity>
    <Text style={styles.actionLabel}>Comment</Text>
  </View>

  {/* Share Button */}
  <View style={styles.actionItem}>
    <TouchableOpacity onPress={onShare} activeOpacity={0.8}>
      <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
        <Ionicons name="share-social" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
    <Text style={styles.actionLabel}>Share</Text>
  </View>

</View>

          <View style={styles.bottomInfo} pointerEvents="box-none">
            <View style={[styles.genreTag, { borderColor: station.accentColor }]}>
              <Text style={[styles.genreText, { color: station.accentColor }]}>{station.genre}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 12 }}>
              <TouchableOpacity onPress={() => router.push(`/rjs/artist?name=${encodeURIComponent(station.name)}&image=${encodeURIComponent(station.thumbnail)}`)}>
                <Text style={styles.stationName}>{station.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsFollowing(!isFollowing)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 4,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isFollowing ? 'rgba(255,255,255,0.4)' : '#fff',
                  backgroundColor: isFollowing ? 'transparent' : 'rgba(255,255,255,0.15)'
                }}
              >
                <Text style={{ color: isFollowing ? 'rgba(255,255,255,0.7)' : '#fff', fontSize: 12, fontWeight: '700' }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tagline}>{station.tagline}</Text>
            <View style={styles.showRow}>
              <MaterialCommunityIcons name="music-note" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.showText}>{station.currentShow} · {station.rjName}</Text>
            </View>

            <View style={styles.playRow}>
              <EqualizerBars color={station.accentColor} isActive={isActive && isPlaying} />
              <TouchableOpacity
                onPress={onPlayPause}
                activeOpacity={0.85}
                style={[styles.playButton, { backgroundColor: station.accentColor }]}
              >
                <Ionicons
                  name={isActive && isPlaying ? 'pause' : 'play'}
                  size={26}
                  color="#fff"
                  style={isActive && isPlaying ? undefined : { marginLeft: 3 }}
                />
              </TouchableOpacity>
              <View style={styles.listenersRow}>
                <FontAwesome5 name="headphones" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.listenersText}>{formatListeners(station.listeners)} listening</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', text: 'First time here, loving it!', timestamp: '10:05 AM', stationId: '1', name: 'nova_k' },
  { id: 'c2', text: 'This track is a vibe! 🔥', timestamp: '10:08 AM', stationId: '1', name: 'cool_dude' },
  { id: 'c3', text: 'Where can I find the playlist?', timestamp: '10:12 AM', stationId: '1', name: 'music_lover99' },
  { id: 'c4', text: 'Awesome show today 🙌', timestamp: '11:00 AM', stationId: '2', name: 'radio_fan' },
  { id: 'c5', text: 'Greetings from Mumbai!', timestamp: '11:05 AM', stationId: '2', name: 'mumbai_vibes' },
  { id: 'c6', text: 'Such a nostalgic song 😌', timestamp: '09:30 AM', stationId: '3', name: 'retro_king' },
  { id: 'c7', text: 'Play some A.R. Rahman please!', timestamp: '09:45 AM', stationId: '3', name: 'arr_fanatic' },
  { id: 'c8', text: 'Good morning everyone! ☀️', timestamp: '08:00 AM', stationId: '4', name: 'early_bird' },
  { id: 'c9', text: 'Loving the vibe today 🎧', timestamp: '08:15 AM', stationId: '5', name: 'edm_lover' },
  { id: 'c10', text: 'Beautiful voice ❤️', timestamp: '07:30 AM', stationId: '6', name: 'classical_soul' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

const LiveRadioScreen: React.FC = () => {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 900;
  // ITEM_HEIGHT: on desktop we have top nav (56) + bottom player (72) = 128px taken.
  // We use exactly the remaining height so paging works correctly.
  const ITEM_HEIGHT = isDesktop ? windowHeight - 128 : windowHeight;

  const { stationId } = useLocalSearchParams<{ stationId?: string }>();
  const {
    currentStation,
    isPlaying,
    setLiveRadioFocused,
    startSession,
    updateStation,
    pauseLive,
    resumeLive,
  } = useRJLive();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn, showAuthModal } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentStationId, setCommentStationId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const initialAutoPlay = useRef(false);
  const handleSendComment = useCallback(() => {
  if (commentText.trim().length === 0) return;
  const newComment: Comment = {
    id: Date.now().toString(),
    text: commentText.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stationId: commentStationId ?? '',
    name: 'nova_k',
  };
  setComments(prev => [newComment, ...prev]);
  setCommentText('');
}, [commentText, commentStationId]);
const handleOpenComment = useCallback((stationId: string) => {
  if (!isLoggedIn) {
    showAuthModal('Please login to comment');
    return;
  }
  setCommentStationId(stationId);
  Animated.spring(slideAnim, {
    toValue: 1,
    useNativeDriver: true,
    tension: 70,
    friction: 10,
  }).start();
}, [slideAnim]);

const handleCloseComment = useCallback(() => {
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 250,
    useNativeDriver: true,
  }).start(() => {
    setCommentStationId(null);
    setCommentText('');
  });
}, [slideAnim]);
  useFocusEffect(
    useCallback(() => {
      setLiveRadioFocused(true);
      return () => setLiveRadioFocused(false);
    }, [setLiveRadioFocused])
  );

  useEffect(() => {
    if (!stationId) return;
    const index = RJS_LIVE_STATIONS.findIndex(s => s.id === stationId);
    if (index >= 0) {
      setActiveIndex(index);
      try {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      } catch (err) {
        console.warn('flatListRef scrollToIndex failed:', err);
      }
    }
  }, [stationId]);

  useEffect(() => {
    if (initialAutoPlay.current) return;
    const targetStation = stationId
      ? RJS_LIVE_STATIONS.find(s => s.id === stationId)
      : RJS_LIVE_STATIONS[0];

    if (!targetStation) return;

    if (!currentStation || currentStation.id !== targetStation.id || !isPlaying) {
      startSession(targetStation);
    }
    initialAutoPlay.current = true;
  }, [stationId, currentStation, isPlaying, startSession]);

  useEffect(() => {
    const station = RJS_LIVE_STATIONS[activeIndex];
    if (station && isPlaying && currentStation) {
      updateStation(station);
    }
  }, [activeIndex, isPlaying, currentStation, updateStation]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePlayPause = useCallback(
    (station: RJSStation) => {
      const isCurrent = currentStation?.id === station.id;
      if (isCurrent && isPlaying) {
        pauseLive();
      } else if (isCurrent && !isPlaying) {
        resumeLive();
      } else {
        startSession(station);
      }
    },
    [currentStation, isPlaying, pauseLive, resumeLive, startSession]
  );

  const handleLike = useCallback((station: RJSStation) => {
    toggleFavorite({
      id: `station-${station.id}`,
      title: station.name,
      subtitle: `${station.frequency} • ${station.currentShow}`,
      image: station.thumbnail,
      type: 'rj',
      rawData: station,
    });
  }, [toggleFavorite]);

  const handleShare = useCallback(async (station: RJSStation) => {
    try {
      await Share.share({
        title: station.name,
        message: `🎵 Listening to ${station.name} (${station.frequency}) — "${station.currentShow}" with ${station.rjName}!\nTune in now on RJS App.`,
      });
    } catch {
      Alert.alert('Share failed', 'Unable to share this station right now.');
    }
  }, []);

  const handleComment = useCallback((station: RJSStation) => {
    // TODO: Navigate to comments screen or show comment modal
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: RJSStation; index: number }) => (
      <StationCard
        station={item}
        isActive={index === activeIndex}
        isPlaying={currentStation?.id === item.id && isPlaying}
        isLiked={isFavorite(`station-${item.id}`)}
        itemHeight={ITEM_HEIGHT}
        onPlayPause={() => handlePlayPause(item)}
        onLike={() => handleLike(item)}
        onShare={() => handleShare(item)}
        onComment={() => handleOpenComment(item.id)}
      />
    ),
    [activeIndex, currentStation, isPlaying, isFavorite, handlePlayPause, handleLike, handleShare, handleOpenComment]
  );

  const keyExtractor = useCallback((item: RJSStation) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [ITEM_HEIGHT]
  );

  return (
    <View style={[styles.screen, { paddingBottom: 80 }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {!isDesktop && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="radio" size={22} color="#FF3B5C" />
            <Text style={styles.headerTitle}>RJS Live</Text>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={RJS_LIVE_STATIONS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
      />

      <View style={styles.stationPill} pointerEvents="none">
        <View style={[styles.pillDot, { backgroundColor: RJS_LIVE_STATIONS[activeIndex]?.accentColor }]} />
        <Text style={styles.pillText} numberOfLines={1}>
          {RJS_LIVE_STATIONS[activeIndex]?.name} · {RJS_LIVE_STATIONS[activeIndex]?.currentShow}
        </Text>
        <Ionicons name="radio" size={14} color="rgba(255,255,255,0.5)" />
      </View>
     {commentStationId && (
  <>
    <TouchableOpacity
      style={styles.backdrop}
      activeOpacity={1}
      onPress={handleCloseComment}
    />

    <Animated.View
      style={[
        styles.commentSheet,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [500, 0],
            }),
          }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.commentHeader}>
        <Text style={styles.commentTitle}>
          Comments ({comments.filter(c => c.stationId === commentStationId).length})
        </Text>
        <TouchableOpacity onPress={handleCloseComment} style={styles.closeButton}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.commentDivider} />

      {/* Comments List */}
      {comments.filter(c => c.stationId === commentStationId).length === 0 ? (
        <View style={styles.commentEmpty}>
          <Ionicons name="chatbubble-ellipses-outline" size={40} color="rgba(255,255,255,0.2)" />
          <Text style={styles.commentEmptyText}>No comments yet</Text>
          <Text style={styles.commentEmptySubText}>Be the first to comment!</Text>
        </View>
      ) : (
        <FlatList
          data={comments.filter(c => c.stationId === commentStationId)}
          keyExtractor={item => item.id}
          style={styles.commentList}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              {/* Avatar */}
              <View style={styles.commentAvatar}>
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.commentAvatarImg} />
              </View>

              {/* Text + time */}
              <View style={styles.commentContent}>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentName}>{item.name || 'nova_k'}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Emoji Row */}
      <View style={styles.emojiRow}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {['❤️', '🔥', '👏', '😂', '🤯'].map(emoji => (
            <TouchableOpacity key={emoji} style={styles.emojiCircle} activeOpacity={0.8}>
              <Text style={{ fontSize: 16 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.raiseHandBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 14 }}>✋</Text>
          <Text style={styles.raiseHandText}>Raise hand</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentDivider} />

      {/* Input Row */}
      <View style={styles.commentInputRow}>
        <View style={styles.commentInputBox}>
          <TextInput
            style={styles.commentInput}
            placeholder="Say something..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={commentText}
            onChangeText={setCommentText}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSendComment}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.commentSendBtn,
            { opacity: commentText.trim().length > 0 ? 1 : 0.6 },
          ]}
          onPress={handleSendComment}
          disabled={commentText.trim().length === 0}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  </>
)}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  commentList: {
  flex: 1,
  paddingHorizontal: 16,
},
commentItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.06)',
},
commentAvatar: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: 'rgba(255,255,255,0.15)',
  alignItems: 'center',
  justifyContent: 'center',
},
commentContent: {
  flex: 1,
  gap: 3,
},
commentText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 20,
},
commentTime: {
  color: 'rgba(255,255,255,0.35)',
  fontSize: 11,
},
commentOptions: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 16,
  marginBottom: 8,
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  overflow: 'hidden',
},
commentOptionBtn: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 12,
},
commentOptionDivider: {
  width: 1,
  height: 36,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
commentOptionText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
editRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
editInput: {
  flex: 1,
  color: '#fff',
  fontSize: 14,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.3)',
  paddingVertical: 4,
},
editSaveBtn: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#34D399',
  alignItems: 'center',
  justifyContent: 'center',
},
  screen: { flex: 1, backgroundColor: '#000' },
  header: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  backButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 2,
  },
  searchIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardOuter: { width: '100%', backgroundColor: '#000' },
  cardContainer: { flex: 1 },
  thumbnail: { flex: 1, justifyContent: 'space-between' },
  thumbnailImage: { opacity: 0.85 },
  tapArea: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  heartBurst: {
    position: 'absolute', top: '40%', left: '50%',
    marginLeft: -45, marginTop: -45, zIndex: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: STATUSBAR_HEIGHT + 60, paddingHorizontal: 16, zIndex: 10,
  },
  liveBadgeWrapper: { alignItems: 'center', justifyContent: 'center' },
  livePulse: { position: 'absolute', width: 60, height: 28, borderRadius: 14, opacity: 0.3 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  frequencyBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 12,
  },
  frequencyText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  rightActions: {
    position: 'absolute', right: 14, bottom: 190,
    alignItems: 'center', gap: 20, zIndex: 10,
  },
  actionItem: { alignItems: 'center', gap: 4 },
  actionIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  actionLabel: {
    color: '#fff', fontSize: 11, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  bottomInfo: { paddingHorizontal: 16, paddingBottom: 100, paddingRight: 80, zIndex: 10 },
  genreTag: {
    alignSelf: 'flex-start', borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10,
  },
  genreText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  stationName: {
    color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  tagline: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', marginBottom: 10 },
  showRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 18 },
  showText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  playRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playButton: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 10,
  },
  listenersRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listenersText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  equalizerContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 28 },
  equalizerBar: { width: 4, borderRadius: 2 },
  stationPill: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 30,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16, gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  // Comment sheet styles
backdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 200,
},
commentSheet: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 480,
  backgroundColor: '#120505',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  zIndex: 300,
  paddingBottom: 24,
},
commentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 18,
  paddingBottom: 12,
},
commentTitle: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
closeButton: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: 'rgba(255,255,255,0.08)',
  alignItems: 'center',
  justifyContent: 'center',
},
commentDivider: {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.04)',
  marginHorizontal: 0,
},
commentEmpty: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},
commentEmptyText: {
  color: 'rgba(255,255,255,0.5)',
  fontSize: 15,
  fontWeight: '600',
},
commentEmptySubText: {
  color: 'rgba(255,255,255,0.3)',
  fontSize: 13,
},
emojiRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  marginBottom: 16,
  marginTop: 8,
},
emojiCircle: {
  width: 38, height: 38, borderRadius: 19,
  backgroundColor: 'rgba(255,255,255,0.06)',
  alignItems: 'center', justifyContent: 'center'
},
raiseHandBtn: {
  flexDirection: 'row', alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.06)',
  paddingHorizontal: 14, paddingVertical: 10,
  borderRadius: 20, gap: 6,
},
raiseHandText: { color: '#fff', fontSize: 13, fontWeight: '700' },
commentInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingTop: 16,
  gap: 12,
},
commentInputBox: {
  flex: 1,
  backgroundColor: '#260f0f',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.04)',
  paddingHorizontal: 16,
  paddingVertical: 12,
},
commentInput: {
  color: '#fff',
  fontSize: 14,
  textAlign: 'left',
  flex: 1,
  ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
},
commentSendBtn: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: '#7a0000',
  alignItems: 'center',
  justifyContent: 'center',
},
commentBubble: {
  backgroundColor: '#260f0f',
  borderRadius: 16,
  padding: 12,
  alignSelf: 'flex-start',
},
commentName: {
  color: '#FF5C77',
  fontSize: 12,
  fontWeight: '700',
  marginBottom: 4,
},
commentAvatarImg: {
  width: 34, height: 34, borderRadius: 17,
},
});

export default LiveRadioScreen;