import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, spacing } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const cardWidth = width - spacing.md * 2;

export const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginHorizontal: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.overlayLight,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  imageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  stationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  listenersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  listenersText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  songInfo: {
    marginBottom: spacing.sm,
  },
  songTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  artistName: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  progressContainer: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.overlayLight,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  // Wrapper for animated width — the gradient fills 100% of this
  progressFillWrapper: {
  height: 3,
  borderRadius: 1.5,
  overflow: 'hidden',
},
progressFill: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  controls: {
  flexDirection: 'row',
  justifyContent: 'center',  // change from space-between to center
  alignItems: 'center',
  marginTop: spacing.xs,
  gap: spacing.md,  // add gap for even spacing
},
  controlButton: {
    padding: spacing.xs,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    
  },
  playButtonGradient: {
  width: 44,   // explicit size instead of '100%'
  height: 44,
  borderRadius: 22,
  justifyContent: 'center',
  alignItems: 'center',
},
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 2,
  },
  seekText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});