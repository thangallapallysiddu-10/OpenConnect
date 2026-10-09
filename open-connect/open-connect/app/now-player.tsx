import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAudio } from '../src/context/AudioContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { Tooltip } from '../src/components/Tooltip/Tooltip';

// ─── Small reusable circle button with tooltip ────────────────────────────────
interface ActionBtnProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
  active?: boolean;
  activeColor?: string;
  size?: number;
}
function ActionBtn({ label, icon, onPress, color = '#9CA3AF', active = false, activeColor = '#8B5CF6', size = 22 }: ActionBtnProps) {
  return (
    <Tooltip label={label}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: active ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1,
          borderColor: active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <Ionicons name={icon} size={size} color={active ? activeColor : color} />
      </TouchableOpacity>
    </Tooltip>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NowPlayingScreen() {
  const { width } = useWindowDimensions();

  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    pauseTrack,
    resumeTrack,
    playNext,
    playPrevious,
    seekTo,
    seekForward,
    seekBackward,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useFavorites();

  // ── Local toggle states ──
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [showQueue, setShowQueue] = useState(false);

  // ── Vinyl rotation ──
  const rotateValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.timing(rotateValue, { toValue: 1, duration: 20000, useNativeDriver: true })
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
    }
  }, [isPlaying]);

  const spin = rotateValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => { if (!currentTrack) router.back(); }, [currentTrack]);
  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;
  const isWeb = Platform.OS === 'web';
  const artSize = isWeb ? Math.min(width * 0.30, 300) : Math.min(width * 0.62, 280);

  // ── Button handlers ──────────────────────────────────────────────────────────

  const handleFavourite = () => {
    toggleFavorite({
      id: currentTrack.id,
      title: currentTrack.title,
      subtitle: currentTrack.artist,
      image: currentTrack.image?.uri ?? currentTrack.image ?? '',
      type: 'song',
      rawData: currentTrack,
    });
  };

  const handleShare = async () => {
    const message = `🎵 Now listening to "${currentTrack.title}" by ${currentTrack.artist} on Open Connect`;
    if (Platform.OS === 'web' && typeof navigator?.share === 'function') {
      try {
        await navigator.share({ title: currentTrack.title, text: message, url: window.location.href });
        return;
      } catch {
        // fell through — copy to clipboard instead
      }
    }
    if (Platform.OS === 'web' && navigator?.clipboard) {
      await navigator.clipboard.writeText(message);
      Alert.alert('Copied!', 'Song info copied to clipboard.');
      return;
    }
    // Native fallback
    try {
      await Share.share({ message });
    } catch { /* dismissed */ }
  };

  const handleDownload = () => {
    // On web, trigger a direct download if a URI exists
    if (Platform.OS === 'web' && currentTrack.uri) {
      const a = document.createElement('a');
      a.href = currentTrack.uri;
      a.download = `${currentTrack.title} - ${currentTrack.artist}.mp3`;
      a.click();
      return;
    }
    Alert.alert(
      'Download',
      `"${currentTrack.title}" by ${currentTrack.artist} will be saved for offline listening.`,
      [{ text: 'OK' }]
    );
  };

  const handleShuffle = () => setShuffle(prev => !prev);

  const handleRepeat = () =>
    setRepeat(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));

  const repeatIcon: React.ComponentProps<typeof Ionicons>['name'] =
    repeat === 'one' ? 'repeat' : 'repeat-outline';

  const repeatColor =
    repeat === 'off' ? '#9CA3AF' : repeat === 'one' ? '#EC4899' : '#8B5CF6';

  const repeatLabel =
    repeat === 'off' ? 'Repeat: Off' : repeat === 'one' ? 'Repeat: One' : 'Repeat: All';

  const toggleQueue = () => setShowQueue(v => !v);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#1e1230', '#0A0A0A', '#0a0a14']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
        }}>
          <Tooltip label="Minimise player">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>
            NOW PLAYING
          </Text>

          <Tooltip label="More options">
            <TouchableOpacity
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
              onPress={() =>
                Alert.alert(
                  currentTrack.title,
                  `Artist: ${currentTrack.artist}\n\nOptions like "Add to playlist", "Go to artist", and "View lyrics" will be available soon.`,
                  [{ text: 'Close' }]
                )
              }
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* ── Album Art ────────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 28 }}>
          <Animated.View style={{
            width: artSize, height: artSize, borderRadius: artSize / 2,
            overflow: 'hidden', borderWidth: 3,
            borderColor: 'rgba(139,92,246,0.4)',
            transform: [{ rotate: spin }],
            shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
          }}>
            <Image source={currentTrack.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </Animated.View>
          {/* Vinyl centre dot */}
          <View style={{
            position: 'absolute', width: 22, height: 22, borderRadius: 11,
            backgroundColor: '#8B5CF6', borderWidth: 3, borderColor: '#fff',
            top: 16 + artSize / 2 - 11,
          }} />
        </View>

        {/* ── Song Info ────────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}
            numberOfLines={2}>{currentTrack.title}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 15, textAlign: 'center' }}>{currentTrack.artist}</Text>
        </View>

        {/* ── Progress Bar ─────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 28, marginBottom: 8 }}>
          <Tooltip label="Seek — tap to jump to any position">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={(e: any) => {
                const { locationX } = e.nativeEvent;
                seekTo((locationX / (width - 56)) * duration);
              }}
            >
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 6, borderRadius: 3, width: `${progress * 100}%` }}
                />
              </View>
            </TouchableOpacity>
          </Tooltip>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(position)}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* ── Playback Controls ────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 16, paddingHorizontal: 20, marginTop: 8, marginBottom: 24,
        }}>
          {/* Skip Previous */}
          <Tooltip label="Previous track">
            <TouchableOpacity onPress={playPrevious} style={{ padding: 10 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={30} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          {/* Seek Back 10 s */}
          <Tooltip label="Rewind 10 seconds">
            <TouchableOpacity
              onPress={seekBackward}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 3,
              }}
            >
              <Ionicons name="play-back" size={18} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Play / Pause */}
          <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
            <TouchableOpacity onPress={isPlaying ? pauseTrack : resumeTrack} activeOpacity={0.85}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{
                  width: 70, height: 70, borderRadius: 35,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
                }}
              >
                <Ionicons
                  name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                  size={32} color="#fff"
                  style={(!isPlaying && !isLoading) ? { marginLeft: 4 } : undefined}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Tooltip>

          {/* Seek Forward 10 s */}
          <Tooltip label="Skip forward 10 seconds">
            <TouchableOpacity
              onPress={seekForward}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 3,
              }}
            >
              <Ionicons name="play-forward" size={18} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Skip Next */}
          <Tooltip label="Next track">
            <TouchableOpacity onPress={playNext} style={{ padding: 10 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={30} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* ── Secondary Controls Row (Shuffle / Repeat) ─────────────────────── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
          gap: 24, marginBottom: 28,
        }}>
          <Tooltip label={shuffle ? 'Shuffle: On — tap to turn off' : 'Shuffle: Off — tap to turn on'}>
            <TouchableOpacity onPress={handleShuffle} activeOpacity={0.7} style={{ padding: 8 }}>
              <Ionicons
                name="shuffle"
                size={22}
                color={shuffle ? '#8B5CF6' : '#4B5563'}
              />
            </TouchableOpacity>
          </Tooltip>

          <Tooltip label={repeatLabel}>
            <TouchableOpacity onPress={handleRepeat} activeOpacity={0.7} style={{ padding: 8 }}>
              <Ionicons name={repeatIcon} size={22} color={repeatColor} />
              {repeat === 'one' && (
                <View style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: 4, backgroundColor: '#EC4899',
                }} />
              )}
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* ── Bottom Action Buttons ────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-evenly',
          alignItems: 'center', paddingHorizontal: 24, marginBottom: 28,
        }}>
          <ActionBtn
            label={isFavorite(currentTrack.id) ? 'Remove from favourites' : 'Add to favourites'}
            icon={isFavorite(currentTrack.id) ? 'heart' : 'heart-outline'}
            onPress={handleFavourite}
            color={isFavorite(currentTrack.id) ? '#EC4899' : '#9CA3AF'}
            active={isFavorite(currentTrack.id)}
            activeColor="#EC4899"
          />

          <ActionBtn
            label="Share this track"
            icon="share-outline"
            onPress={handleShare}
          />

          <ActionBtn
            label="Download for offline listening"
            icon="download-outline"
            onPress={handleDownload}
          />

          <ActionBtn
            label={showQueue ? 'Hide queue' : 'Show queue'}
            icon="list-outline"
            onPress={toggleQueue}
            active={showQueue}
          />
        </View>

        {/* ── Queue Panel (shown when queue button is active) ───────────────── */}
        {showQueue && (
          <View style={{
            marginHorizontal: 24, borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            paddingVertical: 12, paddingHorizontal: 16,
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
              UP NEXT
            </Text>
            {[
              { label: 'Next in queue', icon: 'musical-note' as const },
              { label: 'Recommended tracks', icon: 'sparkles' as const },
            ].map((item, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: 'rgba(255,255,255,0.05)',
              }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 8,
                  backgroundColor: 'rgba(139,92,246,0.12)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={item.icon} size={16} color="#8B5CF6" />
                </View>
                <Text style={{ color: '#6B7280', fontSize: 13 }}>{item.label} coming soon</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
