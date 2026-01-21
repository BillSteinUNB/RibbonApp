import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONTS, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import type { AuthCredentials } from '../types/user';
import { useAuthStore } from '../store/authStore';
import { validateEmail } from '../utils/validation';
import { formatErrorMessage } from '../utils/errorMessages';
import { errorLogger } from '../services/errorLogger';
import { trackEvent } from '../utils/analytics';
import { rateLimitService } from '../services/rateLimitService';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const setUser = useAuthStore(state => state.setUser);
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);
  const setLoading = useAuthStore(state => state.setLoading);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthCredentials, string>>>({});
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLocked: boolean;
    remainingSeconds: number;
    remainingAttempts: number;
  }>({ isLocked: false, remainingSeconds: 0, remainingAttempts: 5 });

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (rateLimitInfo.remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRateLimitInfo(prev => {
        const newSeconds = prev.remainingSeconds - 1;
        if (newSeconds <= 0) {
          return { ...prev, isLocked: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitInfo.remainingSeconds]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AuthCredentials, string>> = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    const rateLimitCheck = await rateLimitService.checkRateLimit(formData.email);
    if (!rateLimitCheck.allowed) {
      setRateLimitInfo({
        isLocked: true,
        remainingSeconds: rateLimitCheck.remainingSeconds,
        remainingAttempts: 0,
      });
      setErrors({
        email: `Too many failed attempts. Please try again in ${rateLimitService.formatRemainingTime(rateLimitCheck.remainingSeconds)}.`,
      });
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setErrors({});

    try {
      const result = await authService.signIn(formData.email, formData.password);
      if (result.user) {
        setUser({
          id: result.user.id,
          email: result.user.email || formData.email,
          createdAt: result.user.created_at || new Date().toISOString(),
          trialUsesRemaining: 5,
          isPremium: false,
        });
        setAuthenticated(true);
      }
      await rateLimitService.recordAttempt(formData.email, true);
      trackEvent('auth_sign_in', { method: 'email' });
      router.replace('/');
    } catch (error) {
      const result = await rateLimitService.recordAttempt(formData.email, false);

      if (!result.allowed) {
        setRateLimitInfo({
          isLocked: true,
          remainingSeconds: result.remainingSeconds,
          remainingAttempts: 0,
        });
        setErrors({
          email: `Too many failed attempts. Please try again in ${rateLimitService.formatRemainingTime(result.remainingSeconds)}.`,
        });
      } else {
        setRateLimitInfo(prev => ({
          ...prev,
          remainingAttempts: result.remainingAttempts,
        }));
        setErrors({
          email: formatErrorMessage(error),
        });
      }
      errorLogger.log(error, { context: 'signIn' });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue finding perfect gifts
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="••••••••"
                secureTextEntry={true}
                error={errors.password}
              />
            </View>

            <View style={styles.forgotPasswordContainer}>
              <Text
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                Forgot Password?
              </Text>
            </View>

            {rateLimitInfo.isLocked && rateLimitInfo.remainingSeconds > 0 && (
              <View style={styles.rateLimitWarning}>
                <Text style={styles.rateLimitText}>
                  Account temporarily locked. Try again in {rateLimitService.formatRemainingTime(rateLimitInfo.remainingSeconds)}
                </Text>
              </View>
            )}

            <Button
              title={rateLimitInfo.isLocked ? `Locked (${rateLimitService.formatRemainingTime(rateLimitInfo.remainingSeconds)})` : 'Sign In'}
              onPress={handleSignIn}
              disabled={isLoading || rateLimitInfo.isLocked}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
              </Text>
              <Text
                style={styles.link}
                onPress={() => router.push('/(auth)/sign-up')}
              >
                Sign Up
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    fontFamily: FONTS.body,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.accentPrimary,
    fontFamily: FONTS.body,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
    fontFamily: FONTS.body,
  },
  rateLimitWarning: {
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rateLimitText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: FONTS.body,
    textAlign: 'center',
  },
});
