/**
 * Type-safe storage service with error handling
 *
 * CRITICAL: No static imports of native modules or services that depend on them.
 * Uses dynamic imports to prevent crashes at bundle load time.
 */

import { getSafeStorage } from '../lib/safeStorage';
import {
  STORAGE_KEYS,
  STORAGE_KEY_SENSITIVITY,
  STORAGE_VERSION,
  type StorageKeySensitivity,
} from '../constants/storageKeys';
import { StorageError, StorageParseError } from '../types/errors';
import { logger } from '../utils/logger';

// Lazy module loaders - do NOT import these statically
let _errorLoggerModule: typeof import('./errorLogger') | null = null;
let _encryptedStorageModule: typeof import('./encryptedStorage') | null = null;

async function getErrorLogger() {
  if (!_errorLoggerModule) {
    _errorLoggerModule = await import('./errorLogger');
  }
  return _errorLoggerModule.errorLogger;
}

async function getEncryptedStorage() {
  if (!_encryptedStorageModule) {
    _encryptedStorageModule = await import('./encryptedStorage');
  }
  return _encryptedStorageModule.encryptedStorage;
}

function logError(error: unknown, context: Record<string, unknown>) {
  getErrorLogger().then(el => el?.log(error, context)).catch((err) => logger.warn('[Storage] Non-critical cleanup error:', err));
  console.error('[Storage]', context, error);
}

const STORAGE_KEY_SENSITIVITY_BY_VALUE: Record<string, StorageKeySensitivity> =
  Object.entries(STORAGE_KEYS).reduce((acc, [keyName, value]) => {
    const name = keyName as keyof typeof STORAGE_KEYS;
    acc[value] = STORAGE_KEY_SENSITIVITY[name];
    return acc;
  }, {} as Record<string, StorageKeySensitivity>);

const deprecatedKeys: string[] = [
  '@ribbon/old_key_1',
  '@ribbon/old_key_2',
];

/**
 * Storage limits to prevent unbounded data growth
 */
export const STORAGE_LIMITS = {
  /** Maximum total storage size in MB */
  MAX_STORAGE_SIZE_MB: 50,
  /** Maximum age for cached data in days */
  MAX_CACHE_AGE_DAYS: 30,
  /** Maximum number of error logs to keep */
  MAX_ERROR_LOGS: 100,
  /** Maximum number of audit logs to keep */
  MAX_AUDIT_LOGS: 50,
  /** Maximum number of gift history items per recipient */
  MAX_GIFT_HISTORY_PER_RECIPIENT: 100,
  /** Warning threshold (percentage of max storage) */
  WARNING_THRESHOLD_PERCENT: 80,
} as const;

class StorageService {
  private static instance: StorageService;
  private initialized = false;

