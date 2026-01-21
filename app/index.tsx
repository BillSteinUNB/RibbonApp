import { Redirect } from 'expo-router';
import { useUIStore, selectHasCompletedOnboarding } from './store/uiStore';

export default function Index() {
  const hasCompletedOnboarding = useUIStore(selectHasCompletedOnboarding);
  
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  
  return <Redirect href="/(tabs)" />;
}
