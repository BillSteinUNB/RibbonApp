/**
 * Type-safe storage service with error handling
 * 
 * CRITICAL: No static imports of native modules - uses dynamic imports via safeStorage.
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
import { errorLogger } from './errorLogger';
import { encryptedStorage } from './encryptedStorage';

const STORAGE_KEY_SENSITIVITY_BY_VALUE: Record<string, StorageKeySensitivity> =
  Object.entries(STORAGE_KEYS).reduce((acc, [keyName, value]) => {
    const name = keyName as keyof typeof STORAGE_KEYS;
    acc[value] = STORAGE_KEY_SENSITIVITY[name];
    return acc;
  }, {} as Record<string, StorageKeySensitivity>);

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

        const encrypted = await encryptedStorage.encryptValue(sensitivity, value);
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
            parsedValue = await encryptedStorage.decryptValue(key, parsedValue);
          }

          return parsedValue;
        } catch (parseError) {
          const error = new StorageParseError(`Invalid JSON in storage key: ${key}`);
          errorLogger.log(error, { key, value: jsonValue });
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
        finalValue = await encryptedStorage.encryptValue(key, value) as T;
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
}

export const storage = StorageService.getInstance();
