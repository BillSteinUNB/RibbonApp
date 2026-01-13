// Storage keys - centralized constants for all AsyncStorage keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@ribbon/auth_token',
  REFRESH_TOKEN: '@ribbon/refresh_token',
  USER_DATA: '@ribbon/user_data',
  
  // Recipients
  RECIPIENTS: '@ribbon/recipients',
  ACTIVE_RECIPIENT: '@ribbon/active_recipient',
  
  // Gifts
  GIFTS: '@ribbon/gifts',
  SAVED_GIFTS: '@ribbon/saved_gifts',
  PURCHASED_GIFTS: '@ribbon/purchased_gifts',
  
  // UI State
  THEME: '@ribbon/theme',
  USER_PREFERENCES: '@ribbon/user_preferences',
  
  // Onboarding
  HAS_COMPLETED_ONBOARDING: '@ribbon/has_completed_onboarding',
  ONBOARDING_DRAFT: '@ribbon/onboarding_draft',
  
  // Analytics
  ANALYTICS_EVENTS: '@ribbon/analytics_events',
  
  // Config
  FEATURE_FLAGS: '@ribbon/feature_flags',
  
  // Version
  STORAGE_VERSION: '@ribbon/storage_version',
} as const;

// Current storage schema version
export const STORAGE_VERSION = '1.0.0';
