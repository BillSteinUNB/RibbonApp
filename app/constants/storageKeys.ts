// Storage keys - centralized constants for all AsyncStorage keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@ribbon/auth_token',
  REFRESH_TOKEN: '@ribbon/refresh_token',
  USER_DATA: '@ribbon/user_data',

  // Recipients (SENSITIVE - contains personal info)
  RECIPIENTS: '@ribbon/recipients',
  ACTIVE_RECIPIENT: '@ribbon/active_recipient',

  // Gifts (SENSITIVE - contains gift history)
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

// Storage key sensitivity levels for encryption
export type StorageKeySensitivity = 'SENSITIVE' | 'SAFE';

export const STORAGE_KEY_SENSITIVITY: Record<keyof typeof STORAGE_KEYS, StorageKeySensitivity> = {
  // Auth - SENSITIVE
  AUTH_TOKEN: 'SENSITIVE',
  REFRESH_TOKEN: 'SENSITIVE',
  USER_DATA: 'SENSITIVE',

  // Recipients - SENSITIVE (contains PII)
  RECIPIENTS: 'SENSITIVE',
  ACTIVE_RECIPIENT: 'SENSITIVE',

  // Gifts - SENSITIVE (contains personal preferences)
  GIFTS: 'SENSITIVE',
  SAVED_GIFTS: 'SENSITIVE',
  PURCHASED_GIFTS: 'SENSITIVE',

  // UI State - SAFE
  THEME: 'SAFE',
  USER_PREFERENCES: 'SAFE',

  // Onboarding - SAFE
  HAS_COMPLETED_ONBOARDING: 'SAFE',
  ONBOARDING_DRAFT: 'SENSITIVE', // Contains draft recipient data

  // Analytics - SAFE
  ANALYTICS_EVENTS: 'SAFE',

  // Config - SAFE
  FEATURE_FLAGS: 'SAFE',

  // Version - SAFE
  STORAGE_VERSION: 'SAFE',
};

// Current storage schema version
export const STORAGE_VERSION = '1.1.0';
