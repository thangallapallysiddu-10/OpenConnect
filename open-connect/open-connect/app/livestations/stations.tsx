import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useFilter } from '../../src/context/FilterContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { ALL_CHANNELS, LANGUAGES } from '../../src/data/channels';

export default function StationsScreen() {
  const { theme, colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { channel: paramChannel, autoplay } = useLocalSearchParams<{ channel?: string; autoplay?: string }>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: 24 }, () => 14)
  );

  const { globalLanguage: selectedLanguage, setGlobalLanguage: setSelectedLanguage } = useFilter();
  const [tempLanguage, setTempLanguage] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const sheetWidth = Math.min(windowWidth, 480);
  const sheetLeft = windowWidth > 480 ? (windowWidth - 480) / 2 : 0;

  const filterBackdropOpacity = useRef(new Animated.Value(0)).current;
  const filterSheetTranslateY = useRef(new Animated.Value(600)).current;

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

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Button interaction scales
  const prevScale = useRef(new Animated.Value(1)).current;
  const playScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;

  // Handle incoming routing parameters from the channel list
  useEffect(() => {
    if (paramChannel) {
      const chNum = parseInt(paramChannel, 10);
      if (!isNaN(chNum) && chNum >= 1 && chNum <= 100) {
        const idx = filteredChannels.findIndex(c => c.channelNumber === chNum);
        if (idx !== -1) {
          setCurrentIndex(idx);
        }
      }
    }
    if (autoplay === 'true') {
      setIsPlaying(true);
    }
  }, [paramChannel, autoplay]); // Intentionally omitting filteredChannels so it doesn't jump around when filter changes

  const handleNextChannel = () => {
    setCurrentIndex((prev) => (prev === filteredChannels.length - 1 ? 0 : prev + 1));
  };

  const handlePrevChannel = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredChannels.length - 1 : prev - 1));
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLanguage]);

  // Button feedback handlers
  const handlePressIn = (scaleVar: Animated.Value) => {
    Animated.timing(scaleVar, {
      toValue: 0.88,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Continuous Floating Animation Loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Central Badge Breathing/Pulse Animation when playing
  useEffect(() => {
    if (!isPlaying) {
      Animated.timing(pulseScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScaleAnim, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isPlaying]);

  // Sequential Broadcast Ripple Waves Animation when playing
  useEffect(() => {
    if (!isPlaying) {
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
      return;
    }

    const createWaveLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const loop1 = createWaveLoop(waveAnim1, 0);
    const loop2 = createWaveLoop(waveAnim2, 800);
    const loop3 = createWaveLoop(waveAnim3, 1600);

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [isPlaying]);

  // Waveform animation (Up and down lines)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBarHeights(
        Array.from({ length: 24 }, () => Math.floor(Math.random() * 45) + 8)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Interpolated translation for the float animation
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  // Interpolated wave ring styles
  const getWaveStyle = (anim: Animated.Value) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.2],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0.5, 0.25, 0],
    });

    return {
      position: 'absolute' as const,
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: '#EC4899',
      transform: [{ scale }],
      opacity,
    };
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background Gradient matching application theme */}
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ width: '100%', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', flex: 1 }}>
          {/* Page Header */}
          <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.headerBtnBg,
                  borderColor: colors.headerBtnBorder,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              
              <View>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 }}>
                  Live Stations
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <View className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }}>
                    LIVE NOW
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Heart button */}
              <TouchableOpacity
                onPress={() => {
                  toggleFavorite({ 
                    id: currentChannelObj.channelNumber.toString(), 
                    title: currentChannelObj.name, 
                    subtitle: `Channel ${currentChannelObj.channelNumber} • ${currentChannelObj.language}`, 
                    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', 
                    type: 'station', 
                    rawData: currentChannelObj 
                  });
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.headerBtnBg,
                  borderColor: colors.headerBtnBorder,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={isFavorite(currentChannelObj.channelNumber.toString()) ? "heart" : "heart-outline"} size={20} color={isFavorite(currentChannelObj.channelNumber.toString()) ? "#EC4899" : colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openFilter}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.headerBtnBg,
                  borderColor: colors.headerBtnBorder,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="filter" size={20} color={colors.text} />
              </TouchableOpacity>

              {/* List button to show all 100 channels screen */}
              <TouchableOpacity
                onPress={() => router.push('/livestations/all-channels')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.headerBtnBg,
                  borderColor: colors.headerBtnBorder,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="list" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

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

          {/* Divider line */}
          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Full Page Tuner Content */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24 }}>
          
          {/* Top Info section */}
          <View className="items-center mb-6">
            {/* Waves Badge with Floating and Broadcasting Rings */}
            <View className="h-32 w-32 items-center justify-center mb-4">
              <Animated.View 
                style={{ transform: [{ translateY }] }} 
                className="relative items-center justify-center h-28 w-28"
              >
                {/* Ripple Ring 1 */}
                {isPlaying && (
                  <Animated.View style={getWaveStyle(waveAnim1)} />
                )}
                {/* Ripple Ring 2 */}
                {isPlaying && (
                  <Animated.View style={getWaveStyle(waveAnim2)} />
                )}
                {/* Ripple Ring 3 */}
                {isPlaying && (
                  <Animated.View style={getWaveStyle(waveAnim3)} />
                )}

                {/* Central Breathing Badge */}
                <Animated.View style={{ transform: [{ scale: pulseScaleAnim }], zIndex: 10 }}>
                  <LinearGradient
                    colors={['#EC4899', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-20 w-20 items-center justify-center rounded-full"
                    style={{
                      shadowColor: '#8B5CF6',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.45,
                      shadowRadius: 10,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="radio" size={36} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </Animated.View>
            </View>

            {/* Tuned Label */}
            <Text className="text-[13px] font-extrabold tracking-[3px] text-cyan-400 mb-2 uppercase">
              TUNED TO CHANNEL
            </Text>

            {/* Frequency Title */}
            <Text 
              style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              className="text-6xl font-black tracking-tight"
            >
              MM {frequency.toFixed(3)}
            </Text>

            {/* Channel Description */}
            <Text 
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#475569' }}
              className="text-base font-bold mt-2"
            >
              Channel {channel} • {currentChannelObj.language}
            </Text>
          </View>

          {/* Controls Row */}
          <View className="flex-row items-center justify-center gap-8 w-full my-6">
            {/* Previous Channel with Spring Press Bounce */}
            <TouchableOpacity
              onPressIn={() => handlePressIn(prevScale)}
              onPressOut={() => handlePressOut(prevScale)}
              onPress={handlePrevChannel}
              activeOpacity={1}
              style={{
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Animated.View style={{ transform: [{ scale: prevScale }] }}>
                <Ionicons name="chevron-back" size={38} color={theme === 'dark' ? '#22D3EE' : '#0891B2'} />
              </Animated.View>
            </TouchableOpacity>

            {/* Play / Pause button with Spring Press Bounce */}
            <TouchableOpacity
              onPressIn={() => handlePressIn(playScale)}
              onPressOut={() => handlePressOut(playScale)}
              onPress={() => setIsPlaying(!isPlaying)}
              activeOpacity={1}
            >
              <Animated.View
                style={{
                  transform: [{ scale: playScale }],
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: theme === 'dark' ? 0.6 : 0.35,
                  shadowRadius: 14,
                  elevation: 10,
                  borderRadius: 40,
                  borderWidth: 1.5,
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <LinearGradient
                  colors={['#EC4899', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="h-20 w-20 items-center justify-center rounded-full"
                >
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={34} 
                    color="#FFFFFF" 
                    style={!isPlaying ? { marginLeft: 4 } : undefined} 
                  />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            {/* Next Channel with Spring Press Bounce */}
            <TouchableOpacity
              onPressIn={() => handlePressIn(nextScale)}
              onPressOut={() => handlePressOut(nextScale)}
              onPress={handleNextChannel}
              activeOpacity={1}
              style={{
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Animated.View style={{ transform: [{ scale: nextScale }] }}>
                <Ionicons name="chevron-forward" size={38} color={theme === 'dark' ? '#22D3EE' : '#0891B2'} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Bottom section (Capsule and Waveform) */}
          <View className="w-full items-center mt-6">
            {/* Now Playing capsule / pill */}
            <View
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.05)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderWidth: 1,
              }}
              className="flex-row items-center justify-between px-6 py-3 rounded-full w-full max-w-[320px] mb-6"
            >
              <View className="flex-row items-center gap-2.5">
                <View className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text 
                  style={{ color: theme === 'dark' ? '#E2E8F0' : '#1E293B' }}
                  className="text-[13px] font-extrabold"
                >
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </Text>
              </View>
              <Text 
                style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}
                className="text-[13px] font-black"
              >
                {currentIndex + 1} / {filteredChannels.length}
              </Text>
            </View>

            {/* Waveform Visualizer (Appears ONLY when playing, disappears on pause) */}
            <View className="h-16 justify-end w-full mb-8">
              {isPlaying && (
                <View className="flex-row items-end justify-center gap-1.5 h-14">
                  {barHeights.map((h, i) => (
                    <View
                      key={i}
                      style={{
                        width: 4,
                        height: h,
                        backgroundColor: '#06B6D4',
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
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