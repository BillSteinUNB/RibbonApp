import { AppError } from '../types/errors';

/**
 * Error formatting utilities for user-friendly messages
 */

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // AppError instances
  if (error instanceof AppError) {
    return getUserFriendlyMessage(error);
  }

  // Error instances
  if (error instanceof Error) {
    return getUserFriendlyMessageFromError(error);
  }

  // String errors
  if (typeof error === 'string') {
    return error;
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
export function formatErrorWithDetails(error: unknown, context?: any): string {
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
export function createErrorLogEntry(error: unknown, context?: any): {
  message: string;
  code?: string;
  stack?: string;
  context?: any;
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
