import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRJLive } from '../../context/RJLiveContext';
import { RJS_LIVE_STATIONS } from '../../data/rjsLiveStations';

const BOX_W = 168;
const BOX_H = 112;
const EDGE_PADDING = 10;
const TAP_THRESHOLD = 8;

function getInitialPosition() {
  return { x: EDGE_PADDING, y: Platform.OS === 'ios' ? 56 : 48 };
}

function clampPosition(x: number, y: number) {
  const { width, height } = Dimensions.get('window');
  const minY = EDGE_PADDING + (Platform.OS === 'ios' ? 44 : 24);
  const maxY = height - BOX_H - EDGE_PADDING - 72;
  return {
    x: Math.min(Math.max(EDGE_PADDING, x), width - BOX_W - EDGE_PADDING),
    y: Math.min(Math.max(minY, y), maxY),
  };
}

export default function RJLiveMiniPlayer() {
  const {
    currentStation,
    isPlaying,
    showMiniPlayer,
    pauseLive,
    resumeLive,
    stopLive,
    startSession,
  } = useRJLive();

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY(getInitialPosition())).current;
  const lastPosition = useRef(getInitialPosition());
  const didDrag = useRef(false);

  const playPrevious = () => {
    if (!currentStation) return;
    const currentIndex = RJS_LIVE_STATIONS.findIndex(s => s.id === currentStation.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + RJS_LIVE_STATIONS.length) % RJS_LIVE_STATIONS.length;
    startSession(RJS_LIVE_STATIONS[prevIndex]);
  };

  const playNext = () => {
    if (!currentStation) return;
    const currentIndex = RJS_LIVE_STATIONS.findIndex(s => s.id === currentStation.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % RJS_LIVE_STATIONS.length;
    startSession(RJS_LIVE_STATIONS[nextIndex]);
  };

  const handleOpenLiveRadio = () => {
    if (!currentStation) return;
    router.push({
      pathname: '/rjs/live-radio',
      params: { stationId: currentStation.id },
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > TAP_THRESHOLD || Math.abs(gesture.dy) > TAP_THRESHOLD,
        onPanResponderGrant: () => {
          didDrag.current = false;
          position.setOffset({
            x: (position.x as Animated.Value & { _value: number })._value,
            y: (position.y as Animated.Value & { _value: number })._value,
          });
          position.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gesture) => {
          if (
            Math.abs(gesture.dx) > TAP_THRESHOLD ||
            Math.abs(gesture.dy) > TAP_THRESHOLD
          ) {
            didDrag.current = true;
          }
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: () => {
          position.flattenOffset();
          const rawX = (position.x as Animated.Value & { _value: number })._value;
          const rawY = (position.y as Animated.Value & { _value: number })._value;
          const clamped = clampPosition(rawX, rawY);

          if (!didDrag.current) {
            handleOpenLiveRadio();
            return;
          }

          lastPosition.current = clamped;
          Animated.spring(position, {
            toValue: clamped,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        },
      }),
    [currentStation]
  );

  useEffect(() => {
    if (showMiniPlayer) {
      position.setValue(lastPosition.current);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMiniPlayer, scaleAnim, opacityAnim, position]);

  if (!currentStation || !showMiniPlayer) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.box}>
        <View style={StyleSheet.absoluteFillObject}>
          <Image
            source={{ uri: currentStation.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFillObject}
          />

          {isPlaying && (
            <View style={styles.livePulse}>
              <View style={[styles.liveDot, { backgroundColor: currentStation.accentColor }]} />
            </View>
          )}

          <View style={styles.nameBar}>
            <Text style={styles.rjName} numberOfLines={1}>
              {currentStation.rjName}
            </Text>
            <Text style={styles.showName} numberOfLines={1}>
              {currentStation.currentShow}
            </Text>
          </View>
        </View>

        <View style={styles.topBar} pointerEvents="box-none">
          <View />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => stopLive()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerControls} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={playPrevious}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-back" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.playPauseBtn]}
            onPress={() => (isPlaying ? pauseLive() : resumeLive())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#fff"
              style={!isPlaying ? { marginLeft: 2 } : undefined}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={playNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BOX_W,
    height: BOX_H,
    zIndex: 2000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  box: {
    width: BOX_W,
    height: BOX_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: BOX_W,
    height: BOX_H,
  },
  topBar: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livePulse: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 2,
  },
  rjName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  showName: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    fontWeight: '500',
  },
  centerControls: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
