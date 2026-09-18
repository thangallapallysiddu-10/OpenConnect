// app>podcasts>trending.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

// ── Types ─────────────────────────────────────────────────────────────────
interface Podcast {
  id: string;
  title: string;
  creator: string;
  creatorImage?: string;
  episodes: string;
  image: string;
  category: string;
  duration: string;
  isNew?: boolean;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  listeners?: string;
  description?: string;
  audioUrl?: string;
}

// ── Mock Data for Different Timeframes ────────────────────────────────────
const podcastData: Record<string, Podcast[]> = {
  'This Week': [
    { 
      id: 'us2',  
      title: 'Up First',                    
      creator: 'NPR',             
      creatorImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop',
      episodes: '21 episodes', 
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop', 
      category: 'News',        
      duration: '15 min', 
      isNew: true,
      trend: 'up',
      trendValue: '+24%',
      listeners: '1.2M',
      description: 'Start your day with the latest news and analysis from NPR.',
      audioUrl: 'https://example.com/audio1.mp3'
    },
    { 
      id: 'us12', 
      title: 'Lex Fridman Podcast',         
      creator: 'Lex Fridman',     
      creatorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      episodes: '18 episodes', 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=400&fit=crop', 
      category: 'Technology',  
      duration: '2 hr',   
      isNew: true,
      trend: 'up',
      trendValue: '+18%',
      listeners: '890K',
      description: 'Deep conversations about science, technology, and the human condition.',
      audioUrl: 'https://example.com/audio2.mp3'
    },
    { 
      id: 'us4',  
      title: 'Serial',                      
      creator: 'Sarah Koenig',    
      creatorImage: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=100&h=100&fit=crop',
      episodes: '32 episodes', 
      image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=600&h=400&fit=crop', 
      category: 'True Crime',  
      duration: '45 min',
      listeners: '2.1M',
      description: 'A true crime story that unfolds week by week.',
      audioUrl: 'https://example.com/audio3.mp3'
    },
  ],
  'This Month': [
    { 
      id: 'us15', 
      title: 'Huberman Lab',                
      creator: 'Andrew Huberman', 
      creatorImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&h=100&fit=crop',
      episodes: '24 episodes', 
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop', 
      category: 'Wellness',    
      duration: '1 hr 30 min',
      trend: 'up',
      trendValue: '+12%',
      listeners: '750K',
      description: 'Learn how your brain and body work from a neuroscientist.',
      audioUrl: 'https://example.com/audio4.mp3'
    },
    { 
      id: 'us1',  
      title: 'The Daily',                   
      creator: 'NYT / Michael Barbaro',   
      creatorImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=100&h=100&fit=crop',
      episodes: '40 episodes', 
      image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop', 
      category: 'News',        
      duration: '20 min',
      trend: 'down',
      trendValue: '-5%',
      listeners: '1.5M',
      description: 'The stories behind the headlines, told by NYT journalists.',
      audioUrl: 'https://example.com/audio5.mp3'
    },
    { 
      id: 'us6',  
      title: 'How I Built This',            
      creator: 'Guy Raz',         
      creatorImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop',
      episodes: '28 episodes', 
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', 
      category: 'Business',    
      duration: '55 min', 
      isNew: true,
      trend: 'up',
      trendValue: '+31%',
      listeners: '620K',
      description: 'Stories behind the companies and innovators shaping our world.',
      audioUrl: 'https://example.com/audio6.mp3'
    },
  ],
  'All Time': [
    { 
      id: 'us7',  
      title: 'Tim Ferriss Show',            
      creator: 'Tim Ferriss',     
      creatorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      episodes: '35 episodes', 
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop', 
      category: 'Business',    
      duration: '1 hr 20 min',
      listeners: '980K',
      description: 'Interviews with world-class performers from various fields.',
      audioUrl: 'https://example.com/audio7.mp3'
    },
    { 
      id: 'us8',  
      title: 'Stuff You Should Know',       
      creator: 'iHeart Radio',   
      creatorImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&h=100&fit=crop',
      episodes: '50 episodes', 
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop', 
      category: 'Education',   
      duration: '40 min',
      listeners: '2.3M',
      description: 'Learn about everything from science to history.',
      audioUrl: 'https://example.com/audio8.mp3'
    },
    { 
      id: 'us9',  
      title: 'Crime Junkie',                
      creator: 'Ashley Flowers', 
      creatorImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=100&h=100&fit=crop',
      episodes: '22 episodes', 
      image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600&h=400&fit=crop', 
      category: 'True Crime',  
      duration: '35 min', 
      isNew: true,
      listeners: '1.8M',
      description: 'True crime stories that will keep you on the edge.',
      audioUrl: 'https://example.com/audio9.mp3'
    },
  ],
};

