import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore, selectIsAuthenticated } from '../store/authStore';

/**
 * Protected Route Guard
 * Redirects unauthenticated users to sign-in
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // If auth is still loading, don't do anything
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to sign-in page
      router.replace('/(auth)/sign-in');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  // While checking auth status or if authenticated, render children
  if (isLoading) {
    return null;
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}

/**
 * Guest Route Guard
 * Redirects authenticated users to home
 */
interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // If auth is still loading, don't do anything
    if (isLoading) return;

    // If user is authenticated, redirect to home
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  // While checking auth status or if guest, render children
  if (isLoading) {
    return null;
  }

  // Only render children if not authenticated
  return !isAuthenticated ? <>{children}</> : null;
}
