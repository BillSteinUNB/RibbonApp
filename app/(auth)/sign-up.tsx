import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SPACING, FONTS, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validation';
import { useAuthStore } from '../store/authStore';
import type { User } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const setUser = useAuthStore(state => state.setUser);
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);
  const setLoading = useAuthStore(state => state.setLoading);
  const setHasCompletedOnboarding = useUIStore(state => state.setHasCompletedOnboarding);
  const isLoadingStore = useAuthStore(state => state.isLoading);

  const [isLoading, setIsLoadingLocal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Invalid email';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error || 'Password does not meet requirements';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    setGeneralError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoadingLocal(true);
    setLoading(true);
    setGeneralError(null);

    try {
      const result = await authService.signUp(formData.email, formData.password);
      
      if (result.user) {
        const user: User = {
          id: result.user.id,
          email: result.user.email!,
          createdAt: new Date().toISOString(),
          trialUsesRemaining: 5,
          isPremium: false,
        };
        setUser(user);
        setAuthenticated(true);
        setHasCompletedOnboarding(false);
        router.replace('/onboarding');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
      setGeneralError(message);
    } finally {
      setIsLoadingLocal(false);
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Ribbon to start finding perfect gifts
              </Text>
            </View>

            {generalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            )}

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
                placeholder="Min. 12 chars with upper, lower, number, special"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="••••••••"
                secureTextEntry
                error={errors.confirmPassword}
              />
            </View>

            {isLoading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <Button
                title="Create Account"
                onPress={handleSignUp}
                style={styles.button}
              />
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
              </Text>
              <Text
                style={styles.link}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Sign In
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
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: FONTS.body,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  loadingButton: {
    height: 56,
    backgroundColor: colors.accentPrimary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
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
});
