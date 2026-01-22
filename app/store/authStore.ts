/**
 * User Store - Local Profile
 *
 * Stores local profile and subscription state without remote auth.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subscription } from '../types/subscription';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/settings';
import { logger } from '../utils/logger';
import { getSafeStorage } from '../lib/safeStorage';
import { generateId } from '../utils/helpers';

const DEFAULT_TRIAL_USES = 5;

export interface User {
  id: string;
  email?: string;
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
}

interface AuthActions {
  initializeLocalUser: () => void;
  getOrCreateUser: () => User;
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setSubscription: (subscription: Subscription) => void;
  decrementTrialUses: () => void;
  resetTrialUses: () => void;
  validateAndCorrectPremiumStatus: () => void;
  resetLocalUser: () => void;
}

const createLocalUser = (): User => ({
  id: generateId(),
  createdAt: new Date().toISOString(),
  trialUsesRemaining: DEFAULT_TRIAL_USES,
  isPremium: false,
  profile: {
    preferences: DEFAULT_PREFERENCES,
  },
});

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => {
      const ensureUser = () => {
        const existing = get().user;
        if (existing) return existing;
        const created = createLocalUser();
        set({ user: created });
        return created;
      };

      return {
        user: null,

        initializeLocalUser: () => {
          const user = ensureUser();
          if (!user.profile?.preferences) {
            set({
              user: {
                ...user,
                profile: {
                  ...user.profile,
                  preferences: DEFAULT_PREFERENCES,
                },
              },
            });
          }
        },
        getOrCreateUser: () => ensureUser(),

        setUser: (user) => {
          set({ user });
          if (user) get().validateAndCorrectPremiumStatus();
        },

        updateUserPreferences: (preferences) => {
          const user = ensureUser();
          const currentPrefs = user.profile?.preferences || DEFAULT_PREFERENCES;
          set({
            user: {
              ...user,
              profile: {
                ...user.profile,
                preferences: { ...currentPrefs, ...preferences },
              },
            },
          });
        },

        setSubscription: (subscription) => {
          const user = ensureUser();
          const isPremium = subscription.plan !== 'free';
          set({
            user: {
              ...user,
              isPremium,
              subscription,
            },
          });

          if (user.isPremium !== isPremium) {
            logger.warn('[AuthStore] Inconsistent premium status detected and corrected:', {
              userId: user.id,
              oldIsPremium: user.isPremium,
              newIsPremium: isPremium,
              subscriptionPlan: subscription.plan,
            });
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
              subscriptionPlan: user.subscription.plan,
            });

            set({
              user: {
                ...user,
                isPremium: correctIsPremium,
              },
            });
          }
        },

        decrementTrialUses: () => {
          const user = ensureUser();
          if (user.trialUsesRemaining > 0) {
            set({
              user: {
                ...user,
                trialUsesRemaining: user.trialUsesRemaining - 1,
              },
            });
          }
        },

        resetTrialUses: () => {
          const user = ensureUser();
          set({
            user: {
              ...user,
              trialUsesRemaining: DEFAULT_TRIAL_USES,
            },
          });
        },

        resetLocalUser: () => {
          set({ user: createLocalUser() });
        },
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

export const selectUser = (state: AuthState & AuthActions) => state.user;
export const selectTrialUsesRemaining = (state: AuthState & AuthActions) => state.user?.trialUsesRemaining ?? 0;
export const selectIsPremium = (state: AuthState & AuthActions) => state.user?.isPremium ?? false;
export const selectUserPreferences = (state: AuthState & AuthActions) => state.user?.profile?.preferences ?? DEFAULT_PREFERENCES;
