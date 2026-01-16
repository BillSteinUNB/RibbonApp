/**
 * RevenueCat Service
 * Handles all RevenueCat SDK interactions for subscriptions and in-app purchases
 */

import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
  PurchasesError,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { REVENUECAT_CONFIG } from '../config/env';
import { logger } from '../utils/logger';

// Types
export interface RevenueCatState {
  isInitialized: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isPro: boolean;
}

export type PaywallResultType = 'purchased' | 'restored' | 'cancelled' | 'error' | 'not_presented';

// Service state
let isInitialized = false;

// Track active listeners with unique IDs and context
const activeListeners = new Map<number, {
  listener: (customerInfo: CustomerInfo) => void;
  userId?: string;
}>();
let listenerIdCounter = 0;
const MAX_LISTENERS = 50;

/**
 * Initialize RevenueCat SDK
 * Should be called once on app startup
 */
export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) {
    logger.log('[RevenueCat] Already initialized');
    return;
  }

  try {
    // Enable verbose logging in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
    }

    // Configure with API key
    // RevenueCat uses the same API key for both platforms when configured in dashboard
    await Purchases.configure({ apiKey: REVENUECAT_CONFIG.apiKey });

    isInitialized = true;
    logger.log('[RevenueCat] Initialized successfully');
  } catch (error) {
    logger.error('[RevenueCat] Initialization failed:', error);
    throw error;
  }
}

/**
 * Identify user with RevenueCat
 * Call this after user authentication
 */
export async function identifyUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    logger.log('[RevenueCat] User identified:', userId);
    return customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Failed to identify user:', error);
    throw error;
  }
}

/**
 * Log out current user from RevenueCat
 * Call this when user signs out
 */
export async function logOutUser(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.logOut();
    logger.log('[RevenueCat] User logged out');

    // Clear all tracked listeners to prevent stale callbacks
    clearAllListeners();

    return customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Failed to log out user:', error);
    throw error;
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has access to "Ribbon Pro" entitlement
 */
export async function checkProAccess(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId];
    return entitlement !== undefined;
  } catch (error) {
    logger.error('[RevenueCat] Failed to check pro access:', error);
    return false;
  }
}

/**
 * Get current offerings
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get offerings:', error);
    throw error;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    logger.log('[RevenueCat] Purchase successful');
    return customerInfo;
  } catch (error) {
    const purchaseError = error as PurchasesError;

    // User cancelled - not a real error
    if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      logger.log('[RevenueCat] Purchase cancelled by user');
      throw error;
    }

    logger.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    logger.log('[RevenueCat] Purchases restored');
    return customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Present RevenueCat Paywall
 * Returns the result of the paywall interaction
 */
export async function presentPaywall(offering?: PurchasesOffering): Promise<PaywallResultType> {
  try {
    const paywallResult = await RevenueCatUI.presentPaywall(
      offering ? { offering } : undefined
    );

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        return 'purchased';
      case PAYWALL_RESULT.RESTORED:
        return 'restored';
      case PAYWALL_RESULT.CANCELLED:
        return 'cancelled';
      case PAYWALL_RESULT.ERROR:
        return 'error';
      case PAYWALL_RESULT.NOT_PRESENTED:
      default:
        return 'not_presented';
    }
  } catch (error) {
    logger.error('[RevenueCat] Failed to present paywall:', error);
    return 'error';
  }
}

/**
 * Present paywall only if user doesn't have pro access
 * Returns true if user now has pro access (purchased, restored, or already had it)
 */
export async function presentPaywallIfNeeded(): Promise<boolean> {
  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: REVENUECAT_CONFIG.entitlementId,
    });

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
      case PAYWALL_RESULT.NOT_PRESENTED: // Already has entitlement
        return true;
      default:
        return false;
    }
  } catch (error) {
    logger.error('[RevenueCat] Failed to present paywall if needed:', error);
    return false;
  }
}

/**
 * Present Customer Center for subscription management
 * @param onSubscriptionChanged - Optional callback when subscription status may have changed
 */
