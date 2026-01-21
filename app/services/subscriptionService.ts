import Purchases, { 
  PurchasesPackage, 
  CustomerInfo, 
  PurchasesOfferings,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { Subscription } from '../types/subscription';
import { storage } from './storage';
import { logger } from '../utils/logger';
import { errorLogger } from './errorLogger';

const SUBSCRIPTION_KEY = 'user_subscription';
const ENTITLEMENT_ID = 'premium';

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

class SubscriptionService {
  private isInitialized = false;
  private offerings: PurchasesOfferings | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    
    if (!apiKey) {
      logger.warn('[Subscription] RevenueCat API key not configured');
      return;
    }

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      await Purchases.configure({ apiKey });
      this.isInitialized = true;
      logger.log('[Subscription] RevenueCat initialized successfully');
    } catch (error) {
      errorLogger.log(error, { context: 'RevenueCat initialization' });
    }
  }

  isConfigured(): boolean {
    return this.isInitialized;
  }

  async getOfferings(): Promise<PurchasesOfferings | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      return null;
    }

    try {
      this.offerings = await Purchases.getOfferings();
      return this.offerings;
    } catch (error) {
      errorLogger.log(error, { context: 'getOfferings' });
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'RevenueCat not initialized' };
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        await this.syncSubscriptionToStorage(customerInfo);
        return { success: true, customerInfo };
      }
      
      return { success: false, error: 'Purchase completed but entitlement not active' };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, error: 'Purchase cancelled' };
      }
      errorLogger.log(error, { context: 'purchasePackage' });
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async restorePurchases(): Promise<{ success: boolean; isPremium: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, isPremium: false, error: 'RevenueCat not initialized' };
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
      
      if (isPremium) {
        await this.syncSubscriptionToStorage(customerInfo);
      }
      
      return { success: true, isPremium };
    } catch (error: any) {
      errorLogger.log(error, { context: 'restorePurchases' });
      return { success: false, isPremium: false, error: error.message || 'Restore failed' };
    }
  }

  async checkSubscriptionStatus(): Promise<{ isPremium: boolean; expirationDate?: Date }> {
    if (!this.isInitialized) {
      return { isPremium: false };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      
      if (premiumEntitlement) {
        return {
          isPremium: true,
          expirationDate: premiumEntitlement.expirationDate 
            ? new Date(premiumEntitlement.expirationDate) 
            : undefined,
        };
      }
      
      return { isPremium: false };
    } catch (error) {
      errorLogger.log(error, { context: 'checkSubscriptionStatus' });
      return { isPremium: false };
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      errorLogger.log(error, { context: 'setUserId' });
    }
  }

  async logout(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await Purchases.logOut();
    } catch (error) {
      errorLogger.log(error, { context: 'logout' });
    }
  }

  private async syncSubscriptionToStorage(customerInfo: CustomerInfo): Promise<void> {
    const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (premiumEntitlement) {
      const subscription: Subscription = {
        userId: customerInfo.originalAppUserId,
        plan: premiumEntitlement.productIdentifier.includes('yearly') ? 'yearly' : 'monthly',
        status: 'active',
        startDate: new Date(premiumEntitlement.originalPurchaseDate),
        endDate: premiumEntitlement.expirationDate ? new Date(premiumEntitlement.expirationDate) : undefined,
        cancelAtPeriodEnd: premiumEntitlement.willRenew === false,
        paymentProvider: Platform.OS === 'ios' ? 'apple' : 'google',
      };
      
      await storage.setItem(SUBSCRIPTION_KEY, subscription);
    }
  }

  async getSubscription(userId: string): Promise<Subscription> {
    try {
      const cached = await storage.getItem<Subscription>(SUBSCRIPTION_KEY);
      if (cached) {
        return cached;
      }
    } catch (error) {
      logger.warn('[Subscription] Failed to get cached subscription:', error);
    }
    return getFreeSubscription(userId);
  }

  async subscribeToPlan(userId: string, planId: string): Promise<Subscription> {
    if (!this.isInitialized) {
      throw new Error('Subscription service not initialized');
    }
    
    const offerings = await this.getOfferings();
    if (!offerings?.current?.availablePackages) {
      throw new Error('No subscription packages available');
    }
    
    const pkg = offerings.current.availablePackages.find(
      p => p.identifier === planId || p.product.identifier === planId
    );
    
    if (!pkg) {
      throw new Error('Package not found');
    }
    
    const result = await this.purchasePackage(pkg);
    if (!result.success) {
      throw new Error(result.error || 'Purchase failed');
    }
    
    return this.getSubscription(userId);
  }

  async cancelSubscription(userId: string): Promise<void> {
    logger.log('[Subscription] To cancel, user should manage subscription through App Store/Play Store');
  }

  async checkHasAccess(userId: string): Promise<boolean> {
    const status = await this.checkSubscriptionStatus();
    return status.isPremium;
  }

  async presentPaywall(): Promise<boolean> {
    logger.log('[Subscription] Present custom paywall - navigate to pricing screen');
    return false;
  }

  async presentPaywallIfNeeded(): Promise<boolean> {
    const status = await this.checkSubscriptionStatus();
    if (!status.isPremium) {
      return this.presentPaywall();
    }
    return false;
  }

  async openCustomerCenter(): Promise<void> {
    logger.log('[Subscription] Customer center - subscription management via store');
  }
}

export const subscriptionService = new SubscriptionService();
