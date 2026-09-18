import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFavorites } from '../../src/context/FavoritesContext';

const { width, height } = Dimensions.get('window');
const SBH = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 44) : 44;

const WHITE = '#FFFFFF';
const TEXT2 = '#6B7280';
const TEXT3 = '#9CA3AF';
const BG = '#0D0D0D';
const RED = '#EF4444';

const DB: Record<string, {
  accent: string; gradient: [string, string, string];
  heroImage: string; coverImage: string;
  bio: string; website: string; followers: string; genre: string;
  members?: string[];
  albums?: { title: string; year: string; type: string; songs: number }[];
}> = {
  'ATEEZ': {
    accent: '#FF2E63', gradient: ['#4C0519', '#881337', '#BE123C'],
    heroImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    bio: 'ATEEZ is a South Korean boy band formed by KQ Entertainment. Known for their powerful performances and unique musical style.',
    website: 'https://www.ateez.kqent.com', followers: '5.2M', genre: 'K-Pop / Hip-Hop',
    members: ['Hongjoong', 'Seonghwa', 'Yunho', 'Yeosang', 'San', 'Mingi', 'Wooyoung', 'Jongho'],
    albums: [
      { title: 'THE WORLD EP.2 : OUTLAW', year: '2023', type: 'Studio Album', songs: 6 },
      { title: 'ZERO : FEVER Part.3', year: '2021', type: 'EP', songs: 7 },
      { title: 'TREASURE EP.3 : One To All', year: '2019', type: 'Mini Album', songs: 6 },
    ],
  },
  'Coldplay': {
    accent: '#3B82F6', gradient: ['#0C1445', '#1E3A8A', '#1D4ED8'],
    heroImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    bio: 'Coldplay are a British rock band formed in London in 1996. Known for their melodic rock sound and heartfelt lyrics.',
    website: 'https://www.coldplay.com', followers: '45.2M', genre: 'Rock / Alternative',
    members: ['Chris Martin', 'Jonny Buckland', 'Guy Berryman', 'Will Champion'],
    albums: [
      { title: 'Music of the Spheres', year: '2021', type: 'Studio Album', songs: 12 },
      { title: 'Everyday Life', year: '2019', type: 'Studio Album', songs: 16 },
      { title: 'A Head Full of Dreams', year: '2015', type: 'Studio Album', songs: 11 },
    ],
  },
  'Ed Sheeran': {
    accent: '#E11D48', gradient: ['#4C0519', '#881337', '#BE123C'],
    heroImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=1000&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    bio: 'Ed Sheeran is an English singer-songwriter known for his soulful voice and acoustic pop sound.',
    website: 'https://www.edsheeran.com', followers: '38.7M', genre: 'Pop / Acoustic',
    members: ['Ed Sheeran'],
    albums: [
      { title: '=', year: '2021', type: 'Studio Album', songs: 14 },
      { title: 'No.6 Collaborations Project', year: '2019', type: 'Studio Album', songs: 15 },
      { title: '÷ (Divide)', year: '2017', type: 'Studio Album', songs: 16 },
    ],
  },
};

const DEFAULT = {
  accent: '#7C3AED', gradient: ['#1E1B4B', '#3730A3', '#4F46E5'] as [string, string, string],
  heroImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  bio: 'A talented artist whose music transcends genres and touches hearts around the world.',
  website: 'https://www.artist.com', followers: '10k', genre: 'Music',
  members: ['Artist'],
  albums: [{ title: 'Latest Album', year: '2024', type: 'Studio Album', songs: 10 }],
};

const SOCIALS = [
  { bg: '#1DB954', icon: 'musical-notes' as const, label: 'Spotify' },
  { bg: '#E1306C', icon: 'camera' as const, label: 'Instagram' },
  { bg: '#1877F2', icon: 'logo-facebook' as const, label: 'Facebook' },
  { bg: '#1DA1F2', icon: 'logo-twitter' as const, label: 'Twitter' },
  { bg: '#FF0000', icon: 'logo-youtube' as const, label: 'YouTube' },
];

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 6 }}>
      <View style={{ height: 32, justifyContent: 'center' }}>
        <View style={S.track}>
          <View style={[S.trackFill, { width: '100%' as any }]} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={S.timeTxt}>LIVE</Text>
        <Text style={S.timeTxt}>LIVE</Text>
      </View>
    </View>
  );
}

