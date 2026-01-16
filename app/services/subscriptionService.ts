import { Subscription, PRICING_PLANS } from '../types/subscription';
import { storage } from './storage';
import { errorLogger } from './errorLogger';
import { generateSecureSessionId } from '../utils/helpers';

// Mock implementation since we don't have backend/RevenueCat keys yet
const SUBSCRIPTION_KEY = 'user_subscription';

export const subscriptionService = {
  getSubscription: async (userId: string): Promise<Subscription | null> => {
    try {
      // In a real app, this would fetch from RevenueCat or backend
      const stored = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      
      // If no subscription, return default free plan state or null
      if (!stored) {
        return {
          userId,
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          cancelAtPeriodEnd: false,
          paymentProvider: 'none'
        };
      }
      
      return stored;
    } catch (error) {
      errorLogger.log(error, { context: 'getSubscription', userId });
      return null;
    }
  },

  subscribeToPlan: async (userId: string, planId: string): Promise<Subscription> => {
    // Mock successful subscription
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Invalid plan ID');

    const newSubscription: Subscription = {
      userId,
      plan: plan.id as 'monthly' | 'yearly',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (plan.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      paymentProvider: 'revenuecat', // Simulating external provider
      providerSubscriptionId: generateSecureSessionId('sub')
    };

    await storage.setItem(SUBSCRIPTION_KEY, newSubscription);
    return newSubscription;
  },

  cancelSubscription: async (userId: string): Promise<void> => {
    const current = await subscriptionService.getSubscription(userId);
    if (!current) return;

    const updated: Subscription = {
      ...current,
      cancelAtPeriodEnd: true
    };

    await storage.setItem(SUBSCRIPTION_KEY, updated);
  },

  restorePurchases: async (userId: string): Promise<Subscription | null> => {
    // Simulate finding a previous purchase
    return await subscriptionService.getSubscription(userId);
  },

  checkHasAccess: async (userId: string): Promise<boolean> => {
    const sub = await subscriptionService.getSubscription(userId);
    return sub?.status === 'active' || sub?.status === 'canceling';
  }
};
