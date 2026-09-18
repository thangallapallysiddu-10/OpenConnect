import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

// ── Dark Theme Tokens ─────────────────────────────────────────────────────────
const BG      = '#07070F';
const CARD    = '#0F0F1E';
const CARD2   = '#13132A';
const WHITE   = '#FFFFFF';
const TEXT1   = 'rgba(255,255,255,0.95)';
const TEXT2   = 'rgba(255,255,255,0.55)';
const TEXT3   = 'rgba(255,255,255,0.30)';
const BORDER  = 'rgba(255,255,255,0.07)';

// ── RJ Database (unchanged content) ──────────────────────────────────────────
const DB: Record<string, {
  accent: string;
  gradient: [string, string, string];
  heroImage: string;
  bio: string;
  fullBio: string;
  experience: string;
  languages: string[];
  timeslot: string;
  awards: string[];
  stations: { name: string; frequency: string; years: string; logo: string; genre: string }[];
  shows: { title: string; time: string; days: string; image: string; listeners: string }[];
  socials: { platform: string; handle: string; followers: string; bg: string; icon: string }[];
}> = {
  'RJ Priya': {
    accent: '#E11D48',
    gradient: ['#4C0519', '#881337', '#BE123C'],
    heroImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop&crop=faces&facepad=4',
    bio: 'Morning show host & pop culture queen with 8 years on air.',
    fullBio: 'RJ Priya is one of the most beloved voices in Indian radio. With a warm personality and infectious energy, she has been entertaining listeners for over 8 years. Her signature morning show has won multiple awards and consistently tops the charts across all major cities.',
    experience: '8 Years',
    languages: ['Hindi', 'English', 'Tamil'],
    timeslot: '6:00 AM – 10:00 AM',
    awards: ['Best Morning RJ 2023', "People's Choice Award 2022", 'Radio Excellence 2021'],
    stations: [
      { name: 'Radio Mirchi', frequency: '98.3 FM', years: '2020–Present', logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', genre: 'Pop / Bollywood' },
      { name: 'Red FM',       frequency: '93.5 FM', years: '2018–2020',    logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', genre: 'Hindi Hits' },
      { name: 'Big FM',       frequency: '92.7 FM', years: '2016–2018',    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop', genre: 'Retro / Classic' },
    ],
    shows: [
      { title: 'Good Morning India', time: '6:00 AM',  days: 'Mon – Fri', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop', listeners: '2.1M' },
      { title: 'Weekend Brunch',     time: '10:00 AM', days: 'Sat – Sun', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&h=200&fit=crop', listeners: '1.4M' },
    ],
    socials: [
      { platform: 'Instagram', handle: '@rjpriya', followers: '1.2M', bg: '#E1306C', icon: 'camera' },
      { platform: 'Twitter',   handle: '@rjpriya', followers: '890K', bg: '#1DA1F2', icon: 'logo-twitter' },
      { platform: 'YouTube',   handle: 'RJ Priya', followers: '540K', bg: '#FF0000', icon: 'logo-youtube' },
    ],
  },
  'RJ Marcus': {
    accent: '#2563EB',
    gradient: ['#0C1445', '#1E3A8A', '#1D4ED8'],
    heroImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=faces&facepad=4',
    bio: 'Night show host & electronic music specialist with 6 years on air.',
    fullBio: 'RJ Marcus is the undisputed king of late-night radio. Known for his deep knowledge of electronic music and calm, engaging voice, he has built one of the most loyal listener communities in the industry over his 6-year career.',
    experience: '6 Years',
    languages: ['English', 'French'],
    timeslot: '10:00 PM – 2:00 AM',
    awards: ['Best Night Show 2023', 'EDM Radio Host of the Year 2022'],
    stations: [
      { name: 'NRJ Radio', frequency: '91.1 FM',  years: '2021–Present', logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', genre: 'EDM / Electronic' },
      { name: 'Kiss FM',   frequency: '100.2 FM', years: '2019–2021',    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop', genre: 'Club Hits' },
    ],
    shows: [
      { title: 'Night Frequency', time: '10:00 PM', days: 'Mon – Fri', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop', listeners: '1.8M' },
      { title: 'Bass Sessions',   time: '12:00 AM', days: 'Fri – Sat',  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop', listeners: '980K' },
    ],
    socials: [
      { platform: 'Instagram', handle: '@rjmarcus', followers: '760K', bg: '#E1306C', icon: 'camera' },
      { platform: 'Twitter',   handle: '@rjmarcus', followers: '420K', bg: '#1DA1F2', icon: 'logo-twitter' },
    ],
  },
  'RJ Zara': {
    accent: '#059669',
    gradient: ['#022C22', '#064E3B', '#065F46'],
    heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&crop=faces&facepad=4',
    bio: 'Jazz & soul specialist with a silky smooth voice. 10 years on air.',
    fullBio: 'RJ Zara is widely regarded as one of the finest radio personalities of her generation. Her deep knowledge of jazz, soul, and R&B combined with her naturally soothing voice creates an unmatched listening experience. She has spent 10 years shaping the late afternoon soundscape for millions.',
    experience: '10 Years',
    languages: ['English', 'Arabic', 'French'],
    timeslot: '2:00 PM – 6:00 PM',
    awards: ['Best Afternoon Show 2023', 'Jazz Radio Host Award 2021', 'Voice of the Year 2020'],
    stations: [
      { name: 'Smooth Radio', frequency: '92.2 FM',  years: '2019–Present', logo: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=100&h=100&fit=crop', genre: 'Jazz / Soul' },
      { name: 'Classic FM',   frequency: '100.9 FM', years: '2016–2019',    logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', genre: 'Classical / Jazz' },
      { name: 'Heart FM',     frequency: '102.0 FM', years: '2014–2016',    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop', genre: 'R&B / Soul' },
    ],
    shows: [
      { title: 'Afternoon Jazz', time: '2:00 PM', days: 'Mon – Fri', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=200&fit=crop', listeners: '2.4M' },
      { title: 'Soul Sundays',   time: '4:00 PM', days: 'Sunday',    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&h=200&fit=crop', listeners: '1.9M' },
    ],
    socials: [
      { platform: 'Instagram', handle: '@rjzara', followers: '2.1M', bg: '#E1306C', icon: 'camera' },
      { platform: 'YouTube',   handle: 'RJ Zara', followers: '1.1M', bg: '#FF0000', icon: 'logo-youtube' },
      { platform: 'Twitter',   handle: '@rjzara', followers: '680K', bg: '#1DA1F2', icon: 'logo-twitter' },
    ],
  },
  'RJ Arjun': {
    accent: '#D97706',
    gradient: ['#431407', '#92400E', '#B45309'],
    heroImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop&crop=faces&facepad=4',
    bio: 'Bollywood & retro specialist. 5 years making mornings better.',
    fullBio: 'RJ Arjun is the go-to voice for Bollywood lovers and retro music fans. His encyclopedic knowledge of Hindi film music, combined with his witty humor and quick storytelling, has made him a household name across the country in just 5 years.',
    experience: '5 Years',
    languages: ['Hindi', 'English', 'Punjabi'],
    timeslot: '10:00 AM – 2:00 PM',
    awards: ["Best Bollywood RJ 2023", "Listener's Favorite 2022"],
    stations: [
      { name: 'Radio City', frequency: '91.1 FM', years: '2022–Present', logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', genre: 'Bollywood / Retro' },
      { name: 'Big FM',     frequency: '92.7 FM', years: '2019–2022',    logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', genre: 'Hindi Classics' },
    ],
    shows: [
      { title: 'Filmy Mornings', time: '10:00 AM', days: 'Mon – Sat', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop', listeners: '1.6M' },
      { title: 'Retro Rewind',   time: '12:00 PM', days: 'Sunday',    image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=300&h=200&fit=crop', listeners: '1.1M' },
    ],
    socials: [
      { platform: 'Instagram', handle: '@rjarjun', followers: '540K', bg: '#E1306C', icon: 'camera' },
      { platform: 'Twitter',   handle: '@rjarjun', followers: '310K', bg: '#1DA1F2', icon: 'logo-twitter' },
    ],
  },
  'RJ Natalie': {
    accent: '#7C3AED',
    gradient: ['#1E1B4B', '#3730A3', '#4F46E5'],
    heroImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop&crop=faces&facepad=4',
    bio: 'Pop & lifestyle host. Most followed RJ in the country. 12 years.',
    fullBio: 'RJ Natalie is an icon in the world of radio broadcasting. Over 12 extraordinary years, she has hosted flagship shows, interviewed A-list celebrities, and championed youth culture. She is the most-followed RJ on social media and continues to set the standard for modern radio entertainment.',
    experience: '12 Years',
    languages: ['English', 'Spanish', 'Portuguese'],
    timeslot: '4:00 PM – 8:00 PM',
    awards: ['Best RJ of the Year 2023', 'Icon Award 2022', 'Best Lifestyle Show 2021', 'Youth Choice Award 2020'],
    stations: [
      { name: 'Virgin Radio', frequency: '94.3 FM',  years: '2018–Present', logo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', genre: 'Pop / Lifestyle' },
      { name: 'Radio 1',      frequency: '97.6 FM',  years: '2015–2018',    logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', genre: 'Top 40' },
      { name: 'Heart FM',     frequency: '102.0 FM', years: '2012–2015',    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop', genre: 'Pop / Dance' },
    ],
    shows: [
      { title: 'Drive Time with Natalie', time: '4:00 PM', days: 'Mon – Fri', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop', listeners: '3.2M' },
      { title: 'Saturday Night Live',     time: '8:00 PM', days: 'Saturday',  image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop', listeners: '2.8M' },
      { title: 'Celebrity Chat',          time: '6:00 PM', days: 'Friday',    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop', listeners: '2.1M' },
    ],
    socials: [
      { platform: 'Instagram', handle: '@rjnatalie', followers: '4.2M', bg: '#E1306C', icon: 'camera' },
      { platform: 'Twitter',   handle: '@rjnatalie', followers: '2.1M', bg: '#1DA1F2', icon: 'logo-twitter' },
      { platform: 'YouTube',   handle: 'RJ Natalie', followers: '1.8M', bg: '#FF0000', icon: 'logo-youtube' },
      { platform: 'Facebook',  handle: 'RJ Natalie', followers: '3.1M', bg: '#1877F2', icon: 'logo-facebook' },
    ],
  },
};

const DEFAULT_RJ = {
  accent: '#8B5CF6',
  gradient: ['#1E1B4B', '#3730A3', '#4F46E5'] as [string, string, string],
  heroImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1000&fit=crop&crop=faces&facepad=4',
  bio: 'Professional radio jockey with years of experience on air.',
  fullBio: 'A passionate and experienced radio jockey bringing energy, music, and great conversations to listeners every day. Known for an engaging style and deep knowledge of music across all genres.',
  experience: '5+ Years',
  languages: ['English'],
  timeslot: 'Various',
  awards: ['Best New RJ Award'],
  stations: [
    { name: 'RJ Stations', frequency: '91.1 FM', years: '2020–Present', logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', genre: 'Mixed' },
  ],
  shows: [
    { title: 'Daily Mix', time: '12:00 PM', days: 'Mon – Fri', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop', listeners: '500K' },
  ],
  socials: [
    { platform: 'Instagram', handle: '@rj', followers: '100K', bg: '#E1306C', icon: 'camera' },
  ],
};

// ── Section Header ────────────────────────────────────────────────────────────
function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={S.sectionHead}>
      <View style={[S.accentBar, { backgroundColor: accent }]} />
      <Text style={S.sectionTitle}>{title}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ArtistScreen() {
  const params = useLocalSearchParams<{ name: string; image: string; listeners: string; isFollowing: string }>();
  const name      = params.name ?? 'RJ';
  const listeners = params.listeners ?? '0';
  const data      = DB[name] ?? DEFAULT_RJ;
  const { accent, gradient, heroImage, fullBio, experience, languages, timeslot, awards, stations, shows, socials } = data;
  const passedImg = params.image ? decodeURIComponent(params.image) : heroImage;
  const [isFollowing, setIsFollowing] = useState(params.isFollowing === 'true');
  const [notifOn,     setNotifOn]     = useState(false);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const heroHeight = isDesktop ? 450 : windowHeight * 0.52;

  const renderHeroCard = () => (
    <View style={[S.hero, { width: isDesktop ? '100%' : windowWidth, height: heroHeight, borderRadius: isDesktop ? 24 : 0, overflow: 'hidden', borderWidth: isDesktop ? 1.5 : 0, borderColor: 'rgba(255,255,255,0.16)' }]}>
      <Image source={{ uri: passedImg }} style={S.heroImg} resizeMode="cover" />

      {/* Deep dark gradient from top */}
      <LinearGradient
        colors={['rgba(7,7,15,0.72)', 'rgba(7,7,15,0.10)', 'transparent']}
        locations={[0, 0.4, 0.7]}
        style={StyleSheet.absoluteFill}
      />
      {/* Fade to dark BG at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(7,7,15,0.55)', BG]}
        locations={[0.5, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Accent color glow at bottom */}
      <LinearGradient
        colors={['transparent', accent + '22']}
        locations={[0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header row */}
      <View style={[S.heroHeader, { top: isDesktop ? 20 : SBH + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={S.iconBtn} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <Text style={S.heroName}>{name}</Text>
        <TouchableOpacity style={S.iconBtn} activeOpacity={0.8}>
          <Ionicons name="share-social-outline" size={18} color={WHITE} />
        </TouchableOpacity>
      </View>

      {/* Bottom hero row */}
      <View style={[S.heroBottom, { bottom: isDesktop ? 24 : 40 }]}>
        <View style={[S.onAirPill, { backgroundColor: accent + 'CC', borderColor: accent }]}>
          <View style={S.onAirDot} />
          <Text style={S.onAirTxt}>ON AIR · {timeslot}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={[S.notifBtn, notifOn && { backgroundColor: accent + '30', borderColor: accent }]}
            onPress={() => setNotifOn(n => !n)}
            activeOpacity={0.85}
          >
            <Ionicons name={notifOn ? 'notifications' : 'notifications-outline'} size={17} color={notifOn ? accent : 'rgba(255,255,255,0.7)'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.followBtn, isFollowing
              ? { backgroundColor: accent, borderColor: accent }
              : { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)' }
            ]}
            onPress={() => setIsFollowing(f => !f)}
            activeOpacity={0.85}
          >
            <Ionicons name={isFollowing ? 'checkmark' : 'add'} size={14} color={WHITE} />
            <Text style={S.followTxt}>{isFollowing ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatsBar = () => (
    <View style={[S.statsBar, { borderColor: accent + '30', borderWidth: 1.5, marginHorizontal: 0, marginTop: 0 }]}>
      <LinearGradient
        colors={[accent + '12', accent + '06']}
        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
      />
      <View style={S.statItem}>
        <Text style={[S.statNum, { color: accent }]}>{listeners}</Text>
        <Text style={S.statLabel}>Listeners</Text>
      </View>
      <View style={[S.statDivider, { backgroundColor: accent + '30' }]} />
      <View style={S.statItem}>
        <Text style={[S.statNum, { color: accent }]}>{experience}</Text>
        <Text style={S.statLabel}>Experience</Text>
      </View>
      <View style={[S.statDivider, { backgroundColor: accent + '30' }]} />
      <View style={S.statItem}>
        <Text style={[S.statNum, { color: accent }]}>{stations.length}</Text>
        <Text style={S.statLabel}>Stations</Text>
      </View>
    </View>
  );

  const renderAbout = () => (
    <View style={[S.section, { paddingHorizontal: 0, paddingTop: 0 }]}>
      <SectionTitle title={`About ${name}`} accent={accent} />
      <Text style={S.bodyTxt}>{fullBio}</Text>
      <View style={S.tagsRow}>
        {languages.map(lang => (
          <View key={lang} style={[S.tag, { borderColor: accent + '50', backgroundColor: accent + '18', borderWidth: 1.5 }]}>
            <Ionicons name="globe-outline" size={11} color={accent} />
            <Text style={[S.tagTxt, { color: accent }]}>{lang}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAwards = () => (
    <View style={[S.section, { paddingHorizontal: 0, paddingTop: 0 }]}>
      <SectionTitle title="Awards & Recognition" accent={accent} />
      {awards.map((award, i) => (
        <View key={i} style={[S.awardRow, { borderColor: accent + '20', borderWidth: 1.5 }]}>
          <LinearGradient
            colors={[accent + '25', accent + '10']}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
          <View style={[S.awardIcon, { backgroundColor: accent + '30' }]}>
            <Ionicons name="trophy" size={16} color={accent} />
          </View>
          <Text style={S.awardTxt}>{award}</Text>
          <Ionicons name="star" size={12} color={accent + '80'} />
        </View>
      ))}
    </View>
  );

  const renderStations = () => (
    <View style={[S.section, { paddingHorizontal: 0, paddingTop: 0 }]}>
      <SectionTitle title="Radio Stations" accent={accent} />
      {stations.map((st, i) => (
        <TouchableOpacity
          key={i}
          style={[S.stationCard, { borderColor: accent + '25', borderWidth: 1.5 }]}
          activeOpacity={0.85}
          onPress={() => router.push({
            pathname: '/rjs/player',
            params: {
              name:      st.name,
              frequency: st.frequency.replace(' FM', ''),
              genre:     st.genre,
              listeners: '0',
              image:     encodeURIComponent(passedImg),
              accent:    accent,
            },
          })}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
            style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
          />
          <Image source={{ uri: st.logo }} style={S.stationLogo} resizeMode="cover" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.stationName}>{st.name}</Text>
            <Text style={S.stationFreq}>{st.frequency} · {st.genre}</Text>
            <View style={[S.yearsBadge, { backgroundColor: accent + '20' }]}>
              <Text style={[S.stationYears, { color: accent }]}>{st.years}</Text>
            </View>
          </View>
          <View style={[S.playStationBtn, { backgroundColor: accent }]}>
            <Ionicons name="radio-outline" size={17} color={WHITE} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderShows = () => (
    <View style={[S.section, { paddingHorizontal: 0, paddingTop: 0 }]}>
      <SectionTitle title="Latest Shows" accent={accent} />
      {shows.map((show, i) => (
        <View key={i} style={[S.showCard, { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)' }]}>
          <Image source={{ uri: show.image }} style={S.showImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.88)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[S.showAccentStrip, { backgroundColor: accent }]} />
          <View style={[S.showTimeBadge, { backgroundColor: accent + 'EE' }]}>
            <Ionicons name="time-outline" size={10} color={WHITE} style={{ marginRight: 3 }} />
            <Text style={S.showTimeTxt}>{show.time}</Text>
          </View>
          <View style={S.showInfo}>
            <Text style={S.showTitle}>{show.title}</Text>
            <View style={S.showMeta}>
              <View style={[S.showDaysBadge, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={S.showDays}>{show.days}</Text>
              </View>
              <View style={S.showDot} />
              <Ionicons name="headset-outline" size={11} color="rgba(255,255,255,0.6)" />
              <Text style={S.showListeners}>{show.listeners}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSocialMedia = () => (
    <View style={[S.section, { paddingHorizontal: 0, paddingTop: 0 }]}>
      <SectionTitle title="Follow on Social Media" accent={accent} />
      {socials.map((s, i) => (
        <TouchableOpacity key={i} style={[S.socialRow, { borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1.5 }]} activeOpacity={0.85}>
          <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
          <View style={[S.socialIcon, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon as any} size={18} color={WHITE} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.socialPlatform}>{s.platform}</Text>
            <Text style={S.socialHandle}>{s.handle}</Text>
          </View>
          <View style={[S.followersBadge, { backgroundColor: accent + '20', borderColor: accent + '40', borderWidth: 1 }]}>
            <Text style={[S.socialFollowers, { color: accent }]}>{s.followers}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={TEXT3} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pb-12">
          {isDesktop ? (
            <View style={{ flexDirection: 'row', gap: 32, paddingTop: SBH + 20 }}>
              {/* Left Column (Hero Card, Stats, Socials) */}
              <View style={{ flex: 1, gap: 24 }}>
                {renderHeroCard()}
                {renderStatsBar()}
                {renderSocialMedia()}
              </View>

              {/* Right Column (About, Awards, Stations, Shows) */}
              <View style={{ flex: 1.6, gap: 24 }}>
                {renderAbout()}
                {renderAwards()}
                {renderStations()}
                {renderShows()}
              </View>
            </View>
          ) : (
            // Mobile layout
            <View>
              {renderHeroCard()}
              <View style={S.content}>
                {renderStatsBar()}
                {renderAbout()}
                <View style={S.divider} />
                {renderAwards()}
                <View style={S.divider} />
                {renderStations()}
                <View style={S.divider} />
                {renderShows()}
                <View style={S.divider} />
                {renderSocialMedia()}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Hero
  hero:    { position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroHeader: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroName: { fontSize: 20, fontWeight: '800', color: WHITE, flex: 1, textAlign: 'center' },
  heroBottom: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  onAirPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  onAirDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: WHITE, marginRight: 7 },
  onAirTxt: { fontSize: 11, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1.5,
  },
  followTxt: { fontSize: 13, fontWeight: '700', color: WHITE },

  // Content area
  content: {
    backgroundColor: BG,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 4,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 24, marginBottom: 4,
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 18, overflow: 'hidden',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginBottom: 3 },
  statLabel:   { fontSize: 11, color: TEXT2, fontWeight: '500' },
  statDivider: { width: 1, height: 36 },

  // Sections
  section:    { paddingTop: 24 },
  sectionHead:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  accentBar:  { width: 4, height: 20, borderRadius: 2 },
  sectionTitle:{ fontSize: 18, fontWeight: '800', color: TEXT1, letterSpacing: -0.3 },
  bodyTxt:    { fontSize: 14, color: TEXT2, lineHeight: 24 },
  divider:    { height: 1, backgroundColor: BORDER, marginHorizontal: 20, marginTop: 24 },

  // Language tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  tagTxt:  { fontSize: 12, fontWeight: '600' },

  // Awards
  awardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 10, padding: 14, borderRadius: 16,
    borderWidth: 1, overflow: 'hidden', position: 'relative',
  },
  awardIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  awardTxt:  { fontSize: 14, color: TEXT1, fontWeight: '600', flex: 1 },

  // Stations
  stationCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 14, marginBottom: 12,
    borderWidth: 1, overflow: 'hidden', position: 'relative',
    backgroundColor: CARD,
  },
  stationLogo:  { width: 52, height: 52, borderRadius: 12 },
  stationName:  { fontSize: 15, fontWeight: '700', color: TEXT1, marginBottom: 3 },
  stationFreq:  { fontSize: 12, color: TEXT2, marginBottom: 6 },
  yearsBadge:   { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stationYears: { fontSize: 11, fontWeight: '600' },
  playStationBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // Shows
  showCard: {
    height: 148, borderRadius: 20, overflow: 'hidden',
    marginBottom: 14, backgroundColor: CARD2,
  },
  showImage:      { width: '100%', height: '100%' },
  showAccentStrip:{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  showTimeBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  showTimeTxt:  { fontSize: 11, fontWeight: '700', color: WHITE },
  showInfo:     { position: 'absolute', bottom: 14, left: 14, right: 14 },
  showTitle:    { fontSize: 17, fontWeight: '800', color: WHITE, marginBottom: 6 },
  showMeta:     { flexDirection: 'row', alignItems: 'center', gap: 7 },
  showDaysBadge:{ borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  showDays:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  showDot:      { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  showListeners:{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  // Socials
  socialRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14,
    borderRadius: 16, marginBottom: 10,
    borderWidth: 1, overflow: 'hidden', position: 'relative',
    backgroundColor: CARD,
  },
  socialIcon:     { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  socialPlatform: { fontSize: 14, fontWeight: '700', color: TEXT1 },
  socialHandle:   { fontSize: 12, color: TEXT3, marginTop: 2 },
  followersBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  socialFollowers:{ fontSize: 13, fontWeight: '700' },
});