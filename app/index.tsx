/**
 * Index Route - Entry Point
 * 
 * This redirects users based on onboarding status:
 * - Not completed onboarding -> Onboarding flow
 * - Completed onboarding -> Main app (tabs)
 */

import { Redirect } from 'expo-router';
import { useOnboardingStore } from './store/onboardingStore';
import { ROUTES } from './constants/routes';

export default function Index() {
  const { hasCompletedOnboarding } = useOnboardingStore();

  if (!hasCompletedOnboarding) {
    return <Redirect href={ROUTES.ONBOARDING.ROOT} />;
  }

  return <Redirect href={ROUTES.TABS.ROOT} />;
}
