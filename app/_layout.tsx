import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useNavigationState } from 'expo-router';
import { useAuthStore } from './store/authStore';
import { STORAGE_KEYS } from './constants/storageKeys';
import { COLORS, SPACING, FONTS } from './constants';

let _authServiceModule: typeof import('./services/authService') | null = null;
let _storageModule: typeof import('./services/storage') | null = null;

async function getAuthService() {
  if (!_authServiceModule) {
    _authServiceModule = await import('./services/authService');
  }
  return _authServiceModule.authService;
}

async function getStorage() {
  if (!_storageModule) {
    _storageModule = await import('./services/storage');
  }
  return _storageModule.storage;
}

const AUTH_ROUTES = ['sign-in', 'sign-up', 'forgot-password'];

const PROTECTED_ROUTES = [
  '(tabs)',
  '',
  'index',
  'recipients',
  'recipients/new',
  'settings',
  'pricing',
  'help',
  'onboarding',
];

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.accentPrimary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useNavigationState();
  const { isAuthenticated, setUser, setAuthenticated, setLoading, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingStatus = async () => {
      try {
        const storageService = await getStorage();
        const value = await storageService.getItem<boolean>(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
        if (isMounted) {
          setHasCompletedOnboarding(value === true);
        }
      } catch {
        if (isMounted) {
          setHasCompletedOnboarding(false);
        }
      }
    };

    if (isAuthenticated) {
      loadOnboardingStatus();
    } else {
      setHasCompletedOnboarding(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authServiceInstance = await getAuthService();
        const result = await authServiceInstance.validateSession();
        
        if (result.isValid && result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            createdAt: new Date().toISOString(),
            trialUsesRemaining: 5,
            isPremium: false,
          });
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setAuthenticated(false);
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setAuthenticated, setLoading]);

  useEffect(() => {
    if (isChecking || !navigationState.key) return;

    let cancelled = false;

    const evaluateRoutes = async () => {
      const currentRoute = navigationState.routes[navigationState.index]?.name || '';
      const isAuthRoute = AUTH_ROUTES.some(route => currentRoute.includes(route));
      const isOnboardingRoute = currentRoute.includes('onboarding');
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        currentRoute === route || currentRoute.startsWith(route + '/')
      );

      let onboardingComplete = hasCompletedOnboarding;

      if (isAuthenticated && onboardingComplete === false && !isOnboardingRoute) {
        try {
          const storageService = await getStorage();
          const value = await storageService.getItem<boolean>(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
          if (cancelled) return;
          if (value === true) {
            setHasCompletedOnboarding(true);
            onboardingComplete = true;
          }
        } catch {
          if (cancelled) return;
        }
      }

      if (isAuthenticated && onboardingComplete === false && !isOnboardingRoute) {
        router.replace('/onboarding');
        return;
      }

      if (isAuthenticated && isAuthRoute) {
        router.replace(onboardingComplete === false ? '/onboarding' : '/');
        return;
      }

      if (!isAuthenticated && isProtectedRoute) {
        router.replace('/(auth)/sign-in');
      }
    };

    evaluateRoutes();

    return () => {
      cancelled = true;
    };
  }, [isChecking, isAuthenticated, hasCompletedOnboarding, navigationState, router]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return <Stack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
});
