import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscriptionService } from './services/subscriptionService';
import { useAuthStore } from './store/authStore';

export default function RootLayout() {
  useEffect(() => {
    const store = useAuthStore.getState();
    store.initializeLocalUser();
    const user = store.getOrCreateUser();
    subscriptionService
      .initialize()
      .then(() => subscriptionService.setUserId(user.id))
      .catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