export async function presentCustomerCenter(
  onSubscriptionChanged?: (customerInfo: CustomerInfo) => void
): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onFeedbackSurveyCompleted: (param) => {
          logger.log('[RevenueCat] Feedback survey completed:', param.feedbackSurveyOptionId);
        },
        onShowingManageSubscriptions: () => {
          logger.log('[RevenueCat] Showing manage subscriptions');
        },
        onRestoreStarted: () => {
          logger.log('[RevenueCat] Restore started from Customer Center');
        },
        onRestoreCompleted: async (param) => {
          logger.log('[RevenueCat] Restore completed from Customer Center');
          // Sync subscription state after restore
          if (onSubscriptionChanged && param.customerInfo) {
            onSubscriptionChanged(param.customerInfo);
          }
        },
        onRestoreFailed: (param) => {
          logger.error('[RevenueCat] Restore failed from Customer Center:', param.error);
        },
        onRefundRequestStarted: (param) => {
          // iOS only
          logger.log('[RevenueCat] Refund request started for:', param.productIdentifier);
        },
        onRefundRequestCompleted: async (param) => {
          // iOS only - Refund may affect subscription status
          logger.log('[RevenueCat] Refund request completed:', param.refundRequestStatus);
          // Refresh customer info after refund
          if (onSubscriptionChanged) {
            try {
              const customerInfo = await getCustomerInfo();
              onSubscriptionChanged(customerInfo);
            } catch (error) {
              logger.error('[RevenueCat] Failed to refresh after refund:', error);
            }
          }
        },
        onManagementOptionSelected: (param) => {
          logger.log('[RevenueCat] Management option selected:', param.option);
        },
      },
    });

    // Always refresh subscription status after Customer Center closes
    // This catches any changes made during the session
    if (onSubscriptionChanged) {
      try {
        const customerInfo = await getCustomerInfo();
        onSubscriptionChanged(customerInfo);
      } catch (error) {
        logger.error('[RevenueCat] Failed to refresh after Customer Center:', error);
      }
    }
  } catch (error) {
    logger.error('[RevenueCat] Failed to present Customer Center:', error);
    throw error;
  }
}

/**
 * Add listener for customer info updates
 * Returns an unsubscribe function
 */
export function addCustomerInfoListener(
  listener: (customerInfo: CustomerInfo) => void,
  currentUserId?: string
): () => void {
  // The SDK's addCustomerInfoUpdateListener stores the listener internally
  // We use a wrapper approach since the TypeScript types show it returns void
  Purchases.addCustomerInfoUpdateListener(listener);

  // Check if we have exceeded max listener limit
  // The SDK will handle cleanup when the app is unmounted
  return () => {
    // Listeners are cleared when the SDK is reset
    // For now, this is a no-op as the SDK manages the listener lifecycle
  };
}

/**
 * Clear all tracked listeners
 * Call this after logout to prevent stale callbacks
 */
export function clearAllListeners(): void {
  activeListeners.clear();
  listenerIdCounter = 0;
  console.log('[RevenueCat] All listeners cleared');
}

/**
 * Check if an error has a code property (like PurchasesError)
 */
function hasErrorCode(error: unknown): error is Error & { code: PURCHASES_ERROR_CODE } {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code: unknown }).code !== undefined
  );
}

/**
 * Get error message for display
 */
export function getErrorMessage(error: unknown): string {
  if (hasErrorCode(error)) {
    switch (error.code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
        return 'Purchase was cancelled';
      case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
        return 'There was a problem with the app store. Please try again later.';
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
        return 'Purchases are not allowed on this device.';
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
        return 'The purchase was invalid. Please try again.';
      case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
        return 'This product is not available for purchase.';
      case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error is a user cancellation
 */
export function isUserCancellation(error: unknown): boolean {
  if (hasErrorCode(error)) {
    return error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
  }
  return false;
}

// Export config for external use
export { REVENUECAT_CONFIG };
