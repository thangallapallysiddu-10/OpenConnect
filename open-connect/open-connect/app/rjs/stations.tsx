import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { AdCarousel } from '../../src/components/AdCarousel/AdCarousel';
import { useRJLive } from '../../src/context/RJLiveContext';
import { RJS_LIVE_STATIONS } from '../../src/data/rjsLiveStations';


const { width } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

// ── Tokens ─────────────────────────────────────────────────────────────────
const BG     = '#0E0E1A';
const WHITE  = '#FFFFFF';
const TEXT2  = 'rgba(255,255,255,0.55)';
const TEXT3  = 'rgba(255,255,255,0.32)';
const PURPLE = '#8B5CF6';

// ── Existing data (unchanged) ───────────────────────────────────────────────
const RECOMMENDED = [
  { id: 1, frequency: '91.1', name: 'RJ Beats FM',    tag: 'Hip-Hop', listeners: '14.2k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=500&fit=crop', accent: '#8B5CF6' },
  { id: 2, frequency: '92.9', name: 'RJ Vibes',       tag: 'Pop',     listeners: '8.9k',  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=500&fit=crop', accent: '#3B82F6' },
  { id: 3, frequency: '88.1', name: 'Smooth RJ',      tag: 'Jazz',    listeners: '3.1k',  image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&h=500&fit=crop', accent: '#EC4899' },
  { id: 4, frequency: '95.5', name: 'RJ Rock Nation', tag: 'Rock',    listeners: '11.4k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=500&fit=crop', accent: '#F97316' },
  { id: 5, frequency: '99.3', name: 'RJ Bass Drop',   tag: 'EDM',     listeners: '18.1k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=500&fit=crop', accent: '#EAB308' },
];

const TOP_ARTISTS = [
  { id: 1, name: 'RJ Priya',   listeners: '22.5k', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 2, name: 'RJ Marcus',  listeners: '18.2k', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 3, name: 'RJ Zara',    listeners: '15.1k', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 4, name: 'RJ Arjun',   listeners: '9.7k',  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 5, name: 'RJ Natalie', listeners: '31.3k', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces&facepad=3' },
];
const RECENT_RJS = [
  { id: 1, name: 'RJ Aisha',   listeners: '5.2k',  image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 2, name: 'RJ Rohan',   listeners: '3.8k',  image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 3, name: 'RJ Sneha',   listeners: '4.1k',  image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 4, name: 'RJ Karthik', listeners: '2.9k',  image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 5, name: 'RJ Divya',   listeners: '6.3k',  image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces&facepad=3' },
];

const GENERAL_RJS = [
  { id: 1, name: 'RJ Amit',    listeners: '1.2k',  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 2, name: 'RJ Meera',   listeners: '980',   image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 3, name: 'RJ Suresh',  listeners: '1.5k',  image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 4, name: 'RJ Pooja',   listeners: '2.1k',  image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop&crop=faces&facepad=3' },
  { id: 5, name: 'RJ Nikhil',  listeners: '870',   image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&facepad=3' },
];
const FOLLOWING_ARTISTS = [
  { id: 1, name: 'RJ Sofia',  listeners: '2.1M', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true  },
  { id: 2, name: 'RJ Leo',    listeners: '1.8M', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false },
  { id: 3, name: 'RJ Ananya', listeners: '3.2M', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true  },
  { id: 4, name: 'RJ James',  listeners: '1.5M', image: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false },
  { id: 5, name: 'RJ Maya',   listeners: '2.4M', image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: true  },
  { id: 6, name: 'RJ Vikram', listeners: '2.9M', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces&facepad=3', isLive: false },
];

const FOLLOWING_CATEGORIES = [
  { id: 1, name: 'Rock',    icon: 'musical-notes', color: '#F97316', stations: '24 stations', listeners: '1.2M', gradient: ['#F97316', '#F59E0B'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&h=600&fit=crop' },
  { id: 2, name: 'Pop',     icon: 'mic',           color: '#3B82F6', stations: '18 stations', listeners: '2.8M', gradient: ['#3B82F6', '#60A5FA'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop' },
  { id: 3, name: 'Jazz',    icon: 'radio',         color: '#8B5CF6', stations: '12 stations', listeners: '856K', gradient: ['#8B5CF6', '#A78BFA'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop' },
  { id: 4, name: 'EDM',     icon: 'flash',         color: '#EC4899', stations: '15 stations', listeners: '1.9M', gradient: ['#EC4899', '#F472B6'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop' },
  { id: 5, name: 'Metal',   icon: 'bonfire',       color: '#EAB308', stations: '8 stations',  listeners: '623K', gradient: ['#EAB308', '#FBBF24'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop' },
  { id: 6, name: 'R&B',     icon: 'heart',         color: '#06B6D4', stations: '10 stations', listeners: '1.1M', gradient: ['#06B6D4', '#22D3EE'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop' },
  { id: 7, name: 'Hip-Hop', icon: 'headset',       color: '#14B8A6', stations: '14 stations', listeners: '2.1M', gradient: ['#14B8A6', '#2DD4BF'] as [string,string], backgroundImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=600&fit=crop' },
];

const RING_COLORS: [string, string][] = [
  ['#60A5FA', '#3B82F6'], ['#F9A8D4', '#EC4899'], ['#6EE7B7', '#10B981'],
  ['#C4B5FD', '#8B5CF6'], ['#FDBA74', '#F97316'],
];

const LIVE_EVENTS = [
  { id: 1, name: 'RJ Sofia Live',  viewers: '108k', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' },
  { id: 2, name: 'RJ Leo Show',    viewers: '84k',  image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: 3, name: 'RJ Zara Vibes',  viewers: '256k', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { id: 4, name: 'RJ Arjun Mix',   viewers: '196k', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: 5, name: 'RJ Maya Beats',  viewers: '312k', image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&h=300&fit=crop' },
];

const UPCOMING_RJS = [
  { id: 1, name: 'RJ Priya',   show: 'Morning Vibes',       time: 'Today, 6:00 AM',    genre: 'Pop',    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=400&fit=crop', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces&facepad=3', accent: '#3B82F6', listeners: '22.5k' },
  { id: 2, name: 'RJ Marcus',  show: 'Night Frequency',     time: 'Today, 10:00 PM',   genre: 'Hip-Hop',image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=400&fit=crop', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&facepad=3', accent: '#8B5CF6', listeners: '18.2k' },
  { id: 3, name: 'RJ Zara',    show: 'Afternoon Jazz Hour', time: 'Today, 2:00 PM',    genre: 'Jazz',   image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&h=400&fit=crop', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&facepad=3', accent: '#EC4899', listeners: '15.1k' },
  { id: 4, name: 'RJ Arjun',   show: 'Filmy Rock Mornings', time: 'Tomorrow, 10:00 AM',genre: 'Rock',   image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=400&fit=crop', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&facepad=3', accent: '#F97316', listeners: '9.7k' },
  { id: 5, name: 'RJ Natalie', show: 'Saturday Night Live', time: 'Tomorrow, 8:00 PM', genre: 'EDM',    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=400&fit=crop', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&facepad=3', accent: '#EAB308', listeners: '31.3k' },
];

const NEW_ALBUMS = [
  { id: 1, title: 'Midnight Dreams',    subtitle: 'Album • The Weeknd',      artist: 'The Weeknd',     description: '', coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', songs: [] },
  { id: 2, title: 'Eternal Sunshine',   subtitle: 'Album • Ariana Grande',   artist: 'Ariana Grande',  description: '', coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop', songs: [] },
  { id: 3, title: 'Urban Symphony',     subtitle: 'EP • Kendrick Lamar',     artist: 'Kendrick Lamar', description: '', coverImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=400&fit=crop', songs: [] },
  { id: 4, title: 'Electric Heart',     subtitle: 'Single • Dua Lipa',       artist: 'Dua Lipa',       description: '', coverImage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop', songs: [] },
  { id: 5, title: 'Acoustic Sessions',  subtitle: 'Album • Ed Sheeran',      artist: 'Ed Sheeran',     description: '', coverImage: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=400&h=400&fit=crop', songs: [] },
];

// ── Professional FM Tuner Data ───────────────────────────────────────────────
const FM_MIN = 87.5;
const FM_MAX = 108.0;
const DIAL_W = width - 48;

// Enhanced station list with detailed metadata
const PROFESSIONAL_STATIONS = [
  { id: 1, frequency: '91.1', name: 'RJ Beats FM',      tag: 'Hip-Hop', city: 'Hyderabad', signal: 98, listeners: '14.2k', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=500&fit=crop', accent: '#8B5CF6', description: 'The hottest hip-hop and urban beats' },
  { id: 2, frequency: '92.9', name: 'RJ Vibes',         tag: 'Pop',     city: 'Hyderabad', signal: 95, listeners: '8.9k',  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=500&fit=crop', accent: '#3B82F6', description: 'Top 40 hits and pop classics' },
  { id: 3, frequency: '88.1', name: 'Smooth RJ',        tag: 'Jazz',    city: 'Secunderabad', signal: 92, listeners: '3.1k',  image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&h=500&fit=crop', accent: '#EC4899', description: 'Smooth jazz for sophisticated ears' },
  { id: 4, frequency: '95.5', name: 'RJ Rock Nation',   tag: 'Rock',    city: 'Cyberabad', signal: 96, listeners: '11.4k', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=500&fit=crop', accent: '#F97316', description: 'Classic rock and new wave' },
  { id: 5, frequency: '99.3', name: 'RJ Bass Drop',     tag: 'EDM',     city: 'Hyderabad', signal: 94, listeners: '18.1k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=500&fit=crop', accent: '#EAB308', description: 'Electronic dance music nonstop' },
  { id: 6, frequency: '101.1',name: 'News Talk RJ',     tag: 'News',    city: 'Hyderabad', signal: 99, listeners: '22.3k', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&h=500&fit=crop', accent: '#14B8A6', description: 'Breaking news and talk shows' },
  { id: 7, frequency: '103.5',name: 'Retro RJ',         tag: 'Oldies',  city: 'Secunderabad', signal: 91, listeners: '6.7k',  image: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=700&h=500&fit=crop', accent: '#06B6D4', description: 'Golden oldies and timeless classics' },
];

function SignalStrengthMeter({ strength }: { strength: number }) {
  const bars = Math.floor(strength / 20);
  const getColor = () => {
    if (strength >= 80) return '#10B981';
    if (strength >= 60) return '#F59E0B';
    return '#EF4444';
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={{
            width: 5,
            height: 4 + i * 2.5,
            borderRadius: 2,
            backgroundColor: i <= bars ? getColor() : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </View>
  );
}

// ── Professional FM Tuner Component ─────────────────────────────────────────


// Professional Tuner Styles
const PT = StyleSheet.create({
  container: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.55)',
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingVertical: 20,
    boxShadow: '0px 8px 32px rgba(139,92,246,0.45)',
    elevation: 20,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEXT2,
    letterSpacing: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: TEXT3,
    letterSpacing: 1,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '600',
    color: TEXT3,
  },
  freqDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  freqGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    opacity: 0.1,
  },
  freqMain: {
    fontSize: 72,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'] as any,
    boxShadow: '0px 0px 20px rgba(139,92,246,0.6)',
  },
  freqUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT2,
    letterSpacing: 1,
    marginTop: -8,
  },
  modulationBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  modulationText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  stationInfo: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  stationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stationAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: -0.3,
  },
  stationTag: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT2,
    marginBottom: 8,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
    color: TEXT2,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: TEXT3,
  },
  stationDesc: {
    fontSize: 11,
    color: TEXT3,
    fontStyle: 'italic',
  },
  dialSection: {
    height: 70,
    position: 'relative',
    marginBottom: 20,
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  tickWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  tickMark: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 1,
  },
  tickMajor: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: 1.5,
  },
  tickLabel: {
    fontSize: 9,
    color: TEXT3,
    fontWeight: '600',
    marginTop: 16,
  },
  trackBg: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  stationDot: {
    position: 'absolute',
    top: 28,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 4,
    borderWidth: 2,
  },
  needle: {
    position: 'absolute',
    top: 12,
    width: 28,
    alignItems: 'center',
    zIndex: 10,
  },
  needleLine: {
    width: 2,
    height: 34,
    backgroundColor: WHITE,
    borderRadius: 1,
    boxShadow : '0px 0px 12px rgba(255,255,255,0.6)',
  },
  needleHead: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: WHITE,
    boxShadow: '0px 0px 8px rgba(255,255,255,0.8)',
  },
  needleGlow: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlBtn: {
    flex: 1,
    height: 56,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 6,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT2,
    letterSpacing: 1,
  },
  scanBtn: {
    flex: 1.5,
    height: 56,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 8,
  },
  scanBtnActive: {
    borderColor: '#F59E0B',
  },
  scanText: {
    fontSize: 12,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 1,
  },
  scanTextActive: {
    color: WHITE,
  },
  quickStationContainer: {
    paddingHorizontal: 4,
    gap: 10,
    flexDirection: 'row',
  },
  quickStation: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    minWidth: 70,
  },
  quickFreq: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickName: {
    fontSize: 10,
    fontWeight: '600',
    color: TEXT3,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    boxShadow: '0px 4px 20px rgba(139,92,246,0.6)',
    elevation: 12,
  },
  pauseIconWrap: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBar: {
    width: 5,
    height: 26,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  nowPlayingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  nowPlayingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.5,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function goPlayer(item: { name: string; frequency: string; tag?: string; genre?: string; listeners: string; image: string; accent: string }) {
  router.push({
    pathname: '/rjs/player',
    params: { name: item.name, frequency: item.frequency, genre: item.genre ?? item.tag ?? '', listeners: item.listeners, image: encodeURIComponent(item.image), accent: item.accent },
  });
}

// ── Existing sub-components (unchanged internals) ─────────────────────────────
const CARD_H = 210;

function RecCard({ item }: { item: typeof RECOMMENDED[0] }) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.68, 280);
  return (
    <TouchableOpacity style={[S.recCard, { width: cardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} activeOpacity={0.92} onPress={() => goPlayer(item)}>
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <View style={S.recTop}>
        <View style={[S.tagChip, { backgroundColor: item.accent }]}>
          <Text style={S.tagChipTxt}>{item.tag}</Text>
        </View>
      </View>
      <View style={S.recBottom}>
        <Text style={S.recFreq}>{item.frequency} FM</Text>
        <Text style={S.recName} numberOfLines={1}>{item.name}</Text>
        <View style={S.recFooter}>
          <View style={S.listenerContainer}>
            <Ionicons name="headset-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={S.recListeners}>{item.listeners}</Text>
          </View>
          <TouchableOpacity style={[S.recPlayBtn, { backgroundColor: item.accent }]} onPress={() => goPlayer(item)} activeOpacity={0.85}>
            <Ionicons name="play" size={18} color={WHITE} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AlbumCard({ item }: { item: typeof NEW_ALBUMS[0] }) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.45, 180);
  return (
    <TouchableOpacity style={[S.albumCard, { width: cardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.14)' }]} activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/rjs/album-details', params: { id: item.id, title: item.title, subtitle: item.subtitle, description: item.description, coverImage: encodeURIComponent(item.coverImage), songs: JSON.stringify(item.songs), artist: item.artist } })}>
      <Image source={{ uri: item.coverImage }} style={[S.albumCover, { height: cardWidth }]} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={S.albumGradient} />
      <Text style={S.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={S.albumSubtitle} numberOfLines={1}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
}

const AVT = 80;
function ArtistAvatar({ item, index, showLiveBadge = false, isDefaultFollowing = false }: { item: any; index: number; showLiveBadge?: boolean; isDefaultFollowing?: boolean }) {
  const [c1, c2] = RING_COLORS[index % RING_COLORS.length];
  return (
    <TouchableOpacity style={S.artistWrap} activeOpacity={0.85}
      onPress={() => router.push({ 
  pathname: '/rjs/artist', 
  params: { 
    name: item.name, 
    image: encodeURIComponent(item.image), 
    listeners: item.listeners, 
    isFollowing: isDefaultFollowing ? 'true' : 'false', 
    ...(showLiveBadge && item.isLive ? { isLive: 'true' } : {})
  } 
})}>
      <View style={S.ringOuter}>
        <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: AVT / 2 + 5 }]} />
        <View style={[S.ringGap, { borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Image source={{ uri: item.image }} style={S.artistImg} resizeMode="cover" />
          {showLiveBadge && item.isLive && (
            <View style={S.liveBadgePremium}><Text style={S.liveBadgeTextPremium}>LIVE</Text></View>
          )}
        </View>
      </View>
      <Text style={S.artistNamePremium} numberOfLines={1}>{item.name}</Text>
      <View style={S.artistStats}>
        <Ionicons name="headset-outline" size={10} color={TEXT2} />
        <Text style={S.artistListenersPremium}>{item.listeners}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CategoryCard({ item }: { item: typeof FOLLOWING_CATEGORIES[0] }) {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const cardWidth = isDesktop
    ? (Math.min(windowWidth, 1200) - 40 - 72) / 4
    : 160;
  return (
    <TouchableOpacity style={[S.categoryCardPremium, { width: cardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} activeOpacity={0.92}
      onPress={() => router.push({ pathname: '/rjs/genre', params: { name: encodeURIComponent(item.name), stations: item.stations, listeners: item.listeners } })}>
      <Image source={{ uri: item.backgroundImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={[item.gradient[0] + '80', item.gradient[1] + '80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={S.categoryContentPremium}>
        <View style={[S.categoryIconPremium, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={item.icon as any} size={32} color={WHITE} />
        </View>
        <Text style={S.categoryNamePremium}>{item.name}</Text>
        <View style={S.categoryDetails}>
          <View style={S.categoryStat}><Ionicons name="radio-outline" size={12} color="rgba(255,255,255,0.7)" /><Text style={S.categoryStationsPremium}>{item.stations}</Text></View>
          <View style={S.categoryStat}><Ionicons name="headset-outline" size={12} color="rgba(255,255,255,0.7)" /><Text style={S.categoryListenersPremium}>{item.listeners}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LiveEventCard({ item }: { item: typeof LIVE_EVENTS[0] }) {
  const { showMiniPlayer, startSession } = useRJLive();

  const handlePress = () => {
    const stationIdStr = item.id.toString();
    
    // Always open full live-radio screen
    router.push({
      pathname: '/rjs/live-radio',
      params: { stationId: stationIdStr },
    });
  };

  return (
    <TouchableOpacity style={S.liveEventCard} activeOpacity={0.85} onPress={handlePress}>
      <View style={[S.liveEventImageContainer, { borderWidth: 1.5, borderColor: 'rgba(239, 68, 68, 0.35)' }]}>
        <Image source={{ uri: item.image }} style={S.liveEventImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={S.liveEventGradient} />
        <View style={S.liveEventBadge}><View style={S.liveEventDot} /><Text style={S.liveEventBadgeText}>LIVE</Text></View>
      </View>
      <Text style={S.liveEventName} numberOfLines={1}>{item.name}</Text>
      <View style={S.liveEventStats}><Ionicons name="people-outline" size={12} color={TEXT2} /><Text style={S.liveEventViewers}>{item.viewers}</Text></View>
    </TouchableOpacity>
  );
}

const UPCOMING_CARD_H = 200;
function UpcomingRJCard({ item, onPress }: { item: typeof UPCOMING_RJS[0]; onPress: () => void }) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.78, 340);
  return (
    <Pressable style={[S.upcomingCard, { width: cardWidth, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.16)' }]} onPress={onPress}>
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={[S.upcomingAccentStrip, { backgroundColor: item.accent }]} />
      <View style={S.upcomingTop}>
        <View style={[S.upcomingGenreChip, { backgroundColor: item.accent + 'CC' }]}><Text style={S.upcomingGenreTxt}>{item.genre}</Text></View>
        <View style={S.upcomingBadge}><Ionicons name="time-outline" size={10} color={WHITE} /><Text style={S.upcomingBadgeTxt}>UPCOMING</Text></View>
      </View>
      <View style={S.upcomingBottom}>
        <View style={[S.upcomingAvatarRing, { borderColor: item.accent }]}>
          <Image source={{ uri: item.avatar }} style={S.upcomingAvatar} resizeMode="cover" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.upcomingShowName} numberOfLines={1}>{item.show}</Text>
          <Text style={S.upcomingRJName} numberOfLines={1}>{item.name}</Text>
          <View style={S.upcomingMeta}>
            <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.65)" />
            <Text style={S.upcomingTime}>{item.time}</Text>
            <View style={S.upcomingDot} />
            <Ionicons name="headset-outline" size={11} color="rgba(255,255,255,0.65)" />
            <Text style={S.upcomingTime}>{item.listeners}</Text>
          </View>
        </View>
        <TouchableOpacity style={[S.upcomingNotifyBtn, { backgroundColor: item.accent }]} activeOpacity={0.85} onPress={e => e.stopPropagation()}>
          <Ionicons name="notifications-outline" size={16} color={WHITE} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

// ── Section Header helper ─────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={S.sectionHead}>
      <View style={S.sectionTitleRow}>
        <View style={[S.accentBar, { backgroundColor: PURPLE }]} />
        <Text style={S.sectionTitle}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity style={S.viewAllBtn} activeOpacity={0.75} onPress={onSeeAll}>
          <Text style={[S.viewAllTxt, { color: PURPLE }]}>See All</Text>
          <Ionicons name="arrow-forward" size={14} color={PURPLE} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
export default function StationsScreen() {
  const isScrollingUpcoming = React.useRef(false);
  const [showTuner, setShowTuner] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0A0A12', '#07070F', '#05050C']} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ width: '100%', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', paddingHorizontal: isDesktop ? 24 : 12 }}>

          {/* ── HEADER ── */}
          <View style={[S.header, { paddingTop: SBH + 14 }]}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={S.headerIconBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={WHITE} />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={S.headerTitle}>RJ Stations</Text>
            <View style={S.headerSubtitle}>
              <View style={S.onAirDot} />
              <Text style={S.onAirTxt}>LIVE NOW</Text>
            </View>
          </View>
          <TouchableOpacity
  style={S.headerIconBtn}
  activeOpacity={0.75}
  onPress={() => router.push('/rjs/search')}
>
  <Ionicons name="search-outline" size={20} color={WHITE} />
</TouchableOpacity>
        </View>

        <AdCarousel />

        {/* ── RJ LIVE EVENTS ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="RJ Live Events" onSeeAll={() => router.push('/rjs/live-event')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, paddingHorizontal: 20 }}>
              {LIVE_EVENTS.map(item => <LiveEventCard key={item.id} item={item} />)}
            </View>
          ) : (
            <FlatList data={LIVE_EVENTS} horizontal keyExtractor={i => i.id.toString()} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }} renderItem={({ item }) => <LiveEventCard item={item} />} />
          )}
        </View>

        {/* ── TOP RJS ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="Top RJs" onSeeAll={() => router.push('/rjs/topsingers')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingHorizontal: 20 }}>
              {TOP_ARTISTS.map((item, index) => <ArtistAvatar key={item.id} item={item} index={index} isDefaultFollowing={false} />)}
            </View>
          ) : (
            <FlatList data={TOP_ARTISTS} horizontal keyExtractor={i => i.id.toString()} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }} renderItem={({ item, index }) => <ArtistAvatar item={item} index={index} isDefaultFollowing={false} />} />
          )}
        </View>

        {/* ── RECENT RJS ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="Recent RJs" onSeeAll={() => router.push('/rjs/topsingers')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingHorizontal: 20 }}>
              {RECENT_RJS.map((item, index) => <ArtistAvatar key={item.id} item={item} index={index} isDefaultFollowing={false} />)}
            </View>
          ) : (
            <FlatList
              data={RECENT_RJS}
              horizontal
              keyExtractor={i => i.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }}
              renderItem={({ item, index }) => (
                <ArtistAvatar item={item} index={index} isDefaultFollowing={false} />
              )}
            />
          )}
        </View>

        {/* ── GENERAL RJS ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="General RJs" onSeeAll={() => router.push('/rjs/topsingers')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingHorizontal: 20 }}>
              {GENERAL_RJS.map((item, index) => <ArtistAvatar key={item.id} item={item} index={index} isDefaultFollowing={false} />)}
            </View>
          ) : (
            <FlatList
              data={GENERAL_RJS}
              horizontal
              keyExtractor={i => i.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }}
              renderItem={({ item, index }) => (
                <ArtistAvatar item={item} index={index} isDefaultFollowing={false} />
              )}
            />
          )}
        </View>

        {/* ── BROWSE BY GENRE ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="Browse by Genre" onSeeAll={() => router.push('/rjs/genre')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, paddingHorizontal: 20 }}>
              {FOLLOWING_CATEGORIES.map(item => <CategoryCard key={item.id} item={item} />)}
            </View>
          ) : (
            <FlatList data={FOLLOWING_CATEGORIES} horizontal keyExtractor={i => i.id.toString()} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }} renderItem={({ item }) => <CategoryCard item={item} />} />
          )}
        </View>

        {/* ── RJS YOU FOLLOW ── */}
        <View style={S.sectionContainer}>
          <SectionHeader title="RJs You Follow" onSeeAll={() => router.push('/rjs/topsingers')} />
          {isDesktop ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingHorizontal: 20 }}>
              {FOLLOWING_ARTISTS.map((item, index) => <ArtistAvatar key={item.id} item={item} index={index} showLiveBadge isDefaultFollowing />)}
            </View>
          ) : (
            <FlatList data={FOLLOWING_ARTISTS} horizontal keyExtractor={i => i.id.toString()} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }} renderItem={({ item, index }) => <ArtistAvatar item={item} index={index} showLiveBadge isDefaultFollowing />} />
          )}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── EXISTING STYLES (unchanged) ───────────────────────────────────────────────
const S = StyleSheet.create({
  root:             { flex: 1, backgroundColor: BG },
  sectionContainer: { marginBottom: 36 },

  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { fontSize: 28, fontWeight: '800', color: WHITE, letterSpacing: -0.8 },
  headerSubtitle:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onAirDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  onAirTxt:      { fontSize: 11, fontWeight: '700', color: TEXT2, letterSpacing: 1.5 },

  sectionHead:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accentBar:       { width: 4, height: 20, borderRadius: 2 },
  sectionTitle:    { fontSize: 20, fontWeight: '800', color: WHITE, letterSpacing: -0.5 },
  viewAllBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewAllTxt:      { fontSize: 13, fontWeight: '600' },

  recCard:           { height: CARD_H, borderRadius: 24, overflow: 'hidden' },
  recTop:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  tagChip:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 30 },
  tagChipTxt:        { fontSize: 12, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  recBottom:         { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  recFreq:           { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 4 },
  recName:           { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: -0.8, marginBottom: 12 },
  recFooter:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listenerContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recListeners:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  recPlayBtn:        { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  artistWrap:             { alignItems: 'center', width: 88 },
  ringOuter:              { width: AVT + 10, height: AVT + 10, borderRadius: AVT / 2 + 5, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  ringGap:                { width: AVT + 4, height: AVT + 4, borderRadius: AVT / 2 + 2, backgroundColor: BG, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  artistImg:              { width: AVT, height: AVT, borderRadius: AVT / 2 },
  artistNamePremium:      { fontSize: 14, fontWeight: '700', color: WHITE, textAlign: 'center', marginBottom: 4 },
  artistStats:            { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artistListenersPremium: { fontSize: 11, color: TEXT2, fontWeight: '500' },
  liveBadgePremium:       { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 16, borderWidth: 2, borderColor: BG },
  liveBadgeTextPremium:   { fontSize: 9, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },

  categoryCardPremium:      { height: 140, borderRadius: 20, overflow: 'hidden' },
  categoryContentPremium:   { flex: 1, padding: 16, justifyContent: 'space-between', zIndex: 2 },
  categoryIconPremium:      { width: 44, height: 44, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  categoryNamePremium:      { fontSize: 18, fontWeight: '800', color: WHITE, letterSpacing: -0.5, marginBottom: 6 },
  categoryDetails:          { gap: 4 },
  categoryStat:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryStationsPremium:  { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  categoryListenersPremium: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  liveEventCard:           { width: 100, alignItems: 'center' },
  liveEventImageContainer: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', marginBottom: 12 },
  liveEventImage:          { width: '100%', height: '100%' },
  liveEventGradient:       { ...StyleSheet.absoluteFillObject },
  liveEventBadge:          { position: 'absolute', bottom: 4, left: '50%', transform: [{ translateX: -24 }], backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  liveEventDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: WHITE },
  liveEventBadgeText:      { fontSize: 10, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  liveEventName:           { fontSize: 12, fontWeight: '700', color: WHITE, textAlign: 'center', marginBottom: 4 },
  liveEventStats:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveEventViewers:        { fontSize: 10, color: TEXT2, fontWeight: '500' },

  albumCard:     { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  albumCover:    { width: '100%', borderRadius: 16 },
  albumGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, borderRadius: 16 },
  albumTitle:    { fontSize: 15, fontWeight: '700', color: WHITE, marginTop: 8, marginHorizontal: 4 },
  albumSubtitle: { fontSize: 12, fontWeight: '500', color: TEXT2, marginTop: 2, marginHorizontal: 4, marginBottom: 8 },

  upcomingCard:        { height: UPCOMING_CARD_H, borderRadius: 22, overflow: 'hidden' },
  upcomingAccentStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  upcomingTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 18 },
  upcomingGenreChip:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  upcomingGenreTxt:    { fontSize: 11, fontWeight: '800', color: WHITE, letterSpacing: 0.4 },
  upcomingBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  upcomingBadgeTxt:    { fontSize: 10, fontWeight: '800', color: WHITE, letterSpacing: 1 },
  upcomingBottom:      { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  upcomingAvatarRing:  { width: 48, height: 48, borderRadius: 24, borderWidth: 2, overflow: 'hidden' },
  upcomingAvatar:      { width: '100%', height: '100%' },
  upcomingShowName:    { fontSize: 15, fontWeight: '800', color: WHITE, letterSpacing: -0.3, marginBottom: 2 },
  upcomingRJName:      { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  upcomingMeta:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  upcomingTime:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  upcomingDot:         { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.35)' },
  upcomingNotifyBtn:   { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});