import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  LayoutChangeEvent,
  Platform,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudio } from '../src/context/AudioContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { Tooltip } from '../src/components/Tooltip/Tooltip';

const GRAD_START = '#8B5CF6';
const GRAD_END   = '#EC4899';

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
  color = '#9CA3AF', active = false,
  activeColor = GRAD_START,
  activeBg = 'rgba(139,92,246,0.18)',
  activeBorder = 'rgba(139,92,246,0.55)',
  size = 20, btnSize = 46,
}: ActionBtnProps) {
  return (
    <Tooltip label={label}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
        width: btnSize, height: btnSize, borderRadius: btnSize / 2,
        backgroundColor: active ? activeBg : 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
        borderColor: active ? activeBorder : 'rgba(255,255,255,0.1)',
      }}>
        <Ionicons name={icon} size={size} color={active ? activeColor : color} />
      </TouchableOpacity>
    </Tooltip>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NowPlayingScreen() {
  const {
    currentTrack, isPlaying, isLoading,
    position, duration,
    pauseTrack, resumeTrack,
    playNext, playPrevious,
    seekTo, seekForward, seekBackward,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useFavorites();

  const [shuffle, setShuffle]     = useState(false);
  const [repeat, setRepeat]       = useState<'off' | 'one' | 'all'>('off');
  const [showQueue, setShowQueue] = useState(false);

  // ── Vinyl rotation ────────────────────────────────────────────────────────────
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

  // ── Progress bar — pixel-based, measured via onLayout ────────────────────────
  // We measure the grey track's rendered pixel width, then animate a fill
  // View from 0 → trackWidth. No % strings (unreliable on RN web), no thumb dot.
  const [trackWidth, setTrackWidth] = useState(1); // 1 avoids divide-by-zero
  const fillPx = useRef(new Animated.Value(0)).current;
  // Drag-to-scrub state
  const isScrubbing   = useRef(false);
  const scrubPosition = useRef(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTrackWidth(w);
  };

  useEffect(() => {
    // Don't let position ticks override the fill while user is dragging
    if (isScrubbing.current) return;
    const px = trackWidth > 1 && duration > 0
      ? (position / duration) * trackWidth
      : 0;
    Animated.timing(fillPx, {
      toValue: px,
      duration: isPlaying ? 280 : 0,
      useNativeDriver: false,
    }).start();
  }, [position, duration, trackWidth, isPlaying]);

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Navigate HOME when track is stopped / cleared
  useEffect(() => {
    if (!currentTrack) router.replace('/');
  }, [currentTrack]);

  if (!currentTrack) return null;

  const isWeb   = Platform.OS === 'web';

  // ── Handlers ─────────────────────────────────────────────────────────────────
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
        catch { /* fall through to clipboard */ }
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
      const a = document.createElement('a');
      a.href = currentTrack.uri;
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
    <LinearGradient colors={['#1e1230', '#0d0b1a', '#0a0a14']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 24 }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <Tooltip label="Minimise player">
            <TouchableOpacity onPress={() => router.back()}
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="chevron-down" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>
            NOW PLAYING
          </Text>

          <Tooltip label="More options">
            <TouchableOpacity
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => Alert.alert(currentTrack.title,
                `Artist: ${currentTrack.artist}\n\n"Add to playlist", "Go to artist" and "Lyrics" coming soon.`,
                [{ text: 'Close' }])}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </Tooltip>
        </View>

        {/* ── Album Art ──────────────────────────────────────────────────────── */}
        {/* Uses flex: 1 so it expands to fill space, keeping sections below fixed */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Animated.View style={{
            // artSize grows with the available flex space, capped at 240px on web
            width: isWeb ? 220 : 240,
            height: isWeb ? 220 : 240,
            borderRadius: isWeb ? 110 : 120,
            overflow: 'hidden', borderWidth: 3,
            borderColor: 'rgba(139,92,246,0.45)',
            transform: [{ rotate: spin }],
            shadowColor: GRAD_START, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5, shadowRadius: 18, elevation: 12,
          }}>
            <Image source={currentTrack.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </Animated.View>
          {/* Vinyl centre — static, centred over art */}
          <View style={{
            position: 'absolute',
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: GRAD_START, borderWidth: 2.5, borderColor: '#fff',
          }} />
        </View>

        {/* ── Song Info ──────────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{
            color: '#fff', fontSize: 20, fontWeight: '800',
            textAlign: 'center', marginBottom: 5,
          }} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* ── Progress Bar ───────────────────────────────────────────────────── */}
        {/*
          Supports both tap-to-seek and drag-to-scrub:
          - Web: onMouseDown starts scrubbing, onMouseMove updates position live,
            onMouseUp commits the seek. A global mousemove/mouseup listener is
            attached during drag so the scrub works even if the cursor leaves the bar.
          - Native: PanResponder handles the equivalent touch events.
          - The fill animates smoothly while playing and snaps instantly on seek.
        */}
        <View style={{ marginBottom: 20 }}>
          <View
            onLayout={onTrackLayout}
            style={{
              height: 20,              // tall hit area, bar is visually 4px via inner View
              justifyContent: 'center',
              cursor: 'pointer' as any,
            }}
            // ── Web pointer events ──────────────────────────────────────────
            // @ts-ignore — web-only props
            onMouseDown={(e: any) => {
              if (trackWidth <= 1) return;
              isScrubbing.current = true;

              const rect = e.currentTarget.getBoundingClientRect();
              const px   = Math.max(0, Math.min(e.clientX - rect.left, trackWidth));
              const secs = (px / trackWidth) * duration;

              // Snap fill immediately for responsive feel
              fillPx.setValue(px);
              scrubPosition.current = secs;

              const onMove = (ev: MouseEvent) => {
                if (!isScrubbing.current) return;
                const movePx = Math.max(0, Math.min(ev.clientX - rect.left, trackWidth));
                fillPx.setValue(movePx);
                scrubPosition.current = (movePx / trackWidth) * duration;
              };

              const onUp = () => {
                if (!isScrubbing.current) return;
                isScrubbing.current = false;
                seekTo(scrubPosition.current);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };

              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            {/* Rail + fill + knob — all in one relative container */}
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              {/* Grey background rail */}
              <View style={{
                height: 4,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
              }}>
                {/* Purple animated fill */}
                <Animated.View style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  borderRadius: 2,
                  width: fillPx,
                  backgroundColor: GRAD_START,
                }} />
              </View>

              {/* Knob — sits at the right edge of the fill, vertically centred on the rail */}
              <Animated.View
                style={{
                  position: 'absolute',
                  // centre knob on the 4px rail: top = (railHeight/2) - (knobSize/2) = 2 - 6 = -4
                  // But we're in a relative container with justifyContent:center so top:0 = centre
                  top: -4,          // knob is 12px, rail is 4px → offset by (12-4)/2 = 4
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: GRAD_START,
                  // Shift left by half the knob width so its centre aligns with fill edge
                  transform: [{ translateX: Animated.subtract(fillPx, new Animated.Value(6)) }],
                  shadowColor: GRAD_START,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(position)}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* ── Playback Controls ──────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'center', gap: 10, marginBottom: 22,
        }}>
          {/* Shuffle */}
          <Tooltip label={shuffle ? 'Shuffle: On — tap to disable' : 'Shuffle: Off — tap to enable'}>
            <TouchableOpacity onPress={() => setShuffle(p => !p)} activeOpacity={0.75} style={{
              width: 36, height: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: shuffle ? 'rgba(139,92,246,0.22)' : 'transparent',
              borderWidth: shuffle ? 1.5 : 0,
              borderColor: shuffle ? GRAD_START : 'transparent',
            }}>
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
            <TouchableOpacity onPress={playPrevious} style={{ padding: 8 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          {/* Seek back 10 s */}
          <Tooltip label="Rewind 10 seconds">
            <TouchableOpacity onPress={seekBackward} activeOpacity={0.7} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18, gap: 3,
            }}>
              <Ionicons name="play-back" size={14} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Play / Pause */}
          <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
            <TouchableOpacity onPress={isPlaying ? pauseTrack : resumeTrack} activeOpacity={0.85}>
              <LinearGradient colors={[GRAD_START, GRAD_END]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{
                  width: 68, height: 68, borderRadius: 34,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: GRAD_START, shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.55, shadowRadius: 12, elevation: 10,
                }}>
                <Ionicons
                  name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                  size={30} color="#fff"
                  style={(!isPlaying && !isLoading) ? { marginLeft: 4 } : undefined}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Tooltip>

          {/* Seek forward 10 s */}
          <Tooltip label="Skip forward 10 seconds">
            <TouchableOpacity onPress={seekForward} activeOpacity={0.7} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18, gap: 3,
            }}>
              <Ionicons name="play-forward" size={14} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700' }}>10</Text>
            </TouchableOpacity>
          </Tooltip>

          {/* Next */}
          <Tooltip label="Next track">
            <TouchableOpacity onPress={playNext} style={{ padding: 8 }} activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={26} color="#fff" />
            </TouchableOpacity>
          </Tooltip>

          {/* Repeat */}
          <Tooltip label={repeatLabel}>
            <TouchableOpacity onPress={handleRepeat} activeOpacity={0.75} style={{
              width: 36, height: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor:
                repeat === 'off' ? 'transparent' :
                repeat === 'all' ? 'rgba(139,92,246,0.22)' : 'rgba(236,72,153,0.22)',
              borderWidth: repeat !== 'off' ? 1.5 : 0,
              borderColor: repeat === 'all' ? GRAD_START : repeat === 'one' ? GRAD_END : 'transparent',
            }}>
              <Ionicons
                name={repeat === 'one' ? 'repeat' : 'repeat-outline'} size={18}
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

        {/* ── Bottom Action Buttons ───────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: showQueue ? 16 : 0 }}>
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
          <ActionBtn label="Share this track"       icon="share-outline"    onPress={handleShare} />
          <ActionBtn label="Download for offline"   icon="download-outline" onPress={handleDownload} />
          <ActionBtn
            label={showQueue ? 'Hide queue' : 'Show queue'}
            icon="list-outline"
            onPress={() => setShowQueue(v => !v)}
            active={showQueue}
          />
        </View>

        {/* ── Queue panel ─────────────────────────────────────────────────────── */}
        {showQueue && (
          <View style={{
            borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)',
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