  private constructor() {
    // Defer initialization
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      const currentVersion = await this.getItem<string>(STORAGE_KEYS.STORAGE_VERSION);

      if (currentVersion !== STORAGE_VERSION) {
        await this.runMigrations(currentVersion);
        await this.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
      }
      this.initialized = true;
    } catch (error) {
      logger.warn('Failed to initialize storage:', error);
      this.initialized = true;
    }
  }

  private async runMigrations(fromVersion: string | null): Promise<void> {
    logger.log('Running storage migrations from:', fromVersion);

    if (fromVersion && fromVersion < '1.1.0') {
      logger.log('[Migration] Encrypting existing sensitive data...');
      await this.encryptSensitiveData();
    }

    try {
      await this.clearDeprecatedKeys();
    } catch (error) {
      logger.warn('Migration failed:', error);
    }
  }

  private async encryptSensitiveData(): Promise<void> {
    try {
      const keys = Object.keys(STORAGE_KEYS);
      let migratedCount = 0;

      for (const key of keys) {
        const sensitivity = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
        if (!sensitivity) continue;

        const value = await this.getItem(sensitivity);

        if (!value) continue;

        if (typeof value === 'object' && 'data' in value && 'iv' in value && 'version' in value) {
          continue;
        }

        const encStorage = await getEncryptedStorage();
        const encrypted = await encStorage.encryptValue(sensitivity, value);
        if (encrypted !== value) {
          const storage = getSafeStorage();
          await storage.setItem(sensitivity, JSON.stringify(encrypted));
          migratedCount++;
        }
      }

      logger.log(`[Migration] Encrypted ${migratedCount} sensitive keys`);
    } catch (error) {
      logger.error('[Migration] Failed to encrypt sensitive data:', error);
    }
  }

  private async clearDeprecatedKeys(): Promise<void> {
    const deprecatedKeys: string[] = [];

    for (const key of deprecatedKeys) {
      try {
        await this.removeItem(key);
      } catch (error) {
        logger.warn(`Failed to clear deprecated key ${key}:`, error);
      }
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storage = getSafeStorage();
      const jsonValue = await storage.getItem(key);
      if (jsonValue !== null) {
        try {
          let parsedValue = JSON.parse(jsonValue as string) as T;

          const keySensitivity = STORAGE_KEY_SENSITIVITY_BY_VALUE[key];
          if (keySensitivity === 'SENSITIVE') {
            const encStorage = await getEncryptedStorage();
            parsedValue = await encStorage.decryptValue(key, parsedValue);
          }

          return parsedValue;
        } catch (parseError) {
          const error = new StorageParseError(`Invalid JSON in storage key: ${key}`);
          logError(error, { key, value: jsonValue });
          throw error;
        }
      }
      return null;
    } catch (error) {
      if (error instanceof StorageParseError) {
        throw error;
      }
      throw new StorageError(`Failed to get item for key: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      let finalValue = value;

      const keySensitivity = STORAGE_KEY_SENSITIVITY_BY_VALUE[key];
      if (keySensitivity === 'SENSITIVE') {
        const encStorage = await getEncryptedStorage();
        finalValue = await encStorage.encryptValue(key, value) as T;
      }

      const jsonValue = JSON.stringify(finalValue);
      const storage = getSafeStorage();
      await storage.setItem(key, jsonValue);
    } catch (error) {
      throw new StorageError(`Failed to set item for key: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const storage = getSafeStorage();
      await storage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to remove item for key: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  async getItems<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      try {
        const value = await this.getItem<T>(key);
        if (value !== null) {
          result.set(key, value);
        }
      } catch (error) {
        logger.warn(`Failed to get item for key ${key}:`, error);
      }
    }

    return result;
  }

  async setItems<T>(entries: Map<string, T>): Promise<void> {
    for (const [key, value] of entries) {
      await this.setItem(key, value);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.removeItem(key);
      }
    } catch (error) {
      throw new StorageError('Failed to clear storage', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    return Object.values(STORAGE_KEYS);
  }

  async removeItems(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }

  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      throw new StorageError(`Failed to check key existence: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  async getStorageSize(): Promise<{ keys: number; approxSizeMb: number }> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        try {
          const storage = getSafeStorage();
          const value = await storage.getItem(key);
          if (value) {
            totalSize += key.length + (value as string).length;
          }
        } catch {
          // Skip keys we can't read
        }
      }

      return {
        keys: keys.length,
        approxSizeMb: totalSize / (1024 * 1024),
      };
    } catch (error) {
      throw new StorageError('Failed to calculate storage size', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Check if storage is approaching limits and return status
   */
  async checkStorageHealth(): Promise<{
    isHealthy: boolean;
    currentSizeMb: number;
    maxSizeMb: number;
    usagePercent: number;
    warnings: string[];
  }> {
    const { approxSizeMb } = await this.getStorageSize();
    const usagePercent = (approxSizeMb / STORAGE_LIMITS.MAX_STORAGE_SIZE_MB) * 100;
    const warnings: string[] = [];

    if (usagePercent >= 100) {
      warnings.push('Storage limit exceeded. Please clear some data.');
    } else if (usagePercent >= STORAGE_LIMITS.WARNING_THRESHOLD_PERCENT) {
      warnings.push(`Storage is ${usagePercent.toFixed(0)}% full. Consider clearing old data.`);
    }

    return {
      isHealthy: usagePercent < STORAGE_LIMITS.WARNING_THRESHOLD_PERCENT,
      currentSizeMb: approxSizeMb,
      maxSizeMb: STORAGE_LIMITS.MAX_STORAGE_SIZE_MB,
      usagePercent,
      warnings,
    };
  }

  /**
   * Run cleanup to enforce storage limits and remove stale data
   */
  async runCleanup(): Promise<{
    freedMb: number;
    itemsCleaned: number;
    errors: string[];
  }> {
    const initialSize = await this.getStorageSize();
    let itemsCleaned = 0;
    const errors: string[] = [];

    try {
      // Clean old error logs
      const errorLogsCleaned = await this.cleanupErrorLogs();
      itemsCleaned += errorLogsCleaned;

      // Clean old audit logs
      const auditLogsCleaned = await this.cleanupAuditLogs();
      itemsCleaned += auditLogsCleaned;

      // Clean old drafts (e.g., recipient drafts older than cache age)
      const draftsCleaned = await this.cleanupOldDrafts();
      itemsCleaned += draftsCleaned;

      // Clean gift history if too large
      const giftHistoryCleaned = await this.cleanupGiftHistory();
      itemsCleaned += giftHistoryCleaned;

      // Clear deprecated keys
      await this.clearDeprecatedKeys();

    } catch (error) {
      errors.push(`Cleanup error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const finalSize = await this.getStorageSize();
    const freedMb = initialSize.approxSizeMb - finalSize.approxSizeMb;

    logger.log(`[Storage] Cleanup complete: freed ${freedMb.toFixed(2)}MB, cleaned ${itemsCleaned} items`);

    return {
      freedMb: Math.max(0, freedMb),
      itemsCleaned,
      errors,
    };
  }

  /**
   * Clean up error logs to keep within limits
   */
  private async cleanupErrorLogs(): Promise<number> {
    try {
      const errorLogs = await this.getItem<any[]>(STORAGE_KEYS.ERROR_LOGS);
      if (!errorLogs || errorLogs.length <= STORAGE_LIMITS.MAX_ERROR_LOGS) {
        return 0;
      }

      // Keep most recent logs
      const trimmedLogs = errorLogs.slice(-STORAGE_LIMITS.MAX_ERROR_LOGS);
      await this.setItem(STORAGE_KEYS.ERROR_LOGS, trimmedLogs);

      return errorLogs.length - trimmedLogs.length;
    } catch {
      return 0;
    }
  }

  /**
   * Clean up audit logs to keep within limits
   */
  private async cleanupAuditLogs(): Promise<number> {
    try {
      const auditLogs = await this.getItem<any[]>(STORAGE_KEYS.AUDIT_LOGS);
      if (!auditLogs || auditLogs.length <= STORAGE_LIMITS.MAX_AUDIT_LOGS) {
        return 0;
      }

      // Keep most recent logs
      const trimmedLogs = auditLogs.slice(-STORAGE_LIMITS.MAX_AUDIT_LOGS);
      await this.setItem(STORAGE_KEYS.AUDIT_LOGS, trimmedLogs);

      return auditLogs.length - trimmedLogs.length;
    } catch {
      return 0;
    }
  }

  /**
   * Clean up old drafts (drafts older than MAX_CACHE_AGE_DAYS)
   */
  private async cleanupOldDrafts(): Promise<number> {
    let cleaned = 0;
    const draftKeys = ['@ribbon/recipient-draft'];
    const maxAge = STORAGE_LIMITS.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const key of draftKeys) {
      try {
        const draft = await this.getItem<{ timestamp?: number }>(key);
        if (draft?.timestamp && (now - draft.timestamp) > maxAge) {
          await this.removeItem(key);
          cleaned++;
        }
      } catch {
        // Skip if can't read
      }
    }

    return cleaned;
  }

  /**
   * Clean up gift history to keep within limits per recipient
   */
  private async cleanupGiftHistory(): Promise<number> {
    try {
      const recipients = await this.getItem<any[]>(STORAGE_KEYS.RECIPIENTS);
      if (!recipients) return 0;

      let totalCleaned = 0;

      for (const recipient of recipients) {
        if (recipient.giftHistory && recipient.giftHistory.length > STORAGE_LIMITS.MAX_GIFT_HISTORY_PER_RECIPIENT) {
          const excess = recipient.giftHistory.length - STORAGE_LIMITS.MAX_GIFT_HISTORY_PER_RECIPIENT;
          recipient.giftHistory = recipient.giftHistory.slice(-STORAGE_LIMITS.MAX_GIFT_HISTORY_PER_RECIPIENT);
          totalCleaned += excess;
        }
      }

      if (totalCleaned > 0) {
        await this.setItem(STORAGE_KEYS.RECIPIENTS, recipients);
      }

      return totalCleaned;
    } catch {
      return 0;
    }
  }
}

export const storage = StorageService.getInstance();
