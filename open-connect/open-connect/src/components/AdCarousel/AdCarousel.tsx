import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const CARD_MARGIN = 6;

const ads = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Headphones',
    title: 'Beats Studio Pro',
    subtitle: 'Spatial audio. Pure silence.',
    tag: 'SPONSORED',
    accent: '#FF6B35',
    ctaLabel: 'Shop Now',
    ctaColor: '#FF6B35',
    ctaText: '#fff',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Headphones',
    title: 'Beats Studio Pro',
    subtitle: 'Spatial audio. Pure silence.',
    tag: 'SPONSORED',
    accent: '#FF6B35',
    ctaLabel: 'Shop Now',
    ctaColor: '#FF6B35',
    ctaText: '#fff',
    
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Headphones',
    title: 'Beats Studio Pro',
    subtitle: 'Spatial audio. Pure silence.',
    tag: 'SPONSORED',
    accent: '#FF6B35',
    ctaLabel: 'Shop Now',
    ctaColor: '#FF6B35',
    ctaText: '#fff',
    
  },
  
];

export const AdCarousel = () => {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  const CARD_WIDTH = containerWidth > 0 ? containerWidth - CARD_MARGIN * 2 : 300;
  const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotWidths = useRef(ads.map((_, i) => new Animated.Value(i === 0 ? 22 : 6))).current;
  const dotOpacities = useRef(ads.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.3))).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (!nextWidth || nextWidth === containerWidthRef.current) {
      return;
    }

    containerWidthRef.current = nextWidth;
    requestAnimationFrame(() => {
      setContainerWidth(prev => (prev === nextWidth ? prev : nextWidth));
    });
  }, []);

  const animateDots = useCallback((index: number) => {
    ads.forEach((_, i) => {
      Animated.parallel([
        Animated.spring(dotWidths[i], {
          toValue: i === index ? 22 : 6,
          useNativeDriver: false,
        }),
        Animated.timing(dotOpacities[i], {
          toValue: i === index ? 1 : 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [dotOpacities, dotWidths]);

  const goTo = useCallback((index: number) => {
    const next = (index + ads.length) % ads.length;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
    animateDots(next);
  }, [animateDots]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % ads.length;
        try {
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          animateDots(next);
        } catch {
          // Prevent scroll error if layout changes
        }
        return next;
      });
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [animateDots]);

  const onScroll = (_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(_event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    if (index !== activeIndex && index >= 0 && index < ads.length) {
      setActiveIndex(index);
      animateDots(index);
    }
  };

  const borderCol = theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {containerWidth > 0 && (
      <FlatList
        ref={flatListRef}
        data={ads}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => timerRef.current && clearInterval(timerRef.current)}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.92} 
            style={[
              styles.card, 
              { 
                width: CARD_WIDTH,
                borderWidth: 1.5,
                borderColor: borderCol
              }
            ]}
          >
            {/* Background image */}
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Diagonal scrim overlay */}
            <View style={styles.overlay} />

            {/* Top row: category pill + sponsored tag */}
            <View style={styles.topRow}>
              <View style={[styles.categoryPill, { backgroundColor: item.accent }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            </View>

            {/* Bottom row: text + CTA */}
            <View style={styles.bottomRow}>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={[styles.cta, { backgroundColor: item.ctaColor }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.ctaText, { color: item.ctaText }]}>
                  {item.ctaLabel}  →
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      )}

      {/* Dot indicators */}
      <View style={styles.dots}>
        {ads.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <Animated.View
              style={[
                styles.dot,
                { width: dotWidths[i], opacity: dotOpacities[i] },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    marginBottom: 6,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  card: {
    height: 280,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Diagonal dark scrim — heavier at bottom-left where text sits
    // React Native doesn't support CSS gradients natively;
    // use expo-linear-gradient or react-native-linear-gradient if available:
    // <LinearGradient colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.72)']}
    //   start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    // Fallback solid:
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.8,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    marginRight: 14,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.2,
  },
  cta: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});
