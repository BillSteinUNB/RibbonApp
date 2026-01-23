import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscriptionService } from './services/subscriptionService';
import { storage } from './services/storage';
import { useAuthStore } from './store/authStore';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { OfflineOverlay } from './components/OfflineOverlay';
import { useRouter } from 'expo-router';
import { getInitialDeepLink, setupDeepLinkListener, handleDeepLink } from './utils/deepLinking';

export default function RootLayout() {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const [showOfflineOverlay, setShowOfflineOverlay] = useState(false);

  useEffect(() => {
    const store = useAuthStore.getState();
    store.initializeLocalUser();
    const user = store.getOrCreateUser();
    subscriptionService
      .initialize()
      .then(() => subscriptionService.setUserId(user.id))
      .catch(console.error);

    // Run storage cleanup on app startup (non-blocking)
    storage.runCleanup().catch(console.error);

  }, []);

  // Handle deep links
  useEffect(() => {
    const navigate = (route: string) => router.push(route as any);

    // Check if app was launched with a deep link
    getInitialDeepLink().then((url) => {
      if (url) {
        // Delay handling to ensure navigation is ready
        setTimeout(() => handleDeepLink(url, navigate), 500);
      }
    });

    // Listen for deep links while app is running
    const unsubscribe = setupDeepLinkListener((url) => {
      handleDeepLink(url, navigate);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  // Update offline overlay visibility based on network status
  useEffect(() => {
    // Only show overlay after initial check is complete
    if (networkStatus.lastChecked !== null) {
      setShowOfflineOverlay(!networkStatus.isConnected);
    }
  }, [networkStatus.isConnected, networkStatus.lastChecked]);

  const handleRetry = useCallback(() => {
    if (networkStatus.isConnected) {
      setShowOfflineOverlay(false);
    }
  }, [networkStatus.isConnected]);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
        <OfflineOverlay isVisible={showOfflineOverlay} onRetry={handleRetry} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
