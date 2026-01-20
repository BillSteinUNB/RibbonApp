import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SPACING, FONTS } from '../constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    setIsLoading(true);
    setTimeout(() => {
      Alert.alert('Check Your Email', 'We sent a password reset link to your email address.');
      router.back();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Button
        title="Send Reset Link"
        onPress={handleResetPassword}
        disabled={isLoading}
        style={styles.button}
      />

      <Text style={styles.link} onPress={() => router.back()}>
        ← Back to Sign In
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.xxl,
    paddingTop: 80,
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
    marginBottom: SPACING.xl * 2,
    fontFamily: FONTS.body,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
});
