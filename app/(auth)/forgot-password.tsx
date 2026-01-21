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
import { validateEmail } from '../utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.xl }]} 
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            
            <Text style={styles.instructions}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </Text>

            <Button
              title="Back to Sign In"
              onPress={() => router.replace('/(auth)/sign-in')}
              style={styles.button}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error || undefined}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color={colors.white} />
            </View>
          ) : (
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              style={styles.button}
            />
          )}

          <Text style={styles.link} onPress={() => router.back()}>
            ← Back to Sign In
          </Text>
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.xxl,
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
    marginBottom: SPACING.xl * 2,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    alignSelf: 'center',
  },
  successIconText: {
    fontSize: 40,
    color: colors.accentSuccess,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
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
    marginBottom: SPACING.xl,
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
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
});
