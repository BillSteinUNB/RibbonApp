/**
 * Onboarding Layout
 * Container for the onboarding flow screens
 */

import { Stack } from 'expo-router';
import { COLORS } from '../constants';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bgPrimary },
        animation: 'slide_from_right',
      }}
    >
      {/* Initial onboarding flow */}
      <Stack.Screen name="index" />
      <Stack.Screen name="value" />
      <Stack.Screen name="how-it-works" />
      <Stack.Screen name="social-proof" />
      <Stack.Screen name="paywall" />
      
      {/* Quick Start flow (after paywall) */}
      <Stack.Screen name="quick-start" />
      <Stack.Screen name="quick-recipient" />
      <Stack.Screen name="quick-generating" />
      <Stack.Screen name="quick-success" />
    </Stack>
  );
}