// ── Helper Functions ──────────────────────────────────────────────────────
const parseTrendValue = (trendValue: string | undefined): number => {
  if (!trendValue) return 0;
  // Extract numeric value including negative sign
  const numericValue = parseInt(trendValue.replace(/[^0-9-]/g, '')) || 0;
  return numericValue;
};

const parseListenersCount = (listeners: string | undefined): number => {
  if (!listeners) return 0;
  
  const numericValue = parseFloat(listeners.replace(/[^0-9.]/g, ''));
  if (listeners.includes('M')) return numericValue * 1000000;
  if (listeners.includes('K')) return numericValue * 1000;
  return numericValue || 0;
};

// ── Mini Player Component ─────────────────────────────────────────────────
// Mini Player Component - Updated with solid background
const MiniPlayer = ({ 
  podcast, 
  isPlaying, 
  onPlayPause, 
  onClose, 
  onExpand 
}: { 
  podcast: Podcast | null; 
  isPlaying: boolean; 
  onPlayPause: () => void; 
  onClose: () => void;
  onExpand: () => void;
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (podcast) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 100,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [podcast]);

  if (!podcast) return null;

  return (
    <Animated.View
      style={[
        styles.miniPlayer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          width: isDesktop ? 480 : '100%',
          alignSelf: 'center',
          borderLeftWidth: isDesktop ? 1 : 0,
          borderRightWidth: isDesktop ? 1 : 0,
          borderColor: 'rgba(224,85,85,0.3)',
        },
      ]}
    >
      <View style={styles.miniPlayerContent}>
        <Image source={{ uri: podcast.image }} style={styles.miniPlayerImage} />
        
        <View style={styles.miniPlayerInfo}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>{podcast.title}</Text>
          <Text style={styles.miniPlayerCreator} numberOfLines={1}>{podcast.creator}</Text>
        </View>

        <View style={styles.miniPlayerControls}>
          <TouchableOpacity onPress={onPlayPause} style={styles.miniPlayerButton}>
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={20} 
              color="#E05555" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.miniPlayerButton}>
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.miniPlayerProgress}>
        <View style={[styles.miniPlayerProgressFill, { width: '45%' }]} />
      </View>
    </Animated.View>
  );
};

// ── Full Player Modal ─────────────────────────────────────────────────────
const FullPlayerModal = ({ 
  visible, 
  podcast, 
  onClose, 
  isPlaying, 
  onPlayPause 
}: { 
  visible: boolean; 
  podcast: Podcast | null; 
  onClose: () => void; 
  isPlaying: boolean; 
  onPlayPause: () => void;
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const artworkSize = Math.min(windowWidth * 0.7, 300);
  const translateY = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: height,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!podcast) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.fullPlayerOverlay, { opacity: fadeAnim }]}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View 
          style={[
            styles.fullPlayerContainer,
            {
              transform: [{ translateY }, { scale: scaleAnim }],
              width: isDesktop ? 480 : '100%',
              alignSelf: 'center',
              borderLeftWidth: isDesktop ? 1 : 0,
              borderRightWidth: isDesktop ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.1)',
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.playerHandle} />

          {/* Header */}
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.playerHeaderButton}>
              <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.playerHeaderTitle}>Now Playing</Text>
            <TouchableOpacity style={styles.playerHeaderButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Artwork */}
          <View style={styles.playerArtworkContainer}>
            <Image source={{ uri: podcast.image }} style={[styles.playerArtwork, { width: artworkSize, height: artworkSize }]} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.playerArtworkGradient}
            />
          </View>

          {/* Info */}
          <View style={styles.playerInfo}>
            <Text style={styles.playerTitle}>{podcast.title}</Text>
            <Text style={styles.playerCreator}>{podcast.creator}</Text>
          </View>

          {/* Progress */}
          <View style={styles.playerProgress}>
            <View style={styles.playerProgressBar}>
              <View style={[styles.playerProgressFill, { width: '30%' }]} />
            </View>
            <View style={styles.playerProgressTime}>
              <Text style={styles.playerProgressTimeText}>15:30</Text>
              <Text style={styles.playerProgressTimeText}>-45:30</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.playerControlButton}>
              <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onPlayPause} style={styles.playerPlayButton}>
              <LinearGradient
                colors={['#E05555', '#B23B3B']}
                style={styles.playerPlayButtonGradient}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playerControlButton}>
              <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Additional Controls */}
          <View style={styles.playerExtraControls}>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="list-outline" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="speedometer-outline" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Filter Modal Component ────────────────────────────────────────────────
