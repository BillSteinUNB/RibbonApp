import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';
import { formatErrorMessage } from '../utils/errorMessages';
import { errorLogger } from '../services/errorLogger';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const validateForm = (): boolean => {
    if (!email || !email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email');
      return false;
    }

    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // authService.initialize() is not needed with Supabase
      await authService.resetPassword(email);
      
      Alert.alert(
        'Check Your Email',
        'We sent a password reset link to your email address.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setError(formatErrorMessage(error));
      errorLogger.log(error, { context: 'forgotPassword' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Forgot Password',
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
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={error}
              />
            </View>

            {/* Submit Button */}
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              disabled={isLoading}
              style={styles.button}
            />

            {/* Back to Sign In */}
            <View style={styles.footer}>
              <Text 
                style={styles.link}
                onPress={() => router.back()}
              >
                ← Back to Sign In
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
    marginBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
});
