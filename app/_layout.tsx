// CRITICAL: Import Sentry FIRST - it has try-catch protection
import './sentry';
import { Sentry } from './sentry';

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Wrap entire app in error boundary
function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple initialization - no external services
    const init = async () => {
      try {
        console.log('[Layout] Starting initialization...');
        
        // Test Sentry is working
        Sentry.addBreadcrumb({
          category: 'app',
          message: 'App initialization started',
          level: 'info',
        });

        // Delay to allow native modules to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try to load auth store (common crash point)
        try {
          console.log('[Layout] Loading auth store...');
          const authModule = await import('./store/authStore');
          console.log('[Layout] Auth store loaded successfully');
        } catch (authError) {
          console.error('[Layout] Auth store failed:', authError);
          Sentry.captureException(authError);
          // Continue anyway
        }

        // Try to load RevenueCat (another common crash point)  
        try {
          console.log('[Layout] Loading RevenueCat...');
          const rcModule = await import('./services/revenueCatService');
          console.log('[Layout] RevenueCat module loaded');
          
          // Don't initialize RevenueCat yet - just load the module
        } catch (rcError) {
          console.error('[Layout] RevenueCat failed:', rcError);
          Sentry.captureException(rcError);
          // Continue anyway
        }

        console.log('[Layout] Initialization complete');
        setIsReady(true);
      } catch (err) {
        console.error('[Layout] Fatal error:', err);
        Sentry.captureException(err);
        setError(err instanceof Error ? err.message : String(err));
        setIsReady(true); // Show error screen
      }
    };

    init();
  }, []);

  // Loading screen
  if (!isReady) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Error screen
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Error</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  // Main app
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="recipients/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recipients/[id]" />
        <Stack.Screen name="recipients/[id]/ideas" />
        <Stack.Screen name="recipients/[id]/edit" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Sentry.wrap(RootLayout);
