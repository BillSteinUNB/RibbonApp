import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SPACING, FONTS } from '../constants';

export default function SignUpScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignUp = async () => {
    setIsLoading(true);
    setTimeout(() => {
      router.replace('/onboarding');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join Ribbon to start finding perfect gifts
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          placeholder="••••••••"
          secureTextEntry
        />

        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          placeholder="••••••••"
          secureTextEntry
        />
      </View>

      <Button
        title="Create Account"
        onPress={handleSignUp}
        disabled={isLoading}
        style={styles.button}
      />

      <Text style={styles.link} onPress={() => router.push('/(auth)/sign-in')}>
        Already have an account? Sign In
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
