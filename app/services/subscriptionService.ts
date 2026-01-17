/**
 * Subscription Service
 * Stub implementation - RevenueCat integration removed for now
 * TODO: Re-add RevenueCat when ready
 */

import { Subscription } from '../types/subscription';
import { storage } from './storage';
import { logger } from '../utils/logger';

const SUBSCRIPTION_KEY = 'user_subscription';

function getFreeSubscription(userId: string): Subscription {
  return {
    userId,
    plan: 'free',
    status: 'active',
    startDate: new Date(),
    cancelAtPeriodEnd: false,
    paymentProvider: 'none',
  };
}

export const subscriptionService = {
  getSubscription: async (userId: string): Promise<Subscription> => {
    try {
      const cached = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      if (cached) {
        return cached;
      }
    } catch (error) {
      logger.warn('[Subscription] Failed to get cached subscription:', error);
    }
    return getFreeSubscription(userId);
  },

  subscribeToPlan: async (userId: string, planId: string): Promise<Subscription> => {
    logger.log('[Subscription] Premium subscriptions coming soon');
    throw new Error('Premium subscriptions coming soon!');
  },

  cancelSubscription: async (userId: string): Promise<void> => {
    logger.log('[Subscription] Subscription management coming soon');
  },

  restorePurchases: async (userId: string): Promise<Subscription | null> => {
    logger.log('[Subscription] Purchase restoration coming soon');
    return null;
  },

  checkHasAccess: async (userId: string): Promise<boolean> => {
    try {
      const cached = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      return cached?.plan !== 'free' && cached?.status === 'active';
    } catch {
      return false;
    }
  },

  presentPaywall: async (): Promise<boolean> => {
    logger.log('[Subscription] Paywall coming soon');
    return false;
  },

  presentPaywallIfNeeded: async (): Promise<boolean> => {
    return false;
  },

  openCustomerCenter: async (): Promise<void> => {
    logger.log('[Subscription] Customer center coming soon');
  },
};
