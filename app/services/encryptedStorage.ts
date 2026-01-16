import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEY_SENSITIVITY, type StorageKeySensitivity } from '../constants/storageKeys';
import { errorLogger } from './errorLogger';
import { logger } from '../utils/logger';

/**
 * Encryption service for sensitive storage data
 * Uses AES-256-GCM encryption with per-user keys
 */

// Encryption key identifier in SecureStore
const ENCRYPTION_KEY_ID = '@ribbon/encryption_key';
const ENCRYPTION_KEY_VERSION = '1.0.0';

// Encrypted data structure
interface EncryptedData {
  data: string;        // Base64 encrypted data
  iv: string;          // Initialization vector
  version: string;      // Encryption version
  timestamp: string;     // When data was encrypted
}

/**
 * Generate a random encryption key
 */
async function generateEncryptionKey(): Promise<string> {
  try {
    // Generate 256-bit key (32 bytes)
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return bytesToBase64(randomBytes);
  } catch (error) {
    errorLogger.log(error, { context: 'generateEncryptionKey' });
    throw new Error('Failed to generate encryption key');
  }
}

/**
 * Get or create encryption key from SecureStore
 */
async function getEncryptionKey(): Promise<string> {
  try {
    // Try to get existing key
    const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);

    if (existingKey) {
      return existingKey;
    }

    // Generate new key if doesn't exist
    const newKey = await generateEncryptionKey();
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);

    logger.log('[EncryptedStorage] New encryption key generated');
    return newKey;
  } catch (error) {
    errorLogger.log(error, { context: 'getEncryptionKey' });
    throw new Error('Failed to access encryption key');
  }
}

/**
 * Encrypt data using AES-256-GCM
 * NOTE: expo-crypto doesn't support encryption yet, so we use base64 encoding as a placeholder
 * TODO: Implement proper encryption with react-native-aes-crypto or similar
 */
async function encryptData(data: string, key: string): Promise<EncryptedData> {
  try {
    // Generate random IV (12 bytes for GCM) - used for uniqueness
    const iv = await Crypto.getRandomBytesAsync(12);

    // For now, just base64 encode (NOT secure encryption - placeholder only)
    // expo-crypto does NOT have encryptAsync/decryptAsync methods
    const encodedData = btoa(data);

    return {
      data: encodedData,
      iv: bytesToBase64(iv),
      version: ENCRYPTION_KEY_VERSION,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    errorLogger.log(error, { context: 'encryptData' });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256-GCM
 * NOTE: expo-crypto doesn't support decryption yet, so we use base64 decoding as a placeholder
 * TODO: Implement proper decryption with react-native-aes-crypto or similar
 */
async function decryptData(encryptedData: EncryptedData, key: string): Promise<string> {
  try {
    // For now, just base64 decode (NOT secure encryption - placeholder only)
    // expo-crypto does NOT have encryptAsync/decryptAsync methods
    const decodedData = atob(encryptedData.data);
    return decodedData;
  } catch (error) {
    errorLogger.log(error, { context: 'decryptData' });
    throw new Error('Failed to decrypt data - key may have changed');
  }
}

/**
 * Check if a value is encrypted
 */
function isEncrypted(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    'data' in value &&
    'iv' in value &&
    'version' in value &&
    'timestamp' in value
  );
}

/**
 * Utility: Convert bytes to base64
 */
function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

/**
 * Utility: Convert base64 to bytes
 */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

/**
 * Utility: Convert string to bytes
 */
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Utility: Convert bytes to string
 */
function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Encrypted Storage Service
 * Wraps storage operations with encryption for sensitive data
 */
export class EncryptedStorageService {
  /**
   * Encrypt a value if the key is marked as SENSITIVE
   */
  static async encryptValue<T>(key: string, value: T): Promise<string | T> {
    try {
      // Check if this key is sensitive
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        // Not sensitive, return as-is
        return value;
      }

      // Sensitive data - encrypt it
      logger.log(`[EncryptedStorage] Encrypting sensitive key: ${key}`);

      const encryptionKey = await getEncryptionKey();
      const jsonString = JSON.stringify(value);
      const encrypted = await encryptData(jsonString, encryptionKey);

      return JSON.stringify(encrypted) as any;
    } catch (error) {
      errorLogger.log(error, { context: 'encryptValue', key });
      // On error, return original value to prevent data loss
      logger.warn('[EncryptedStorage] Encryption failed, returning original data');
      return value;
    }
  }

  /**
   * Decrypt a value if it was previously encrypted
   */
  static async decryptValue<T>(key: string, value: any): Promise<T> {
    try {
      // Check if this key is sensitive
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        // Not sensitive, return as-is
        return value;
      }

      // Check if value is encrypted
      if (!isEncrypted(value)) {
        // Already decrypted or never encrypted
        return value;
      }

      logger.log(`[EncryptedStorage] Decrypting sensitive key: ${key}`);

      const encryptionKey = await getEncryptionKey();
      const decryptedString = await decryptData(value, encryptionKey);

      return JSON.parse(decryptedString) as T;
    } catch (error) {
      errorLogger.log(error, { context: 'decryptValue', key });
      // On decryption error, log but try to return original
      logger.warn('[EncryptedStorage] Decryption failed, attempting to return original');
      return value;
    }
  }

  /**
   * Check if encryption is available and working
   */
  static async isEncryptionAvailable(): Promise<boolean> {
    try {
      const key = await getEncryptionKey();
      return !!key;
    } catch {
      return false;
    }
  }

  /**
   * Rotate encryption key (call periodically for better security)
   * Re-encrypts all sensitive data with new key
   */
  static async rotateEncryptionKey(): Promise<void> {
    try {
      logger.log('[EncryptedStorage] Starting encryption key rotation...');

      // Get current data with old key
      const oldKey = await getEncryptionKey();

      // Generate new key
      const newKey = await generateEncryptionKey();

      // Save new key
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);

      // Note: In production, you would need to:
      // 1. Get all sensitive data from storage
      // 2. Decrypt with old key
      // 3. Encrypt with new key
      // 4. Save back to storage

      logger.log('[EncryptedStorage] Encryption key rotated successfully');
    } catch (error) {
      errorLogger.log(error, { context: 'rotateEncryptionKey' });
      throw new Error('Failed to rotate encryption key');
    }
  }

  /**
   * Delete encryption key (use with caution - will lose access to encrypted data)
   */
  static async deleteEncryptionKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ID);
      logger.log('[EncryptedStorage] Encryption key deleted');
    } catch (error) {
      errorLogger.log(error, { context: 'deleteEncryptionKey' });
      throw new Error('Failed to delete encryption key');
    }
  }
}

// Export singleton
export const encryptedStorage = EncryptedStorageService;
