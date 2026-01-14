import { AppError } from '../types/errors';
import { logger } from '../utils/logger';

/**
 * Error Logger Service for tracking and reporting errors
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: AppError[] = [];
  private maxErrors: number = 100;

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error
   */
  log(error: AppError | Error | any, context?: any): void {
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
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

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
    };
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();
