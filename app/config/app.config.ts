/**
 * Application Configuration
 * Centralized configuration management for the RibbonApp
 */

/**
 * Environment-specific settings
 */
export const ENV = {
  isDevelopment: __DEV__,
  // Will be set by process.env in a real build
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
  AI_API_KEY: process.env.EXPO_PUBLIC_AI_API_KEY || '',
} as const;

/**
 * API Endpoints Configuration
 */
export const API_CONFIG = {
  baseURL: ENV.isDevelopment 
    ? 'http://localhost:3000/api'
    : 'https://api.ribbonapp.com/api',
  
  endpoints: {
    auth: {
      signUp: '/auth/sign-up',
      signIn: '/auth/sign-in',
      signOut: '/auth/sign-out',
      refreshToken: '/auth/refresh',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    recipients: {
      list: '/recipients',
      create: '/recipients',
      get: (id: string) => `/recipients/${id}`,
      update: (id: string) => `/recipients/${id}`,
      delete: (id: string) => `/recipients/${id}`,
    },
    gifts: {
      generate: '/gifts/generate',
      save: '/gifts/save',
      unsave: (id: string) => `/gifts/${id}/unsave`,
      markPurchased: (id: string) => `/gifts/${id}/purchase`,
    },
    subscription: {
      plans: '/subscription/plans',
      subscribe: '/subscription/subscribe',
      cancel: '/subscription/cancel',
      status: '/subscription/status',
    },
  },
  timeout: 30000,
  retries: 3,
} as const;

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  apiKey: ENV.AI_API_KEY,
  model: 'gpt-4-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  defaultRequestCount: 5,
} as const;

/**
 * Business Rules Configuration
 */
export const BUSINESS_CONFIG = {
  trial: {
    freeUses: 5,
    resetPeriodDays: 30,
  },
  subscription: {
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month' as const,
        features: [
          '5 free gift generations',
          '1 recipient',
          'Basic support',
        ],
        popular: false,
      },
      {
        id: 'monthly',
        name: 'Premium Monthly',
        price: 9.99,
        currency: 'USD',
        interval: 'month' as const,
        features: [
          'Unlimited gift generations',
          'Unlimited recipients',
          'Gift history tracking',
          'Priority support',
          'Early access to new features',
        ],
        popular: false,
      },
      {
        id: 'yearly',
        name: 'Premium Yearly',
        price: 79.99,
        currency: 'USD',
        interval: 'year' as const,
        features: [
          'Unlimited gift generations',
          'Unlimited recipients',
          'Gift history tracking',
          'Priority support',
          'Early access to new features',
          'Save 33% vs monthly',
        ],
        popular: true,
      },
    ],
  },
} as const;

/**
 * Feature Flags Configuration
 * Allows turning features on/off without code changes
 */
export const FEATURE_FLAGS = {
  // Core features
  authEnabled: true,
  recipientManagement: true,
  giftGeneration: true,
  
  // Premium features
  subscriptionEnabled: true,
  affiliateLinks: false, // Phase 5
  
  // Experimental features
  aiTemperatureControl: false,
  giftComparison: false,
  
  // Analytics (enable for development only)
  debugMode: ENV.isDevelopment,
  performanceMonitoring: ENV.isDevelopment,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  animation: {
    defaultDuration: 300,
    slowDuration: 500,
  },
  onboarding: {
    maxRecipients: 10, // Limit in free tier
    draftAutoSaveDelay: 1000, // ms
  },
  pagination: {
    defaultPageSize: 20,
    giftPageSize: 10,
  },
} as const;

/**
 * Storage Configuration
 */
export const STORAGE_CONFIG = {
  maxHistoryItems: 100,
  cacheExpiryHours: 24,
  encryptionEnabled: false, // Enable when implementing encryption
} as const;

/**
 * Validate required environment variables on startup
 */
export function validateConfig(): void {
  const requiredEnvVars: string[] = [];

  if (FEATURE_FLAGS.giftGeneration && !ENV.AI_API_KEY) {
    requiredEnvVars.push('EXPO_PUBLIC_AI_API_KEY');
  }

  if (requiredEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${requiredEnvVars.join('\n')}\n` +
      'Please set these in your .env file.'
    );
  }
}

/**
 * Get configuration by name
 */
export function getConfig<T>(name: keyof typeof appConfig): T {
  return appConfig[name] as T;
}

/**
 * Combine all configurations
 */
const appConfig = {
  ENV,
  API_CONFIG,
  AI_CONFIG,
  BUSINESS_CONFIG,
  FEATURE_FLAGS,
  UI_CONFIG,
  STORAGE_CONFIG,
} as const;

export default appConfig;
