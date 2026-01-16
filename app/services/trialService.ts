import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import type { User } from '../types/user';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useAuthStore } from '../store/authStore';

/**
 * Trial limit configuration
 */
const TRIAL_CONFIG = {
  FREE_TRIAL_USES: 5,
  RESET_PERIOD_DAYS: 30,
} as const;

/**
 * Trial usage tracking data
 */
interface TrialUsageData {
  usesRemaining: number;
  lastResetDate: string;
  totalCount: number;
}

/**
 * Trial Limit Service
 * Manages free trial usage and limits
 */
class TrialService {
  private usageData: TrialUsageData | null = null;
  private isLoaded = false;

  /**
   * Load trial usage data from storage
   */
  async loadUsageData(userId: string): Promise<TrialUsageData> {
    try {
      const key = `${STORAGE_KEYS.AUTH_TOKEN}_${userId}_trial`;
      const data = await storage.getItem<TrialUsageData>(key);

      if (data) {
        this.usageData = data;
        // Check if reset is needed
        await this.checkAndResetIfNeeded();
      } else {
        // Initialize new trial data
        this.usageData = {
          usesRemaining: TRIAL_CONFIG.FREE_TRIAL_USES,
          lastResetDate: new Date().toISOString(),
          totalCount: 0,
        };
        await this.saveUsageData(userId);
      }

      this.isLoaded = true;
      return this.usageData;
    } catch (error) {
      errorLogger.log(error, { context: 'loadUsageData', userId });
      throw new AppError('Failed to load trial data');
    }
  }

  /**
   * Save trial usage data to storage
   */
  private async saveUsageData(userId: string): Promise<void> {
    if (!this.usageData) return;

    try {
      const key = `${STORAGE_KEYS.AUTH_TOKEN}_${userId}_trial`;
      await storage.setItem(key, this.usageData);
    } catch (error) {
      errorLogger.log(error, { context: 'saveUsageData', userId });
      throw new AppError('Failed to save trial data');
    }
  }

  /**
   * Check if trial reset is needed
   */
  private async checkAndResetIfNeeded(): Promise<void> {
    if (!this.usageData) return;

    const lastReset = new Date(this.usageData.lastResetDate);
    const now = new Date();
    const daysSinceReset = this.getDaysBetween(lastReset, now);

    if (daysSinceReset >= TRIAL_CONFIG.RESET_PERIOD_DAYS) {
      // Reset trial uses
      this.usageData.usesRemaining = TRIAL_CONFIG.FREE_TRIAL_USES;
      this.usageData.lastResetDate = now.toISOString();
      await this.saveUsageData(this.getCurrentUserId()!);
    }
  }

  /**
   * Get days between two dates
   */
  private getDaysBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Decrement trial uses
   */
  async decrementUses(userId: string): Promise<boolean> {
    try {
      if (!this.isLoaded) {
        await this.loadUsageData(userId);
      }

      if (this.usageData!.usesRemaining > 0) {
        this.usageData!.usesRemaining -= 1;
        this.usageData!.totalCount += 1;
        await this.saveUsageData(userId);
        return true;
      }

      return false;
    } catch (error) {
      errorLogger.log(error, { context: 'decrementUses', userId });
      throw new AppError('Failed to decrement trial uses');
    }
  }

  /**
   * Get remaining trial uses
   */
  getRemainingUses(): number {
    return this.usageData?.usesRemaining ?? TRIAL_CONFIG.FREE_TRIAL_USES;
  }

  /**
   * Check if user has remaining trial uses
   */
  hasRemainingUses(): boolean {
    return this.getRemainingUses() > 0;
  }

  /**
   * Get total number of uses
   */
  getTotalUses(): number {
    return this.usageData?.totalCount ?? 0;
  }

  /**
   * Calculate days until trial reset
   */
  getDaysUntilReset(): number {
    if (!this.usageData) return TRIAL_CONFIG.RESET_PERIOD_DAYS;

    const lastReset = new Date(this.usageData.lastResetDate);
    const now = new Date();
    const daysSinceReset = this.getDaysBetween(lastReset, now);
    const daysUntilReset = TRIAL_CONFIG.RESET_PERIOD_DAYS - daysSinceReset;
    
    return Math.max(0, daysUntilReset);
  }

  /**
   * Get current user ID from auth store
   */
  private getCurrentUserId(): string | null {
    return useAuthStore.getState().user?.id ?? null;
  }

  /**
   * Reset trial uses manually (for testing or admin purposes)
   */
  async resetTrial(userId: string): Promise<void> {
    try {
      this.usageData = {
        usesRemaining: TRIAL_CONFIG.FREE_TRIAL_USES,
        lastResetDate: new Date().toISOString(),
        totalCount: 0,
      };
      await this.saveUsageData(userId);
    } catch (error) {
      errorLogger.log(error, { context: 'resetTrial', userId });
      throw new AppError('Failed to reset trial');
    }
  }

  /**
   * Check if user can use gift generation
   */
  canUseFeature(): boolean {
    return this.hasRemainingUses();
  }

  /**
   * Get trial limit configuration
   */
  static get TRIAL_LIMIT(): number {
    return TRIAL_CONFIG.FREE_TRIAL_USES;
  }

  /**
   * Get reset period in days
   */
  static get RESET_PERIOD(): number {
    return TRIAL_CONFIG.RESET_PERIOD_DAYS;
  }

  /**
   * Clear trial data (for logout or account deletion)
   */
  async clearData(userId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.AUTH_TOKEN}_${userId}_trial`;
      await storage.removeItem(key);
      this.usageData = null;
      this.isLoaded = false;
    } catch (error) {
      errorLogger.log(error, { context: 'clearData', userId });
      throw new AppError('Failed to clear trial data');
    }
  }
}

// Export singleton instance
export const trialService = new TrialService();
