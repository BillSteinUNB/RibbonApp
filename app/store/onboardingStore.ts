/**
 * Onboarding Store
 * Manages onboarding state and subscription status for paywall
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '../lib/safeStorage';
import { logger } from '../utils/logger';

interface OnboardingState {
  // Onboarding flow state
  hasCompletedOnboarding: boolean;
  currentStep: number;
  
  // Trial/Subscription state
  hasStartedTrial: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  selectedPlan: 'weekly' | 'monthly' | 'yearly' | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  startTrial: (plan: 'weekly' | 'monthly' | 'yearly') => void;
  setSelectedPlan: (plan: 'weekly' | 'monthly' | 'yearly') => void;
  isTrialActive: () => boolean;
}

const TRIAL_DURATION_DAYS = 3;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      hasCompletedOnboarding: false,
      currentStep: 0,
      hasStartedTrial: false,
      trialStartDate: null,
      trialEndDate: null,
      selectedPlan: 'yearly', // Default to yearly (best value)

      setCurrentStep: (step) => {
        set({ currentStep: step });
        logger.info('[Onboarding] Step changed to:', step);
      },

      nextStep: () => {
        const { currentStep } = get();
        set({ currentStep: currentStep + 1 });
        logger.info('[Onboarding] Advanced to step:', currentStep + 1);
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
          logger.info('[Onboarding] Went back to step:', currentStep - 1);
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
        logger.info('[Onboarding] Onboarding completed');
      },

      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          currentStep: 0,
          hasStartedTrial: false,
          trialStartDate: null,
          trialEndDate: null,
          selectedPlan: 'yearly',
        });
        logger.info('[Onboarding] Onboarding reset');
      },

      startTrial: (plan) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);

        set({
          hasStartedTrial: true,
          trialStartDate: now.toISOString(),
          trialEndDate: endDate.toISOString(),
          selectedPlan: plan,
          hasCompletedOnboarding: true,
        });

        logger.info('[Onboarding] Trial started:', {
          plan,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
        });
      },

      setSelectedPlan: (plan) => {
        set({ selectedPlan: plan });
        logger.info('[Onboarding] Plan selected:', plan);
      },

      isTrialActive: () => {
        const { hasStartedTrial, trialEndDate } = get();
        if (!hasStartedTrial || !trialEndDate) return false;
        
        const now = new Date();
        const end = new Date(trialEndDate);
        return now < end;
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

// Selectors
export const selectHasCompletedOnboarding = (state: OnboardingState) => state.hasCompletedOnboarding;
export const selectCurrentStep = (state: OnboardingState) => state.currentStep;
export const selectHasStartedTrial = (state: OnboardingState) => state.hasStartedTrial;
export const selectSelectedPlan = (state: OnboardingState) => state.selectedPlan;
