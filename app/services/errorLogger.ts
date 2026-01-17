/**
 * Error Logger Service - Safe Lazy Initialization
 *
 * CRITICAL: This file defers all initialization to prevent crashes
 * at JavaScript bundle load time on TestFlight/Production builds.
 *
 * The singleton is NOT instantiated at module level - it uses a lazy proxy.
 */

import { AppError } from '../types/errors';
import { logger } from '../utils/logger';
import { Platform } from 'react-native';

// Lazy supabase loader - do NOT import statically
let _supabaseModule: typeof import('../lib/supabase') | null = null;

async function getSupabase() {
  if (!_supabaseModule) {
    _supabaseModule = await import('../lib/supabase');
  }
  return _supabaseModule.supabase;
}

/**
 * Error Logger Service for tracking and reporting errors to backend
 * Implements Issue #53 - Error Reporting to Backend
 */
class ErrorLogger {
  private static instance: ErrorLogger | null = null;
  private errors: AppError[] = [];
  private maxErrors: number = 100;
  private errorQueue: any[] = [];
  private isReporting = false;
  private reportIntervalMinutes = 5;
  private maxQueueSize = 50;
  private reportTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  private constructor() {
    // DO NOT start anything in constructor - defer to initialize()
  }

  /**
   * Initialize the error logger (called lazily on first use)
   */
  private initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Delay periodic reporting to avoid issues during app startup
    setTimeout(() => {
      try {
        this.startPeriodicReporting();
      } catch (error) {
        console.warn('[ErrorLogger] Failed to start periodic reporting:', error);
      }
    }, 10000); // Wait 10 seconds before starting (increased from 5)
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error (and queue for backend reporting)
   */
  log(error: AppError | Error | any, context?: any): void {
    // Ensure initialization on first use
    this.initialize();

    const appError = this.normalizeError(error);

    // Add context to error details
    if (context) {
      appError.details = {
        ...appError.details,
        context,
        timestamp: new Date().toISOString(),
      };
    }

    // Add to error history
    this.errors.push(appError);

    // Keep only most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Queue for backend reporting
    this.queueForReporting(appError, context);

    // Console log for debugging
    logger.error('[ErrorLogger]', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
    });
  }

  /**
   * Queue error for backend reporting
   */
  private queueForReporting(error: AppError, context?: any): void {
    const errorData = {
      message: error.message,
      type: error.name || 'Error',
      code: error.code,
      stack: error.stack,
      context: context,
      component: context?.component,
      method: context?.context,
      timestamp: new Date().toISOString(),
    };

    this.errorQueue.push(errorData);

    // Report immediately if queue is full
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.reportErrors();
    }
  }

  /**
   * Start periodic error reporting
   */
  private startPeriodicReporting(): void {
    const reportInterval = this.reportIntervalMinutes * 60 * 1000;

    this.reportTimer = setInterval(() => {
      this.reportErrors();
    }, reportInterval);

    logger.log(`[ErrorLogger] Started periodic reporting (every ${this.reportIntervalMinutes} minutes)`);
  }

  /**
   * Report queued errors to backend
   */
  private async reportErrors(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const supabase = await getSupabase();
      const errorsToReport = [...this.errorQueue];
      this.errorQueue = []; // Clear queue

      logger.log(`[ErrorLogger] Reporting ${errorsToReport.length} errors to backend...`);

      for (const errorData of errorsToReport) {
        try {
          await supabase.rpc('log_error', {
            p_error_message: errorData.message,
            p_error_type: errorData.type,
            p_error_code: errorData.code,
            p_stack_trace: errorData.stack,
            p_context: errorData.context,
            p_component: errorData.component,
            p_method: errorData.method,
            p_platform: Platform.OS,
            p_app_version: process.env.EXPO_PUBLIC_APP_VERSION || 'unknown',
            p_device_info: this.getDeviceInfo(),
          });

          logger.log('[ErrorLogger] Error reported successfully');
        } catch (error) {
          logger.error('[ErrorLogger] Failed to report error:', error);
          // On failure, add back to queue (limit queue size)
          if (this.errorQueue.length < this.maxQueueSize) {
            this.errorQueue.push(errorData);
          }
        }
      }
    } catch (error) {
      logger.error('[ErrorLogger] Error reporting batch failed:', error);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * Get device info for error reporting
   */
  private getDeviceInfo(): any {
    const constants = Platform.constants as {
      Model?: string;
      systemName?: string;
      systemVersion?: string;
    };
    return {
      platform: Platform.OS,
      version: Platform.Version,
      model: constants?.Model,
      systemName: constants?.systemName,
      systemVersion: constants?.systemVersion,
    };
  }

  /**
   * Normalize any error to AppError
   */
  private normalizeError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'GENERIC_ERROR',
        undefined,
        { originalError: error.name }
      );
    }

    return new AppError(
      String(error) || 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Get all logged errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clear all logged errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors filtered by code
   */
  getErrorsByCode(code: string): AppError[] {
    return this.errors.filter(error => error.code === code);
  }

  /**
   * Get recent errors (last N)
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCode: Record<string, number>;
    recent: AppError[];
    queued: number;
  } {
    const byCode: Record<string, number> = {};

    this.errors.forEach(error => {
      const code = error.code || 'UNKNOWN';
      byCode[code] = (byCode[code] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byCode,
      recent: this.getRecentErrors(5),
      queued: this.errorQueue.length,
    };
  }

  /**
   * Get error logs from backend (for admin/support)
   */
  async getBackendErrorLogs(limit: number = 100): Promise<any[]> {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('get_user_error_logs', {
        p_limit: limit,
        p_offset: 0,
      });

      if (error) {
        logger.error('[ErrorLogger] Failed to fetch error logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[ErrorLogger] getBackendErrorLogs error:', error);
      return [];
    }
  }

  /**
   * Mark error as resolved
   */
  async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('mark_error_resolved', {
        p_error_id: errorId,
      });

      if (error) {
        logger.error('[ErrorLogger] Failed to mark error as resolved:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      logger.error('[ErrorLogger] markErrorResolved error:', error);
      return false;
    }
  }

  /**
   * Force report all queued errors immediately
   */
  async forceReportErrors(): Promise<void> {
    await this.reportErrors();
  }

  /**
   * Stop periodic reporting (call on app cleanup)
   */
  stopPeriodicReporting(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
      logger.log('[ErrorLogger] Stopped periodic reporting');
    }
  }
}

// DO NOT instantiate at module level!
// Use lazy proxy instead for backward compatibility
let _errorLoggerInstance: ErrorLogger | null = null;

function getErrorLoggerInstance(): ErrorLogger {
  if (!_errorLoggerInstance) {
    _errorLoggerInstance = ErrorLogger.getInstance();
  }
  return _errorLoggerInstance;
}

/**
 * Lazy proxy that defers instantiation until first method call
 * This prevents any code from running at module evaluation time
 */
export const errorLogger = new Proxy({} as ErrorLogger, {
  get(_, prop) {
    const instance = getErrorLoggerInstance();
    const value = (instance as any)[prop];

    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  },
});

// Also export the getter for explicit lazy loading
export { getErrorLoggerInstance };
