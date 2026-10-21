import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  accentLine: {
    width: 3,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    flex: 1,
  },
  seeAll: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});