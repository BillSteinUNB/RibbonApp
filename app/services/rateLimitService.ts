import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Rate Limiting Service
 * Tracks authentication attempts and enforces rate limits to prevent brute force attacks
 */

const STORAGE_KEY = '@ribbon/rate_limit_data';
const GENERATION_STORAGE_KEY = '@ribbon/generation_limits';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window for tracking attempts

const GENERATION_CONFIG = {
  FREE_DAILY_LIMIT: 5,
  PREMIUM_DAILY_LIMIT: 50,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  REFINEMENT_DAILY_LIMIT: 25, // Premium only
};

interface AttemptRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
  consecutiveLockouts: number;
}

interface RateLimitData {
  [email: string]: AttemptRecord;
}

interface GenerationRecord {
  userId: string;
  generations: number;
  refinements: number;
  windowStart: number;
}

interface GenerationLimitCheckResult {
  allowed: boolean;
  remaining: number;
  windowEndsAt: number;
  remainingHours: number;
}

interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
  remainingSeconds: number;
}

class RateLimitService {
  private cache: RateLimitData = {};
  private generationCache: Record<string, GenerationRecord> = {};
  private initialized = false;
  private generationInitialized = false;

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

  /**
   * Initialize the generation cache by loading data from storage
   */
  private async initializeGenerationCache(): Promise<void> {
    if (this.generationInitialized) return;

    try {
      const data = await AsyncStorage.getItem(GENERATION_STORAGE_KEY);
      if (data) {
        this.generationCache = JSON.parse(data);
        this.cleanupExpiredGenerationRecords();
      }
      this.generationInitialized = true;
    } catch (error) {
      this.generationCache = {};
      this.generationInitialized = true;
    }
  }

