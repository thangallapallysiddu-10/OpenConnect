import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AnimatedPressable,
  useFadeSlideAnimation,
  useStaggerAnimation,
} from '../../src/utils/animations';

const newPodcasts = [
  { id: 'new1', title: 'The Insight Hour', host: 'Dr. Emma Collins', episodes: '8 episodes', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=200&fit=crop', description: 'Deep conversations about science and philosophy' },
  { id: 'new2', title: 'Creative Minds', host: 'Alex Rivera', episodes: '12 episodes', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=200&fit=crop', description: 'Exploring creativity and innovation' },
  { id: 'new3', title: 'Future Forward', host: 'Sarah Mitchell', episodes: '15 episodes', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=200&fit=crop', description: 'Technology trends and predictions' },
  { id: 'new4', title: 'Wellness Talk', host: 'Dr. James Park', episodes: '20 episodes', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop', description: 'Health, fitness, and mental wellness' },
  { id: 'new5', title: 'Business Bytes', host: 'Lisa Chen', episodes: '25 episodes', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop', description: 'Entrepreneurship and business insights' },
  { id: 'new6', title: 'Stories Untold', host: 'Michael Torres', episodes: '18 episodes', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop', description: 'Real stories from real people' },
  { id: 'new7', title: 'Music Theory', host: 'David Kim', episodes: '22 episodes', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=200&fit=crop', description: 'Understanding music and sound' },
  { id: 'new8', title: 'World Explorer', host: 'Jessica Blake', episodes: '14 episodes', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=300&h=200&fit=crop', description: 'Travel stories and cultural insights' },
];

const PressableCard = ({ children, onPress, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(220,80,80,0)', 'rgba(220,80,80,0.7)'],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} activeOpacity={1}>
        <Animated.View style={[style, { borderColor, borderWidth: 1 }]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AllNewPodcastsScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const numColumns = isDesktop ? 4 : 2;

  const { style: headerEntrance } = useFadeSlideAnimation('down', 20, 350, 0);
  const getStagger = useStaggerAnimation(newPodcasts.length, 45);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/podcasts/discover');
  };

  const handlePodcastPress = (podcast: typeof newPodcasts[0]) => {
    router.push({
      pathname: '/podcasts/player',
      params: {
        podcastId: podcast.id,
        podcastTitle: podcast.title,
        podcastCreator: podcast.host,
        podcastImage: podcast.image,
        fromCountryId: '',
        fromCategoryId: '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2a0000', '#1a0000', '#0f0000', '#000000']}
        style={styles.backgroundGradient}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={headerEntrance}>
          <View style={styles.header}>
            <AnimatedPressable onPress={handleBack} style={styles.backButton} scaleTo={0.85}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>New Podcasts</Text>
            <View style={{ width: 42 }} />
          </View>
        </Animated.View>

        <FlatList
          key={numColumns}
          data={newPodcasts}
          numColumns={numColumns}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={podcastListStyles.contentContainer}
          columnWrapperStyle={podcastListStyles.columnWrapper}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View style={[getStagger(index), { flex: 1 }]}>
              <PressableCard
                style={podcastListStyles.card}
                onPress={() => handlePodcastPress(item)}
              >
                <View style={podcastListStyles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={podcastListStyles.image}
                    resizeMode="cover"
                  />
                </View>
                <View style={podcastListStyles.textContainer}>
                  <Text style={podcastListStyles.title}>
                    {item.title}
                  </Text>
                  <Text style={podcastListStyles.host}>
                    {item.host}
                  </Text>
                  <Text style={podcastListStyles.episodeText}>
                    {item.episodes}
                  </Text>
                  <Text style={podcastListStyles.description}>
                    {item.description}
                  </Text>
                </View>
              </PressableCard>
            </Animated.View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0000',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});

const podcastListStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1F0606',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    padding: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  host: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  episodeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
});
