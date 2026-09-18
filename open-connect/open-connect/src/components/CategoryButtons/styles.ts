import { StyleSheet } from 'react-native';
import { fontSizes, spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    marginTop: 10,
  },

  // ── Inactive button ──
  buttonContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.4)',
  },

  // ── Active button — glowing purple border ──
  buttonContainerActive: {
    borderColor: 'rgba(124,58,237,0.95)',
    boxShadow: '0px 0px 16px rgba(124,58,237,0.7)',
    elevation: 8,
  },

  // ── BlurView inactive ──
  blurWrapper: {
    flex: 1,
    backgroundColor: 'rgba(124,58,237,0.1)',
  },

  // ── BlurView active — stronger purple tint ──
  blurWrapperActive: {
    backgroundColor: 'rgba(124,58,237,0.35)',
  },

  button: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // ── Inactive text ──
  buttonText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: fontSizes.sm,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ── Active text — bright white ──
  buttonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});