  /**
   * Save current generation state to storage
   */
  private async persistGenerationCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(GENERATION_STORAGE_KEY, JSON.stringify(this.generationCache));
    } catch (error) {
    }
  }

  /**
   * Clean up expired generation records
   */
  private cleanupExpiredGenerationRecords(): void {
    const now = Date.now();
    for (const userId of Object.keys(this.generationCache)) {
      const record = this.generationCache[userId];
      if (record.windowStart + GENERATION_CONFIG.WINDOW_MS < now) {
        delete this.generationCache[userId];
      }
    }
  }

  /**
   * Get or create a generation record for a user
   */
  private getGenerationRecord(userId: string): GenerationRecord {
    if (!this.generationCache[userId]) {
      this.generationCache[userId] = {
        userId,
        generations: 0,
        refinements: 0,
        windowStart: Date.now(),
      };
    }
    return this.generationCache[userId];
  }

  /**
   * Check if user can generate gifts
   */
  async checkGenerationLimit(userId: string, isPremium: boolean): Promise<GenerationLimitCheckResult> {
    await this.initializeGenerationCache();

    const record = this.getGenerationRecord(userId);
    const limit = isPremium ? GENERATION_CONFIG.PREMIUM_DAILY_LIMIT : GENERATION_CONFIG.FREE_DAILY_LIMIT;

    if (Date.now() - record.windowStart >= GENERATION_CONFIG.WINDOW_MS) {
      record.generations = 0;
      record.refinements = 0;
      record.windowStart = Date.now();
      await this.persistGenerationCache();
    }

    const remaining = Math.max(0, limit - record.generations);

    return {
      allowed: record.generations < limit,
      remaining,
      windowEndsAt: record.windowStart + GENERATION_CONFIG.WINDOW_MS,
      remainingHours: Math.ceil((record.windowStart + GENERATION_CONFIG.WINDOW_MS - Date.now()) / (1000 * 60 * 60)),
    };
  }

  /**
   * Check if user can refine gifts (premium only)
   */
  async checkRefinementLimit(userId: string, isPremium: boolean): Promise<GenerationLimitCheckResult> {
    if (!isPremium) {
      return {
        allowed: false,
        remaining: 0,
        windowEndsAt: 0,
        remainingHours: 0,
      };
    }

    await this.initializeGenerationCache();
    const record = this.getGenerationRecord(userId);

    if (Date.now() - record.windowStart >= GENERATION_CONFIG.WINDOW_MS) {
      record.generations = 0;
      record.refinements = 0;
      record.windowStart = Date.now();
      await this.persistGenerationCache();
    }

    const remaining = Math.max(0, GENERATION_CONFIG.REFINEMENT_DAILY_LIMIT - record.refinements);

    return {
      allowed: record.refinements < GENERATION_CONFIG.REFINEMENT_DAILY_LIMIT,
      remaining,
      windowEndsAt: record.windowStart + GENERATION_CONFIG.WINDOW_MS,
      remainingHours: Math.ceil((record.windowStart + GENERATION_CONFIG.WINDOW_MS - Date.now()) / (1000 * 60 * 60)),
    };
  }

  /**
   * Record a gift generation
   */
  async recordGeneration(userId: string): Promise<void> {
    await this.initializeGenerationCache();
    const record = this.getGenerationRecord(userId);
    record.generations++;
    await this.persistGenerationCache();
  }

  /**
   * Record a refinement
   */
  async recordRefinement(userId: string): Promise<void> {
    await this.initializeGenerationCache();
    const record = this.getGenerationRecord(userId);
    record.refinements++;
    await this.persistGenerationCache();
  }

  /**
   * Check and record generation (atomic)
   */
  async checkAndRecordGeneration(userId: string, isPremium: boolean): Promise<GenerationLimitCheckResult> {
    const check = await this.checkGenerationLimit(userId, isPremium);
    if (check.allowed) {
      await this.recordGeneration(userId);
    }
    return check;
  }

  /**
   * Check and record refinement (atomic)
   */
  async checkAndRecordRefinement(userId: string, isPremium: boolean): Promise<GenerationLimitCheckResult> {
    const check = await this.checkRefinementLimit(userId, isPremium);
    if (check.allowed) {
      await this.recordRefinement(userId);
    }
    return check;
  }

  /**
   * Get current generation stats for a user
   */
  async getGenerationStats(userId: string, isPremium: boolean): Promise<{
    generationsUsed: number;
    generationsRemaining: number;
    generationsLimit: number;
    refinementsUsed: number;
    refinementsRemaining: number;
    refinementsLimit: number;
    windowEndsAt: number;
    remainingHours: number;
  }> {
    await this.initializeGenerationCache();
    const record = this.getGenerationRecord(userId);
    const limit = isPremium ? GENERATION_CONFIG.PREMIUM_DAILY_LIMIT : GENERATION_CONFIG.FREE_DAILY_LIMIT;

    if (Date.now() - record.windowStart >= GENERATION_CONFIG.WINDOW_MS) {
      record.generations = 0;
      record.refinements = 0;
      record.windowStart = Date.now();
      await this.persistGenerationCache();
    }

    return {
      generationsUsed: record.generations,
      generationsRemaining: Math.max(0, limit - record.generations),
      generationsLimit: limit,
      refinementsUsed: record.refinements,
      refinementsRemaining: Math.max(0, GENERATION_CONFIG.REFINEMENT_DAILY_LIMIT - record.refinements),
      refinementsLimit: isPremium ? GENERATION_CONFIG.REFINEMENT_DAILY_LIMIT : 0,
      windowEndsAt: record.windowStart + GENERATION_CONFIG.WINDOW_MS,
      remainingHours: Math.ceil((record.windowStart + GENERATION_CONFIG.WINDOW_MS - Date.now()) / (1000 * 60 * 60)),
    };
  }

  /**
   * Clear generation data for testing or account recovery
   */
  async clearGenerationData(userId?: string): Promise<void> {
    await this.initializeGenerationCache();
    if (userId) {
      delete this.generationCache[userId];
    } else {
      this.generationCache = {};
    }
    await this.persistGenerationCache();
  }
}

export const rateLimitService = new RateLimitService();
