import { Dimensions, StyleSheet } from 'react-native';
import { spacing } from '../../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  carouselContent: {
    paddingHorizontal: spacing.md,
  },
  cardWrapper: {
    width: SCREEN_WIDTH - 48,
    marginRight: spacing.md,
  },
  // Dot indicators
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#7C3AED',
  },
});