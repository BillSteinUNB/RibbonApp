import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './store/authStore';
import * as revenueCat from './services/revenueCatService';
import { logger } from './utils/logger';

export default function RootLayout() {
  const { user, syncFromRevenueCat } = useAuthStore();
  const appState = useRef(AppState.currentState);
  const isRevenueCatInitialized = useRef(false);

  // Refresh subscription status from RevenueCat
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const customerInfo = await revenueCat.getCustomerInfo();
      syncFromRevenueCat(customerInfo);
      logger.log('[Layout] Subscription status refreshed');
    } catch (error) {
      logger.error('[Layout] Failed to refresh subscription status:', error);
    }
  }, [user?.id, syncFromRevenueCat]);

  // Initialize RevenueCat once on app start
  useEffect(() => {
    const initRevenueCat = async () => {
      if (isRevenueCatInitialized.current) return;

      try {
        await revenueCat.initializeRevenueCat();
        isRevenueCatInitialized.current = true;

        // Set up listener for subscription updates (fires on any change)
        revenueCat.addCustomerInfoListener((customerInfo) => {
          logger.log('[Layout] Customer info updated via listener');
          syncFromRevenueCat(customerInfo);
        });

        logger.log('[Layout] RevenueCat initialized with listener');
      } catch (error) {
        logger.error('[Layout] Failed to initialize RevenueCat:', error);
      }
    };

    initRevenueCat();
  }, [syncFromRevenueCat]);

  // Identify user with RevenueCat when authenticated and sync subscription
  useEffect(() => {
    const identifyAndSyncUser = async () => {
      if (!user?.id || !isRevenueCatInitialized.current) return;

      try {
        // Identify user with RevenueCat (links purchases to this user)
        const customerInfo = await revenueCat.identifyUser(user.id);

        // Immediately sync subscription status
        syncFromRevenueCat(customerInfo);
        logger.log('[Layout] User identified and subscription synced:', user.id);
      } catch (error) {
        logger.error('[Layout] Failed to identify user with RevenueCat:', error);

        // Even if identification fails, try to get current customer info
        try {
          const customerInfo = await revenueCat.getCustomerInfo();
          syncFromRevenueCat(customerInfo);
        } catch (innerError) {
          logger.error('[Layout] Failed to get customer info as fallback:', innerError);
        }
      }
    };

    identifyAndSyncUser();
  }, [user?.id, syncFromRevenueCat]);

  // Refresh subscription when app comes to foreground
  // This catches purchases made outside the app (e.g., App Store, other devices)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        logger.log('[Layout] App came to foreground, refreshing subscription');
        refreshSubscriptionStatus();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refreshSubscriptionStatus]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
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
