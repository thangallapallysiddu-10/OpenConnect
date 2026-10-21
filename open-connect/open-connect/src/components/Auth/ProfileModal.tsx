import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const ProfileModal = () => {
  const { showProfileModal, closeProfile, user, logoutSession, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showProfileModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [showProfileModal]);

  if (!showProfileModal) return null;

  const isMobile = windowWidth < 600;

  const handleLogout = async () => {
    await logoutSession();
    closeProfile();
  };

  return (
    <Modal transparent animationType="none" visible={showProfileModal} onRequestClose={closeProfile}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeProfile}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.7)' }]} />
      </TouchableOpacity>

      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalBox,
            {
              width: isMobile ? '90%' : 420,
              backgroundColor: isDark ? '#14141A' : '#FFFFFF',
              borderColor: colors.border,
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Profile Details</Text>
            <TouchableOpacity onPress={closeProfile} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={[styles.detailBox, { backgroundColor: isDark ? '#1C1C24' : '#F9F9F9', borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.name || 'Not available'}</Text>
            </View>

            <View style={[styles.detailBox, { backgroundColor: isDark ? '#1C1C24' : '#F9F9F9', borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Email ID</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.email || 'Not available'}</Text>
            </View>

            <View style={[styles.detailBox, { backgroundColor: isDark ? '#1C1C24' : '#F9F9F9', borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Role</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.role || 'Not available'}</Text>
            </View>

            <View style={[styles.detailBox, { backgroundColor: isDark ? '#1C1C24' : '#F9F9F9', borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.status || 'Not available'}</Text>
            </View>

            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: '#EF4444', opacity: loading ? 0.75 : 1 }]}
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.logoutBtnText}>{loading ? 'Logging Out...' : 'Log Out'}</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    gap: 16,
  },
  detailBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
