import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import type { AuthCredentials } from '../types/user';
import { validateEmail, validateRequired } from '../utils/validation';
import { formatErrorMessage } from '../utils/errorMessages';
import { errorLogger } from '../services/errorLogger';
import { trackEvent } from '../utils/analytics';
import { rateLimitService } from '../services/rateLimitService';

export default function SignInScreen() {
  const router = useRouter();
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

  // Countdown timer for rate limit lockout
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

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }
    }

    // Validate password
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

    // Check rate limit before attempting
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
    setErrors({});

    try {
      // authService.initialize() is not needed with Supabase
      const { user } = await authService.signIn(formData.email, formData.password);

      // Record successful attempt (clears rate limit)
      await rateLimitService.recordAttempt(formData.email, true);

      // Load trial data for the user
      // await trialService.loadUsageData(user.id);

      trackEvent('auth_sign_in', { method: 'email' });

      // Navigate to main app
      router.replace('/');
    } catch (error) {
      // Record failed attempt
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
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Sign In',
        headerShown: false,
      }} />
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue finding perfect gifts
              </Text>
            </View>

            {/* Form */}
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

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <Text 
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                Forgot Password?
              </Text>
            </View>

            {/* Rate Limit Warning */}
            {rateLimitInfo.isLocked && rateLimitInfo.remainingSeconds > 0 && (
              <View style={styles.rateLimitWarning}>
                <Text style={styles.rateLimitText}>
                  Account temporarily locked. Try again in {rateLimitService.formatRemainingTime(rateLimitInfo.remainingSeconds)}
                </Text>
              </View>
            )}

            {/* Sign In Button */}
            <Button
              title={rateLimitInfo.isLocked ? `Locked (${rateLimitService.formatRemainingTime(rateLimitInfo.remainingSeconds)})` : 'Sign In'}
              onPress={handleSignIn}
              disabled={isLoading || rateLimitInfo.isLocked}
              style={styles.button}
            />

            {/* Sign Up Link */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    color: COLORS.accentPrimary,
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
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
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
