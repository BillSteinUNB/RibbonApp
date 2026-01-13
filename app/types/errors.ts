/**
 * Custom error types for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR');
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication error') {
    super(message, 'AUTH_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Server error occurred') {
    super(message, 'SERVER_ERROR', 500);
  }
}

export class StorageError extends AppError {
  constructor(message: string = 'Storage error occurred') {
    super(message, 'STORAGE_ERROR');
  }
}

export type ErrorType =
  | AppError
  | NetworkError
  | AuthError
  | ValidationError
  | NotFoundError
  | RateLimitError
  | ServerError
  | StorageError;
