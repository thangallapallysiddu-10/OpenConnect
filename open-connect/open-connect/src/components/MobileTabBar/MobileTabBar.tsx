import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { label: 'Home',      icon: 'home-outline',   activeIcon: 'home',       route: '/',          targetRoute: '/'               },
  { label: 'Search',    icon: 'search-outline', activeIcon: 'search',     route: '/search',    targetRoute: '/search'         },
  { label: 'Favourites',icon: 'heart-outline',  activeIcon: 'heart',      route: '/favourites',targetRoute: '/favourites'     },
  { label: 'Podcasts',  icon: 'mic-outline',    activeIcon: 'mic',        route: '/podcasts',  targetRoute: '/podcasts/discover' },
  { label: 'RJ Live',   icon: 'radio-outline',  activeIcon: 'radio',      route: '/rjs',       targetRoute: '/rjs/stations'   },
];

export default function MobileTabBar() {
  const { colors, isDark } = useTheme();
  const { isLoggedIn, showAuthModal } = useAuth();
  const pathname    = usePathname();
  const insets      = useSafeAreaInsets();

  const tabBg     = isDark ? '#0F0F0F' : '#FFFFFF';
  const border    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const accent    = '#E05555';

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View style={[S.bar, { backgroundColor: tabBg, borderTopColor: border, paddingBottom: insets.bottom || 8 }]}>
      {TABS.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={S.tab}
            onPress={() => {
              router.push(tab.targetRoute as any);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(active ? tab.activeIcon : tab.icon) as any}
              size={22}
              color={active ? accent : colors.textMuted}
            />
            <Text style={[S.label, { color: active ? accent : colors.textMuted }, active && S.labelActive]}>
              {tab.label}
            </Text>
            {active && <View style={S.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: { fontWeight: '700' },
  dot: {
    position: 'absolute',
    bottom: -2,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: '#E05555',
  },
});
