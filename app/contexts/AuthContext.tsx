import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '../types/user';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { errorLogger } from '../services/errorLogger';

/**
 * Authentication Context
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();

  useEffect(() => {
    // Initialize auth service
    authService.initialize();
    
    // Get current user
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    authStore.setUser(currentUser);
    setIsLoading(false);

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      authStore.setUser(authUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const signedInUser = await authService.signIn({ email, password });
    setUser(signedInUser);
    authStore.setUser(signedInUser);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const signedUpUser = await authService.signUp({
      email,
      password,
      name,
    });
    setUser(signedUpUser);
    authStore.setUser(signedUpUser);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    authStore.logout();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Provides authentication context to components
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
