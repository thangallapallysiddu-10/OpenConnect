import React, { useEffect, useRef } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';
// ─────────────────────────────────────────────────────────────────────────────
// SCALE ANIMATION HOOK
// Usage: const { scaleValue, onPressIn, onPressOut } = useScaleAnimation();
// ─────────────────────────────────────────────────────────────────────────────
export const useScaleAnimation = (initialScale = 1, scaleTo = 0.95) => {
  const scaleValue = useRef(new Animated.Value(initialScale)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: initialScale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return { scaleValue, onPressIn, onPressOut };
};

// ─────────────────────────────────────────────────────────────────────────────
// FADE ANIMATION HOOK
// Usage: const fadeAnim = useFadeAnimation(0, 1, 500);
// Apply: <Animated.View style={{ opacity: fadeAnim }}>
// ─────────────────────────────────────────────────────────────────────────────
export const useFadeAnimation = (
  initialValue = 0,
  toValue = 1,
  duration = 300,
  delay = 0
) => {
  const fadeValue = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue,
      duration,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeValue;
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE ANIMATION HOOK
// Usage: const slideStyle = useSlideAnimation('up', 30);
// Apply: <Animated.View style={slideStyle}>
// ─────────────────────────────────────────────────────────────────────────────
export const useSlideAnimation = (
  direction: 'left' | 'right' | 'up' | 'down',
  distance = 50,
  duration = 400,
  delay = 0
) => {
  const slideValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
      delay,
    } as any).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return {
          transform: [
            {
              translateX: slideValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-distance, 0],
              }),
            },
          ],
        };
      case 'right':
        return {
          transform: [
            {
              translateX: slideValue.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        };
      case 'up':
        return {
          transform: [
            {
              translateY: slideValue.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        };
      case 'down':
        return {
          transform: [
            {
              translateY: slideValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-distance, 0],
              }),
            },
          ],
        };
      default:
        return {};
    }
  };

  return getTransform();
};

// ─────────────────────────────────────────────────────────────────────────────
// FADE + SLIDE COMBINED HOOK  ← great for page entrances
// Usage: const { style } = useFadeSlideAnimation('up', 24, 400, delay);
// Apply: <Animated.View style={style}>
// ─────────────────────────────────────────────────────────────────────────────
export const useFadeSlideAnimation = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance = 24,
  duration = 420,
  delay = 0
) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateMap = {
    up: { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
    down: { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-distance, 0] }) },
    left: { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-distance, 0] }) },
    right: { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
  };

  return {
    style: {
      opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
      transform: [translateMap[direction]],
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGERED CHILDREN ANIMATION HOOK  ← for lists, carousels
// Usage: const getStaggerStyle = useStaggerAnimation(items.length, 60);
//        <Animated.View style={getStaggerStyle(index)}>
// ─────────────────────────────────────────────────────────────────────────────
export const useStaggerAnimation = (
  count: number,
  staggerMs = 60,
  duration = 380
) => {
  const animations = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.stagger(
      staggerMs,
      animations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const getStyle = (index: number) => ({
    opacity: animations[index] ?? new Animated.Value(1),
    transform: [
      {
        translateY: (animations[index] ?? new Animated.Value(1)).interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  });

  return getStyle;
};

// ─────────────────────────────────────────────────────────────────────────────
// PULSE ANIMATION HOOK  ← for live indicators, play button glow
// Usage: const pulseStyle = usePulseAnimation();
// Apply: <Animated.View style={pulseStyle}>
// ─────────────────────────────────────────────────────────────────────────────
export const usePulseAnimation = (
  minScale = 0.97,
  maxScale = 1.03,
  duration = 900
) => {
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: maxScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: minScale,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return { transform: [{ scale: pulseValue }] };
};

// ─────────────────────────────────────────────────────────────────────────────
// ROTATE ANIMATION HOOK  ← for loading spinners, vinyl records
// Usage: const rotateStyle = useRotateAnimation();
// Apply: <Animated.View style={rotateStyle}>
// ─────────────────────────────────────────────────────────────────────────────
export const useRotateAnimation = (duration = 3000, isActive = true) => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      animRef.current = Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animRef.current.start();
    } else {
      animRef.current?.stop();
    }

    return () => animRef.current?.stop();
  }, [isActive]);

  return {
    transform: [
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE-UP ENTRANCE HOOK  ← perfect for MiniPlayer mounting
// Usage: const slideUpStyle = useSlideUpEntrance();
// Apply: <Animated.View style={slideUpStyle}>
// ─────────────────────────────────────────────────────────────────────────────
export const useSlideUpEntrance = (distance = 80, duration = 350) => {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { transform: [{ translateY }], opacity };
};

// ─────────────────────────────────────────────────────────────────────────────
// SHIMMER / SKELETON ANIMATION HOOK  ← for loading states
// Usage: const shimmerStyle = useShimmerAnimation();
// Apply to a gradient overlay: <Animated.View style={shimmerStyle}>
// ─────────────────────────────────────────────────────────────────────────────
export const useShimmerAnimation = (duration = 1200) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.7, 0.3],
    }),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// BOUNCE ANIMATION HOOK  ← for icon press feedback
// Usage: const { bounceStyle, triggerBounce } = useBounceAnimation();
// ─────────────────────────────────────────────────────────────────────────────
export const useBounceAnimation = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const triggerBounce = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }),
    ]).start();
  };

  return {
    bounceStyle: { transform: [{ scale: scaleValue }] },
    triggerBounce,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED PRESSABLE COMPONENT  ← drop-in replacement for TouchableOpacity
// Usage: <AnimatedPressable onPress={fn} style={styles.btn}>...</AnimatedPressable>
// ─────────────────────────────────────────────────────────────────────────────
export const AnimatedPressable = ({ 
  children, 
  style, 
  onPress,
  onPressIn: externalPressIn,
  onPressOut: externalPressOut,
  scaleTo = 0.95,
  disabled,
  ...props 
}: {
  children?: React.ReactNode;
  style?: any;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  scaleTo?: number;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const { scaleValue, onPressIn, onPressOut } = useScaleAnimation(1, scaleTo);

  return (
    <TouchableOpacity
      onPressIn={() => { onPressIn(); externalPressIn?.(); }}
      onPressOut={() => { onPressOut(); externalPressOut?.(); }}
      onPress={onPress}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};