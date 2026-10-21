import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, spacing } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

export const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 160,
    borderRadius: 20,
    marginRight: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: colors.overlayLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  bookmarkButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.overlayLight,
  },
});