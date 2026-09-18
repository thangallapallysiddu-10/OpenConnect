import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError } from '../../services/api';
import { login, register } from '../../services/auth.service';
import { useTheme } from '../../context/ThemeContext';

type ValidationDetails = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

const fieldLabelMap: Record<string, string> = {
  displayName: 'Display Name',
  email: 'Email',
  password: 'Password',
  platform: 'Platform',
  pushToken: 'Push Token',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignUpForm(name: string, email: string, password: string, confirmPassword: string): string | null {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    return 'Display Name is required.';
  }

  if (!trimmedEmail) {
    return 'Email is required.';
  }

  if (!emailPattern.test(trimmedEmail)) {
    return 'Invalid email address.';
  }

  if (!password) {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Password must contain at least 8 characters.';
  }

  if (password.length > 128) {
    return 'Password must be 128 characters or less.';
  }

  if (!confirmPassword) {
    return 'Confirm Password is required.';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}

function formatValidationDetails(details: unknown): string | null {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const typedDetails = details as ValidationDetails;
  const messages: string[] = [];

  if (Array.isArray(typedDetails.formErrors)) {
    messages.push(...typedDetails.formErrors.filter((message): message is string => typeof message === 'string' && message.trim().length > 0));
  }

  if (typedDetails.fieldErrors && typeof typedDetails.fieldErrors === 'object') {
    for (const [field, errors] of Object.entries(typedDetails.fieldErrors)) {
      if (!Array.isArray(errors)) {
        continue;
      }

      const label = fieldLabelMap[field] ?? field;
      for (const error of errors) {
        if (typeof error === 'string' && error.trim().length > 0) {
          messages.push(`${label}: ${error}`);
        }
      }
    }
  }

  return messages.length > 0 ? messages.join('\n') : null;
}

export const AuthModal = () => {
  const { showModal, hideAuthModal, setAuthSession, loading, setLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In Fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up Fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success' | ''>('');

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      
      // Reset state after close
      setTimeout(() => setMode('signin'), 200);
      setFeedbackMessage('');
      setFeedbackTone('');
    }
  }, [showModal]);

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      setFeedbackTone('error');
      setFeedbackMessage('Please enter email and password.');
      return;
    }

    setLoading(true);
    setFeedbackMessage('');
    setFeedbackTone('');

    try {
      const session = await login({
        email: signInEmail.trim(),
        password: signInPassword,
        platform: Platform.OS,
      });

      setAuthSession({
        user: {
          name: session.user.displayName || session.user.email,
          email: session.user.email,
          role: session.user.role,
          status: session.user.status,
        },
        accessToken: session.tokens.accessToken,
        refreshToken: session.tokens.refreshToken,
      });
      setSignInPassword('');
      hideAuthModal();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setFeedbackTone('error');
        setFeedbackMessage('No account exists with these credentials.\n\nPlease create an account first.');
      } else {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to log in. Please try again.';
        setFeedbackTone('error');
        setFeedbackMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const validationMessage = validateSignUpForm(signUpName, signUpEmail, signUpPassword, signUpConfirm);
    if (validationMessage) {
      setFeedbackTone('error');
      setFeedbackMessage(validationMessage);
      return;
    }

    setLoading(true);
    setFeedbackMessage('');
    setFeedbackTone('');

    try {
      await register({
        displayName: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        platform: 'web',
      });

      setSignInEmail(signUpEmail.trim());
      setSignInPassword('');
      setSignUpPassword('');
      setSignUpConfirm('');
      setSignUpName('');
      setSignUpEmail('');
      setMode('signin');
      setFeedbackTone('success');
      setFeedbackMessage('Account created successfully.');
    } catch (error) {
      const validationMessage = error instanceof ApiRequestError ? formatValidationDetails(error.details) : null;
      const message =
        validationMessage ||
        (error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to register. Please try again.');
      setFeedbackTone('error');
      setFeedbackMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const isMobile = windowWidth < 600;

  return (
    <Modal transparent animationType="none" visible={showModal} onRequestClose={hideAuthModal}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={hideAuthModal}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.7)' }]} />
      </TouchableOpacity>

      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalBox,
            {
              width: isMobile ? '90%' : 420,
              backgroundColor: isDark ? '#14141A' : '#FFFFFF',
              borderColor: colors.border,
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
            <TouchableOpacity onPress={hideAuthModal} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {mode === 'signin' ? (
            <View style={styles.body}>
              {!!feedbackMessage && (
                <Text style={[styles.feedbackText, { color: feedbackTone === 'success' ? '#34D399' : '#F87171' }]}>
                  {feedbackMessage}
                </Text>
              )}
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={signInEmail}
                onChangeText={setSignInEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={signInPassword}
                onChangeText={setSignInPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#8B5CF6', opacity: loading ? 0.7 : 1 }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8B5CF6', marginTop: 12 }]} onPress={hideAuthModal}>
                <Text style={[styles.primaryBtnText, { color: '#8B5CF6' }]}>Listen for Free</Text>
              </TouchableOpacity>

              <View style={styles.dividerBox}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity style={[styles.googleBtn, { borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#FFFFFF' }]} onPress={() => {
                Alert.alert('Google login unavailable', 'Google authentication will be connected in Phase 8.');
              }}>
                <Ionicons name="logo-google" size={20} color={isDark ? '#FFF' : '#333'} />
                <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={{ color: colors.textMuted }}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={() => setMode('signup')}>
                  <Text style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.body}>
              {!!feedbackMessage && (
                <Text style={[styles.feedbackText, { color: feedbackTone === 'success' ? '#34D399' : '#F87171' }]}>
                  {feedbackMessage}
                </Text>
              )}
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Name"
                placeholderTextColor={colors.textMuted}
                value={signUpName}
                onChangeText={setSignUpName}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={signUpEmail}
                onChangeText={setSignUpEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={signUpPassword}
                onChangeText={setSignUpPassword}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1C1C24' : '#F9F9F9' }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textMuted}
                value={signUpConfirm}
                onChangeText={setSignUpConfirm}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#8B5CF6', opacity: loading ? 0.7 : 1 }]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setMode('signin')}>
                  <Text style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  modalBox: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    gap: 16,
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
