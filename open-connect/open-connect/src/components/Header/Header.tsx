import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { notify, shareContent } from '../../utils/ui';

type Props = {
  onRequestRJ?: () => void;
};

export const Header = ({ onRequestRJ }: Props) => {
  const { colors, isDark, theme, toggleTheme } = useTheme();
  const { isLoggedIn, showAuthModal, openProfile } = useAuth();
  const { openNotifications } = useNotifications();
  const { width: windowWidth } = useWindowDimensions();
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
      if (onRequestRJ) {
        onRequestRJ();
      } else {
        router.push('/request-rj');
      }
    });
  };

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }} className="flex-row items-center justify-between px-4 pt-2.5 pb-4 shadow-sm sm:px-5 md:px-8 lg:px-12">
      <View className="flex-row items-center gap-2.5 sm:gap-3">
        <View className="h-10 w-10 overflow-hidden items-center justify-center rounded-[13px] border-[1.5px] border-orange-500/45 bg-orange-500 shadow-md shadow-orange-500/45 elevation-8 sm:h-11 sm:w-11">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop' }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={{ color: colors.text }} className="text-base font-extrabold leading-5 sm:text-lg md:text-xl">
            Open Connect
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium leading-[14px] tracking-wide sm:text-xs">
            Your music universe
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2.5 sm:gap-3">
        {/* Notification Bell Icon */}
        <TouchableOpacity
          style={{ borderColor: colors.headerBtnBorder, backgroundColor: colors.headerBtnBg }}
          className="relative h-9 w-9 items-center justify-center rounded-full border sm:h-10 sm:w-10"
          activeOpacity={0.7}
          onPress={openNotifications}
        >
          <Ionicons name="notifications" size={18} color="#FFC107" />
          {/* Red Badge */}
          <View className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ borderColor: '#8B5CF6', backgroundColor: '#311042' }}
          className="h-9 w-9 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10"
          activeOpacity={0.8}
          onPress={() => {
            if (!isLoggedIn) {
              showAuthModal();
            } else {
              openProfile();
            }
          }}
        >
          <Text className="text-white text-xs font-black tracking-widest sm:text-sm">U</Text>
        </TouchableOpacity>

        {/* 3-dots Button */}
        <TouchableOpacity
          style={{ borderColor: colors.headerBtnBorder, backgroundColor: colors.headerBtnBg }}
          className="h-9 w-9 items-center justify-center rounded-full border sm:h-10 sm:w-10"
          activeOpacity={0.7}
          onPress={openQuickActions}
        >
          <Ionicons name="ellipsis-vertical" size={17} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions Bottom Sheet */}
      {quickVisible && (
        <Modal transparent animationType="none" onRequestClose={() => closeQuickActions()}>
          <TouchableOpacity
            className="absolute inset-0"
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
              styles.bottomSheet,
              {
                transform: [{ translateY: quickSheetTranslateY }],
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
              onPress={() => closeQuickActions()}
              className="py-2.5 items-center justify-center"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} className="h-1.5 w-12 rounded-full" />
            </TouchableOpacity>

            {/* Quick Actions Title */}
            <View className="px-5 pb-3">
              <Text style={{ color: colors.textSecondary }} className="text-[11px] font-extrabold tracking-wider uppercase">
                QUICK ACTIONS
              </Text>
            </View>

            {/* Divider line */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Menu Items */}
            <ScrollView showsVerticalScrollIndicator={false} className="px-2 mt-2" contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Request for RJ */}
              <TouchableOpacity
                onPress={handleRequestRJPress}
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: '#2D1610' }} // Brownish/Orange background
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="mic" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Request for RJ
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      Find local FM stations near you
                    </Text>
                  </View>
                </View>
                {/* Circular Arrow Container */}
                <View style={{ borderColor: 'rgba(245, 158, 11, 0.3)', borderWidth: 1 }} className="h-7 w-7 items-center justify-center rounded-full">
                  <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
                </View>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                onPress={handleSettingsPress}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: '#1E293B' }} // Dark Slate/Blue background
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="settings" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Settings
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      App preferences & account
                    </Text>
                  </View>
                </View>
                {/* Circular Arrow Container */}
                <View style={{ borderColor: 'rgba(59, 130, 246, 0.3)', borderWidth: 1 }} className="h-7 w-7 items-center justify-center rounded-full">
                  <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
                </View>
              </TouchableOpacity>

              {/* Footer text */}
              <View className="items-center justify-center mt-6 pt-4 border-t border-transparent">
                <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium tracking-wide">
                  Open Connect v1.0
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}

      {menuVisible && (
        <Modal transparent animationType="none" onRequestClose={() => closeMenu()}>
          <TouchableOpacity
            className="absolute inset-0"
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
              styles.bottomSheet,
              {
                transform: [{ translateY: sheetTranslateY }],
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
            {/* Drag Handle Indicator */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => closeMenu()}
              className="py-3 items-center justify-center"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} className="h-1.5 w-12 rounded-full" />
            </TouchableOpacity>

            {/* Header Title */}
            <View className="px-5 pb-3">
              <Text style={{ color: colors.text }} className="text-xl font-bold tracking-wide">
                Settings
              </Text>
            </View>

            {/* Divider line */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Settings List */}
            <ScrollView showsVerticalScrollIndicator={false} className="px-2 mt-2" contentContainerStyle={{ paddingBottom: 24 }}>
              {/* ITEM 1: Dark Mode / Light Mode */}
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }} className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-row items-center gap-3.5 flex-1 pr-4">
                  <View
                    style={{ backgroundColor: colors.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      Toggle between dark and light theme
                    </Text>
                  </View>
                </View>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* ITEM 2: Schedule */}
              <TouchableOpacity
                onPress={() => closeMenu(() => router.push('/rjs/live-event'))}
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: colors.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Schedule
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      See upcoming RJ sessions & events
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>

              {/* ITEM 3: Share Open Connect */}
              <TouchableOpacity
                onPress={() => closeMenu(() => shareContent({ title: 'Open Connect', message: 'Invite friends to discover live music.' }))}
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: colors.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="share-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Share Open Connect
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      Invite friends to discover live music
                    </Text>
                  </View>
                </View>
                {/* No Chevron on Share as in reference mockup! */}
              </TouchableOpacity>

              {/* ITEM 4: Report */}
              <TouchableOpacity
                onPress={() => closeMenu(() => router.push('/podcasts/report'))}
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: colors.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="warning-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Report
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      Flag inappropriate content or behaviour
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>

              {/* ITEM 5: Help & Support */}
              <TouchableOpacity
                onPress={() => closeMenu(() => notify('Help & Support', 'FAQs, contact, community guidelines.'))}
                className="flex-row items-center justify-between px-4 py-4"
                activeOpacity={0.6}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{ backgroundColor: colors.iconBg }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Ionicons name="help-circle-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
                      Help & Support
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] leading-[15px] mt-0.5">
                      FAQs, contact, community guidelines
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.chevronColor} />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
