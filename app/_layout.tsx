import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useNavigationState } from 'expo-router';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';
import { COLORS, SPACING, FONTS } from './constants';

const AUTH_ROUTES = ['sign-in', 'sign-up', 'forgot-password'];

const PROTECTED_ROUTES = [
  '',
  'index',
  'recipients',
  'settings',
  'recipients/new',
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authService.validateSession();
        
        if (result.isValid && result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            createdAt: new Date().toISOString(),
            trialUsesRemaining: 5,
            isPremium: false,
          });
          setAuthenticated(true);
        } else if (result.needsReauth) {
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

    const currentRoute = navigationState.routes[navigationState.index]?.name || '';
    const isAuthRoute = AUTH_ROUTES.some(route => currentRoute.includes(route));
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      currentRoute === route || currentRoute.startsWith(route + '/')
    );

    if (isAuthenticated && isAuthRoute) {
      router.replace('/');
    } else if (!isAuthenticated && isProtectedRoute) {
      router.replace('/(auth)/sign-in');
    }
  }, [isChecking, isAuthenticated, navigationState, router]);

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
