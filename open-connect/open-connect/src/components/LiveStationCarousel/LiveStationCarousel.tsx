import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/spacing';
import { liveStations } from '../../data/liveStations';
import { LiveStationPlayer } from '../LiveStationPlayer/LiveStationPlayer';
import type { LiveStation } from '../../data/liveStations';

export const LiveStationCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Dot indicators animated values ──────────────────────────────────────
  const dotScales = useRef(
    liveStations.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.6))
  ).current;

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = event.nativeEvent.layoutMeasurement.width;
    const newIndex = Math.round(offsetX / cardWidth);

    if (newIndex !== activeIndex) {
      // Animate old dot down, new dot up
      Animated.parallel([
        Animated.spring(dotScales[activeIndex], {
          toValue: 0.6,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
        Animated.spring(dotScales[newIndex], {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
      ]).start();
      setActiveIndex(newIndex);
    }
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={liveStations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <LiveStationPlayer item={item} />
        )}
        contentContainerStyle={styles.carouselContent}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
      />

      {/* Animated dot indicators */}
      <View style={styles.dotsContainer}>
        {liveStations.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
              { transform: [{ scale: dotScales[i] }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    width: 20,
    backgroundColor: 'rgba(191, 123, 63, 0.9)',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});