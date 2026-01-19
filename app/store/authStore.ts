/**
 * Auth Store - Safe Lazy Initialization
 *
 * CRITICAL: This file uses ONLY dynamic imports for services that depend on
 * native modules to prevent crashes at JavaScript bundle load time.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subscription } from '../types/subscription';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/settings';
import { logger } from '../utils/logger';
import { getSafeStorage } from '../lib/safeStorage';

let _authServiceModule: typeof import('../services/authService') | null = null;
let _errorLoggerModule: typeof import('../services/errorLogger') | null = null;

async function getAuthService() {
  if (!_authServiceModule) {
    _authServiceModule = await import('../services/authService');
  }
  return _authServiceModule.authService;
}

async function getErrorLogger() {
  if (!_errorLoggerModule) {
    _errorLoggerModule = await import('../services/errorLogger');
  }
  return _errorLoggerModule.errorLogger;
}

function logErrorSync(error: any, context: any) {
  getErrorLogger().then(el => el?.log(error, context)).catch(() => {});
  console.error('[AuthStore]', context, error);
}

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
  logoutError: string | null;
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
  setLogoutError: (error: string | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  cleanupFailedLogout: () => Promise<void>;
  validateAndCorrectPremiumStatus: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      logoutError: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, error: null });
        if (user) get().validateAndCorrectPremiumStatus();
      },
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
          const isPremium = subscription.plan !== 'free';
          set({
            user: {
              ...user,
              isPremium,
              subscription
            }
          });

          if (user.isPremium !== isPremium) {
            logger.warn('[AuthStore] Inconsistent premium status detected and corrected:', {
              userId: user.id,
              oldIsPremium: user.isPremium,
              newIsPremium: isPremium,
              subscriptionPlan: subscription.plan
            });
          }
        }
      },

      validateAndCorrectPremiumStatus: () => {
        const { user } = get();
        if (!user || !user.subscription) return;

        const correctIsPremium = user.subscription.plan !== 'free';

        if (user.isPremium !== correctIsPremium) {
          logger.warn('[AuthStore] Validating premium status - inconsistency detected:', {
            userId: user.id,
            currentIsPremium: user.isPremium,
            correctIsPremium,
            subscriptionPlan: user.subscription.plan
          });

          set({
            user: {
              ...user,
              isPremium: correctIsPremium
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
      setLogoutError: (error) => set({ logoutError: error }),

      logout: async () => {
        set({ logoutError: null });

        try {
          const authService = await getAuthService();
          await authService.signOut();
          set({ user: null, isAuthenticated: false, error: null, logoutError: null });
        } catch (error) {
          logErrorSync(error, { context: 'logout' });
          set({
            logoutError: `Logout failed: ${(error as Error)?.message || 'Unknown error'}`,
            isLoading: false,
          });

          try {
            const storage = getSafeStorage();
            await storage.setItem('@ribbon/failed-logout-timestamp', Date.now().toString());
          } catch {
            // Ignore storage errors
          }
        }
      },

      clearError: () => set({ error: null }),

      cleanupFailedLogout: async () => {
        try {
          const storage = getSafeStorage();
          const failedLogoutTimestamp = await storage.getItem('@ribbon/failed-logout-timestamp');

          if (!failedLogoutTimestamp) {
            return;
          }

          const failedTime = parseInt(failedLogoutTimestamp as string, 10);
          const hoursSinceFailure = (Date.now() - failedTime) / (1000 * 60 * 60);

          if (hoursSinceFailure > 24) {
            logger.info('[Auth] Force clearing stale logout state after 24 hours');
            await storage.removeItem('@ribbon/failed-logout-timestamp');
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              logoutError: null,
            });
          } else {
            logger.info('[Auth] Attempting to complete failed logout');
            const store = get();
            await store.logout();
          }
        } catch (error) {
          logger.warn('[Auth] Failed to cleanup logout state:', error);
          try {
            const storage = getSafeStorage();
            await storage.removeItem('@ribbon/failed-logout-timestamp');
          } catch {
            // Ignore storage errors
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

export const selectUser = (state: AuthState & AuthActions) => state.user;
export const selectIsAuthenticated = (state: AuthState & AuthActions) => state.isAuthenticated;
export const selectTrialUsesRemaining = (state: AuthState & AuthActions) => state.user?.trialUsesRemaining ?? 0;
export const selectIsPremium = (state: AuthState & AuthActions) => state.user?.isPremium ?? false;
export const selectUserPreferences = (state: AuthState & AuthActions) => state.user?.profile?.preferences ?? DEFAULT_PREFERENCES;
