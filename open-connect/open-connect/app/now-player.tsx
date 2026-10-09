import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
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

// ── Play button gradient colours (confirmed from DOM snapshot) ────────────────
const GRAD_START = '#8B5CF6'; // rgb(139, 92, 246)
const GRAD_END   = '#EC4899'; // rgb(236, 72, 153)

// ─── Circle action button ─────────────────────────────────────────────────────
interface ActionBtnProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
  active?: boolean;
  activeColor?: string;
  activeBg?: string;
  activeBorder?: string;
  size?: number;
  btnSize?: number;
}
function ActionBtn({
  label, icon, onPress,
  color = '#9CA3AF',
  active = false,
  activeColor = GRAD_START,
  activeBg = 'rgba(139,92,246,0.18)',
  activeBorder = 'rgba(139,92,246,0.55)',
  size = 20,
  btnSize = 46,
}: ActionBtnProps) {
  return (
    <Tooltip label={label}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          width: btnSize, height: btnSize, borderRadius: btnSize / 2,
          backgroundColor: active ? activeBg : 'rgba(255,255,255,0.06)',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1,
          borderColor: active ? activeBorder : 'rgba(255,255,255,0.1)',
        }}
      >
        <Ionicons name={icon} size={size} color={active ? activeColor : color} />
      </TouchableOpacity>
    </Tooltip>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NowPlayingScreen() {
  const { width, height } = useWindowDimensions();

  const {
    currentTrack, isPlaying, isLoading,
    position, duration,
    pauseTrack, resumeTrack,
    playNext, playPrevious,
    seekTo, seekForward, seekBackward,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useFavorites();

  const [shuffle, setShuffle]   = useState(false);
  const [repeat, setRepeat]     = useState<'off' | 'one' | 'all'>('off');
  const [showQueue, setShowQueue] = useState(false);

  // ── Vinyl rotation ──
  const rotateValue = useRef(new Animated.Value(0)).current;
  const loopRef     = useRef<Animated.CompositeAnimation | null>(null);

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

  // ── Animated progress bar width ──
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pct = duration > 0 ? (position / duration) * 100 : 0;
    // Smooth but not laggy — 250 ms tracks position ticks precisely
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [position, duration]);

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ── BUG FIX: navigate HOME (not back) when track is stopped/cleared ──────────
  // Using router.replace so pressing the browser back button after dismiss
  // doesn't accidentally re-open the empty player.
  useEffect(() => {
    if (!currentTrack) {
      router.replace('/');
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;
  const isWeb    = Platform.OS === 'web';

  // Art size: smaller so everything fits without scrolling
  const artSize = isWeb
    ? Math.min(width * 0.22, 220)
    : Math.min(width * 0.55, 240);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleFavourite = () =>
    toggleFavorite({
      id: currentTrack.id, title: currentTrack.title,
      subtitle: currentTrack.artist,
      image: currentTrack.image?.uri ?? currentTrack.image ?? '',
      type: 'song', rawData: currentTrack,
    });

  const handleShare = async () => {
    const msg = `🎵 Now listening to "${currentTrack.title}" by ${currentTrack.artist} on Open Connect`;
    if (Platform.OS === 'web') {
      if (typeof navigator?.share === 'function') {
        try { await navigator.share({ title: currentTrack.title, text: msg, url: window.location.href }); return; }
        catch { /* fall through */ }
      }
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(msg);
        Alert.alert('Copied!', 'Song info copied to clipboard.');
        return;
      }
    }
    try { await Share.share({ message: msg }); } catch { /* dismissed */ }
  };

  const handleDownload = () => {
    if (Platform.OS === 'web' && currentTrack.uri) {
      const a   = document.createElement('a');
      a.href    = currentTrack.uri;
      a.download = `${currentTrack.title} - ${currentTrack.artist}.mp3`;
      a.click();
      return;
    }
    Alert.alert('Download', `"${currentTrack.title}" will be saved for offline listening.`, [{ text: 'OK' }]);
  };

  const handleRepeat = () =>
    setRepeat(p => (p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'));

  const repeatLabel =
    repeat === 'off' ? 'Repeat: Off' : repeat === 'one' ? 'Repeat: One' : 'Repeat: All';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={['#1e1230', '#0d0b1a', '#0a0a14']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Single non-scrolling container ── */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 14, justifyContent: 'space-between' }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tooltip label="Minimise player">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 38, height: 38, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="chevron-down" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>
            NOW PLAYING
          </Text>

          <Tooltip label="More options">
            <TouchableOpacity
              style={{ width: 38, height: 38, justifyContent: 'center', alignItems: 'center' }}
              onPress={() =>
                Alert.alert(currentTrack.title,
                  `Artist: ${currentTrack.artist}\n\n"Add to playlist", "Go to artist" and "Lyrics" coming soon.`,
                  [{ text: 'Close' }])
              }
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* ── Album Art ── */}
        <View style={{ alignItems: 'center' }}>
          <Animated.View style={{
            width: artSize, height: artSize, borderRadius: artSize / 2,
            overflow: 'hidden', borderWidth: 3,
            borderColor: 'rgba(139,92,246,0.45)',
            transform: [{ rotate: spin }],
            shadowColor: GRAD_START, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
          }}>
            <Image source={currentTrack.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </Animated.View>
          {/* Vinyl centre dot */}
          <View style={{
            position: 'absolute',
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: GRAD_START,
            borderWidth: 2.5, borderColor: '#fff',
            top: artSize / 2 - 9,
          }} />
        </View>

        {/* ── Song Info ── */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 }}
            numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>{currentTrack.artist}</Text>
        </View>

        {/* ── Progress Bar ── */}
        <View>
          {/* Clickable seek track */}
          <Tooltip label="Seek — tap to jump">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={(e: any) => {
                const { locationX } = e.nativeEvent;
                seekTo((locationX / (width - 48)) * duration);
              }}
              style={{ paddingVertical: 8 }}
            >
              {/* Background track */}
              <View style={{
                height: 5, backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 3, overflow: 'hidden',
              }}>
                {/* Animated filled portion — driven by progressAnim */}
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                    // Purple → pink gradient via background colour approximation
                    // (Animated.View doesn't support LinearGradient natively,
                    //  so we use the start colour; the bar still animates perfectly)
                    backgroundColor: GRAD_START,
                  }}
                />
              </View>
              {/* Thumb dot */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 8 - 6,           // centre on the 5px bar (paddingTop 8)
                  left: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, width - 48 - 12],
                    extrapolate: 'clamp',
                  }),
                  width: 12, height: 12, borderRadius: 6,
                  backgroundColor: '#fff',
                  shadowColor: GRAD_START,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              />
            </TouchableOpacity>
          </Tooltip>
          {/* Time labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ color: '#6B7280', fontSize: 10 }}>{formatTime(position)}</Text>
            <Text style={{ color: '#6B7280', fontSize: 10 }}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* ── Playback Controls ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'center', gap: 10,
        }}>

          {/* Shuffle */}
          <Tooltip label={shuffle ? 'Shuffle: On — tap to disable' : 'Shuffle: Off — tap to enable'}>
            <TouchableOpacity
              onPress={() => setShuffle(p => !p)}
              activeOpacity={0.75}
              style={{
                width: 36, height: 36, borderRadius: 18,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: shuffle ? 'rgba(139,92,246,0.22)' : 'transparent',
                borderWidth: shuffle ? 1.5 : 0,
                borderColor: shuffle ? GRAD_START : 'transparent',
              }}
            >
              <Ionicons name="shuffle" size={18} color={shuffle ? GRAD_START : '#4B5563'} />
              {shuffle && (
                <View style={{
                  position: 'absolute', bottom: 3, left: '50%', marginLeft: -2.5,
                  width: 5, height: 5, borderRadius: 2.5, backgroundColor: GRAD_START,
                }} />
              )}
            </TouchableOpacity>
          </Tooltip>

          {/* Previous */}
          <Tooltip label="Previous track">
            <TouchableOpacity onPress={playPrevious} style={{ padding: 7 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          {/* Seek back 10 s */}
          <Tooltip label="Rewind 10 seconds">
            <TouchableOpacity
              onPress={seekBackward} activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 9, paddingVertical: 6, borderRadius: 18, gap: 2,
              }}
            >
              <Ionicons name="play-back" size={14} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Play / Pause */}
          <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
            <TouchableOpacity onPress={isPlaying ? pauseTrack : resumeTrack} activeOpacity={0.85}>
              <LinearGradient
                colors={[GRAD_START, GRAD_END]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{
                  width: 70, height: 70, borderRadius: 35,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: GRAD_START, shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.55, shadowRadius: 12, elevation: 10,
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

          {/* Seek forward 10 s */}
          <Tooltip label="Skip forward 10 seconds">
            <TouchableOpacity
              onPress={seekForward} activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 9, paddingVertical: 6, borderRadius: 18, gap: 2,
              }}
            >
              <Ionicons name="play-forward" size={14} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Next */}
          <Tooltip label="Next track">
            <TouchableOpacity onPress={playNext} style={{ padding: 7 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          {/* Repeat */}
          <Tooltip label={repeatLabel}>
            <TouchableOpacity
              onPress={handleRepeat} activeOpacity={0.75}
              style={{
                width: 36, height: 36, borderRadius: 18,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor:
                  repeat === 'off'  ? 'transparent' :
                  repeat === 'all'  ? 'rgba(139,92,246,0.22)' :
                                      'rgba(236,72,153,0.22)',
                borderWidth: repeat !== 'off' ? 1.5 : 0,
                borderColor:
                  repeat === 'all' ? GRAD_START : repeat === 'one' ? GRAD_END : 'transparent',
              }}
            >
              <Ionicons
                name={repeat === 'one' ? 'repeat' : 'repeat-outline'}
                size={18}
                color={repeat === 'off' ? '#4B5563' : repeat === 'all' ? GRAD_START : GRAD_END}
              />
              {repeat !== 'off' && (
                <View style={{
                  position: 'absolute', bottom: 3, left: '50%', marginLeft: -2.5,
                  width: 5, height: 5, borderRadius: 2.5,
                  backgroundColor: repeat === 'all' ? GRAD_START : GRAD_END,
                }} />
              )}
              {repeat === 'one' && (
                <View style={{
                  position: 'absolute', top: 1, right: 1,
                  backgroundColor: GRAD_END, borderRadius: 4,
                  paddingHorizontal: 2, paddingVertical: 0.5,
                }}>
                  <Text style={{ color: '#fff', fontSize: 6, fontWeight: '900' }}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </Tooltip>

        </View>

        {/* ── Bottom Action Buttons ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
          <ActionBtn
            label={isFavorite(currentTrack.id) ? 'Remove from favourites' : 'Add to favourites'}
            icon={isFavorite(currentTrack.id) ? 'heart' : 'heart-outline'}
            onPress={handleFavourite}
            color={isFavorite(currentTrack.id) ? GRAD_END : '#9CA3AF'}
            active={isFavorite(currentTrack.id)}
            activeColor={GRAD_END}
            activeBg="rgba(236,72,153,0.18)"
            activeBorder="rgba(236,72,153,0.55)"
          />
          <ActionBtn label="Share this track"            icon="share-outline"   onPress={handleShare} />
          <ActionBtn label="Download for offline"        icon="download-outline" onPress={handleDownload} />
          <ActionBtn
            label={showQueue ? 'Hide queue' : 'Show queue'}
            icon="list-outline"
            onPress={() => setShowQueue(v => !v)}
            active={showQueue}
          />
        </View>

        {/* ── Queue panel (only when toggled) ── */}
        {showQueue && (
          <View style={{
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            paddingVertical: 10, paddingHorizontal: 14,
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
              UP NEXT
            </Text>
            {(['Next in queue', 'Recommended tracks'] as const).map((label, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 8,
                borderTopWidth: i > 0 ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.05)',
              }}>
                <View style={{
                  width: 30, height: 30, borderRadius: 6,
                  backgroundColor: 'rgba(139,92,246,0.12)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={i === 0 ? 'musical-note' : 'sparkles'} size={14} color={GRAD_START} />
                </View>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{label} — coming soon</Text>
              </View>
            ))}
          </View>
        )}

      </View>
    </LinearGradient>
  );
}
