/**
 * Root Layout
 * Handles initial routing based on onboarding completion state
 * 
 * Flow:
 * 1. Initialize local user and subscription service
 * 2. Check if user has completed onboarding
 * 3. If not, redirect to onboarding flow (hard paywall)
 * 4. If yes, show main app with tabs
 */

import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscriptionService } from './services/subscriptionService';
import { storage } from './services/storage';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { OfflineOverlay } from './components/OfflineOverlay';
import { getInitialDeepLink, setupDeepLinkListener, handleDeepLink } from './utils/deepLinking';
import { COLORS } from './constants';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const networkStatus = useNetworkStatus();
  const [showOfflineOverlay, setShowOfflineOverlay] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const { hasCompletedOnboarding } = useOnboardingStore();

  // Initialize app services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const store = useAuthStore.getState();
        store.initializeLocalUser();
        const user = store.getOrCreateUser();
        
        await subscriptionService.initialize();
        await subscriptionService.setUserId(user.id);
        
        // Run storage cleanup on app startup (non-blocking)
        storage.runCleanup().catch(console.error);
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Small delay to allow store hydration
        setTimeout(() => setIsReady(true), 100);
      }
    };

    initializeApp();
  }, []);

  // Handle onboarding routing
  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === '(onboarding)';
    
    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't completed onboarding, redirect to onboarding
      router.replace('/(onboarding)');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // User has completed onboarding but is in onboarding flow, redirect to main
      router.replace('/(tabs)');
    }
  }, [isReady, hasCompletedOnboarding, segments]);

  // Handle deep links
  useEffect(() => {
    if (!isReady) return;
    
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
  }, [router, isReady]);

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

  // Show loading spinner while initializing
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <OfflineOverlay isVisible={showOfflineOverlay} onRetry={handleRetry} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
  },
});
