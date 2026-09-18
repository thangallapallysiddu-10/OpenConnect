import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, useWindowDimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../../context/PremiumContext';

const FEATURES = [
  {
    id: '1',
    title: 'Ad-Free Music',
    description: 'Listen without any interruptions',
    icon: 'musical-notes',
    color: '#EC4899', // Pink
  },
  {
    id: '2',
    title: 'Offline Mode',
    description: 'Download and listen anywhere',
    icon: 'cloud-download',
    color: '#8B5CF6', // Purple
  },
  {
    id: '3',
    title: 'High Quality',
    description: 'Crystal clear 320kbps audio',
    icon: 'headset',
    color: '#10B981', // Emerald
  },
];

export const PremiumFeatures = () => {
  const { colors, isDark } = useTheme();
  const { showPremiumModal, closePremiumModal } = usePremium();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  useEffect(() => {
    if (showPremiumModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: windowHeight, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [showPremiumModal]);

  if (!showPremiumModal) return null;

  const isMobile = windowWidth < 768;

  const handleUpgrade = () => {
    Alert.alert('Success', 'You have successfully upgraded to Premium!');
    closePremiumModal();
  };

  return (
    <Modal transparent animationType="none" visible={showPremiumModal} onRequestClose={closePremiumModal}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closePremiumModal}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.75)' }]} />
      </TouchableOpacity>

      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalBox,
            {
              width: isMobile ? '95%' : 900,
              backgroundColor: isDark ? '#14141A' : '#F9F9F9',
              borderColor: colors.border,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={closePremiumModal} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Upgrade to Premium</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Unlock the ultimate music experience with these exclusive features.
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {FEATURES.map((feature) => (
              <View 
                key={feature.id} 
                style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border }]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={32} color={feature.color} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.upgradeBtn} onPress={handleUpgrade}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBg}
            >
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 30,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  card: {
    flex: 1,
    minWidth: 240,
    maxWidth: 280,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeBtn: {
    alignSelf: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  gradientBg: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
