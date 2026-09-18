import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const TRENDING_CARD_WIDTH = width * 0.82;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0000' },
  backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safeArea: { flex: 1, zIndex: 5 },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4 },
  headerRight: { width: 42, height: 42 },
  scrollContent: { paddingTop: 8, paddingBottom: 120 },

  // ── Selector Buttons ─────────────────────────────────
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 20, 20, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220, 80, 80, 0.45)',
    minWidth: 0,
  },
  selectorIcon: { marginRight: 8, flexShrink: 0 },
  selectorText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },

  // ── Modals ───────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1A0505', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: height * 0.7, borderTopWidth: 1, borderColor: 'rgba(220,80,80,0.2)',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(220,80,80,0.15)',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemIcon: { marginRight: 12 },
  modalItemText: { flex: 1, fontSize: 15, color: '#E8E8E8', fontWeight: '400' },

  // ── Empty States ─────────────────────────────────────
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, gap: 12 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  emptySubtext: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },

  // ── Podcast List ─────────────────────────────────────
  podcastsContainer: { marginBottom: 20, paddingHorizontal: 16 },
  resultsTitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: 0.3 },
  podcastItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 14,
  padding: 12,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: 'rgba(220,80,80,0.18)',
},
  rankNumber: { width: 28, fontSize: 15, fontWeight: '700', color: '#E05555', textAlign: 'center', marginRight: 4 },
  podcastImage: { width: 52, height: 52, borderRadius: 10, marginRight: 12 },
  podcastInfo: { flex: 1 },
  podcastTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 3 },
  podcastCreator: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '400' },
  playButton: { padding: 6 },

  // ── Mic FAB ──────────────────────────────────────────
  micButton: {
    position: 'absolute', bottom: 32, right: 24,
    width: 58, height: 58, borderRadius: 29, overflow: 'hidden',
    boxShadow: '0 6px 10px rgba(204,0,0,0.45)',
  },
  micButtonGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  // ── Section Header Row ───────────────────────────────
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  sectionArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ════════════════════════════════════════════════════
  // ── Trending — Spotify-style card ───────────────────
  // ════════════════════════════════════════════════════
  trendingSection: { marginBottom: 28 },
  trendingScrollContent: { paddingHorizontal: 16, gap: 14 },
  trendingCard: {
    width: TRENDING_CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#1C0505',
    borderWidth: 1,
    borderColor: 'rgba(180,30,30,0.35)',
    overflow: 'hidden',
  },
  trendingHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 10, backgroundColor: '#1C0505',
  },
  trendingThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#2A0808' },
  trendingHeaderText: { flex: 1 },
  trendingTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 4, lineHeight: 19 },
  trendingCreatorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trendingCreatorText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  trendingImage: { width: '100%', height: TRENDING_CARD_WIDTH * 0.56, backgroundColor: '#2A0808' },
  trendingMeta: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4, backgroundColor: '#1C0505' },
  trendingMetaLine: { fontSize: 12, color: '#E05555', fontWeight: '600', marginBottom: 4 },
  trendingDescription: { fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 18 },
  trendingActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#1C0505',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', marginTop: 10,
  },
  trendingPreviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  trendingPreviewText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  trendingActionIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  trendingPlayCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  trendingInfo: { padding: 12 },
  trendingEpisodes: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // ════════════════════════════════════════════════════
  // ── Genres ───────────────────────────────────────────
  // ════════════════════════════════════════════════════
  genresSection: { marginBottom: 28 },
  genresScrollContent: { paddingHorizontal: 16, gap: 10 },
  genreCard: {
    width: 105, paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: 14, backgroundColor: 'rgba(180,20,20,0.15)',
    borderWidth: 1, borderColor: 'rgba(220,80,80,0.2)',
    alignItems: 'center', gap: 8,
  },
  genreIconWrapper: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(220,60,60,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  genreName: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  genreCount: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },

  // ════════════════════════════════════════════════════
  // ── Continue Listening — FIXED ───────────────────────
  // ════════════════════════════════════════════════════
  continueSection: { marginBottom: 20, paddingHorizontal: 16 },

  continueCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(220,80,80,0.15)',
  minHeight: 88,
},

continueImage: {
  width: 64,
  height: 64,
  borderRadius: 10,
  backgroundColor: '#2A0808',
  flexShrink: 0,
},

continueInfo: {
  flex: 1,
  marginLeft: 12,
  marginRight: 8,
  justifyContent: 'center',
},

continueTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#FFFFFF',
  marginBottom: 3,
  lineHeight: 18,
},

continueSubtitle: {
  fontSize: 11,
  color: 'rgba(255,255,255,0.45)',
  marginBottom: 8,
  lineHeight: 15,
},

continueProgressBar: {
  height: 3,
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: 5,
},

continueProgressFill: {
  height: '100%',
  backgroundColor: '#CC2222',
  borderRadius: 2,
},

continueTimeText: {
  fontSize: 10,
  color: 'rgba(255,255,255,0.35)',
},

continuePlayBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(204,34,34,0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(220,80,80,0.35)',
  flexShrink: 0,
},
});