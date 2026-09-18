import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, spacing } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.28;

export const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginRight: spacing.md,
  },
  imageContainer: {
    width: cardWidth,
    height: cardWidth,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    position: 'relative',
    borderWidth: 0.5,
    borderColor: colors.overlayLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: cardWidth * 0.4,
  },
  // Play overlay now covers the full card, fades in on press
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playOverlayBlur: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  artist: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
});