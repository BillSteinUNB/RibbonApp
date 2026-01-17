import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, STORAGE_VERSION } from '../constants/storageKeys';
import { StorageError, StorageParseError } from '../types/errors';

import { logger } from '../utils/logger';
import { errorLogger } from './errorLogger';
import { encryptedStorage } from './encryptedStorage';
import { STORAGE_KEY_SENSITIVITY } from '../constants/storageKeys';

/**
 * Type-safe storage service with error handling
 */
class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize storage and check version for migrations
   */
  private async initializeStorage(): Promise<void> {
    try {
      const currentVersion = await this.getItem<string>(STORAGE_KEYS.STORAGE_VERSION);
      
      if (currentVersion !== STORAGE_VERSION) {
        // Run migrations if version has changed
        await this.runMigrations(currentVersion);
        await this.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
      }
    } catch (error) {
      logger.warn('Failed to initialize storage:', error);
    }
  }

  /**
   * Run storage migrations when schema version changes
   */
  private async runMigrations(fromVersion: string | null): Promise<void> {
    logger.log('Running storage migrations from:', fromVersion);

    // Migration to v1.1.0: Encrypt sensitive data
    if (fromVersion && fromVersion < '1.1.0') {
      logger.log('[Migration] Encrypting existing sensitive data...');
      await this.encryptSensitiveData();
    }

    // Add migration logic here as needed
    // Example: if (!fromVersion) { /* first install setup */ }

    try {
      // Clear any deprecated keys
      await this.clearDeprecatedKeys();
    } catch (error) {
      logger.warn('Migration failed:', error);
    }
  }

  /**
   * Migrate existing sensitive data to encryption (v1.1.0 migration)
   */
  private async encryptSensitiveData(): Promise<void> {
    try {
      const keys = Object.keys(STORAGE_KEYS);
      let migratedCount = 0;

      for (const key of keys) {
        // Check if this key is sensitive
        const sensitivity = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
        if (!sensitivity) continue;

        // Get current value
        const value = await this.getItem(sensitivity);

        // Skip if null or already encrypted
        if (!value) continue;

        // Check if value is already encrypted (has 'data', 'iv', 'version' properties)
        if (typeof value === 'object' && 'data' in value && 'iv' in value && 'version' in value) {
          continue;
        }

        // Encrypt the value
        const encrypted = await encryptedStorage.encryptValue(sensitivity, value);
        if (encrypted !== value) {
          // Save encrypted value
          await AsyncStorage.setItem(sensitivity, JSON.stringify(encrypted));
          migratedCount++;
        }
      }

      logger.log(`[Migration] Encrypted ${migratedCount} sensitive keys`);
    } catch (error) {
      logger.error('[Migration] Failed to encrypt sensitive data:', error);
      // Don't throw - we don't want to block the app on migration failure
    }
  }

  /**
   * Clear deprecated storage keys
   */
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

  /**
   * Get an item from storage (with automatic decryption for sensitive keys)
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        try {
          let parsedValue = JSON.parse(jsonValue) as T;

          // Decrypt if this is a sensitive key
          if (STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]) {
            const sensitivity = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
            const keySensitivity = STORAGE_KEY_SENSITIVITY[sensitivity];

            if (keySensitivity === 'SENSITIVE') {
              parsedValue = await encryptedStorage.decryptValue(key, parsedValue);
            }
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

  /**
   * Set an item in storage (with automatic encryption for sensitive keys)
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      // Encrypt if this is a sensitive key
      let finalValue = value;

      if (STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]) {
        const sensitivity = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
        const keySensitivity = STORAGE_KEY_SENSITIVITY[sensitivity];

        if (keySensitivity === 'SENSITIVE') {
          finalValue = await encryptedStorage.encryptValue(key, value) as T;
        }
      }

      const jsonValue = JSON.stringify(finalValue);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw new StorageError(`Failed to set item for key: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to remove item for key: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Get multiple items from storage
   */
  async getItems<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result = new Map<string, T>();

      items.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result.set(key, JSON.parse(value) as T);
          } catch (parseError) {
            const error = new StorageParseError(`Invalid JSON in storage key: ${key}`);
            errorLogger.log(error, { key, value });
            throw error;
          }
        }
      });

      return result;
    } catch (error) {
      if (error instanceof StorageParseError) {
        throw error;
      }
      throw new StorageError('Failed to get multiple items', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Set multiple items in storage
   */
  async setItems<T>(entries: Map<string, T>): Promise<void> {
    try {
      const keyValuePairPairs: [string, string][] = [];
      
      entries.forEach((value, key) => {
        keyValuePairPairs.push([key, JSON.stringify(value)]);
      });
      
      await AsyncStorage.multiSet(keyValuePairPairs);
    } catch (error) {
      throw new StorageError('Failed to set multiple items', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Clear all stored data (use with caution)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear storage', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new StorageError('Failed to get all keys', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Remove multiple items from storage
   */
  async removeItems(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      throw new StorageError('Failed to remove multiple items', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Check if a key exists in storage
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      throw new StorageError(`Failed to check key existence: ${key}`, 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }

  /**
   * Get storage size (estimated)
   */
  async getStorageSize(): Promise<{ keys: number; approxSizeMb: number }> {
    try {
      const keys = await this.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);

      let totalSize = 0;
      items.forEach(([key, value]) => {
        if (value) {
          totalSize += key.length + value.length;
        }
      });

      return {
        keys: keys.length,
        approxSizeMb: totalSize / (1024 * 1024),
      };
    } catch (error) {
      throw new StorageError('Failed to calculate storage size', 'STORAGE_ERROR', undefined, { originalError: error as Error });
    }
  }
}

// Export singleton instance
export const storage = StorageService.getInstance();
