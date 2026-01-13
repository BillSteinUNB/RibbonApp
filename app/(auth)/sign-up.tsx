import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import type { RegistrationData } from '../types/user';
import { validateEmail, composeValidators, validateRequired } from '../utils/validation';
import { formatErrorMessage } from '../utils/errorMessages';
import { errorLogger } from '../services/errorLogger';
import { trackEvent } from '../utils/analytics';

export default function SignUpScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }
    }

    // Validate name (optional but if provided, must be valid)
    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name?.length === 1) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // authService.initialize() is not needed with Supabase
      const { user } = await authService.signUp(formData.email, formData.password);
      
      // Initialize trial data for the new user
      // await trialService.loadUsageData(user.id);
      
      trackEvent('auth_sign_up', { method: 'email' });
      
      // Navigate to onboarding or main app
      router.replace('/onboarding');
    } catch (error) {
      setErrors({
        email: formatErrorMessage(error),
      });
      errorLogger.log(error, { context: 'signUp' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Sign Up',
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
              <Text style={styles.title}>Welcome to Ribbon</Text>
              <Text style={styles.subtitle}>
                Create an account to start finding perfect gifts
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Full Name (Optional)"
                value={formData.name || ''}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Doe"
                autoCapitalize="words"
                error={errors.name}
              />

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

            {/* Sign Up Button */}
            <Button
              title="Create Account"
              onPress={handleSignUp}
              disabled={isLoading}
              style={styles.button}
            />

            {/* Sign In Link */}
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
});
