import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import type { User } from '../types/user';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

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
 * Manages free trial usage and limits with server-side validation
 */
class TrialService {
  private usageData: TrialUsageData | null = null;
  private isLoaded = false;
  private syncInProgress = false;

  /**
   * Initialize trial limits from server (call on app startup)
   * This syncs server data with local storage to detect tampering
   */
  async initializeFromServer(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return;

      // Call server to initialize/get trial limits
      const { data, error } = await supabase.rpc('initialize_trial_limits');

      if (error) {
        logger.error('[TrialService] Server initialization failed:', error);
        // Fall back to local data if server fails
        return;
      }

      if (data && data.length > 0) {
        const serverData = data[0];
        if (serverData.success) {
          // Update local data with server data
          this.usageData = {
            usesRemaining: serverData.uses_remaining,
            lastResetDate: new Date().toISOString(), // Assume server tracks this
            totalCount: this.usageData?.totalCount || 0,
          };

          await this.saveUsageData(userId);
          logger.log('[TrialService] Trial limits synced from server');
        }
      }
    } catch (error) {
      errorLogger.log(error, { context: 'initializeFromServer' });
      // Don't throw - local data should still work
    }
  }

  /**
   * Sync trial usage with server (detect tampering)
   */
  private async syncWithServer(): Promise<TrialUsageData | null> {
    if (this.syncInProgress) return this.usageData;

    try {
      this.syncInProgress = true;
      const userId = this.getCurrentUserId();
      if (!userId) return this.usageData;

      // Fetch trial limits from server
      const { data, error } = await supabase.rpc('get_trial_limits');

      if (error) {
        logger.error('[TrialService] Server sync failed:', error);
        return this.usageData;
      }

      if (data && data.length > 0) {
        const serverData = data[0];

        // Check if server and local data match
        const localData = this.usageData;
        const hasDiscrepancy =
          !localData ||
          localData.usesRemaining !== serverData.uses_remaining;

        if (hasDiscrepancy) {
          // Log discrepancy - potential tampering detected
          logger.warn('[TrialService] Trial usage discrepancy detected:', {
            userId,
            local: localData?.usesRemaining,
            server: serverData.uses_remaining,
          });

          // Update local data to match server (server is source of truth)
          this.usageData = {
            usesRemaining: serverData.uses_remaining,
            lastResetDate: serverData.last_reset_date,
            totalCount: serverData.total_uses,
          };

          await this.saveUsageData(userId);
        }

        return this.usageData;
      }

      return this.usageData;
    } catch (error) {
      errorLogger.log(error, { context: 'syncWithServer' });
      return this.usageData;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Load trial usage data from storage
   * Includes server-side validation to detect tampering
   */
  async loadUsageData(userId: string): Promise<TrialUsageData> {
    try {
      const key = `${STORAGE_KEYS.AUTH_TOKEN}_${userId}_trial`;
      const data = await storage.getItem<TrialUsageData>(key);

      if (data) {
        this.usageData = data;
        // Sync with server to detect tampering
        await this.syncWithServer();
        // Check if reset is needed
        await this.checkAndResetIfNeeded();
      } else {
        // Initialize new trial data from server
        await this.initializeFromServer();
        if (!this.usageData) {
          // Fallback if server fails
          this.usageData = {
            usesRemaining: TRIAL_CONFIG.FREE_TRIAL_USES,
            lastResetDate: new Date().toISOString(),
            totalCount: 0,
          };
        }
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
   * Decrement trial uses (server-side validation)
   * Calls server to decrement, which enforces limits
   */
  async decrementUses(userId: string): Promise<boolean> {
    try {
      // Call server to decrement (server enforces limits)
      const { data, error } = await supabase.rpc('decrement_trial_uses');

      if (error) {
        logger.error('[TrialService] Server decrement failed:', error);
        // Fall back to local logic if server fails (shouldn't happen in production)
        return await this.decrementUsesLocal(userId);
      }

      if (data && data.length > 0) {
        const result = data[0];

        // Update local cache with server data
        this.usageData = {
          usesRemaining: result.uses_remaining,
          lastResetDate: this.usageData?.lastResetDate || new Date().toISOString(),
          totalCount: result.total_uses,
        };

        await this.saveUsageData(userId);

        return result.success;
      }

      return false;
    } catch (error) {
      errorLogger.log(error, { context: 'decrementUses', userId });
      // Fall back to local logic if error occurs
      return await this.decrementUsesLocal(userId);
    }
  }

  /**
   * Decrement trial uses locally (fallback if server fails)
   */
  private async decrementUsesLocal(userId: string): Promise<boolean> {
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
      errorLogger.log(error, { context: 'decrementUsesLocal', userId });
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
      // Try server reset first
      const { error } = await supabase.rpc('reset_trial_limits');

      if (!error) {
        // Sync with server after reset
        await this.syncWithServer();
      }

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
   * Check if user can use gift generation (local check)
   */
  canUseFeature(): boolean {
    return this.hasRemainingUses();
  }

  /**
   * Check if user can use trial feature (server-side validation)
   */
  async canUseFeatureServerSide(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_use_trial_feature');

      if (error) {
        logger.error('[TrialService] Server check failed:', error);
        // Fall back to local check
        return this.hasRemainingUses();
      }

      return data === true;
    } catch (error) {
      errorLogger.log(error, { context: 'canUseFeatureServerSide' });
      // Fall back to local check
      return this.hasRemainingUses();
    }
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
