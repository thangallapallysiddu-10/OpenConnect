import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',        icon: 'home',           activeIcon: 'home',             route: '/',             targetRoute: '/'                    },
  { label: 'Favourites',  icon: 'heart-outline',  activeIcon: 'heart',            route: '/favourites',   targetRoute: '/favourites'          },
  { label: 'Podcasts',    icon: 'mic-outline',    activeIcon: 'mic',              route: '/podcasts',     targetRoute: '/podcasts/discover'   },
  { label: 'RJ Live',     icon: 'radio-outline',  activeIcon: 'radio',            route: '/rjs',          targetRoute: '/rjs/stations'        },
  { label: 'Live Stations', icon: 'wifi-outline', activeIcon: 'wifi',             route: '/livestations', targetRoute: '/livestations/stations' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function DesktopSidebar() {
  const { colors, isDark } = useTheme();
  const { isLoggedIn, showAuthModal } = useAuth();
  const { openPremiumModal } = usePremium();
  const pathname = usePathname();

  const sidebarBg   = colors.backgroundGradient[1] || '#18181F';
  const borderColor = colors.border || 'rgba(255,255,255,0.1)';
  const activeAccent = colors.iconColor || '#8B5CF6';

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View style={[S.sidebar, { backgroundColor: sidebarBg, borderRightColor: borderColor }]}>

      {/* ── Brand ── */}
      <View style={S.brand}>
        <View style={S.logoWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=100&auto=format&fit=crop' }}
            style={S.logoImg}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={[S.brandName, { color: colors.text }]}>Melody Meet</Text>
          <Text style={[S.brandSub,  { color: colors.textMuted }]}>Premium Music</Text>
        </View>
      </View>

      {/* ── Nav items ── */}
      <View style={S.navSection}>
        <Text style={[S.navLabel, { color: colors.textMuted }]}>FEATURES</Text>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                S.navItem,
                active && { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)' },
              ]}
              onPress={() => {
                router.push(item.targetRoute as any);
              }}
              activeOpacity={0.75}
            >
              <View style={[S.navIconWrap, active && { backgroundColor: activeAccent }]}>
                <Ionicons
                  name={(active ? item.activeIcon : item.icon) as any}
                  size={18}
                  color={active ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text style={[S.navText, { color: active ? activeAccent : colors.text }, active && S.navTextActive]}>
                {item.label}
              </Text>
              {active && <View style={[S.activeBar, { backgroundColor: activeAccent }]} />}
            </TouchableOpacity>
          );
        })}
        
        <View style={S.premiumCard}>
          <Text style={S.premiumTitle}>Go Premium</Text>
          <Text style={S.premiumSub}>Explore 100M+ songs ad-free</Text>
          <TouchableOpacity style={S.premiumBtn} onPress={openPremiumModal}>
            <Text style={S.premiumBtnText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={[S.footer, { borderTopColor: borderColor }]}>
        <Text style={[S.footerText, { color: colors.textMuted }]}>Melody Meet v2.0</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  sidebar: {
    width: '15%',
    minWidth: 200,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 20,
    flexDirection: 'column',
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  logoWrap: {
    width: 40, height: 40, borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#8B5CF6',
  },
  logoImg:  { width: '100%', height: '100%' },
  brandName:{ fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  brandSub: { fontSize: 11, marginTop: 1, letterSpacing: 0.5 },

  // Nav
  navSection: { flex: 1, paddingHorizontal: 12 },
  navLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    paddingHorizontal: 8, marginBottom: 12, marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
  },
  navIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  navText: { fontSize: 14, fontWeight: '600', flex: 1 },
  navTextActive: { fontWeight: '800' },
  activeBar: {
    position: 'absolute',
    right: 0, top: '20%',
    width: 3, height: '60%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },

  // Premium Card
  premiumCard: {
    marginTop: 'auto',
    marginBottom: 20,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  premiumSub: {
    color: '#B3B3B3',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  premiumBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: { fontSize: 11 },
});
