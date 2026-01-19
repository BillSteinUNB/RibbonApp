/**
 * Analytics tracking helpers (STUBBED - no-op implementation)
 * GDPR Compliant: All tracking requires explicit user consent
 * 
 * NOTE: This is a stubbed implementation. The full implementation requires
 * the storage service from Phase 5. For now, analytics is disabled by default
 * and all functions are no-ops.
 */

import { logger } from './logger';

interface AnalyticsConsent {
  enabled: boolean;
  consentGiven: boolean;
  consentDate?: string;
}

// In-memory stub storage (will be lost on reload, but that's OK for a stub)
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
  | 'app_start'
  | 'app_background'
  | 'screen_view'
  | 'auth_sign_up'
  | 'auth_sign_in'
  | 'auth_sign_out'
  | 'recipient_create'
  | 'recipient_update'
  | 'recipient_delete'
  | 'gift_generation_start'
  | 'gift_generation_complete'
  | 'gift_generation_fail'
  | 'gift_save'
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
}

/**
 * Track an analytics event (only if user has consented)
 */
export async function trackEvent(eventName: AnalyticsEvent, properties?: Record<string, any>): Promise<void> {
  // Check if user has given consent before tracking
  const enabled = await isAnalyticsEnabled();
  if (!enabled) {
    return;
  }

  // In production, this would send to your analytics provider
  // For now, we'll just log in development mode
  logger.log('[Analytics]', {
    event_name: eventName,
    properties,
    timestamp: new Date().toISOString(),
  });

  // Future implementation:
  // - Send to Firebase Analytics
  // - Send to Mixpanel/Amplitude
  // - Batch events for efficiency
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

/**
 * Track auth events
 */
export const analyticsAuth = {
  signUp: (method?: string) => trackEvent('auth_sign_up', { method }),
  signIn: (method?: string) => trackEvent('auth_sign_in', { method }),
  signOut: () => trackEvent('auth_sign_out'),
};

/**
 * Track recipient events
 */
export const analyticsRecipient = {
  create: (properties?: { relationship?: string; hasInterests?: boolean }) => 
    trackEvent('recipient_create', properties),
  update: (properties?: { fieldUpdated?: string }) => 
    trackEvent('recipient_update', properties),
  delete: () => trackEvent('recipient_delete'),
};

/**
 * Track gift generation events
 */
export const analyticsGifts = {
  generationStart: (properties?: { recipientId?: string; requestCount?: number }) => 
    trackEvent('gift_generation_start', properties),
  generationComplete: (properties?: { 
    recipientId?: string; 
    giftCount?: number; 
    durationMs?: number;
    category?: string;
  }) => 
    trackEvent('gift_generation_complete', properties),
  generationFail: (properties?: { error?: string; recipientId?: string }) => 
    trackEvent('gift_generation_fail', properties),
  save: (properties?: { giftCategory?: string }) => 
    trackEvent('gift_save', properties),
  unsave: () => trackEvent('gift_unsave'),
  markPurchased: (properties?: { giftCategory?: string; priceRange?: string }) => 
    trackEvent('gift_purchase_mark', properties),
};

/**
 * Track subscription events
 */
export const analyticsSubscription = {
  view: (plan?: string) => trackEvent('subscription_view', { plan }),
  start: (plan: string) => trackEvent('subscription_start', { plan }),
  complete: (plan: string, method?: string) => 
    trackEvent('subscription_complete', { plan, method }),
  cancel: (reason?: string) => trackEvent('subscription_cancel', { reason }),
};

/**
 * Track upgrade prompts
 */
export const analyticsUpgrade = {
  view: (trigger?: string) => trackEvent('upgrade_prompt_view', { trigger }),
  dismiss: (reason?: string) => trackEvent('upgrade_prompt_dismiss', { reason }),
  accept: (plan?: string) => trackEvent('upgrade_prompt_accept', { plan }),
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
  logger.log('[Analytics] All analytics data cleared');
}
