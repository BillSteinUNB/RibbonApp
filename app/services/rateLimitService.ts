import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Rate Limiting Service
 * Tracks authentication attempts and enforces rate limits to prevent brute force attacks
 */

const STORAGE_KEY = '@ribbon/rate_limit_data';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window for tracking attempts

interface AttemptRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
  consecutiveLockouts: number;
}

interface RateLimitData {
  [email: string]: AttemptRecord;
}

interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
  remainingSeconds: number;
}

class RateLimitService {
  private cache: RateLimitData = {};
  private initialized = false;

  /**
   * Initialize the service by loading data from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        this.cache = JSON.parse(data);
        this.cleanupExpiredRecords();
      }
      this.initialized = true;
    } catch (error) {
      // If loading fails, start with empty cache
      this.cache = {};
      this.initialized = true;
    }
  }

  /**
   * Save current state to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      // Silently fail - rate limiting will still work in-memory
    }
  }

  /**
   * Clean up expired records to prevent storage bloat
   */
  private cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const email of Object.keys(this.cache)) {
      const record = this.cache[email];
      // Remove records that are no longer locked and attempts have expired
      if (
        (!record.lockedUntil || record.lockedUntil < now) &&
        record.firstAttemptAt + ATTEMPT_WINDOW_MS < now
      ) {
        delete this.cache[email];
      }
    }
  }

  /**
   * Get or create an attempt record for an email
   */
  private getRecord(email: string): AttemptRecord {
    const normalizedEmail = email.toLowerCase().trim();
    if (!this.cache[normalizedEmail]) {
      this.cache[normalizedEmail] = {
        attempts: 0,
        firstAttemptAt: Date.now(),
        lockedUntil: null,
        consecutiveLockouts: 0,
      };
    }
    return this.cache[normalizedEmail];
  }

  /**
   * Check if an email is rate limited
   */
  async checkRateLimit(email: string): Promise<RateLimitCheckResult> {
    await this.initialize();
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.getRecord(normalizedEmail);
    const now = Date.now();

    // Check if currently locked
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
        remainingSeconds,
      };
    }

    // Reset if lockout has expired
    if (record.lockedUntil && record.lockedUntil <= now) {
      record.lockedUntil = null;
    }

    // Reset attempts if window has expired
    if (record.firstAttemptAt + ATTEMPT_WINDOW_MS < now) {
      record.attempts = 0;
      record.firstAttemptAt = now;
      record.consecutiveLockouts = 0;
    }

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.attempts);

    return {
      allowed: true,
      remainingAttempts,
      lockedUntil: null,
      remainingSeconds: 0,
    };
  }

  /**
   * Record an authentication attempt
   * @param email - The email being used for auth
   * @param success - Whether the attempt was successful
   */
  async recordAttempt(email: string, success: boolean): Promise<RateLimitCheckResult> {
    await this.initialize();
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.getRecord(normalizedEmail);
    const now = Date.now();

    if (success) {
      // Reset on successful auth
      record.attempts = 0;
      record.firstAttemptAt = now;
      record.lockedUntil = null;
      record.consecutiveLockouts = 0;
      await this.persist();
      return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS,
        lockedUntil: null,
        remainingSeconds: 0,
      };
    }

    // Failed attempt
    record.attempts++;

    // Check if we should lock
    if (record.attempts >= MAX_ATTEMPTS) {
      record.consecutiveLockouts++;
      // Exponential backoff: 15min, 30min, 60min, etc.
      const lockoutMultiplier = Math.min(record.consecutiveLockouts, 4);
      const lockoutDuration = LOCKOUT_DURATION_MS * lockoutMultiplier;
      record.lockedUntil = now + lockoutDuration;
      record.attempts = 0; // Reset attempts for next lockout period
      record.firstAttemptAt = now;

      await this.persist();

      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
        remainingSeconds: Math.ceil(lockoutDuration / 1000),
      };
    }

    await this.persist();

    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - record.attempts,
      lockedUntil: null,
      remainingSeconds: 0,
    };
  }

  /**
   * Format remaining time for display
   */
  formatRemainingTime(seconds: number): string {
    if (seconds <= 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  /**
   * Clear rate limit data for testing or account recovery
   */
  async clearRateLimitData(email?: string): Promise<void> {
    await this.initialize();
    if (email) {
      delete this.cache[email.toLowerCase().trim()];
    } else {
      this.cache = {};
    }
    await this.persist();
  }
}

export const rateLimitService = new RateLimitService();
