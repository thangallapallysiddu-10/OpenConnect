import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

// ── Tokens ────────────────────────────────────────────────────────────────────
const BG     = '#080810';
const CARD   = '#111120';
const WHITE  = '#FFFFFF';
const TEXT2  = 'rgba(255,255,255,0.55)';
const TEXT3  = 'rgba(255,255,255,0.28)';
const PURPLE = '#8B5CF6';
const BORDER = 'rgba(255,255,255,0.07)';

// ── Data ──────────────────────────────────────────────────────────────────────

const INDIA_STATES = [
  { id: 's1',  name: 'Telangana',      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { id: 's2',  name: 'Andhra Pradesh', cities: ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati'] },
  { id: 's3',  name: 'Maharashtra',    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  { id: 's4',  name: 'Karnataka',      cities: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'] },
  { id: 's5',  name: 'Tamil Nadu',     cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'] },
  { id: 's6',  name: 'Delhi NCR',      cities: ['New Delhi', 'Noida', 'Gurgaon', 'Faridabad'] },
  { id: 's7',  name: 'Gujarat',        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { id: 's8',  name: 'Rajasthan',      cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { id: 's9',  name: 'West Bengal',    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'] },
  { id: 's10', name: 'Punjab',         cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'] },
  { id: 's11', name: 'Kerala',         cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'] },
  { id: 's12', name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'] },
];

const CITY_STATIONS: Record<string, { id: string; name: string; frequency: string; genre: string; accent: string; listeners: string; image: string }[]> = {
  'Hyderabad': [
    { id: 'h1', name: 'Radio Mirchi 98.3',    frequency: '98.3',  genre: 'Bollywood',   accent: '#EF4444', listeners: '82k',  image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
    { id: 'h2', name: 'Big FM 92.7',          frequency: '92.7',  genre: 'Telugu',      accent: '#F97316', listeners: '71k',  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 'h3', name: 'Red FM 93.5',          frequency: '93.5',  genre: 'Pop',         accent: '#EF4444', listeners: '64k',  image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop' },
    { id: 'h4', name: 'Radio City 91.1',      frequency: '91.1',  genre: 'Hip-Hop',     accent: '#8B5CF6', listeners: '48k',  image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=400&h=400&fit=crop' },
    { id: 'h5', name: 'AIR FM Rainbow 101.9', frequency: '101.9', genre: 'Classic',     accent: '#14B8A6', listeners: '33k',  image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop' },
    { id: 'h6', name: 'Telugu Gold 104.0',    frequency: '104.0', genre: 'Telugu Folk', accent: '#EAB308', listeners: '55k',  image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
  ],
  'Mumbai': [
    { id: 'm1', name: 'Radio Mirchi 98.3', frequency: '98.3',  genre: 'Bollywood', accent: '#EF4444', listeners: '1.2M', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
    { id: 'm2', name: 'Red FM 93.5',       frequency: '93.5',  genre: 'Pop',       accent: '#EF4444', listeners: '980k', image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop' },
    { id: 'm3', name: 'Big FM 92.7',       frequency: '92.7',  genre: 'Hindi',     accent: '#F97316', listeners: '850k', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 'm4', name: 'Radio City 91.1',   frequency: '91.1',  genre: 'Retro',     accent: '#8B5CF6', listeners: '640k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=400&h=400&fit=crop' },
    { id: 'm5', name: 'Fever FM 104.0',    frequency: '104.0', genre: 'Dance',     accent: '#EC4899', listeners: '710k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
  ],
  'Chennai': [
    { id: 'c1', name: 'Sun FM 93.5',       frequency: '93.5',  genre: 'Tamil',     accent: '#EAB308', listeners: '420k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
    { id: 'c2', name: 'Hello FM 106.4',    frequency: '106.4', genre: 'Tamil Pop', accent: '#EC4899', listeners: '390k', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 'c3', name: 'Radio Mirchi 98.3', frequency: '98.3',  genre: 'Bollywood', accent: '#EF4444', listeners: '310k', image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop' },
    { id: 'c4', name: 'Big FM 92.7',       frequency: '92.7',  genre: 'Tamil Folk',accent: '#F97316', listeners: '280k', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop' },
  ],
  'Bengaluru': [
    { id: 'b1', name: 'Radio City 91.1',   frequency: '91.1',  genre: 'Kannada',   accent: '#8B5CF6', listeners: '510k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=400&h=400&fit=crop' },
    { id: 'b2', name: 'Radio Mirchi 98.3', frequency: '98.3',  genre: 'Bollywood', accent: '#EF4444', listeners: '470k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
    { id: 'b3', name: 'Big FM 92.7',       frequency: '92.7',  genre: 'Hindi',     accent: '#F97316', listeners: '360k', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 'b4', name: 'Fever FM 104.0',    frequency: '104.0', genre: 'EDM',       accent: '#EC4899', listeners: '290k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
  ],
  'New Delhi': [
    { id: 'd1', name: 'Radio Mirchi 98.3', frequency: '98.3',  genre: 'Bollywood', accent: '#EF4444', listeners: '1.4M', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
    { id: 'd2', name: 'Big FM 92.7',       frequency: '92.7',  genre: 'Hindi',     accent: '#F97316', listeners: '1.1M', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 'd3', name: 'Red FM 93.5',       frequency: '93.5',  genre: 'Punjabi',   accent: '#EF4444', listeners: '920k', image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop' },
    { id: 'd4', name: 'Fever FM 104.0',    frequency: '104.0', genre: 'Dance',     accent: '#EC4899', listeners: '780k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { id: 'd5', name: 'Radio City 91.1',   frequency: '91.1',  genre: 'Pop',       accent: '#8B5CF6', listeners: '660k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=400&h=400&fit=crop' },
  ],
};
const DEFAULT_STATIONS = CITY_STATIONS['Hyderabad'];

const ALL_FM_STATIONS = [
  { id: 'f1',  name: 'Radio Mirchi', frequency: '98.3',  genre: 'Bollywood', accent: '#EF4444', listeners: '4.2M', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop',  national: true },
  { id: 'f2',  name: 'Big FM',       frequency: '92.7',  genre: 'Hindi',     accent: '#F97316', listeners: '3.8M', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',  national: true },
  { id: 'f3',  name: 'Red FM',       frequency: '93.5',  genre: 'Pop',       accent: '#EF4444', listeners: '3.1M', image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop',  national: true },
  { id: 'f4',  name: 'Radio City',   frequency: '91.1',  genre: 'Retro',     accent: '#8B5CF6', listeners: '2.7M', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=400&h=400&fit=crop',  national: true },
  { id: 'f5',  name: 'Fever FM',     frequency: '104.0', genre: 'Dance',     accent: '#EC4899', listeners: '2.4M', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',  national: true },
  { id: 'f6',  name: 'AIR FM Gold',  frequency: '106.4', genre: 'Classic',   accent: '#14B8A6', listeners: '1.9M', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',  national: true },
  { id: 'f7',  name: 'Sun FM',       frequency: '93.5',  genre: 'Tamil',     accent: '#EAB308', listeners: '1.6M', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=400&fit=crop',  national: false },
  { id: 'f8',  name: 'Hello FM',     frequency: '106.4', genre: 'Tamil Pop', accent: '#EC4899', listeners: '1.2M', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',  national: false },
  { id: 'f9',  name: 'Telugu Gold',  frequency: '104.0', genre: 'Telugu',    accent: '#EAB308', listeners: '1.1M', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',  national: false },
  { id: 'f10', name: 'Dhol Radio',   frequency: '92.7',  genre: 'Punjabi',   accent: '#06B6D4', listeners: '890k', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',  national: false },
  { id: 'f11', name: 'Radio One',    frequency: '94.3',  genre: 'English',   accent: '#3B82F6', listeners: '820k', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',  national: true },
  { id: 'f12', name: 'Club FM',      frequency: '104.6', genre: 'Malayalam', accent: '#10B981', listeners: '740k', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',  national: false },
];

const ALL_RJS = [
  { id: 'r1', name: 'RJ Priya',   station: 'Radio Mirchi', genre: 'Pop',     listeners: '22.5k', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true,  accent: '#3B82F6' },
  { id: 'r2', name: 'RJ Marcus',  station: 'Big FM',       genre: 'Hip-Hop', listeners: '18.2k', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false, accent: '#8B5CF6' },
  { id: 'r3', name: 'RJ Zara',    station: 'Red FM',       genre: 'Jazz',    listeners: '15.1k', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true,  accent: '#EC4899' },
  { id: 'r4', name: 'RJ Arjun',   station: 'Radio City',  genre: 'Rock',    listeners: '9.7k',  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false, accent: '#F97316' },
  { id: 'r5', name: 'RJ Natalie', station: 'Fever FM',     genre: 'EDM',     listeners: '31.3k', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true,  accent: '#EAB308' },
  { id: 'r6', name: 'RJ Sofia',   station: 'Sun FM',       genre: 'Pop',     listeners: '2.1M',  image: 'https://images.unsplash.com/photo-1549213783-2a9c3b2f6a3d?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true,  accent: '#EC4899' },
  { id: 'r7', name: 'RJ Leo',     station: 'Radio Mirchi', genre: 'Hip-Hop', listeners: '1.8M',  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false, accent: '#3B82F6' },
  { id: 'r8', name: 'RJ Ananya',  station: 'Telugu Gold',  genre: 'Telugu',  listeners: '3.2M',  image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true,  accent: '#EAB308' },
];

// ── Updated BROWSE_CATEGORIES with stationCount + mood ────────────────────────
const BROWSE_CATEGORIES = [
  // specials (rendered separately — not in genre grid)
  { id: 'b1',  label: 'Nearby FM',   icon: 'location-sharp',  color: '#10B981', color2: '#059669', special: 'nearby',   stationCount: null,         mood: null },
  { id: 'b2',  label: 'FM Stations', icon: 'radio',            color: '#3B82F6', color2: '#1D4ED8', special: 'stations', stationCount: '12 stations', mood: null },
  { id: 'b3',  label: 'Live Now',    icon: 'radio-outline',   color: '#EF4444', color2: '#B91C1C', special: 'live',     stationCount: null,         mood: null },
  { id: 'b4',  label: 'Top RJs',     icon: 'mic',              color: '#8B5CF6', color2: '#6D28D9', special: 'rjs',      stationCount: null,         mood: null },
  // genres
  { id: 'b5',  label: 'Bollywood',   icon: 'musical-notes',   color: '#F97316', color2: '#C2410C', special: null, stationCount: '14 stations', mood: 'Trending'  },
  { id: 'b6',  label: 'Hip-Hop',     icon: 'headset',          color: '#14B8A6', color2: '#0F766E', special: null, stationCount: '8 stations',  mood: 'Popular'   },
  { id: 'b7',  label: 'Jazz',        icon: 'musical-note',    color: '#EC4899', color2: '#BE185D', special: null, stationCount: '6 stations',  mood: 'Chill'     },
  { id: 'b8',  label: 'Rock',        icon: 'bonfire',          color: '#EAB308', color2: '#A16207', special: null, stationCount: '5 stations',  mood: 'Fire 🔥'   },
  { id: 'b9',  label: 'Classical',   icon: 'library',          color: '#06B6D4', color2: '#0284C7', special: null, stationCount: '9 stations',  mood: 'Soothing'  },
  { id: 'b10', label: 'Devotional',  icon: 'heart',            color: '#A78BFA', color2: '#7C3AED', special: null, stationCount: '7 stations',  mood: 'Peaceful'  },
  { id: 'b11', label: 'Telugu',      icon: 'language',         color: '#FBBF24', color2: '#D97706', special: null, stationCount: '4 stations',  mood: 'Regional'  },
  { id: 'b12', label: 'Punjabi',     icon: 'happy',            color: '#34D399', color2: '#059669', special: null, stationCount: '5 stations',  mood: 'Vibes'     },
];

const GENRE_CATEGORIES = BROWSE_CATEGORIES.filter(c => c.special === null);

const RECENT_SEARCHES = ['Radio Mirchi', 'RJ Sofia', 'Telugu Gold', 'Big FM', 'Jazz stations'];

const TRENDING = [
  { id: 't1', text: 'Hyderabad FM stations',   icon: 'trending-up', color: '#EF4444' },
  { id: 't2', text: 'RJ Priya live',           icon: 'flame',       color: '#F97316' },
  { id: 't3', text: 'Late night jazz',         icon: 'moon',        color: '#8B5CF6' },
  { id: 't4', text: 'Morning drive Bollywood', icon: 'sunny',       color: '#EAB308' },
  { id: 't5', text: 'Big FM top shows',        icon: 'trending-up', color: '#3B82F6' },
];

// ── RJ initials helper ────────────────────────────────────────────────────────
const RJ_AVATAR_COLORS = ['#2D1B69', '#1E1B4B', '#1E3A5F', '#3B1F2B'];
const liveRJInitials = ALL_RJS.filter(r => r.isLive).slice(0, 3).map(r => r.name.replace('RJ ', '').slice(0, 2).toUpperCase());
const liveCount = ALL_RJS.filter(r => r.isLive).length;

// ── Location Picker Modal ─────────────────────────────────────────────────────
function LocationPickerModal({
  visible, onClose, onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string, state: string) => void;
}) {
  const [step, setStep] = useState<'state' | 'city'>('state');
  const [selState, setSelState] = useState<typeof INDIA_STATES[0] | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setStep('state');
      setSelState(null);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={LP.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[LP.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#13131F', '#0E0E1A']} style={StyleSheet.absoluteFill} />
          <View style={LP.handle} />
          <View style={LP.header}>
            {step === 'city' && (
              <TouchableOpacity style={LP.backBtn} onPress={() => setStep('state')} activeOpacity={0.75}>
                <Ionicons name="chevron-back" size={20} color={WHITE} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={LP.title}>{step === 'state' ? 'Select State' : selState?.name}</Text>
              <Text style={LP.subtitle}>{step === 'state' ? 'Find FM stations near you' : 'Choose your city'}</Text>
            </View>
            <TouchableOpacity style={LP.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={WHITE} />
            </TouchableOpacity>
          </View>
          {step === 'city' && selState && (
            <View style={LP.breadcrumb}>
              <TouchableOpacity onPress={() => setStep('state')}>
                <Text style={LP.breadItem}>India</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={12} color={TEXT3} />
              <Text style={[LP.breadItem, { color: PURPLE }]}>{selState.name}</Text>
            </View>
          )}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {step === 'state'
              ? INDIA_STATES.map((st) => (
                  <TouchableOpacity key={st.id} style={LP.row} activeOpacity={0.82} onPress={() => { setSelState(st); setStep('city'); }}>
                    <View style={LP.rowLeft}>
                      <View style={[LP.rowIcon, { backgroundColor: `${PURPLE}20` }]}>
                        <Ionicons name="map-outline" size={18} color={PURPLE} />
                      </View>
                      <View>
                        <Text style={LP.rowTitle}>{st.name}</Text>
                        <Text style={LP.rowSub}>{st.cities.length} cities available</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={TEXT3} />
                  </TouchableOpacity>
                ))
              : selState?.cities.map((city) => {
                  const stations = CITY_STATIONS[city] || DEFAULT_STATIONS;
                  return (
                    <TouchableOpacity key={city} style={LP.row} activeOpacity={0.82} onPress={() => { onSelect(city, selState.name); onClose(); }}>
                      <View style={LP.rowLeft}>
                        <View style={[LP.rowIcon, { backgroundColor: '#10B98120' }]}>
                          <Ionicons name="location-sharp" size={18} color="#10B981" />
                        </View>
                        <View>
                          <Text style={LP.rowTitle}>{city}</Text>
                          <Text style={LP.rowSub}>{stations.length} FM stations</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={LP.stationCountBadge}>
                          <Text style={LP.stationCountTxt}>{stations.length} FM</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={TEXT3} />
                      </View>
                    </TouchableOpacity>
                  );
                })
            }
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── All FM Stations Modal ─────────────────────────────────────────────────────
function AllStationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [filter, setFilter] = useState<'all' | 'national' | 'regional'>('all');
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible]);

  const filtered = filter === 'all' ? ALL_FM_STATIONS
    : filter === 'national' ? ALL_FM_STATIONS.filter(s => s.national)
    : ALL_FM_STATIONS.filter(s => !s.national);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={LP.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[LP.sheet, { height: height * 0.88, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#13131F', '#0E0E1A']} style={StyleSheet.absoluteFill} />
          <View style={LP.handle} />
          <View style={LP.header}>
            <View style={{ flex: 1 }}>
              <Text style={LP.title}>All FM Stations</Text>
              <Text style={LP.subtitle}>{ALL_FM_STATIONS.length} stations across India</Text>
            </View>
            <TouchableOpacity style={LP.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={WHITE} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 }}>
            {(['all', 'national', 'regional'] as const).map(f => (
              <TouchableOpacity key={f} style={[AS.filterPill, filter === f && AS.filterPillActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
                <Text style={[AS.filterTxt, filter === f && AS.filterTxtActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {filtered.map((st, i) => (
              <TouchableOpacity key={st.id} style={AS.row} activeOpacity={0.85}
                onPress={() => { onClose(); router.push({ pathname: '/rjs/player', params: { name: st.name, frequency: st.frequency, genre: st.genre, listeners: st.listeners, image: encodeURIComponent(st.image), accent: st.accent } }); }}>
                <View style={[AS.rank, { backgroundColor: `${st.accent}18` }]}>
                  <Text style={[AS.rankTxt, { color: st.accent }]}>{i + 1}</Text>
                </View>
                <Image source={{ uri: st.image }} style={AS.thumb} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={AS.stationName}>{st.name}</Text>
                    {st.national && <View style={AS.nationalBadge}><Text style={AS.nationalTxt}>National</Text></View>}
                  </View>
                  <Text style={AS.stationMeta}>{st.frequency} FM · {st.genre}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[AS.freqBadge, { backgroundColor: st.accent }]}>
                    <Text style={AS.freqTxt}>{st.frequency}</Text>
                  </View>
                  <Text style={AS.listeners}>{st.listeners}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Nearby Results Screen ─────────────────────────────────────────────────────
function NearbyResults({ city, state, onBack }: { city: string; state: string; onBack: () => void }) {
  const stations = CITY_STATIONS[city] || DEFAULT_STATIONS;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeIn }]}>
      <View style={NR.header}>
        <TouchableOpacity style={NR.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={NR.city}>{city}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-sharp" size={12} color="#10B981" />
            <Text style={NR.state}>{state} · {stations.length} FM stations</Text>
          </View>
        </View>
        <View style={NR.signalBox}>
          <Ionicons name="wifi" size={16} color="#10B981" />
          <Text style={NR.signalTxt}>Strong</Text>
        </View>
      </View>
      <View style={NR.cityBanner}>
        <LinearGradient colors={['#0A2A1A', '#0D3B20', '#0A2A1A']} style={StyleSheet.absoluteFill} />
        {Array.from({ length: 80 }).map((_, i) => (
          <View key={i} style={[NR.mapDot, { left: (i % 10) * (width / 10) + 12, top: Math.floor(i / 10) * 14 + 10, opacity: Math.random() > 0.4 ? 0.18 : 0.06 }]} />
        ))}
        <View style={NR.cityCenter}>
          <View style={NR.locationPin}>
            <Ionicons name="location-sharp" size={20} color="#10B981" />
          </View>
          <Text style={NR.cityLabel}>{city}</Text>
          <Text style={NR.cityStateLabel}>{state}</Text>
        </View>
        {stations.slice(0, 4).map((st, i) => (
          <View key={st.id} style={[NR.freqDot, { left: [width * 0.15, width * 0.7, width * 0.12, width * 0.72][i], top: [30, 25, 85, 80][i], borderColor: st.accent }]}>
            <Text style={[NR.freqDotTxt, { color: st.accent }]}>{st.frequency}</Text>
          </View>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={NR.listTitle}>FM Stations in {city}</Text>
        {stations.map((st) => (
          <TouchableOpacity key={st.id} style={NR.stationRow} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/rjs/player', params: { name: st.name, frequency: st.frequency, genre: st.genre, listeners: st.listeners, image: encodeURIComponent(st.image), accent: st.accent } })}>
            <Image source={{ uri: st.image }} style={NR.thumb} resizeMode="cover" />
            <LinearGradient colors={['transparent', `${st.accent}30`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, { left: 60, borderRadius: 16 }]} />
            <View style={[NR.freqTag, { backgroundColor: st.accent }]}>
              <Text style={NR.freqTagTxt}>{st.frequency}</Text>
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={NR.stationName}>{st.name}</Text>
              <Text style={NR.stationMeta}>{st.genre} · {st.listeners} listeners</Text>
            </View>
            <View style={NR.playBtn}>
              <Ionicons name="play" size={14} color={WHITE} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// ── Live Now results ──────────────────────────────────────────────────────────
function LiveNowResults({ onBack }: { onBack: () => void }) {
  const liveRJs = ALL_RJS.filter(r => r.isLive);
  return (
    <View style={{ flex: 1 }}>
      <View style={NR.header}>
        <TouchableOpacity style={NR.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={NR.city}>Live Now</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444' }} />
            <Text style={NR.state}>{liveRJs.length} RJs broadcasting live</Text>
          </View>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12 }}>
        {liveRJs.map(rj => (
          <TouchableOpacity key={rj.id} style={[NR.stationRow, { borderColor: `${rj.accent}30` }]} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/rjs/live-radio', params: { name: rj.name + ' Live', viewers: rj.listeners, image: encodeURIComponent(rj.image) } })}>
            <Image source={{ uri: rj.image }} style={[NR.thumb, { borderRadius: NR.thumb.borderRadius }]} resizeMode="cover" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={NR.stationName}>{rj.name}</Text>
                <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: WHITE }}>LIVE</Text>
                </View>
              </View>
              <Text style={NR.stationMeta}>{rj.station} · {rj.genre}</Text>
            </View>
            <Text style={[NR.freqTagTxt, { color: rj.accent, fontSize: 12 }]}>{rj.listeners}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Top RJs results ───────────────────────────────────────────────────────────
function TopRJsResults({ onBack }: { onBack: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={NR.header}>
        <TouchableOpacity style={NR.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={NR.city}>Top RJs</Text>
          <Text style={NR.state}>{ALL_RJS.length} radio jockeys</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12 }}>
        {ALL_RJS.map((rj, i) => (
          <TouchableOpacity key={rj.id} style={[NR.stationRow, { borderColor: `${rj.accent}30` }]} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/rjs/artist', params: { name: rj.name, image: encodeURIComponent(rj.image), listeners: rj.listeners, isFollowing: 'false', ...(rj.isLive ? { isLive: 'true' } : {}) } })}>
            <View style={{ width: 28, alignItems: 'center' }}>
              <Text style={[NR.stationName, { color: TEXT3, fontSize: 16 }]}>#{i + 1}</Text>
            </View>
            <Image source={{ uri: rj.image }} style={[NR.thumb, { borderRadius: 24 }]} resizeMode="cover" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={NR.stationName}>{rj.name}</Text>
                {rj.isLive && (
                  <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: WHITE }}>LIVE</Text>
                  </View>
                )}
              </View>
              <Text style={NR.stationMeta}>{rj.station} · {rj.genre}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={[NR.freqTagTxt, { color: rj.accent, fontSize: 12, fontWeight: '700' }]}>{rj.listeners}</Text>
              <Text style={NR.stationMeta}>listeners</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Search results ────────────────────────────────────────────────────────────
function SearchResults({ query }: { query: string }) {
  const q = query.toLowerCase();
  const matchedStations = ALL_FM_STATIONS.filter(s =>
    s.name.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q) || s.frequency.includes(q)
  );
  const matchedRJs = ALL_RJS.filter(r =>
    r.name.toLowerCase().includes(q) || r.station.toLowerCase().includes(q) || r.genre.toLowerCase().includes(q)
  );

  if (matchedStations.length === 0 && matchedRJs.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Ionicons name="search-outline" size={52} color={TEXT3} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: WHITE }}>No results for</Text>
        <Text style={{ fontSize: 16, color: PURPLE, fontWeight: '700' }}>{`"${query}"`}</Text>
        <Text style={{ fontSize: 14, color: TEXT2, textAlign: 'center', paddingHorizontal: 40 }}>
          Try searching for a station name, frequency, RJ name, or genre
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {matchedRJs.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={SR.sectionTitle}>RJs</Text>
          {matchedRJs.map(rj => (
            <TouchableOpacity key={rj.id} style={SR.row} activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/rjs/artist', params: { name: rj.name, image: encodeURIComponent(rj.image), listeners: rj.listeners, isFollowing: 'false' } })}>
              <Image source={{ uri: rj.image }} style={[SR.thumb, { borderRadius: 24 }]} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={SR.title}>{rj.name}</Text>
                  {rj.isLive && <View style={SR.liveBadge}><Text style={SR.liveTxt}>LIVE</Text></View>}
                </View>
                <Text style={SR.sub}>RJ · {rj.station}</Text>
              </View>
              <Text style={[SR.meta, { color: rj.accent }]}>{rj.listeners}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {matchedStations.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={SR.sectionTitle}>FM Stations</Text>
          {matchedStations.map(st => (
            <TouchableOpacity key={st.id} style={SR.row} activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/rjs/player', params: { name: st.name, frequency: st.frequency, genre: st.genre, listeners: st.listeners, image: encodeURIComponent(st.image), accent: st.accent } })}>
              <Image source={{ uri: st.image }} style={SR.thumb} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={SR.title}>{st.name}</Text>
                <Text style={SR.sub}>{st.frequency} FM · {st.genre}</Text>
              </View>
              <View style={[SR.freqBadge, { backgroundColor: st.accent }]}>
                <Text style={SR.freqTxt}>{st.frequency}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── PREMIUM BROWSE GRID ───────────────────────────────────────────────────────
function PremiumBrowseGrid({ onTap }: { onTap: (cat: typeof BROWSE_CATEGORIES[0]) => void }) {
  const CARD_W = (width - 52) / 2;

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 56 }}>

      {/* Section label */}
      <Text style={PB.sectionLabel}>BROWSE</Text>

      {/* ── TIER 1: Hero card — Nearby FM ── */}
      <TouchableOpacity style={PB.heroCard} activeOpacity={0.88} onPress={() => onTap(BROWSE_CATEGORIES[0])}>
        <LinearGradient colors={['#0D3B22', '#0A5C32', '#0D3B22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        {/* Subtle border */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }]} />
        {/* Wave decoration */}
        <View style={PB.heroWaveContainer} pointerEvents="none">
          {[0, 1, 2].map(i => (
            <View key={i} style={[PB.heroWaveLine, { top: 18 + i * 14, opacity: 0.06 - i * 0.01 }]} />
          ))}
        </View>
        {/* Icon ring */}
        <View style={PB.heroIconRing}>
          <Ionicons name="location-sharp" size={22} color="#10B981" />
        </View>
        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={PB.heroTitle}>Nearby FM</Text>
          <Text style={PB.heroSub}>Tap to select your city</Text>
        </View>
        {/* Arrow button */}
        <View style={PB.heroArrow}>
          <Ionicons name="arrow-forward" size={16} color="#10B981" />
        </View>
      </TouchableOpacity>

      {/* ── TIER 2: Two-column — FM Stations + Live Now ── */}
      <View style={PB.row2}>
        {/* FM Stations */}
        <TouchableOpacity style={[PB.cardMd, { width: CARD_W }]} activeOpacity={0.88} onPress={() => onTap(BROWSE_CATEGORIES[1])}>
          <LinearGradient colors={['#0C1F4A', '#1535A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' }]} />
          <View style={PB.bgCircle} />
          {/* Icon */}
          <View style={[PB.mdIconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
            <Ionicons name="radio" size={18} color="#93C5FD" />
          </View>
          {/* Bottom */}
          <View style={PB.mdBottom}>
            <View style={{ flex: 1 }}>
              <Text style={PB.mdTitle}>FM Stations</Text>
              <Text style={PB.mdSub}>All India</Text>
            </View>
            <View style={PB.fmCountBadge}>
              <Text style={PB.fmCountTxt}>{ALL_FM_STATIONS.length} FM</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Live Now */}
        <TouchableOpacity style={[PB.cardMd, { width: CARD_W }]} activeOpacity={0.88} onPress={() => onTap(BROWSE_CATEGORIES[2])}>
          <LinearGradient colors={['#3B0C0C', '#991B1B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' }]} />
          <View style={[PB.bgCircle, { backgroundColor: 'rgba(239,68,68,0.08)' }]} />
          {/* Live badge top */}
          <View style={PB.liveTopRow}>
            <View style={[PB.mdIconBox, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
              <Ionicons name="radio-outline" size={18} color="#FCA5A5" />
            </View>
            <View style={PB.livePill}>
              <View style={PB.liveDot} />
              <Text style={PB.livePillTxt}>LIVE</Text>
            </View>
          </View>
          {/* Bottom */}
          <View style={PB.mdBottom}>
            <View>
              <Text style={PB.mdTitle}>Live Now</Text>
              <Text style={PB.mdSub}>{liveCount} RJs on air</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── TIER 3: Feature card — Top RJs ── */}
      <TouchableOpacity style={PB.featureCard} activeOpacity={0.88} onPress={() => onTap(BROWSE_CATEGORIES[3])}>
        <LinearGradient colors={['#1E0B3B', '#4C1D95', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)' }]} />
        {/* Large bg circle */}
        <View style={PB.featureBgCircle} />
        {/* Stacked avatars */}
        <View style={PB.avatarStack}>
          {liveRJInitials.map((initials, i) => (
            <View key={i} style={[PB.avatar, { marginLeft: i === 0 ? 0 : -10, backgroundColor: RJ_AVATAR_COLORS[i] }]}>
              <Text style={PB.avatarTxt}>{initials}</Text>
            </View>
          ))}
          <View style={[PB.avatar, { marginLeft: -10, backgroundColor: 'rgba(139,92,246,0.35)' }]}>
            <Text style={[PB.avatarTxt, { fontSize: 9 }]}>+{ALL_RJS.length - liveRJInitials.length}</Text>
          </View>
        </View>
        {/* Text */}
        <View style={{ flex: 1, paddingLeft: 14 }}>
          <Text style={PB.featureTitle}>Top RJs</Text>
          <Text style={PB.featureSub}>{ALL_RJS.length} jockeys · {liveCount} live now</Text>
        </View>
        {/* Follow pill */}
        <View style={PB.followPill}>
          <Text style={PB.followTxt}>Explore →</Text>
        </View>
      </TouchableOpacity>

      {/* ── TIER 4: Genre grid ── */}
      <Text style={[PB.sectionLabel, { marginTop: 24, marginBottom: 12 }]}>GENRES</Text>
      <View style={PB.genreGrid}>
        {GENRE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[PB.genreCard, { width: CARD_W }]}
            activeOpacity={0.88}
            onPress={() => onTap(cat)}
          >
            <LinearGradient
              colors={[`${cat.color2}CC`, cat.color]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { borderRadius: 18, borderWidth: 1, borderColor: `${cat.color}50` }]} />
            {/* Large bg icon */}
            <Ionicons
              name={cat.icon as any}
              size={52}
              color="rgba(255,255,255,0.12)"
              style={PB.genreBgIcon}
            />
            {/* Mood tag */}
            {cat.mood ? (
              <View style={PB.moodTag}>
                <Text style={PB.moodTxt}>{cat.mood}</Text>
              </View>
            ) : null}
            {/* Bottom info */}
            <View style={PB.genreBottom}>
              <Text style={PB.genreTitle}>{cat.label}</Text>
              {cat.stationCount ? (
                <Text style={PB.genreMeta}>{cat.stationCount}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ── MAIN SEARCH SCREEN ────────────────────────────────────────────────────────
export default function SearchScreen() {
  const [query, setQuery]                 = useState('');
  const [focused, setFocused]             = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAllStations, setShowAllStations]       = useState(false);
  const [selectedCity, setSelectedCity]   = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [browseView, setBrowseView]       = useState<null | 'live' | 'rjs'>(null);

  const inputRef  = useRef<TextInput>(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const showQuery  = query.trim().length > 0;
  const showBrowse = !showQuery && !selectedCity && !browseView;
  const showRecent = focused && !showQuery && !selectedCity && !browseView;

  const handleBrowseTap = (cat: typeof BROWSE_CATEGORIES[0]) => {
    Keyboard.dismiss();
    if (cat.special === 'nearby')   { setShowLocationPicker(true); return; }
    if (cat.special === 'stations') { setShowAllStations(true);    return; }
    if (cat.special === 'live')     { setBrowseView('live');        return; }
    if (cat.special === 'rjs')      { setBrowseView('rjs');         return; }
    setQuery(cat.label);
  };

  return (
    <View style={SS.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0A0A14', '#080810']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* ── Top bar ── */}
        <View style={[SS.topBar, { paddingTop: SBH + 14 }]}>
          <TouchableOpacity style={SS.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={WHITE} />
          </TouchableOpacity>
          <View style={[SS.searchBar, focused && SS.searchBarFocused]}>
            <Ionicons name="search" size={18} color={focused ? PURPLE : TEXT2} />
            <TextInput
              ref={inputRef}
              style={SS.searchInput}
              placeholder="Search RJs, stations, genres…"
              placeholderTextColor={TEXT3}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color={TEXT2} />
              </TouchableOpacity>
            )}
          </View>
          {query.length === 0 && (
            <TouchableOpacity style={SS.cancelBtn} onPress={() => router.back()} activeOpacity={0.75}>
              <Text style={SS.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Content area ── */}

        {/* A) Typed query */}
        {showQuery && <SearchResults query={query} />}

        {/* B) City selected */}
        {!showQuery && selectedCity && !browseView && (
          <NearbyResults city={selectedCity} state={selectedState ?? ''} onBack={() => { setSelectedCity(null); setSelectedState(null); }} />
        )}

        {/* C) Live Now */}
        {!showQuery && browseView === 'live' && (
          <LiveNowResults onBack={() => setBrowseView(null)} />
        )}

        {/* D) Top RJs */}
        {!showQuery && browseView === 'rjs' && (
          <TopRJsResults onBack={() => setBrowseView(null)} />
        )}

        {/* E) Recent + Trending (focused empty state) */}
        {showRecent && (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>
            <View style={SS.browseSecHead}>
              <Text style={SS.browseSectionTitle}>Recent Searches</Text>
              <TouchableOpacity><Text style={SS.clearTxt}>Clear all</Text></TouchableOpacity>
            </View>
            <View style={{ gap: 2 }}>
              {RECENT_SEARCHES.map((r, i) => (
                <TouchableOpacity key={i} style={SS.recentRow} activeOpacity={0.8} onPress={() => setQuery(r)}>
                  <View style={SS.recentIcon}>
                    <Ionicons name="time-outline" size={16} color={TEXT2} />
                  </View>
                  <Text style={SS.recentTxt}>{r}</Text>
                  <Ionicons name="arrow-up-outline" size={16} color={TEXT3} style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[SS.browseSectionTitle, { marginTop: 28, marginBottom: 14 }]}>Trending</Text>
            {TRENDING.map(t => (
              <TouchableOpacity key={t.id} style={SS.trendRow} activeOpacity={0.8} onPress={() => setQuery(t.text)}>
                <View style={[SS.trendIcon, { backgroundColor: `${t.color}20` }]}>
                  <Ionicons name={t.icon as any} size={16} color={t.color} />
                </View>
                <Text style={SS.trendTxt}>{t.text}</Text>
                <Ionicons name="trending-up-outline" size={14} color={TEXT3} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* F) Premium Browse Grid */}
        {showBrowse && !focused && !showRecent && (
          <PremiumBrowseGrid onTap={handleBrowseTap} />
        )}

      </Animated.View>

      {/* Modals */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(city, state) => { setSelectedCity(city); setSelectedState(state); setShowLocationPicker(false); }}
      />
      <AllStationsModal
        visible={showAllStations}
        onClose={() => setShowAllStations(false)}
      />
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const SS = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  topBar:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  searchBar:        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: BORDER },
  searchBarFocused: { borderColor: PURPLE, backgroundColor: 'rgba(139,92,246,0.08)' },
  searchInput:      { flex: 1, fontSize: 15, color: WHITE, fontWeight: '500' },
  cancelBtn:        { paddingHorizontal: 4 },
  cancelTxt:        { fontSize: 14, fontWeight: '700', color: PURPLE },

  browseSecHead:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  browseSectionTitle: { fontSize: 18, fontWeight: '900', color: WHITE, letterSpacing: -0.4, marginBottom: 16 },
  clearTxt:           { fontSize: 13, color: PURPLE, fontWeight: '600' },

  recentRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  recentIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  recentTxt:  { flex: 1, fontSize: 14, color: WHITE, fontWeight: '500' },

  trendRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: BORDER },
  trendIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendTxt:  { flex: 1, fontSize: 14, color: WHITE, fontWeight: '500' },
});

// ── Premium Browse Styles ─────────────────────────────────────────────────────
const PB = StyleSheet.create({
  sectionLabel: { fontSize: 11, fontWeight: '800', color: TEXT3, letterSpacing: 1.5, marginBottom: 14 },

  // Hero card
  heroCard:          { width: '100%', height: 90, borderRadius: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 14, marginBottom: 12 },
  heroWaveContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  heroWaveLine:      { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#10B981' },
  heroIconRing:      { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.5)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  heroTitle:         { fontSize: 17, fontWeight: '900', color: WHITE, letterSpacing: -0.4 },
  heroSub:           { fontSize: 11, color: 'rgba(16,185,129,0.9)', marginTop: 4, fontWeight: '600' },
  heroArrow:         { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

  // Two-col row
  row2:      { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardMd:    { height: 108, borderRadius: 20, overflow: 'hidden', padding: 14, justifyContent: 'space-between' },
  bgCircle:  { position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  mdIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  mdBottom:  { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  mdTitle:   { fontSize: 14, fontWeight: '900', color: WHITE, letterSpacing: -0.3 },
  mdSub:     { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' },

  fmCountBadge: { backgroundColor: 'rgba(59,130,246,0.25)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  fmCountTxt:   { fontSize: 10, fontWeight: '800', color: '#93C5FD' },

  liveTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.25)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  liveDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  livePillTxt:{ fontSize: 9, fontWeight: '900', color: '#FCA5A5', letterSpacing: 0.5 },

  // Feature card (Top RJs)
  featureCard:    { width: '100%', height: 84, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 0 },
  featureBgCircle:{ position: 'absolute', right: -24, top: -24, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(139,92,246,0.1)' },
  avatarStack:    { flexDirection: 'row', alignItems: 'center' },
  avatar:         { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(139,92,246,0.6)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt:      { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  featureTitle:   { fontSize: 16, fontWeight: '900', color: WHITE, letterSpacing: -0.3 },
  featureSub:     { fontSize: 11, color: 'rgba(167,139,250,0.85)', marginTop: 3, fontWeight: '500' },
  followPill:     { backgroundColor: 'rgba(139,92,246,0.3)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.5)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  followTxt:      { fontSize: 11, fontWeight: '800', color: '#C4B5FD' },

  // Genre grid
  genreGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  genreCard:   { height: 90, borderRadius: 18, overflow: 'hidden', padding: 12, justifyContent: 'space-between' },
  genreBgIcon: { position: 'absolute', right: 8, bottom: 6 },
  moodTag:     { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  moodTxt:     { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3 },
  genreBottom: { gap: 2 },
  genreTitle:  { fontSize: 14, fontWeight: '900', color: WHITE, letterSpacing: -0.3 },
  genreMeta:   { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
});

const LP = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet:   { height: height * 0.78, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', borderWidth: 1, borderBottomWidth: 0, borderColor: BORDER },
  handle:  { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 12, marginBottom: 4 },

  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  title:    { fontSize: 20, fontWeight: '900', color: WHITE },
  subtitle: { fontSize: 13, color: TEXT2, marginTop: 2, fontWeight: '500' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },

  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 14 },
  breadItem:  { fontSize: 13, color: TEXT2, fontWeight: '600' },

  row:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowTitle:{ fontSize: 15, fontWeight: '700', color: WHITE },
  rowSub:  { fontSize: 12, color: TEXT2, marginTop: 2, fontWeight: '500' },

  stationCountBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 1, borderColor: `${PURPLE}40` },
  stationCountTxt:   { fontSize: 11, fontWeight: '700', color: PURPLE },
});

const AS = StyleSheet.create({
  filterPill:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: BORDER },
  filterPillActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterTxt:        { fontSize: 13, fontWeight: '600', color: TEXT2 },
  filterTxtActive:  { color: WHITE },

  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  rank:     { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rankTxt:  { fontSize: 12, fontWeight: '800' },
  thumb:    { width: 46, height: 46, borderRadius: 12 },

  stationName: { fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 3 },
  stationMeta: { fontSize: 12, color: TEXT2, fontWeight: '500' },

  nationalBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(59,130,246,0.2)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' },
  nationalTxt:   { fontSize: 9, fontWeight: '700', color: '#93C5FD' },

  freqBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  freqTxt:   { fontSize: 11, fontWeight: '800', color: WHITE },
  listeners: { fontSize: 11, color: TEXT3, fontWeight: '500' },
});

const NR = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  backBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  city:      { fontSize: 20, fontWeight: '900', color: WHITE },
  state:     { fontSize: 13, color: TEXT2, marginTop: 2, fontWeight: '500' },
  signalBox: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  signalTxt: { fontSize: 11, fontWeight: '700', color: '#10B981' },

  cityBanner:     { height: 120, marginHorizontal: 20, marginBottom: 20, borderRadius: 18, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  mapDot:         { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#10B981' },
  cityCenter:     { alignItems: 'center', gap: 4 },
  locationPin:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' },
  cityLabel:      { fontSize: 16, fontWeight: '900', color: WHITE },
  cityStateLabel: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  freqDot:        { position: 'absolute', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  freqDotTxt:     { fontSize: 10, fontWeight: '800' },

  listTitle:   { fontSize: 16, fontWeight: '800', color: WHITE, paddingHorizontal: 20, marginBottom: 12 },
  stationRow:  { flexDirection: 'row', alignItems: 'center', gap: 0, marginHorizontal: 20, marginBottom: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, padding: 12 },
  thumb:       { width: 48, height: 48, borderRadius: 12 },
  freqTag:     { position: 'absolute', left: 12, bottom: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freqTagTxt:  { fontSize: 9, fontWeight: '900', color: WHITE },
  stationName: { fontSize: 14, fontWeight: '800', color: WHITE, marginBottom: 3 },
  stationMeta: { fontSize: 12, color: TEXT2, fontWeight: '500' },
  playBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center' },
});

const SR = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '800', color: WHITE, marginBottom: 14 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  thumb:        { width: 48, height: 48, borderRadius: 10 },
  title:        { fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 3 },
  sub:          { fontSize: 12, color: TEXT2, fontWeight: '500' },
  meta:         { fontSize: 12, fontWeight: '700' },
  liveBadge:    { backgroundColor: '#EF4444', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  liveTxt:      { fontSize: 9, fontWeight: '800', color: WHITE },
  freqBadge:    { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  freqTxt:      { fontSize: 11, fontWeight: '800', color: WHITE },
});