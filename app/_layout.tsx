import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry first, before any other imports that might crash
Sentry.init({
  dsn: 'https://b71131849b83863eb53d60386a1a7823@o4510722439774208.ingest.us.sentry.io/4510722440757248',
  debug: __DEV__,
  tracesSampleRate: 1.0,
  enableNative: true,
});

// Now import other modules
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';
import { logger } from './utils/logger';

function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { user, syncFromRevenueCat, setUser, setAuthenticated } = useAuthStore();
  const appState = useRef(AppState.currentState);
  const isRevenueCatInitialized = useRef(false);
  const sessionValidated = useRef(false);
  const subscriptionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize app on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Validate session on startup (Issue #46)
        if (!sessionValidated.current) {
          logger.log('[Layout] Validating session on startup...');
          const validation = await authService.validateSession();

          if (validation.isValid && validation.user) {
            setUser({
              id: validation.user.id,
              email: validation.user.email || '',
              createdAt: validation.user.created_at || new Date().toISOString(),
              trialUsesRemaining: 5,
              isPremium: false,
            });
            setAuthenticated(true);
            logger.log('[Layout] Session validated successfully');
          } else if (validation.needsReauth) {
            logger.warn('[Layout] Session validation failed, clearing auth state');
            setUser(null);
            setAuthenticated(false);
          } else {
            logger.log('[Layout] No active session');
            setUser(null);
            setAuthenticated(false);
          }

          sessionValidated.current = true;
        }

        // Dynamically import RevenueCat to catch any native module errors
        const revenueCat = await import('./services/revenueCatService');

        if (!isRevenueCatInitialized.current) {
          await revenueCat.initializeRevenueCat();
          isRevenueCatInitialized.current = true;

          revenueCat.addCustomerInfoListener((customerInfo) => {
            logger.log('[Layout] Customer info updated via listener');
            syncFromRevenueCat(customerInfo);
          });

          logger.log('[Layout] RevenueCat initialized');
        }

        setIsReady(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('[Layout] Initialization failed:', error);
        Sentry.captureException(error);
        setInitError(errorMessage);
        // Still allow app to load even if RevenueCat fails
        setIsReady(true);
      }
    };

    init();
  }, [setUser, setAuthenticated, syncFromRevenueCat]);

  // Identify user with RevenueCat when authenticated
  useEffect(() => {
    const identifyUser = async () => {
      if (!user?.id || !isRevenueCatInitialized.current) return;

      try {
        const revenueCat = await import('./services/revenueCatService');
        const customerInfo = await revenueCat.identifyUser(user.id);
        syncFromRevenueCat(customerInfo);
        logger.log('[Layout] User identified:', user.id);
      } catch (error) {
        logger.error('[Layout] Failed to identify user:', error);
        Sentry.captureException(error);
      }
    };

    identifyUser();
  }, [user?.id, syncFromRevenueCat]);

  // Periodic subscription expiration check (Issue #43)
  useEffect(() => {
    if (!user || !user.isPremium) return;

    const checkSubscription = async () => {
      try {
        const revenueCat = await import('./services/revenueCatService');
        const customerInfo = await revenueCat.getCustomerInfo();
        syncFromRevenueCat(customerInfo);
        logger.log('[Layout] Subscription status refreshed (periodic check)');
      } catch (error) {
        logger.error('[Layout] Failed to check subscription:', error);
      }
    };

    // Check every 5 minutes
    subscriptionCheckInterval.current = setInterval(checkSubscription, 5 * 60 * 1000);

    // Initial check
    checkSubscription();

    return () => {
      if (subscriptionCheckInterval.current) {
        clearInterval(subscriptionCheckInterval.current);
        subscriptionCheckInterval.current = null;
      }
    };
  }, [user?.id, user?.isPremium, syncFromRevenueCat]);

  // Show loading state
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <StatusBar style="dark" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show error state (but still render app)
  if (initError && __DEV__) {
    console.warn('Init error:', initError);
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="recipients/new" options={{
          presentation: 'modal',
        }} />
        <Stack.Screen name="recipients/[id]" />
        <Stack.Screen name="recipients/[id]/ideas" />
        <Stack.Screen name="recipients/[id]/edit" options={{
          presentation: 'modal',
        }} />
      </Stack>
    </>
  );
}

export default Sentry.wrap(RootLayout);