const FilterModal = ({ 
  visible, 
  onClose, 
  onApply,
  currentFilter 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onApply: (filters: any) => void;
  currentFilter: string;
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('trending');

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: height,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }
  }, [visible]);

  const categories = ['All', 'News', 'Technology', 'True Crime', 'Wellness', 'Business', 'Education'];
  const durations = ['All', 'Short (<15 min)', 'Medium (15-45 min)', 'Long (>45 min)'];
  const sortOptions = ['Trending', 'Most Listened', 'Newest', 'Oldest'];

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      duration: selectedDuration,
      sortBy: sortBy.toLowerCase(),
    });
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity 
        style={styles.filterOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.filterSheet,
            { 
              transform: [{ translateY }],
              width: isDesktop ? 480 : '100%',
              alignSelf: 'center',
              borderLeftWidth: isDesktop ? 1 : 0,
              borderRightWidth: isDesktop ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.1)',
            }
          ]}
        >
          <BlurView intensity={90} tint="dark" style={styles.filterSheetBlur}>
            <View style={styles.filterHandle} />
            
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Categories */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterChipContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterChip,
                        selectedCategory === cat && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedCategory === cat && styles.filterChipTextActive,
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Duration</Text>
                <View style={styles.filterChipContainer}>
                  {durations.map((dur) => (
                    <TouchableOpacity
                      key={dur}
                      style={[
                        styles.filterChip,
                        selectedDuration === dur && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedDuration(dur)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedDuration === dur && styles.filterChipTextActive,
                      ]}>{dur}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.filterChipContainer}>
                  {sortOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.filterChip,
                        sortBy === opt.toLowerCase() && styles.filterChipActive,
                      ]}
                      onPress={() => setSortBy(opt.toLowerCase())}
                    >
                      <Text style={[
                        styles.filterChipText,
                        sortBy === opt.toLowerCase() && styles.filterChipTextActive,
                      ]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity 
                style={styles.filterResetButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedDuration('All');
                  setSortBy('trending');
                }}
              >
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.filterApplyButton}
                onPress={handleApply}
              >
                <LinearGradient
                  colors={['#E05555', '#B23B3B']}
                  style={styles.filterApplyGradient}
                >
                  <Text style={styles.filterApplyText}>Apply Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ── Trending Card Component ───────────────────────────────────────────────
