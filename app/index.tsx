import { Redirect } from 'expo-router';
import { useUIStore, selectHasCompletedOnboarding } from './store/uiStore';
import { ROUTES } from './constants/routes';

export default function Index() {
  const hasCompletedOnboarding = useUIStore(selectHasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href={ROUTES.ONBOARDING} />;
  }

  return <Redirect href={ROUTES.TABS.ROOT} />;
}
