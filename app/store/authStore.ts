import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subscription } from '../types/subscription';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/settings';
import { authService } from '../services/authService';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  trialUsesRemaining: number;
  isPremium: boolean;
  premiumSince?: string;
  profile?: UserProfile;
  subscription?: Subscription;
}

export interface UserProfile {
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setSubscription: (subscription: Subscription) => void;
  decrementTrialUses: () => void;
  resetTrialUses: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      updateUserPreferences: (preferences) => {
        const { user } = get();
        if (user) {
          const currentPrefs = user.profile?.preferences || DEFAULT_PREFERENCES;
          set({
            user: {
              ...user,
              profile: {
                ...user.profile,
                preferences: { ...currentPrefs, ...preferences }
              }
            }
          });
        }
      },

      setSubscription: (subscription) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              isPremium: subscription.status === 'active',
              subscription
            }
          });
        }
      },
      
      decrementTrialUses: () => {
        const { user } = get();
        if (user && user.trialUsesRemaining > 0) {
          set({
            user: {
              ...user,
              trialUsesRemaining: user.trialUsesRemaining - 1,
            },
          });
        }
      },
      
      resetTrialUses: () => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              trialUsesRemaining: 5,
            },
          });
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      logout: async () => {
        try {
          await authService.signOut();
        } catch (error) {
          console.error('Logout failed:', error);
        }
        set({ user: null, isAuthenticated: false, error: null });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => require('@react-native-async-storage/async-storage').default),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState & AuthActions) => state.user;
export const selectIsAuthenticated = (state: AuthState & AuthActions) => state.isAuthenticated;
export const selectTrialUsesRemaining = (state: AuthState & AuthActions) => state.user?.trialUsesRemaining ?? 0;
export const selectIsPremium = (state: AuthState & AuthActions) => state.user?.isPremium ?? false;
export const selectUserPreferences = (state: AuthState & AuthActions) => state.user?.profile?.preferences ?? DEFAULT_PREFERENCES;
