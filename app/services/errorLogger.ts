/**
 * Error Logger Service - Local Only
 *
 * Keeps errors in memory and logs to console.
 */

import { AppError } from '../types/errors';
import { logger } from '../utils/logger';

class ErrorLogger {
  private static instance: ErrorLogger | null = null;
  private errors: AppError[] = [];
  private maxErrors: number = 100;

  private constructor() {
    // Intentionally empty
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: AppError | Error | unknown, context?: Record<string, unknown>): void {
    const appError = this.normalizeError(error);

    if (context) {
      appError.details = {
        ...appError.details,
        context,
        timestamp: new Date().toISOString(),
      };
    }

    this.errors.push(appError);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    logger.error('[ErrorLogger]', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
    });
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorsByCode(code: string): AppError[] {
    return this.errors.filter(error => error.code === code);
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

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
      queued: 0,
    };
  }

  async getBackendErrorLogs(_limit: number = 100): Promise<any[]> {
    return [];
  }

  async markErrorResolved(_errorId: string): Promise<boolean> {
    return false;
  }

  async forceReportErrors(): Promise<void> {
    return;
  }

  stopPeriodicReporting(): void {
    return;
  }

  private normalizeError(error: unknown): AppError {
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
}

let _errorLoggerInstance: ErrorLogger | null = null;

function getErrorLoggerInstance(): ErrorLogger {
  if (!_errorLoggerInstance) {
    _errorLoggerInstance = ErrorLogger.getInstance();
  }
  return _errorLoggerInstance;
}

export const errorLogger = new Proxy({} as ErrorLogger, {
  get(_, prop) {
    const instance = getErrorLoggerInstance();
    const value = (instance as unknown as Record<string, unknown>)[prop as string];

    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  },
});

export { getErrorLoggerInstance };
