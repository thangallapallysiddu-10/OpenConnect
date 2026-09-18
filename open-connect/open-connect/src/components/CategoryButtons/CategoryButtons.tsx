import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, Pressable, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useStaggerAnimation } from '../../utils/animations';
import { useTheme } from '../../context/ThemeContext';
import { styles } from './styles';

const CATEGORIES = [
  { label: 'All', route: '/' },
  // Open RJs directly to the stations list (skip intermediate "Explore" page)
  { label: 'RJs', route: '/rjs/stations' },
  { label: 'Podcasts', route: '/podcasts' },
  { label: 'Live Stations', route: '/livestations' },
];

export const CategoryButtons = () => {
  const [activeIndex, setActiveIndex] = useState(0); // 'All' active by default
  const isFocused = useIsFocused();
  const { theme } = useTheme();

  useEffect(() => {
    if (isFocused) {
      setActiveIndex(0);
    }
  }, [isFocused]);

  const getStaggerStyle = useStaggerAnimation(CATEGORIES.length, 80, 360);

  const scales = useRef(CATEGORIES.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index: number) => {
    Animated.spring(scales[index], {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scales[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePress = (index: number, route: string) => {
    setActiveIndex(index);
    if (route !== '/') {
      router.push(route as any);
    }
  };

  const handleHoverIn = (index: number) => {
    Animated.spring(scales[index], {
      toValue: 1.05,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handleHoverOut = (index: number) => {
    Animated.spring(scales[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category, index) => {
        const isActive = activeIndex === index;
        return (
          <Animated.View
            key={category.label}
            style={[
              styles.buttonContainer,
              getStaggerStyle(index),
              { transform: [{ scale: scales[index] }] },
              isActive && styles.buttonContainerActive,
            ]}
          >
            <BlurView
              intensity={isActive ? 60 : 40}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={[
                styles.blurWrapper,
                isActive && styles.blurWrapperActive,
              ]}
            >
              <Pressable
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                onHoverIn={() => handleHoverIn(index)}
                onHoverOut={() => handleHoverOut(index)}
                onPress={() => handlePress(index, category.route)}
                style={styles.button}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : theme === 'dark'
                        ? 'rgba(255,255,255,0.55)'
                        : 'rgba(0,0,0,0.55)',
                    },
                    isActive && styles.buttonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            </BlurView>
          </Animated.View>
        );
      })}
    </View>
  );
};