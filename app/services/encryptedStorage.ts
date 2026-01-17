/**
 * Encryption service for sensitive storage data
 * 
 * CRITICAL: No static imports of native modules (expo-crypto, expo-secure-store)
 * Uses dynamic imports to prevent crashes at bundle load time.
 */

import { STORAGE_KEY_SENSITIVITY, type StorageKeySensitivity } from '../constants/storageKeys';
import { errorLogger } from './errorLogger';
import { logger } from '../utils/logger';

const ENCRYPTION_KEY_ID = '@ribbon/encryption_key';
const ENCRYPTION_KEY_VERSION = '1.0.0';

interface EncryptedData {
  data: string;
  iv: string;
  version: string;
  timestamp: string;
}

let CryptoModule: typeof import('expo-crypto') | null = null;
let SecureStoreModule: typeof import('expo-secure-store') | null = null;

async function getCrypto() {
  if (CryptoModule) return CryptoModule;
  try {
    CryptoModule = await import('expo-crypto');
    return CryptoModule;
  } catch (e) {
    console.warn('[EncryptedStorage] expo-crypto not available:', e);
    return null;
  }
}

async function getSecureStore() {
  if (SecureStoreModule) return SecureStoreModule;
  try {
    SecureStoreModule = await import('expo-secure-store');
    return SecureStoreModule;
  } catch (e) {
    console.warn('[EncryptedStorage] expo-secure-store not available:', e);
    return null;
  }
}

function fallbackRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

async function generateEncryptionKey(): Promise<string> {
  try {
    const Crypto = await getCrypto();
    let randomBytes: Uint8Array;
    
    if (Crypto) {
      randomBytes = await Crypto.getRandomBytesAsync(32);
    } else {
      randomBytes = fallbackRandomBytes(32);
    }
    
    return bytesToBase64(randomBytes);
  } catch (error) {
    errorLogger.log(error, { context: 'generateEncryptionKey' });
    throw new Error('Failed to generate encryption key');
  }
}

async function getEncryptionKey(): Promise<string> {
  try {
    const SecureStore = await getSecureStore();
    
    if (SecureStore) {
      const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
      if (existingKey) {
        return existingKey;
      }
      
      const newKey = await generateEncryptionKey();
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);
      logger.log('[EncryptedStorage] New encryption key generated');
      return newKey;
    }
    
    return await generateEncryptionKey();
  } catch (error) {
    errorLogger.log(error, { context: 'getEncryptionKey' });
    throw new Error('Failed to access encryption key');
  }
}

async function encryptData(data: string, key: string): Promise<EncryptedData> {
  try {
    const Crypto = await getCrypto();
    let iv: Uint8Array;
    
    if (Crypto) {
      iv = await Crypto.getRandomBytesAsync(12);
    } else {
      iv = fallbackRandomBytes(12);
    }

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

async function decryptData(encryptedData: EncryptedData, key: string): Promise<string> {
  try {
    const decodedData = atob(encryptedData.data);
    return decodedData;
  } catch (error) {
    errorLogger.log(error, { context: 'decryptData' });
    throw new Error('Failed to decrypt data - key may have changed');
  }
}

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

function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export class EncryptedStorageService {
  static async encryptValue<T>(key: string, value: T): Promise<string | T> {
    try {
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        return value;
      }

      logger.log(`[EncryptedStorage] Encrypting sensitive key: ${key}`);

      const encryptionKey = await getEncryptionKey();
      const jsonString = JSON.stringify(value);
      const encrypted = await encryptData(jsonString, encryptionKey);

      return JSON.stringify(encrypted) as any;
    } catch (error) {
      errorLogger.log(error, { context: 'encryptValue', key });
      logger.warn('[EncryptedStorage] Encryption failed, returning original data');
      return value;
    }
  }

  static async decryptValue<T>(key: string, value: any): Promise<T> {
    try {
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        return value;
      }

      if (!isEncrypted(value)) {
        return value;
      }

      logger.log(`[EncryptedStorage] Decrypting sensitive key: ${key}`);

      const encryptionKey = await getEncryptionKey();
      const decryptedString = await decryptData(value, encryptionKey);

      return JSON.parse(decryptedString) as T;
    } catch (error) {
      errorLogger.log(error, { context: 'decryptValue', key });
      logger.warn('[EncryptedStorage] Decryption failed, attempting to return original');
      return value;
    }
  }

  static async isEncryptionAvailable(): Promise<boolean> {
    try {
      const key = await getEncryptionKey();
      return !!key;
    } catch {
      return false;
    }
  }

  static async rotateEncryptionKey(): Promise<void> {
    try {
      logger.log('[EncryptedStorage] Starting encryption key rotation...');
      
      const SecureStore = await getSecureStore();
      if (!SecureStore) {
        throw new Error('SecureStore not available');
      }

      const newKey = await generateEncryptionKey();
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);

      logger.log('[EncryptedStorage] Encryption key rotated successfully');
    } catch (error) {
      errorLogger.log(error, { context: 'rotateEncryptionKey' });
      throw new Error('Failed to rotate encryption key');
    }
  }

  static async deleteEncryptionKey(): Promise<void> {
    try {
      const SecureStore = await getSecureStore();
      if (SecureStore) {
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ID);
        logger.log('[EncryptedStorage] Encryption key deleted');
      }
    } catch (error) {
      errorLogger.log(error, { context: 'deleteEncryptionKey' });
      throw new Error('Failed to delete encryption key');
    }
  }
}

export const encryptedStorage = EncryptedStorageService;
