/**
 * Auth Store - Safe Lazy Initialization
 *
 * CRITICAL: This file uses ONLY dynamic imports for services that depend on
 * native modules to prevent crashes at JavaScript bundle load time.
 *
 * DO NOT add static imports for:
 * - authService (depends on supabase which has URL polyfill)
 * - revenueCatService (depends on native RevenueCat module)
 * - errorLogger (depends on supabase)
 * - REVENUECAT_CONFIG from env
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subscription } from '../types/subscription';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/settings';
import { logger } from '../utils/logger';
import type { CustomerInfo } from 'react-native-purchases';
import { getSafeStorage } from '../lib/safeStorage';

// Lazy module loaders - do NOT import these statically
let _authServiceModule: typeof import('../services/authService') | null = null;
let _errorLoggerModule: typeof import('../services/errorLogger') | null = null;
let _revenueCatServiceModule: typeof import('../services/revenueCatService') | null = null;
let _envModule: typeof import('../config/env') | null = null;

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

async function getRevenueCatService() {
  if (!_revenueCatServiceModule) {
    _revenueCatServiceModule = await import('../services/revenueCatService');
  }
  return _revenueCatServiceModule;
}

async function getRevenueCatConfig() {
  if (!_envModule) {
    _envModule = await import('../config/env');
  }
  return _envModule.REVENUECAT_CONFIG;
}

// Sync error logger for non-blocking error logging
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
  syncFromRevenueCat: (customerInfo: CustomerInfo) => void;
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
        // Validate premium status after setting user
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
          // Update subscription data and derive isPremium status from plan
          const isPremium = subscription.plan !== 'free';

          set({
            user: {
              ...user,
              isPremium,
              subscription
            }
          });

          // Validate and log any inconsistencies
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

      /**
       * Validate and correct inconsistencies between isPremium and subscription.plan
       * This addresses GitHub issue #45
       */
      validateAndCorrectPremiumStatus: () => {
        const { user } = get();
        if (!user || !user.subscription) return;

        // Derive correct isPremium status from subscription plan
        const correctIsPremium = user.subscription.plan !== 'free';

        // Check for inconsistency
        if (user.isPremium !== correctIsPremium) {
          logger.warn('[AuthStore] Validating premium status - inconsistency detected:', {
            userId: user.id,
            currentIsPremium: user.isPremium,
            correctIsPremium,
            subscriptionPlan: user.subscription.plan
          });

          // Correct the inconsistency by updating isPremium
          set({
            user: {
              ...user,
              isPremium: correctIsPremium
            }
          });
        }
      },

      syncFromRevenueCat: async (customerInfo: CustomerInfo) => {
        const { user } = get();
        if (!user) return;

        try {
          const REVENUECAT_CONFIG = await getRevenueCatConfig();
          const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId];
          const isPremium = entitlement !== undefined;

          if (isPremium && entitlement) {
            // Determine plan type from product identifier
            let plan: 'free' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
            const productId = entitlement.productIdentifier;

            if (productId.includes('yearly') || productId.includes('annual')) {
              plan = 'yearly';
            } else if (productId.includes('weekly')) {
              plan = 'weekly';
            } else if (productId.includes('monthly')) {
              plan = 'monthly';
            }

            const subscription: Subscription = {
              userId: user.id,
              plan,
              status: entitlement.willRenew === false ? 'canceling' : 'active',
              startDate: entitlement.originalPurchaseDate
                ? new Date(entitlement.originalPurchaseDate)
                : new Date(),
              endDate: entitlement.expirationDate
                ? new Date(entitlement.expirationDate)
                : undefined,
              cancelAtPeriodEnd: !entitlement.willRenew,
              paymentProvider: 'revenuecat',
              providerSubscriptionId: entitlement.productIdentifier,
            };

            set({
              user: {
                ...user,
                isPremium: true,
                premiumSince: entitlement.originalPurchaseDate || new Date().toISOString(),
                subscription,
              },
            });
          } else {
            // User is not premium
            set({
              user: {
                ...user,
                isPremium: false,
                subscription: {
                  userId: user.id,
                  plan: 'free',
                  status: 'active',
                  startDate: new Date(),
                  cancelAtPeriodEnd: false,
                  paymentProvider: 'none',
                },
              },
            });
          }
        } catch (error) {
          logErrorSync(error, { context: 'syncFromRevenueCat' });
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

        // Helper function for retry with exponential backoff
        const retryWithBackoff = async <T>(
          operation: () => Promise<T>,
          operationName: string,
          maxRetries: number = 3
        ): Promise<{ success: boolean; error?: Error }> => {
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              await operation();
              return { success: true };
            } catch (error) {
              logErrorSync(error, { context: operationName, attempt: attempt + 1 });
              if (attempt === maxRetries - 1) {
                return { success: false, error: error as Error };
              }
              // Exponential backoff: 500ms, 1000ms, 2000ms
              const delay = Math.pow(2, attempt) * 500;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
          return { success: false };
        };

        // Attempt Supabase logout with retries
        const supabaseResult = await retryWithBackoff(
          async () => {
            const authService = await getAuthService();
            await authService.signOut();
          },
          'supabase logout',
          3
        );

        // Attempt RevenueCat logout with retries
        const revenueCatResult = await retryWithBackoff(
          async () => {
            const revenueCatService = await getRevenueCatService();
            await revenueCatService.logOutUser();
          },
          'revenueCat logout',
          3
        );

        // Check results and handle accordingly
        if (supabaseResult.success && revenueCatResult.success) {
          // Both logged out successfully - clear state
          set({ user: null, isAuthenticated: false, error: null, logoutError: null });
        } else {
          // At least one logout failed
          const errors: string[] = [];
          if (!supabaseResult.success) {
            errors.push(`Supabase: ${supabaseResult.error?.message || 'Unknown error'}`);
          }
          if (!revenueCatResult.success) {
            errors.push(`RevenueCat: ${revenueCatResult.error?.message || 'Unknown error'}`);
          }

          const errorMessage = `Logout failed: ${errors.join(', ')}`;
          set({
            logoutError: errorMessage,
            isLoading: false,
          });

          // Store failed logout timestamp for cleanup
          try {
            const storage = getSafeStorage();
            await storage.setItem(
              '@ribbon/failed-logout-timestamp',
              Date.now().toString()
            );
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
            return; // No failed logout to clean up
          }

          const failedTime = parseInt(failedLogoutTimestamp, 10);
          const hoursSinceFailure = (Date.now() - failedTime) / (1000 * 60 * 60);

          if (hoursSinceFailure > 24) {
            // Force clear state if failed for more than 24 hours
            console.log('[Auth] Force clearing stale logout state after 24 hours');
            await storage.removeItem('@ribbon/failed-logout-timestamp');
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              logoutError: null,
            });
          } else {
            // Try to complete the failed logout
            console.log('[Auth] Attempting to complete failed logout');
            const store = get();
            await store.logout();
          }
        } catch (error) {
          console.warn('[Auth] Failed to cleanup logout state:', error);
          // If cleanup fails, remove the timestamp to prevent stuck state
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

// Selectors
export const selectUser = (state: AuthState & AuthActions) => state.user;
export const selectIsAuthenticated = (state: AuthState & AuthActions) => state.isAuthenticated;
export const selectTrialUsesRemaining = (state: AuthState & AuthActions) => state.user?.trialUsesRemaining ?? 0;
export const selectIsPremium = (state: AuthState & AuthActions) => state.user?.isPremium ?? false;
export const selectUserPreferences = (state: AuthState & AuthActions) => state.user?.profile?.preferences ?? DEFAULT_PREFERENCES;
