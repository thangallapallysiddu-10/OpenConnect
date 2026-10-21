import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // ── Root ─────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#1A0505',   // dark red-black — fills gap below orange section
  },

  // ── Top Section (light area) ─────────────────────────
  topSection: {
    backgroundColor: '#F5F0F0',    // very slight warm white
    paddingBottom: 0,
  },
  safeArea: {
    paddingHorizontal: 0,
  },

  // ── Header ───────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  // ── Artwork ───────────────────────────────────────────
  artworkContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  artworkWrapper: {
    width: 175,
    height: 175,
    borderRadius: 88,
    overflow: 'hidden',
    elevation: 10,
    boxShadow: '0 6px 12px rgba(139,0,0,0.3)',
    borderWidth: 3,
    borderColor: 'rgba(200,50,50,0.25)',
  },
  artworkGradient: {
    width: '100%',
    height: '100%',
  },
  artworkTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  artworkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── Episode Info ──────────────────────────────────────
  episodeInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 6,
    marginTop: 2,
  },
  episodeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A0505',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 22,
  },
  podcastName: {
    fontSize: 13,
    color: '#8B3A3A',
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Player Card ───────────────────────────────────────
  playerCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  marginHorizontal: 16,
  marginBottom: 50,
  marginTop: 8,       // ✅ was 30, reduce to 8
  paddingHorizontal: 16,
  paddingVertical: 14,
  elevation: 6,
  boxShadow: '0 6px 12px rgba(139,0,0,0.3)',
  borderWidth: 1,
  borderColor: 'rgba(200,50,50,0.08)',
},
  // ── Waveform ──────────────────────────────────────────
  waveformContainer: {
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },

  // ── Controls ──────────────────────────────────────────
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 4,
  },
  controlButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(204,0,0,0.4)',
    elevation: 8,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Bottom Section (replaces yellow with deep crimson) ─
  bottomSection: {
  flex: 1,
  backgroundColor: '#1A0505',
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 30,
  marginTop: 0,        // ✅ remove any marginTop
  borderTopWidth: 1,
  borderColor: 'rgba(220,60,60,0.3)',
},
  handleBarContainer: {
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  otherEpisodesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  episodesList: {
    flex: 1,
  },

  // ── Episode Items ─────────────────────────────────────
  episodeItem: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(220,60,60,0.15)',
  },
  episodeThumbnail: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#2A0808',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  episodeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  episodeDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 7,
    lineHeight: 15,
  },
  episodeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playPillButton: {
    backgroundColor: '#CC2222',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  playPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  episodeDuration: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },
});