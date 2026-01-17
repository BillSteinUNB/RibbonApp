/**
 * Root Layout - Safe Boot Implementation
 * 
 * CRITICAL: This file must NOT import any native modules at the top level.
 * All native module initialization is deferred to useEffect to prevent
 * crashes at JavaScript bundle load time.
 * 
 * Safe imports only:
 * - React and React Native core components
 * - expo-router (Slot)
 * - react-native-safe-area-context
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type InitState = 'loading' | 'ready' | 'error';

interface InitError {
  stage: string;
  message: string;
}

function RootLayout() {
  const [initState, setInitState] = useState<InitState>('loading');
  const [error, setError] = useState<InitError | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        // Stage 1: Initialize Sentry (optional - won't block if it fails)
        try {
          const { initSentry } = await import('./sentry');
          initSentry();
        } catch (e) {
          console.warn('[RootLayout] Sentry init skipped:', e);
        }

        // Stage 2: Initialize RevenueCat (optional - won't block if it fails)
        try {
          const { initializeRevenueCat } = await import('./services/revenueCatService');
          await initializeRevenueCat();
        } catch (e) {
          console.warn('[RootLayout] RevenueCat init skipped:', e);
        }

        // Stage 3: Cleanup any failed logout state
        try {
          const { useAuthStore } = await import('./store/authStore');
          const cleanupFailedLogout = useAuthStore.getState().cleanupFailedLogout;
          await cleanupFailedLogout();
        } catch (e) {
          console.warn('[RootLayout] Auth cleanup skipped:', e);
        }

        if (isMounted) {
          setInitState('ready');
        }
      } catch (e) {
        console.error('[RootLayout] Initialization failed:', e);
        if (isMounted) {
          setError({
            stage: 'initialization',
            message: e instanceof Error ? e.message : String(e),
          });
          setInitState('error');
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  if (initState === 'error' && error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Startup Error</Text>
        <Text style={styles.errorText}>Stage: {error.stage}</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Text style={styles.hint}>Please restart the app or contact support.</Text>
      </View>
    );
  }

  if (initState === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E85D75" />
        <Text style={styles.loadingText}>Loading Ribbon...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RootLayout;
