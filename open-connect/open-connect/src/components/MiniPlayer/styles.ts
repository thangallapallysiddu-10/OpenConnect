import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 70,
  borderTopWidth: 1,
  borderTopColor: 'rgba(191, 123, 63, 0.3)',
  overflow: 'hidden',
  backgroundColor: '#0a0a0a', // change this — was 'rgba(10, 10, 10, 0.95)'
},
  blurContainer: {
  flex: 1,
  backgroundColor: '#0a0a0a', // add this
},
  progressBarTrack: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 2,
},
progressBarFill: {
  height: 2,
},
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textInfo: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  artist: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  controlButton: {
    padding: spacing.xs,
  },
  playButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  playButtonGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    boxShadow: `0px 0px 20px ${colors.primary}`,  
    elevation: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(191, 123, 63, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(191, 123, 63, 0.3)',
  },
  seekText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
    fontWeight: '500',
  },
});