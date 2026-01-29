/**
 * Analytics tracking helpers - RevenueCat + Supabase implementation
 * GDPR Compliant: All tracking requires explicit user consent
 * 
 * This implementation uses:
 * - RevenueCat for purchase/subscription events (already integrated)
 * - Supabase Edge Functions for custom event tracking
 * - Purchases.setAttributes for user properties
 */

import { logger } from './logger';
import Purchases from 'react-native-purchases';

/**
 * Hash an identifier to prevent PII from being sent to analytics.
 * Uses a simple non-reversible hash suitable for analytics grouping.
 */
function hashId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36);
}

interface AnalyticsConsent {
  enabled: boolean;
  consentGiven: boolean;
  consentDate?: string;
}

// In-memory consent storage
let consentState: AnalyticsConsent = { enabled: false, consentGiven: false };

/**
 * Check if analytics is enabled (user has given consent)
 */
export async function isAnalyticsEnabled(): Promise<boolean> {
  return consentState.enabled === true && consentState.consentGiven === true;
}

/**
 * Set analytics consent
 */
export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  consentState = {
    enabled,
    consentGiven: enabled,
    consentDate: enabled ? new Date().toISOString() : undefined,
  };
  
  // Set RevenueCat attribute for analytics consent
  try {
    await Purchases.setAttributes({
      analytics_consent: enabled ? 'true' : 'false',
      analytics_consent_date: consentState.consentDate || '',
    });
  } catch (error) {
    logger.warn('[Analytics] Failed to set RevenueCat attributes:', error);
  }
}

/**
 * Get current analytics consent status
 */
export async function getAnalyticsConsent(): Promise<AnalyticsConsent> {
  return consentState;
}

/**
 * Analytics event types
 */
export type AnalyticsEvent =
  // Onboarding funnel
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // Paywall
  | 'paywall_viewed'
  | 'paywall_plan_selected'
  | 'paywall_purchase_started'
  | 'paywall_purchase_completed'
  | 'paywall_purchase_failed'
  | 'paywall_restore_tapped'
  // Core usage
  | 'recipient_created'
  | 'gift_generation_started'
  | 'gift_generation_completed'
  | 'gift_generation_failed'
  | 'gift_saved'
  | 'gift_purchased'
  | 'gift_shop_clicked'
  // Refinement
  | 'refinement_started'
  | 'refinement_completed'
  // Legacy events (for backwards compatibility)
  | 'app_start'
  | 'app_background'
  | 'screen_view'
  | 'auth_sign_up'
  | 'auth_sign_in'
  | 'auth_sign_out'
  | 'recipient_update'
  | 'recipient_delete'
  | 'gift_unsave'
  | 'gift_purchase_mark'
  | 'subscription_view'
  | 'subscription_start'
  | 'subscription_complete'
  | 'subscription_cancel'
  | 'upgrade_prompt_view'
  | 'upgrade_prompt_dismiss'
  | 'upgrade_prompt_accept';

/**
 * Analytics event payload
 */
export interface AnalyticsPayload {
  event_name: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp?: string;
  user_id?: string;
  session_id?: string;
}

// Session ID for grouping events
let sessionId: string | null = null;

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

/**
 * Reset session ID (call on app start)
 */
export function resetSession(): void {
  sessionId = null;
}

/**
 * Send event to Supabase Edge Function
 */
async function sendToSupabase(payload: AnalyticsPayload): Promise<void> {
  try {
    // In production, this would call your Supabase Edge Function
    // For now, we log to console in development
    if (__DEV__) {
      logger.log('[Analytics Event]', payload);
    }
    
    // TODO: Implement actual Supabase Edge Function call
    // const response = await fetch('https://your-project.supabase.co/functions/v1/track-event', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${supabaseAnonKey}`,
    //   },
    //   body: JSON.stringify(payload),
    // });
  } catch (error) {
    logger.warn('[Analytics] Failed to send event:', error);
  }
}

/**
 * Track an analytics event (only if user has consented)
 */
export async function trackEvent(
  eventName: AnalyticsEvent, 
  properties?: Record<string, any>,
  userId?: string
): Promise<void> {
  // Check if user has given consent before tracking
  const enabled = await isAnalyticsEnabled();
  if (!enabled) {
    return;
  }

  // Strip PII from properties before sending
  const sanitizedProperties = { ...(properties || {}) };
  delete sanitizedProperties.recipientId;
  delete sanitizedProperties.relationship;

  const payload: AnalyticsPayload = {
    event_name: eventName,
    properties: sanitizedProperties,
    timestamp: new Date().toISOString(),
    user_id: userId ? hashId(userId) : undefined,
    session_id: getSessionId(),
  };

  // Send to Supabase
  await sendToSupabase(payload);

  // Also log in development
  logger.log('[Analytics]', payload);
}

/**
 * Track screen view
 */
export function trackScreenView(screenName: string, properties?: Record<string, any>): void {
  trackEvent('screen_view', {
    screen_name: screenName,
    ...properties,
  });
}

// ============================================
// ONBOARDING FUNNEL EVENTS
// ============================================

/**
 * Track onboarding step viewed
 */
export const analyticsOnboarding = {
  stepViewed: (step: 'hook' | 'value' | 'how-it-works' | 'social-proof' | 'paywall', userId?: string) =>
    trackEvent('onboarding_step_viewed', { step }, userId),
  
  completed: (plan: string, userId?: string) =>
    trackEvent('onboarding_completed', { plan }, userId),
  
  skipped: (lastStep: string, userId?: string) =>
    trackEvent('onboarding_skipped', { lastStep }, userId),
};

// ============================================
// PAYWALL EVENTS
// ============================================

