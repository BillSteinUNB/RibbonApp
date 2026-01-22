import { AppError } from '../types/errors';

/**
 * Error formatting utilities for user-friendly messages
 */

/**
 * Sensitive patterns that should be stripped from user-facing errors in production
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /[\/\\][a-zA-Z0-9_\-\/\\]+\.(ts|js|tsx|jsx)/g,  // File paths
  /at\s+[\w.<>]+\s+\([^)]+\)/g,                    // Stack trace lines
  /line\s+\d+/gi,                                  // Line numbers
  /column\s+\d+/gi,                                // Column numbers
  /postgres|postgresql|mysql|sqlite/gi,  // Database references
  /api[_-]?key|secret|token|password/gi,          // Credential references
];

/**
 * Sanitize error message to prevent information leakage in production
 */
function sanitizeErrorMessage(message: string): string {
  if (__DEV__) return message; // Allow full details in development

  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }
  return sanitized;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // AppError instances
  if (error instanceof AppError) {
    return sanitizeErrorMessage(getUserFriendlyMessage(error));
  }

  // Error instances
  if (error instanceof Error) {
    return sanitizeErrorMessage(getUserFriendlyMessageFromError(error));
  }

  // String errors
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error);
  }

  // Unknown types
  return 'An unexpected error occurred';
}

/**
 * Get user-friendly message for AppError
 */
function getUserFriendlyMessage(error: AppError): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    AUTH_ERROR: 'Authentication failed. Please sign in again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'A server error occurred. Please try again later.',
    STORAGE_ERROR: 'Unable to save data. Please try again.',
  };

  return messages[error.code || ''] || error.message || 'An unexpected error occurred';
}

/**
 * Get user-friendly message from standard Error
 */
function getUserFriendlyMessageFromError(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Timeout errors
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Return original message if specific pattern not matched
  return error.message;
}

/**
 * Format error with context (for debugging)
 */
export function formatErrorWithDetails(error: unknown, context?: Record<string, unknown>): string {
  const baseMessage = formatErrorMessage(error);

  if (__DEV__ && context) {
    return `${baseMessage}\n\nDetails: ${JSON.stringify(context, null, 2)}`;
  }

  return baseMessage;
}

/**
 * Extract error code
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }

  return undefined;
}

/**
 * Extract error HTTP status code
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  return undefined;
}

/**
 * Check if error is recoverable (user can try again)
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return [
      'NETWORK_ERROR',
      'RATE_LIMIT_ERROR',
      'SERVER_ERROR',
    ].includes(error.code || '');
  }

  const message = String(error).toLowerCase();
  return message.includes('network') || message.includes('timeout');
}

/**
 * Check if error is auth-related (should redirect to login)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === 'AUTH_ERROR' || error.statusCode === 401;
  }

  const message = String(error).toLowerCase();
  return message.includes('unauthorized') || message.includes('auth');
}

/**
 * Check if error is validation-related (form error)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === 'VALIDATION_ERROR' || error.statusCode === 400;
  }

  const message = String(error).toLowerCase();
  return message.includes('validation') || message.includes('invalid');
}

/**
 * Create error log entry
 */
export function createErrorLogEntry(error: unknown, context?: Record<string, unknown>): {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
} {
  return {
    message: formatErrorMessage(error),
    code: getErrorCode(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };
}
