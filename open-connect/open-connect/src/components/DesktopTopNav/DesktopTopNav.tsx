import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function DesktopTopNav() {
  const { colors, isDark, theme, toggleTheme } = useTheme();
  const { isLoggedIn, user, showAuthModal, openProfile } = useAuth();
  const { openNotifications } = useNotifications();
  const pathname = usePathname();
  const { width: windowWidth } = useWindowDimensions();

  // Modal dimensions
  const sheetWidth = Math.min(windowWidth, 480);
  const sheetLeft = windowWidth > 480 ? (windowWidth - 480) / 2 : 0;

  // Settings bottom sheet states
  const [menuVisible, setMenuVisible] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  // Quick actions bottom sheet states
  const [quickVisible, setQuickVisible] = useState(false);
  const quickBackdropOpacity = useRef(new Animated.Value(0)).current;
  const quickSheetTranslateY = useRef(new Animated.Value(600)).current;

  const navBg = isDark ? 'rgba(15, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = colors.border || 'rgba(255,255,255,0.1)';

  // ── Navigation title ──────────────────────────────────────────────────────────
  const getTitle = () => {
    if (pathname === '/') return 'Home';
    if (pathname.startsWith('/search')) return 'Search';
    if (pathname.startsWith('/favourites')) return 'Favourites';
    if (pathname.startsWith('/podcasts/discover')) return 'Podcasts';
    if (pathname.startsWith('/podcasts/player')) return 'Now Playing';
    if (pathname.startsWith('/podcasts')) return 'Podcasts';
    if (pathname.startsWith('/rjs')) return 'RJ Live';
    if (pathname.startsWith('/livestations')) return 'Live Stations';
    return 'Open Connect';
  };

  const canGoBack = pathname !== '/';

  // ── Modal Actions ─────────────────────────────────────────────────────────────
  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }),
    ]).start();
  };

  const closeMenu = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
      cb?.();
    });
  };

  const openQuickActions = () => {
    setQuickVisible(true);
    Animated.parallel([
      Animated.timing(quickBackdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(quickSheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }),
    ]).start();
  };

  const closeQuickActions = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(quickBackdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(quickSheetTranslateY, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuickVisible(false);
      cb?.();
    });
  };

  const handleSettingsPress = () => {
    closeQuickActions(() => {
      openMenu();
    });
  };

  const handleRequestRJPress = () => {
    closeQuickActions(() => {
      router.push('/request-rj');
    });
  };

  return (
    <>
      <View style={[S.navbar, { backgroundColor: navBg, borderBottomColor: borderColor }]}>
        {/* Left — back/forward navigation */}
        <View style={S.navLeft}>
          <TouchableOpacity
            style={[S.navBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', opacity: canGoBack ? 1 : 0.4 }]}
            onPress={() => router.canGoBack() && router.back()}
            activeOpacity={0.7}
            disabled={!canGoBack}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.navBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', opacity: 0.4 }]}
            activeOpacity={0.7}
            disabled
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Center — global search */}
        <View style={S.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={S.searchIcon} />
          <TextInput
            style={[
              S.searchInput,
              { color: colors.text, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border }
            ]}
            placeholder="Search songs, artists, albums, playlists"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Right — profile & settings */}
        <View style={S.navRight}>
          <TouchableOpacity
            style={[S.navBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
            activeOpacity={0.7}
            onPress={openNotifications}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              S.avatarBtn,
              isLoggedIn
                ? { backgroundColor: '#1a3a2a', borderColor: '#22c55e' }
                : { backgroundColor: '#311042', borderColor: '#8B5CF6' },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (!isLoggedIn) {
                showAuthModal();
              } else {
                openProfile();
              }
            }}
          >
            <Text style={S.avatarText}>
              {isLoggedIn && user?.name
                ? user.name.trim().charAt(0).toUpperCase()
                : 'U'}
            </Text>
            {isLoggedIn && (
              <View style={S.onlineDot} />
            )}
          </TouchableOpacity>

          {/* 3-dots Button */}
          <TouchableOpacity
            style={[S.navBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
            activeOpacity={0.7}
            onPress={openQuickActions}
          >
            <Ionicons name="ellipsis-vertical" size={17} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Quick Actions Modal ──────────────────────────────────────────────── */}
      {quickVisible && (
        <Modal transparent animationType="none" onRequestClose={() => closeQuickActions()}>
          <TouchableOpacity
            style={S.modalOverlay}
            activeOpacity={1}
            onPress={() => closeQuickActions()}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: quickBackdropOpacity,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                },
              ]}
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              S.bottomSheet,
              {
                transform: [{ translateY: quickSheetTranslateY }],
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                width: sheetWidth,
                left: sheetLeft,
                right: windowWidth > 480 ? 'auto' : 0,
              },
            ]}
          >
            <View style={{ height: 4, backgroundColor: '#D97706', borderTopLeftRadius: 28, borderTopRightRadius: 28 }} />
            <TouchableOpacity activeOpacity={0.8} onPress={() => closeQuickActions()} style={S.sheetHandleArea}>
              <View style={[S.sheetHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                QUICK ACTIONS
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}>
              {/* Request RJ */}
              <TouchableOpacity
                onPress={handleRequestRJPress}
                style={[S.menuItem, { borderBottomColor: colors.border }]}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: '#2D1610' }]}>
                    <Ionicons name="mic" size={20} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Request for RJ</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>Find local FM stations near you</Text>
                  </View>
                </View>
                <View style={[S.menuChevronBox, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                  <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
                </View>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                onPress={handleSettingsPress}
                style={S.menuItem}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: '#1E293B' }]}>
                    <Ionicons name="settings" size={20} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Settings</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>App preferences & account</Text>
                  </View>
                </View>
                <View style={[S.menuChevronBox, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
                  <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}

      {/* ── Settings Modal ───────────────────────────────────────────────────── */}
      {menuVisible && (
        <Modal transparent animationType="none" onRequestClose={() => closeMenu()}>
          <TouchableOpacity
            style={S.modalOverlay}
            activeOpacity={1}
            onPress={() => closeMenu()}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: backdropOpacity,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                },
              ]}
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              S.bottomSheet,
              {
                transform: [{ translateY: sheetTranslateY }],
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                width: sheetWidth,
                left: sheetLeft,
                right: windowWidth > 480 ? 'auto' : 0,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={0.8} onPress={() => closeMenu()} style={S.sheetHandleArea}>
              <View style={[S.sheetHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                Settings
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}>
              {/* Dark Mode */}
              <View style={[S.menuItem, { borderBottomColor: colors.border }]}>
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.iconColor} />
                  </View>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>Toggle between dark and light theme</Text>
                  </View>
                </View>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Schedule */}
              <TouchableOpacity
                onPress={() => closeMenu(() => Alert.alert('Schedule', 'See upcoming RJ sessions & events.'))}
                style={[S.menuItem, { borderBottomColor: colors.border }]}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="calendar-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Schedule</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>See upcoming RJ sessions & events</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                onPress={() => closeMenu(() => Alert.alert('Share', 'Invite friends to discover live music.'))}
                style={[S.menuItem, { borderBottomColor: colors.border }]}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="share-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Share Open Connect</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>Invite friends to discover live music</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Report */}
              <TouchableOpacity
                onPress={() => closeMenu(() => Alert.alert('Report', 'Flag inappropriate content or behaviour.'))}
                style={[S.menuItem, { borderBottomColor: colors.border }]}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="warning-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Report</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>Flag inappropriate content or behaviour</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>

              {/* Support */}
              <TouchableOpacity
                onPress={() => closeMenu(() => Alert.alert('Help & Support', 'FAQs, contact, community guidelines.'))}
                style={S.menuItem}
                activeOpacity={0.6}
              >
                <View style={S.menuItemLeft}>
                  <View style={[S.menuIconBox, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.menuItemTitle, { color: colors.text }]}>Help & Support</Text>
                    <Text style={[S.menuItemSub, { color: colors.textMuted }]}>FAQs, contact, community guidelines</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  navbar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  searchContainer: {
    flex: 1,
    maxWidth: 500,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 150,
    justifyContent: 'flex-end',
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  pageTitle: {
    fontSize: 16, fontWeight: '700', marginLeft: 8, letterSpacing: 0.2,
  },
  avatarBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#0f0f14',
  },

  // Modals
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHandleArea: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    height: 6,
    width: 48,
    borderRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIconBox: {
    height: 40, width: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14, fontWeight: '700', letterSpacing: 0.2,
  },
  menuItemSub: {
    fontSize: 11, marginTop: 2, lineHeight: 15,
  },
  menuChevronBox: {
    borderWidth: 1,
    height: 28, width: 28,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
});