/**
 * Track paywall events
 */
export const analyticsPaywall = {
  viewed: (userId?: string) =>
    trackEvent('paywall_viewed', {}, userId),
  
  planSelected: (plan: string, userId?: string) =>
    trackEvent('paywall_plan_selected', { plan }, userId),
  
  purchaseStarted: (plan: string, userId?: string) =>
    trackEvent('paywall_purchase_started', { plan }, userId),
  
  purchaseCompleted: (plan: string, userId?: string) =>
    trackEvent('paywall_purchase_completed', { plan }, userId),
  
  purchaseFailed: (plan: string, error: string, userId?: string) =>
    trackEvent('paywall_purchase_failed', { plan, error }, userId),
  
  restoreTapped: (userId?: string) =>
    trackEvent('paywall_restore_tapped', {}, userId),
};

// ============================================
// CORE USAGE EVENTS
// ============================================

/**
 * Track recipient events
 */
export const analyticsRecipient = {
  create: (properties?: { relationship?: string; interestCount?: number }, userId?: string) => 
    trackEvent('recipient_created', properties, userId),
  update: (properties?: { fieldUpdated?: string }, userId?: string) => 
    trackEvent('recipient_update', properties, userId),
  delete: (userId?: string) => 
    trackEvent('recipient_delete', {}, userId),
};

/**
 * Track gift generation events
 */
export const analyticsGifts = {
  generationStart: (properties?: { occasion?: string; recipientId?: string }, userId?: string) => 
    trackEvent('gift_generation_started', properties, userId),
  generationComplete: (properties?: { 
    giftCount?: number; 
    durationMs?: number;
    recipientId?: string;
  }, userId?: string) => 
    trackEvent('gift_generation_completed', properties, userId),
  generationFail: (properties?: { error?: string; recipientId?: string }, userId?: string) => 
    trackEvent('gift_generation_failed', properties, userId),
  save: (properties?: { category?: string; giftName?: string }, userId?: string) => 
    trackEvent('gift_saved', properties, userId),
  unsave: (userId?: string) => 
    trackEvent('gift_unsave', {}, userId),
  markPurchased: (properties?: { category?: string; priceRange?: string }, userId?: string) => 
    trackEvent('gift_purchased', properties, userId),
  shopClicked: (properties?: { giftName?: string; category?: string }, userId?: string) =>
    trackEvent('gift_shop_clicked', properties, userId),
};

// ============================================
// REFINEMENT EVENTS
// ============================================

/**
 * Track refinement events
 */
export const analyticsRefinement = {
  started: (sessionId: string, userId?: string) =>
    trackEvent('refinement_started', { sessionId }, userId),
  completed: (properties?: { likedCount?: number; dislikedCount?: number }, userId?: string) =>
    trackEvent('refinement_completed', properties, userId),
};

// ============================================
// LEGACY EVENTS (for backwards compatibility)
// ============================================

/**
 * Track auth events
 */
export const analyticsAuth = {
  signUp: (method?: string, userId?: string) => trackEvent('auth_sign_up', { method }, userId),
  signIn: (method?: string, userId?: string) => trackEvent('auth_sign_in', { method }, userId),
  signOut: (userId?: string) => trackEvent('auth_sign_out', {}, userId),
};

/**
 * Track subscription events
 */
export const analyticsSubscription = {
  view: (plan?: string, userId?: string) => trackEvent('subscription_view', { plan }, userId),
  start: (plan: string, userId?: string) => trackEvent('subscription_start', { plan }, userId),
  complete: (plan: string, method?: string, userId?: string) => 
    trackEvent('subscription_complete', { plan, method }, userId),
  cancel: (reason?: string, userId?: string) => trackEvent('subscription_cancel', { reason }, userId),
};

/**
 * Track upgrade prompts
 */
export const analyticsUpgrade = {
  view: (trigger?: string, userId?: string) => trackEvent('upgrade_prompt_view', { trigger }, userId),
  dismiss: (reason?: string, userId?: string) => trackEvent('upgrade_prompt_dismiss', { reason }, userId),
  accept: (plan?: string, userId?: string) => trackEvent('upgrade_prompt_accept', { plan }, userId),
};

/**
 * Batch events for efficiency (useful for offline scenarios)
 */
class AnalyticsBatcher {
  private events: AnalyticsPayload[] = [];
  private maxBatchSize: number = 50;
  private flushInterval: number = 5000; // 5 seconds
  private batchTimeout: NodeJS.Timeout | null = null;

  /**
   * Add event to batch
   */
  add(event: AnalyticsPayload): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });

    if (this.events.length >= this.maxBatchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Schedule automatic flush
   */
  private scheduleFlush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Flush events to analytics provider
   */
  flush(): void {
    if (this.events.length === 0) {
      return;
    }

    // Send to analytics provider
    logger.log('[Analytics Batch]', JSON.stringify(this.events, null, 2));

    this.events = [];
  }

  /**
   * Clear all pending events
   */
  clear(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.events = [];
  }
}

export const analyticsBatcher = new AnalyticsBatcher();

/**
 * Clear all analytics data (right to be forgotten - GDPR compliance)
 */
export async function clearAnalyticsData(): Promise<void> {
  analyticsBatcher.clear();
  consentState = { enabled: false, consentGiven: false };
  
  // Clear RevenueCat attributes
  try {
    await Purchases.setAttributes({
      analytics_consent: 'false',
      analytics_consent_date: '',
    });
  } catch (error) {
    logger.warn('[Analytics] Failed to clear RevenueCat attributes:', error);
  }
  
  logger.log('[Analytics] All analytics data cleared');
}
