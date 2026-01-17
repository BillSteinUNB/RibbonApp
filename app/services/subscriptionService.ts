/**
 * Subscription Service
 * High-level subscription management that integrates with RevenueCat
 */

import { Subscription, PRICING_PLANS } from '../types/subscription';
import { storage } from './storage';
import { errorLogger } from './errorLogger';
import * as revenueCat from './revenueCatService';
import type { CustomerInfo } from 'react-native-purchases';

// Local cache key for subscription state
const SUBSCRIPTION_KEY = 'user_subscription';

/**
 * Convert RevenueCat CustomerInfo to our Subscription type
 */
function customerInfoToSubscription(
  userId: string,
  customerInfo: CustomerInfo
): Subscription {
  const entitlement = customerInfo.entitlements.active[revenueCat.REVENUECAT_CONFIG.entitlementId];

  if (!entitlement) {
    return {
      userId,
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      cancelAtPeriodEnd: false,
      paymentProvider: 'none',
    };
  }

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

  // Determine status
  let status: Subscription['status'] = 'active';
  if (entitlement.willRenew === false) {
    status = 'canceling';
  }

  return {
    userId,
    plan,
    status,
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
}

export const subscriptionService = {
  /**
   * Get current subscription status
   * Fetches from RevenueCat and caches locally
   */
  getSubscription: async (userId: string): Promise<Subscription | null> => {
    try {
      const customerInfo = await revenueCat.getCustomerInfo();
      const subscription = customerInfoToSubscription(userId, customerInfo);

      // Cache locally for offline access
      await storage.setItem(SUBSCRIPTION_KEY, subscription);

      return subscription;
    } catch (error) {
      errorLogger.log(error, { context: 'getSubscription', userId });

      // Fall back to cached subscription
      const cached = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      if (cached) {
        return cached;
      }

      // Return free plan as default
      return {
        userId,
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        cancelAtPeriodEnd: false,
        paymentProvider: 'none',
      };
    }
  },

  /**
   * Subscribe to a plan using RevenueCat Paywall
   * Opens the RevenueCat paywall UI
   */
  subscribeToPlan: async (userId: string, planId: string): Promise<Subscription> => {
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Invalid plan ID');

    // Present the paywall
    const result = await revenueCat.presentPaywall();

    if (result === 'purchased' || result === 'restored') {
      // Get updated customer info
      const customerInfo = await revenueCat.getCustomerInfo();
      const subscription = customerInfoToSubscription(userId, customerInfo);

      // Cache locally
      await storage.setItem(SUBSCRIPTION_KEY, subscription);

      return subscription;
    }

    // User cancelled or error
    throw new Error(
      result === 'cancelled'
        ? 'Purchase cancelled'
        : 'Purchase failed. Please try again.'
    );
  },

  /**
   * Cancel subscription
   * Opens the Customer Center for the user to manage their subscription
   */
  cancelSubscription: async (userId: string, onSubscriptionChanged?: (subscription: Subscription) => void): Promise<void> => {
    try {
      // Open Customer Center for subscription management with sync callback
      await revenueCat.presentCustomerCenter(async (customerInfo) => {
        const subscription = customerInfoToSubscription(userId, customerInfo);
        await storage.setItem(SUBSCRIPTION_KEY, subscription);
        if (onSubscriptionChanged) {
          onSubscriptionChanged(subscription);
        }
      });
    } catch (error) {
      errorLogger.log(error, { context: 'cancelSubscription', userId });
      throw error;
    }
  },

  /**
   * Restore previous purchases
   */
  restorePurchases: async (userId: string): Promise<Subscription | null> => {
    try {
      const customerInfo = await revenueCat.restorePurchases();
      const subscription = customerInfoToSubscription(userId, customerInfo);

      // Cache locally
      await storage.setItem(SUBSCRIPTION_KEY, subscription);

      // Return null if no active subscription was restored
      if (subscription.plan === 'free') {
        return null;
      }

      return subscription;
    } catch (error) {
      errorLogger.log(error, { context: 'restorePurchases', userId });
      throw error;
    }
  },

  /**
   * Check if user has premium access
   */
  checkHasAccess: async (userId: string): Promise<boolean> => {
    try {
      return await revenueCat.checkProAccess();
    } catch (error) {
      errorLogger.log(error, { context: 'checkHasAccess', userId });

      // Fall back to cached subscription
      const cached = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      return cached?.status === 'active' || cached?.status === 'canceling';
    }
  },

  /**
   * Present RevenueCat Paywall directly
   * Returns true if user purchased or restored
   */
  presentPaywall: async (): Promise<boolean> => {
    const result = await revenueCat.presentPaywall();
    return result === 'purchased' || result === 'restored';
  },

  /**
   * Present paywall only if user doesn't have pro access
   * Returns true if user has pro access after (purchased, restored, or already had it)
   */
  presentPaywallIfNeeded: async (): Promise<boolean> => {
    return await revenueCat.presentPaywallIfNeeded();
  },

  /**
   * Open Customer Center for subscription management
   */
  openCustomerCenter: async (userId?: string, onSubscriptionChanged?: (subscription: Subscription) => void): Promise<void> => {
    await revenueCat.presentCustomerCenter(userId ? async (customerInfo) => {
      const subscription = customerInfoToSubscription(userId, customerInfo);
      await storage.setItem(SUBSCRIPTION_KEY, subscription);
      if (onSubscriptionChanged) {
        onSubscriptionChanged(subscription);
      }
    } : undefined);
  },
};