// ── Fullscreen Player ─────────────────────────────────────────────────────────
function FullscreenPlayer({
  visible, image, title, playing, muted, viewers, liked,
  onClose, onTogglePlay, onToggleMute, onToggleLike,
}: {
  visible: boolean; image: string; title: string; playing: boolean;
  muted: boolean; viewers: string; liked: boolean;
  onClose: () => void; onTogglePlay: () => void;
  onToggleMute: () => void; onToggleLike: () => void;
}) {
  const [comments, setComments] = useState([
    { id: 1, avatar: 'https://i.pravatar.cc/40?img=1', name: 'Jasmin Lowery', text: 'His voice is amazing!' },
    { id: 2, avatar: 'https://i.pravatar.cc/40?img=2', name: 'Nevaeh May', text: 'Woah! Such a good performance' },
    { id: 3, avatar: 'https://i.pravatar.cc/40?img=3', name: 'Will Burch', text: 'I want more songs like that! 😂' },
    { id: 4, avatar: 'https://i.pravatar.cc/40?img=4', name: 'Conner Garcia', text: 'His energy is just off the charts!' },
  ]);

  const [commentText, setCommentText] = useState('');

  const handleSendComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    setComments(prev => [
      ...prev.slice(-4),
      { id: Date.now(), avatar: 'https://i.pravatar.cc/40?img=10', name: 'You', text: trimmed },
    ]);
    setCommentText('');
  };

  const [hearts, setHearts] = useState<{
    id: number; x: number; tapX?: number; tapY?: number;
    opacity: Animated.Value; translateY: Animated.Value; scale: Animated.Value;
  }[]>([]);
  const heartIdRef = useRef(0);

  const spawnHeart = (tapX?: number, tapY?: number) => {
    const id = heartIdRef.current++;
    const opacity = new Animated.Value(1);
    const translateY = new Animated.Value(0);
    const scale = new Animated.Value(0.4);
    const x = Math.random() * 30 - 15;
    setHearts(prev => [...prev, { id, x, tapX, tapY, opacity, translateY, scale }]);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -180, duration: 1400, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => setHearts(prev => prev.filter(h => h.id !== id)));
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar hidden />
        <Image source={{ uri: image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top bar */}
        <View style={[FS.topBar, { paddingTop: SBH + 8 }]}>
          <TouchableOpacity onPress={onClose} style={FS.iconBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={WHITE} />
          </TouchableOpacity>
          <View style={FS.artistInfo}>
            <View style={FS.artistAvatar}>
              <Ionicons name="musical-note" size={14} color={WHITE} />
            </View>
            <View>
              <Text style={FS.artistName}>{title.replace(' Live', '').replace(' Perform...', '')}</Text>
              <Text style={FS.artistSub}>Crazy Form</Text>
            </View>
          </View>
          <View style={FS.viewerBadge}>
            <Ionicons name="people" size={13} color={WHITE} />
            <Text style={FS.viewerTxt}>{viewers} viewers</Text>
          </View>
        </View>

        {/* Comments */}
        <View style={FS.commentsArea}>
          {comments.map(c => (
            <View key={c.id} style={FS.commentRow}>
              <Image source={{ uri: c.avatar }} style={FS.commentAvatar} />
              <View style={FS.commentBubble}>
                <Text style={FS.commentName}>{c.name}</Text>
                <Text style={FS.commentText}>{c.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Floating hearts */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {hearts.map(h => (
            <Animated.View
              key={h.id}
              style={{
                position: 'absolute',
                left: (h.tapX ?? width / 2) - 16 + h.x,
                top: (h.tapY ?? height / 2) - 16,
                transform: [{ translateY: h.translateY }, { scale: h.scale }],
                opacity: h.opacity,
              }}
            >
              <Ionicons name="heart" size={32} color={RED} />
            </Animated.View>
          ))}
        </View>

        {/* Bottom bar: heart icon + functional comment input */}
        <View style={FS.bottomBar}>
          

          <View style={FS.commentInputWrap}>
            <TextInput
              style={FS.commentTextInput}
              placeholder="Write a comment..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={handleSendComment} activeOpacity={0.7}>
              <Ionicons name="send" size={18} color={commentText.trim() ? WHITE : TEXT3} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={(e) => { onToggleLike(); spawnHeart(e.nativeEvent.pageX, e.nativeEvent.pageY); }}
            style={FS.heartBtn}
            activeOpacity={0.8}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? RED : WHITE} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Member Chip ───────────────────────────────────────────────────────────────
const MemberChip = ({ name, accent }: { name: string; accent: string }) => (
  <View style={[S.memberChip, { borderColor: `${accent}30` }]}>
    <View style={[S.memberDot, { backgroundColor: accent }]} />
    <Text style={S.memberName}>{name}</Text>
  </View>
);

// ── Album Card ────────────────────────────────────────────────────────────────
const AlbumCard = ({ album, accent, index }: { album: any; accent: string; index: number }) => (
  <TouchableOpacity activeOpacity={0.85} style={S.albumCard}>
    <View style={[S.albumArtwork, { backgroundColor: `${accent}18` }]}>
      <Ionicons name="musical-notes" size={20} color={accent} />
      <Text style={[S.albumIndex, { color: `${accent}80` }]}>0{index + 1}</Text>
    </View>
    <View style={S.albumInfo}>
      <Text style={S.albumTitle} numberOfLines={1}>{album.title}</Text>
      <View style={S.albumMetaRow}>
        <Text style={S.albumYear}>{album.year}</Text>
        <View style={S.albumDot} />
        <Text style={S.albumType}>{album.type}</Text>
        <View style={S.albumDot} />
        <Text style={S.albumSongs}>{album.songs} tracks</Text>
      </View>
    </View>
    <View style={[S.albumPlayBtn, { backgroundColor: `${accent}20` }]}>
      <Ionicons name="play" size={14} color={accent} style={{ marginLeft: 2 }} />
    </View>
  </TouchableOpacity>
);

// ── Stats Card ────────────────────────────────────────────────────────────────
const StatsCard = ({ icon, label, value, iconColor }: any) => (
  <View style={S.statsCard}>
    <View style={[S.statsIconRing, { borderColor: `${iconColor}30` }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={S.statsValue}>{value}</Text>
    <Text style={S.statsLabel}>{label}</Text>
  </View>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LivePlayerScreen() {
  const params = useLocalSearchParams<{
    title: string; subtitle: string; image: string;
    viewers: string; duration: string;
  }>();

  const artistName = params.title?.replace(' Live', '').replace(' Perform...', '') ?? 'ATEEZ';
  const data = DB[artistName] ?? DEFAULT;
  const { accent, bio, website, genre, members, albums, followers } = data;

  const currentCard = {
    title: params.title ?? artistName,
    subtitle: params.subtitle ?? 'Live Performance',
    image: params.image ? decodeURIComponent(params.image) : data.heroImage,
    viewers: params.viewers ?? '234k',
  };

  const { isFavorite, toggleFavorite } = useFavorites();
  const id = params.id ?? artistName;
  const liked = isFavorite(id);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [saved, setSaved] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1, duration: 350,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  const heartScale = useRef(new Animated.Value(1)).current;
  const handleLike = () => {
    toggleFavorite({
      id: id,
      title: currentCard.title,
      subtitle: `Live RJ • ${currentCard.viewers} listeners`,
      image: currentCard.image,
      type: 'rj',
      rawData: { id, name: artistName, image: currentCard.image, listeners: currentCard.viewers }
    });
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = () => setSaved(prev => !prev);
  const VIDEO_H = height * 0.45;
  const handleClose = () => router.replace('/rjs/live-event');
  const handlePlayPause = () => setPlaying(p => !p);
  const handleMuteToggle = () => setMuted(m => !m);
  const handleFullscreen = () => setFullscreen(true);

  return (
    <Animated.View style={[S.root, { opacity: fade }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FullscreenPlayer
        visible={fullscreen}
        image={currentCard.image}
        title={currentCard.title}
        playing={playing}
        muted={muted}
        viewers={currentCard.viewers}
        liked={liked}
        onClose={() => setFullscreen(false)}
        onTogglePlay={handlePlayPause}
        onToggleMute={handleMuteToggle}
        onToggleLike={handleLike}
      />

      {/* Video Player */}
      <View style={[S.videoWrap, { height: VIDEO_H }]}>
        <Image source={{ uri: currentCard.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[S.videoTopBar, { paddingTop: SBH + 6, zIndex: 10 }]}>
          <TouchableOpacity onPress={handleClose} style={S.videoIconBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color={WHITE} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={S.videoIconBtn} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={20} color={WHITE} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={S.videoCenter} activeOpacity={1} onPress={handlePlayPause}>
          {!playing && (
            <View style={S.centerPlayBtn}>
              <Ionicons name="play" size={36} color={WHITE} style={{ marginLeft: 4 }} />
            </View>
          )}
        </TouchableOpacity>
        <View style={S.videoBottomBar}>
          <View style={S.liveInfoContainer}>
            <View style={[S.liveBadge, { backgroundColor: RED }]}>
              <View style={S.liveDotPulse} />
              <Text style={S.liveTxt}>LIVE</Text>
            </View>
            <Text style={S.videoTitle}>{currentCard.title}</Text>
            <Text style={S.videoSubtitle}>{currentCard.subtitle}</Text>
          </View>
          <View style={S.controlsRow}>
            <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.8}>
              <Ionicons name={playing ? 'pause' : 'play'} size={22} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMuteToggle} activeOpacity={0.8}>
              <Ionicons name={muted ? 'volume-mute' : 'volume-medium'} size={22} color={WHITE} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleFullscreen} activeOpacity={0.8}>
              <Ionicons name="expand" size={22} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ProgressBar />

      {/* Artist Details */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.infoContainer}>

        {/* Identity Strip */}
        <View style={S.identityStrip}>
          <View style={[S.accentLine, { backgroundColor: accent }]} />
          <View style={S.identityText}>
            <Text style={S.artistName}>{artistName}</Text>
            <Text style={[S.genreTag, { color: accent }]}>{genre}</Text>
          </View>
          <View style={[S.followerPill, { borderColor: `${accent}40` }]}>
            <Ionicons name="people-outline" size={13} color={accent} />
            <Text style={[S.followerCount, { color: accent }]}>{followers}</Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={S.actionRow}>
          {[
            { icon: liked ? 'heart' : 'heart-outline', label: 'Like', active: liked, color: RED, onPress: handleLike },
            { icon: 'chatbubble-outline', label: 'Chat', active: false, color: accent, onPress: undefined },
            { icon: 'share-social-outline', label: 'Share', active: false, color: accent, onPress: undefined },
            { icon: saved ? 'bookmark' : 'bookmark-outline', label: 'Save', active: saved, color: accent, onPress: handleSave },
          ].map((btn, i) => (
            <TouchableOpacity key={i} style={S.actionBtn} activeOpacity={0.75} onPress={btn.onPress}>
              <View style={[S.actionIconWrap, btn.active && { backgroundColor: `${btn.color}20` }]}>
                <Animated.View style={i === 0 ? { transform: [{ scale: heartScale }] } : undefined}>
                  <Ionicons name={btn.icon as any} size={22} color={btn.active ? btn.color : TEXT2} />
                </Animated.View>
              </View>
              <Text style={[S.actionLabel, btn.active && { color: btn.color }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Row */}
        <View style={S.statsRow}>
          <StatsCard icon="musical-notes-outline" label="Genre" value={genre?.split('/')[0]?.trim() || 'Music'} iconColor={accent} />
          <View style={S.statsDivider} />
          <StatsCard icon="people-outline" label="Followers" value={followers || '10k'} iconColor={accent} />
          <View style={S.statsDivider} />
          <StatsCard icon="albums-outline" label="Albums" value={albums?.length.toString() || '5'} iconColor={accent} />
        </View>

        {/* About */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>About</Text>
            <View style={[S.sectionTitleLine, { backgroundColor: accent }]} />
          </View>
          <View style={S.bioCard}>
            <Text style={S.bioText}>{bio}</Text>
            <TouchableOpacity style={S.websiteRow} activeOpacity={0.7}>
              <View style={[S.websiteIconWrap, { backgroundColor: `${accent}18` }]}>
                <Ionicons name="link" size={12} color={accent} />
              </View>
              <Text style={[S.websiteText, { color: accent }]}>{website}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        {members && members.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Members</Text>
              <View style={[S.sectionTitleLine, { backgroundColor: accent }]} />
              <Text style={S.sectionMeta}>{members.length} artists</Text>
            </View>
            <View style={S.membersGrid}>
              {members.map((member, index) => (
                <MemberChip key={index} name={member} accent={accent} />
              ))}
            </View>
          </View>
        )}

        {/* Discography */}
        
        {/* Connect / Socials */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Connect</Text>
            <View style={[S.sectionTitleLine, { backgroundColor: accent }]} />
          </View>
          <View style={S.socialsRow}>
            {SOCIALS.map((s, i) => (
              <TouchableOpacity key={i} activeOpacity={0.8} style={S.socialBtn}>
                <View style={[S.socialIconWrap, { backgroundColor: `${s.bg}22` }]}>
                  <Ionicons name={s.icon} size={19} color={s.bg} />
                </View>
                <Text style={S.socialLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

// ── MAIN STYLES ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  videoWrap: { width, position: 'relative', backgroundColor: '#000' },
  videoTopBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  videoIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  videoCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  centerPlayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  videoBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 16 },
  liveInfoContainer: { marginBottom: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  liveDotPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: WHITE },
  liveTxt: { fontSize: 11, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  videoTitle: { fontSize: 18, fontWeight: '800', color: WHITE, marginBottom: 4 },
  videoSubtitle: { fontSize: 14, color: '#B3B3B3', fontWeight: '500' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  track: { height: 3, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2 },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2, backgroundColor: RED },
  timeTxt: { fontSize: 11, color: TEXT3, fontWeight: '500', marginTop: 3 },
  infoContainer: { paddingTop: 4 },
  identityStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  accentLine: { width: 3, height: 38, borderRadius: 2, marginRight: 14 },
  identityText: { flex: 1 },
  artistName: { fontSize: 22, fontWeight: '800', color: WHITE, letterSpacing: -0.3, marginBottom: 4 },
  genreTag: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  followerPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  followerCount: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, color: TEXT3, fontWeight: '500' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  statsCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statsIconRing: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statsValue: { fontSize: 15, fontWeight: '800', color: WHITE, marginBottom: 2 },
  statsLabel: { fontSize: 9, color: TEXT3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  statsDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.07)' },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: WHITE, letterSpacing: 0.2 },
  sectionTitleLine: { flex: 1, height: 1, opacity: 0.25 },
  sectionMeta: { fontSize: 11, color: TEXT3, fontWeight: '500' },
  seeAll: { fontSize: 12, fontWeight: '700' },
  bioCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  bioText: { fontSize: 14, color: '#A0A0B0', lineHeight: 22, marginBottom: 14 },
  websiteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  websiteIconWrap: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  websiteText: { fontSize: 13, fontWeight: '600' },
  membersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 30, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  memberDot: { width: 6, height: 6, borderRadius: 3 },
  memberName: { fontSize: 13, fontWeight: '600', color: WHITE },
  albumsList: { gap: 10 },
  albumCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 12 },
  albumArtwork: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  albumIndex: { position: 'absolute', bottom: 4, right: 5, fontSize: 9, fontWeight: '700' },
  albumInfo: { flex: 1 },
  albumTitle: { fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 5 },
  albumMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  albumYear: { fontSize: 11, color: TEXT3 },
  albumDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: TEXT3, opacity: 0.5 },
  albumType: { fontSize: 11, color: TEXT3 },
  albumSongs: { fontSize: 11, color: TEXT3 },
  albumPlayBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  socialsRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { alignItems: 'center', gap: 6 },
  socialIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  socialLabel: { fontSize: 10, color: TEXT3, fontWeight: '500' },
});

// ── FULLSCREEN STYLES ─────────────────────────────────────────────────────────
const FS = StyleSheet.create({
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, zIndex: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  artistInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  artistAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  artistName: { fontSize: 14, fontWeight: '700', color: WHITE },
  artistSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  viewerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  viewerTxt: { fontSize: 12, color: WHITE, fontWeight: '600' },
  commentsArea: { position: 'absolute', bottom: 100, left: 14, right: 14, gap: 12, zIndex: 10 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentBubble: { flex: 1 },
  commentName: { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 2 },
  commentText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },

  // Bottom bar: heart + input
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 32, paddingTop: 12,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 20,
  },
  heartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  commentInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    gap: 8,
  },
  commentTextInput: {
    flex: 1, fontSize: 14, color: WHITE, paddingVertical: 0,
  },
});