const TrendingCard = ({ 
  item, 
  index, 
  onPress,
  onPlay,
}: { 
  item: Podcast; 
  index: number; 
  onPress: () => void;
  onPlay: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(translateY, {
        toValue: -2,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getTrendIcon = () => {
    if (!item.trend) return null;
    switch (item.trend) {
      case 'up':
        return <Ionicons name="trending-up" size={14} color="#4CAF50" />;
      case 'down':
        return <Ionicons name="trending-down" size={14} color="#F44336" />;
      default:
        return <Ionicons name="remove" size={14} color="#FFC107" />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale }, { translateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <Animated.View style={[styles.cardGlow, { opacity: glowOpacity }]} />
        
        <View style={styles.card}>
          {/* Hero Image with Gradient Overlay */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)', '#0A0A0A']}
              locations={[0, 0.6, 1]}
              style={styles.imageGradient}
            />
            
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            {/* Play Button Overlay */}
            <TouchableOpacity onPress={onPlay} activeOpacity={0.8}>
              <BlurView intensity={40} tint="dark" style={styles.playButtonContainer}>
                <LinearGradient
                  colors={['#E05555', '#B23B3B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            {/* Title Row */}
            <View style={styles.titleRow}>
              <Text style={styles.podcastTitle} numberOfLines={1}>{item.title}</Text>
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>

            {/* Creator Row */}
            <View style={styles.creatorRow}>
              {item.creatorImage && (
                <Image source={{ uri: item.creatorImage }} style={styles.creatorAvatar} />
              )}
              <Text style={styles.creatorName} numberOfLines={1}>{item.creator}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Meta Information */}
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Ionicons name="headset-outline" size={14} color="#E05555" />
                <Text style={styles.metaText}>{item.episodes}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#E05555" />
                <Text style={styles.metaText}>{item.duration}</Text>
              </View>
              
              {item.listeners && (
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color="#E05555" />
                  <Text style={styles.metaText}>{item.listeners} listeners</Text>
                </View>
              )}

              {item.trend && item.trendValue && (
                <View style={[styles.metaItem, styles.trendItem]}>
                  {getTrendIcon()}
                  <Text style={[
                    styles.trendText,
                    item.trend === 'up' && styles.trendUp,
                    item.trend === 'down' && styles.trendDown,
                  ]}>
                    {item.trendValue}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.previewButton} onPress={onPlay}>
                <Ionicons name="play-circle-outline" size={18} color="#E05555" />
                <Text style={styles.previewText}>Preview Episode</Text>
              </TouchableOpacity>

              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="add-circle-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
export default function TrendingScreen() {
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All',
    duration: 'All',
    sortBy: 'trending',
  });
  
  // Player state
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  // Get podcasts based on active filter
  const getPodcasts = () => {
    let podcasts = [...podcastData[activeFilter]];

    // Apply category filter
    if (appliedFilters.category !== 'All') {
      podcasts = podcasts.filter(p => p.category === appliedFilters.category);
    }

    // Apply duration filter
    if (appliedFilters.duration !== 'All') {
      // Implement duration filtering logic here
    }

    // Apply sorting with proper type handling
    switch (appliedFilters.sortBy) {
      case 'trending':
        podcasts.sort((a, b) => {
          const aValue = parseTrendValue(a.trendValue);
          const bValue = parseTrendValue(b.trendValue);
          return bValue - aValue; // Descending order (highest first)
        });
        break;
        
      case 'most listened':
        podcasts.sort((a, b) => {
          const aValue = parseListenersCount(a.listeners);
          const bValue = parseListenersCount(b.listeners);
          return bValue - aValue; // Descending order (most listened first)
        });
        break;
        
      case 'newest':
        podcasts.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
        
      case 'oldest':
        podcasts.sort((a, b) => {
          if (!a.isNew && b.isNew) return -1;
          if (a.isNew && !b.isNew) return 1;
          return 0;
        });
        break;
        
      default:
        // Default sorting (by id)
        break;
    }

    return podcasts;
  };

  const handleBack = () => router.canGoBack() ? router.back() : router.replace('/podcasts/discover');
  
  const handleCardPress = (podcast: Podcast) => {
    router.push({ 
      pathname: '/podcasts/player', 
      params: { 
        podcastId: podcast.id, 
        podcastTitle: podcast.title, 
        podcastCreator: podcast.creator, 
        podcastImage: podcast.image, 
      } 
    });
  };

  const handlePlayPress = (podcast: Podcast) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClosePlayer = () => {
    setCurrentPodcast(null);
    setIsPlaying(false);
  };

  const handleExpandPlayer = () => {
    setPlayerModalVisible(true);
  };

  const filters = ['This Week', 'This Month', 'All Time'];
  const podcasts = getPodcasts();

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1A1A1A', '#0A0A0A', '#000000']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={isDesktop ? { width: '100%', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', flex: 1 } : { flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Trending Podcasts</Text>
              <Text style={styles.headerSubtitle}>Most popular {activeFilter.toLowerCase()}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={22} color="#FFFFFF" />
              {(appliedFilters.category !== 'All' || appliedFilters.duration !== 'All' || appliedFilters.sortBy !== 'trending') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.filterTabActive
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter && styles.filterTabTextActive
                ]}>
                  {filter}
                </Text>
                {activeFilter === filter && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Podcast List */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 24 } : null}>
              {podcasts.map((item, index) => (
                <View key={item.id} style={isDesktop ? { width: '48%' } : null}>
                  <TrendingCard
                    item={item}
                    index={index}
                    onPress={() => handleCardPress(item)}
                    onPlay={() => handlePlayPress(item)}
                  />
                </View>
              ))}
            </View>
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>

        {/* Mini Player */}
        <MiniPlayer
          podcast={currentPodcast}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onClose={handleClosePlayer}
          onExpand={handleExpandPlayer}
        />

        {/* Full Player Modal */}
        <FullPlayerModal
          visible={playerModalVisible}
          podcast={currentPodcast}
          onClose={() => setPlayerModalVisible(false)}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={setAppliedFilters}
          currentFilter={activeFilter}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E05555',
    borderWidth: 1,
    borderColor: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#E05555',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#E05555',
    borderRadius: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardTouchable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(224,85,85,0.1)',
    borderRadius: 24,
  },
  card: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(224,85,85,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  playButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  podcastTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  newBadge: {
    backgroundColor: 'rgba(224,85,85,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(224,85,85,0.3)',
  },
  newBadgeText: {
    fontSize: 10,
    color: '#E05555',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  creatorName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  trendItem: {
    marginLeft: 'auto',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendUp: {
    color: '#4CAF50',
  },
  trendDown: {
    color: '#F44336',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(224,85,85,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(224,85,85,0.2)',
  },
  previewText: {
    fontSize: 13,
    color: '#E05555',
    fontWeight: '600',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  bottomSpacer: {
    height: 32,
  },

  // Mini Player Styles
  // Mini Player Styles - Updated to match player.tsx
miniPlayer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 80,
  backgroundColor: '#121212', // Solid dark background
  borderTopWidth: 1,
  borderTopColor: 'rgba(224,85,85,0.3)',
  boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.3)',
  elevation: 20,
},
miniPlayerContent: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  gap: 12,
  backgroundColor: '#121212', // Solid dark background
},
miniPlayerImage: {
  width: 48,
  height: 48,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(224,85,85,0.3)',
},
miniPlayerInfo: {
  flex: 1,
},
miniPlayerTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 2,
},
miniPlayerCreator: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.6)',
},
miniPlayerControls: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
},
miniPlayerButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
miniPlayerProgress: {
  height: 3,
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.1)',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
},
miniPlayerProgressFill: {
  height: '100%',
  backgroundColor: '#E05555',
},
  miniPlayerBlur: {
    flex: 1,
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,85,85,0.3)',
  },
  
  
 

  // Full Player Modal Styles
  fullPlayerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullPlayerContainer: {
    height: height * 0.9,
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  playerHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  playerHeaderButton: {
    padding: 4,
  },
  playerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerArtworkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playerArtwork: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  playerArtworkGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  playerCreator: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  playerProgress: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  playerProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  playerProgressFill: {
    height: '100%',
    backgroundColor: '#E05555',
    borderRadius: 2,
  },
  playerProgressTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerProgressTimeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 30,
  },
  playerControlButton: {
    padding: 8,
  },
  playerPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  playerPlayButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerExtraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },

  // Filter Modal Styles
  filterOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterSheet: {
    height: height * 0.8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  filterSheetBlur: {
    flex: 1,
    padding: 20,
  },
  filterHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(224,85,85,0.2)',
    borderColor: '#E05555',
  },
  filterChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  filterChipTextActive: {
    color: '#E05555',
    fontWeight: '600',
  },
  filterFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  filterResetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterApplyGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});