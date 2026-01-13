/**
 * Phase 1: Foundation & Data Layer
 * 
 * Master export file for all Phase 1 components.
 * Import from this file to access the entire foundation layer.
 */

// ===== STORES =====
export { useAuthStore, selectUser, selectIsAuthenticated, selectTrialUsesRemaining, selectIsPremium, selectUserPreferences } from './store/authStore';
export type { User, UserProfile } from './store/authStore';
export type { UserPreferences } from './types/settings';

export { useRecipientStore, selectRecipients, selectActiveRecipient, selectRecipientById } from './store/recipientStore';
export type { Recipient, GiftIdea } from './store/recipientStore';

export { useUIStore, selectActiveModal, selectModalData, selectIsLoadingOverlay, selectTheme } from './store/uiStore';
export type { ModalType } from './store/uiStore';

export { useGiftStore } from './store/giftStore';

// ===== SERVICES =====
export { storage } from './services/storage';

export { apiClient } from './services/apiClient';
export type { APIClientConfig } from './services/apiClient';

export { errorLogger } from './services/errorLogger';

// ===== TYPES =====
export type { ApiResponse, ApiError, PaginatedResponse, ApiRequestConfig } from './types/api';

export type {
  AppError,
  NetworkError,
  AuthError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  StorageError,
  ErrorType,
} from './types/errors';

// ===== CONFIG =====
export { 
  ENV, 
  API_CONFIG, 
  AI_CONFIG, 
  BUSINESS_CONFIG, 
  FEATURE_FLAGS, 
  UI_CONFIG, 
  STORAGE_CONFIG,
  validateConfig,
  getConfig,
} from './config/app.config';

export { 
  getEnvVar, 
  getAllEnvVars, 
  validateEnvVars, 
  isDevelopment, 
  isProduction, 
  getEnvironmentName 
} from './config/env';

// ===== UTILS =====
export {
  validateEmail,
  validateRequired,
  validateLength,
  composeValidators,
  validatePhone,
  validateRange,
  validateURL,
  validateDate,
  validateArrayMinLength,
} from './utils/validation';

export { 
  debounce, 
  throttle, 
  createDebouncedFunction, 
  createThrottledFunction 
} from './utils/debounce';

export { 
  deepMerge, 
  shallowClone, 
  deepClone, 
  pick, 
  omit 
} from './utils/merge';

export {
  formatDate,
  getRelativeTime,
  getCountdown,
  isToday,
  isThisWeek,
  formatDateRange,
  parseDate,
  startOfDay,
  endOfDay,
} from './utils/dates';

export {
  formatErrorMessage,
  formatErrorWithDetails,
  getErrorCode,
  getErrorStatusCode,
  isRecoverableError,
  isAuthError,
  isValidationError,
  createErrorLogEntry,
} from './utils/errorMessages';

export {
  trackEvent,
  trackScreenView,
  analyticsAuth,
  analyticsRecipient,
  analyticsGifts,
  analyticsSubscription,
  analyticsUpgrade,
  analyticsBatcher,
} from './utils/analytics';
export type { AnalyticsEvent, AnalyticsPayload } from './utils/analytics';

// ===== CONSTANTS =====
export { STORAGE_KEYS, STORAGE_VERSION } from './constants/storageKeys';
