import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscriptionService } from './services/subscriptionService';

export default function RootLayout() {
  useEffect(() => {
    subscriptionService.initialize().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
