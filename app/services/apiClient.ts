import type { ApiResponse, ApiRequestConfig } from '../types/api';
import { AppError, NetworkError, ServerError, RateLimitError } from '../types/errors';

/**
 * Configuration for the API client
 */
export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

/**
 * Base API Client with retry logic and error handling
 */
class APIClient {
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 15000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };
  }

  /**
   * Calculate delay with exponential backoff and jitter
   * Jitter helps prevent thundering herd when many clients retry simultaneously
   */
  private getRetryDelay(attempt: number): number {
    const baseDelay = this.config.retryDelay * Math.pow(2, attempt);
    const maxDelay = 30000; // Cap at 30 seconds
    const cappedDelay = Math.min(baseDelay, maxDelay);
    // Add ±25% jitter to spread out retries
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(cappedDelay + jitter);
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    if (error instanceof NetworkError) {
      return true;
    }

    if (error instanceof RateLimitError || error?.statusCode === 429) {
      return true;
    }

    if (error?.statusCode && error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }

    return false;
  }

  /**
   * Create abort controller for timeout
   * Returns both the controller and timeout ID for cleanup
   */
  private createAbortController(): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> } {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    return { controller, timeoutId };
  }

  /**
   * Handle fetch response
   */
  private async handleResponse<T>(response: Response, attempt: number): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorData: any = {};

      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }
      } else {
        errorData = { message: response.statusText || 'Request failed' };
      }

      const error = this.createError(errorData, response.status);

      if (this.shouldRetry(error, attempt)) {
        throw error;
      }

      throw error;
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data as ApiResponse<T>;
    }

    throw new AppError('Invalid response content type');
  }

  /**
   * Create appropriate error from response
   */
  private createError(errorData: any, statusCode?: number): AppError {
    const message = errorData?.message || 'An error occurred';
    const code = errorData?.code;

    if (statusCode === 401) {
      return new AppError(message, 'AUTH_ERROR', statusCode);
    }

    if (statusCode === 403) {
      return new AppError(message, 'PERMISSION_ERROR', statusCode);
    }

    if (statusCode === 404) {
      return new AppError(message, 'NOT_FOUND', statusCode);
    }

    if (statusCode === 429) {
      return new RateLimitError(message);
    }

    if (statusCode && statusCode >= 500) {
      return new ServerError(message);
    }

    return new AppError(message, code, statusCode, errorData?.details);
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig,
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const url = this.config.baseURL + endpoint;

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.config.headers,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response, attempt);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        const newError = new AppError('Request timeout');
        if (this.shouldRetry(newError, attempt)) {
          await this.delay(this.getRetryDelay(attempt));
          return this.request<T>(endpoint, config, attempt + 1);
        }
        throw newError;
      }

      if (!error.statusCode) {
        const networkError = new NetworkError(error.message);
        if (this.shouldRetry(networkError, attempt)) {
          await this.delay(this.getRetryDelay(attempt));
          return this.request<T>(endpoint, config, attempt + 1);
        }
        throw networkError;
      }

      if (this.shouldRetry(error, attempt)) {
        await this.delay(this.getRetryDelay(attempt));
        return this.request<T>(endpoint, config, attempt + 1);
      }

      throw error;
    } finally {
      // Always clear timeout to prevent memory leaks
      clearTimeout(timeoutId);
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Update base configuration
   */
  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.config.headers = {
      ...this.config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    const { Authorization, ...rest } = this.config.headers || {};
    this.config.headers = rest;
  }
}

export const apiClient = new APIClient();
