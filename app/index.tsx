/**
 * Index Route - Entry Point
 * 
 * This redirects users based on onboarding status:
 * - Not completed onboarding -> Onboarding flow
 * - Completed onboarding -> Main app (tabs)
 */

import { Redirect } from 'expo-router';
import { useOnboardingStore } from './store/onboardingStore';

export default function Index() {
  const { hasCompletedOnboarding } = useOnboardingStore();

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
