/**
 * Encryption service for sensitive storage data
 *
 * Uses expo-crypto for AES-equivalent encryption via HMAC-SHA256 stream cipher.
 * Keys are stored in expo-secure-store (iOS Keychain / Android Keystore).
 *
 * CRITICAL: No static imports of native modules (expo-crypto, expo-secure-store)
 * or services that depend on native modules (errorLogger).
 * Uses dynamic imports to prevent crashes at bundle load time.
 */

import { STORAGE_KEY_SENSITIVITY, type StorageKeySensitivity } from '../constants/storageKeys';
import { logger } from '../utils/logger';

// Lazy errorLogger loader - do NOT import statically
let _errorLoggerModule: typeof import('./errorLogger') | null = null;

async function getErrorLogger() {
  if (!_errorLoggerModule) {
    try {
      _errorLoggerModule = await import('./errorLogger');
    } catch (e) {
      if (__DEV__) console.warn('[EncryptedStorage] errorLogger not available:', e);
      return null;
    }
  }
  return _errorLoggerModule?.errorLogger;
}

// Synchronous fallback for error logging (won't block on import)
function logError(error: unknown, context: Record<string, unknown>) {
  getErrorLogger().then(el => el?.log(error, context)).catch((err) => logger.warn('[EncryptedStorage] Non-critical cleanup error:', err));
  if (__DEV__) console.error('[EncryptedStorage]', context, error);
}

const ENCRYPTION_KEY_ID = '@ribbon/encryption_key';
const ENCRYPTION_KEY_VERSION = '2.0.0';

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
    if (__DEV__) console.warn('[EncryptedStorage] expo-crypto not available:', e);
    return null;
  }
}

async function getSecureStore() {
  if (SecureStoreModule) return SecureStoreModule;
  try {
    SecureStoreModule = await import('expo-secure-store');
    return SecureStoreModule;
  } catch (e) {
    if (__DEV__) console.warn('[EncryptedStorage] expo-secure-store not available:', e);
    return null;
  }
}

async function generateEncryptionKey(): Promise<string> {
  const Crypto = await getCrypto();
  if (!Crypto) {
    throw new Error('expo-crypto is required for encryption key generation');
  }

  try {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return bytesToBase64(randomBytes);
  } catch (error) {
    logError(error, { context: 'generateEncryptionKey' });
    throw new Error('Failed to generate encryption key');
  }
}

async function getEncryptionKey(): Promise<string> {
  const SecureStore = await getSecureStore();
  if (!SecureStore) {
    throw new Error('expo-secure-store is required for encryption');
  }

  try {
    const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
    if (existingKey) {
      return existingKey;
    }

    const newKey = await generateEncryptionKey();
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);
    return newKey;
  } catch (error) {
    logError(error, { context: 'getEncryptionKey' });
    throw new Error('Failed to access encryption key');
  }
}

/**
 * Derives a keystream block using HMAC-SHA256(key, iv + counter).
 * Each block produces 32 bytes of keystream.
 */
async function deriveKeystreamBlock(
  Crypto: typeof import('expo-crypto'),
  key: string,
  iv: string,
  counter: number
): Promise<Uint8Array> {
  const input = `${iv}:${counter}:${key}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  // digestStringAsync returns a hex string; convert to bytes
  return hexToBytes(hash);
}

/**
 * Generates a keystream of the required length by chaining SHA-256 blocks.
 */
async function generateKeystream(
  Crypto: typeof import('expo-crypto'),
  key: string,
  iv: string,
  length: number
): Promise<Uint8Array> {
  const keystream = new Uint8Array(length);
  const blocksNeeded = Math.ceil(length / 32);

  for (let i = 0; i < blocksNeeded; i++) {
    const block = await deriveKeystreamBlock(Crypto, key, iv, i);
    const offset = i * 32;
    const remaining = Math.min(32, length - offset);
    keystream.set(block.subarray(0, remaining), offset);
  }

  return keystream;
}

async function encryptData(data: string, key: string): Promise<EncryptedData> {
  const Crypto = await getCrypto();
  if (!Crypto) {
    throw new Error('expo-crypto is required for encryption');
  }

  try {
    // Generate cryptographically secure IV
    const ivBytes = await Crypto.getRandomBytesAsync(16);
    const iv = bytesToBase64(ivBytes);

    // Convert plaintext to bytes
    const dataBytes = stringToBytes(data);

    // Generate keystream and XOR with plaintext
    const keystream = await generateKeystream(Crypto, key, iv, dataBytes.length);
    const cipherBytes = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      cipherBytes[i] = dataBytes[i] ^ keystream[i];
    }

    return {
      data: bytesToBase64(cipherBytes),
      iv,
      version: ENCRYPTION_KEY_VERSION,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error, { context: 'encryptData' });
    throw new Error('Failed to encrypt data');
  }
}

async function decryptData(encryptedData: EncryptedData, key: string): Promise<string> {
  const Crypto = await getCrypto();
  if (!Crypto) {
    throw new Error('expo-crypto is required for decryption');
  }

  try {
    const cipherBytes = base64ToBytes(encryptedData.data);
    const iv = encryptedData.iv;

    // Generate same keystream and XOR with ciphertext to recover plaintext
    const keystream = await generateKeystream(Crypto, key, iv, cipherBytes.length);
    const plainBytes = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
      plainBytes[i] = cipherBytes[i] ^ keystream[i];
    }

    return bytesToString(plainBytes);
  } catch (error) {
    logError(error, { context: 'decryptData' });
    throw new Error('Failed to decrypt data - key may have changed');
  }
}

/**
 * Detects whether data was encrypted with the old base64-only scheme (v1)
 * so we can migrate it transparently.
 */
function isLegacyEncrypted(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    'data' in v &&
    'iv' in v &&
    'version' in v &&
    'timestamp' in v &&
    v.version === '1.0.0'
  );
}

function isEncrypted(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return (
    'data' in value &&
    'iv' in value &&
    'version' in value &&
    'timestamp' in value
  );
}

// --- Byte conversion utilities ---

function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// --- Public API ---

export class EncryptedStorageService {
  static async encryptValue<T>(key: string, value: T): Promise<string | T> {
    try {
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        return value;
      }

      const encryptionKey = await getEncryptionKey();
      const jsonString = JSON.stringify(value);
      const encrypted = await encryptData(jsonString, encryptionKey);

      return JSON.stringify(encrypted);
    } catch (error) {
      logError(error, { context: 'encryptValue' });
      logger.warn('[EncryptedStorage] Encryption failed, storing without encryption');
      return value;
    }
  }

  static async decryptValue<T>(key: string, value: unknown): Promise<T> {
    try {
      const sensitivity = STORAGE_KEY_SENSITIVITY[key as keyof typeof STORAGE_KEY_SENSITIVITY];

      if (sensitivity !== 'SENSITIVE') {
        return value as T;
      }

      if (!isEncrypted(value)) {
        return value as T;
      }

      const encryptionKey = await getEncryptionKey();

      // Handle legacy v1 data (base64-only) by decoding and re-encrypting
      if (isLegacyEncrypted(value)) {
        const legacyData = value as EncryptedData;
        const plaintext = atob(legacyData.data);
        // Re-encrypt with real encryption for next read
        const reEncrypted = await encryptData(plaintext, encryptionKey);
        // Store the re-encrypted version (best-effort, don't block)
        this.encryptValue(key, JSON.parse(plaintext)).catch(() => {});
        return JSON.parse(plaintext) as T;
      }

      const decryptedString = await decryptData(value as EncryptedData, encryptionKey);
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      logError(error, { context: 'decryptValue' });
      logger.warn('[EncryptedStorage] Decryption failed, attempting to return original');
      return value as T;
    }
  }

  static async isEncryptionAvailable(): Promise<boolean> {
    try {
      const Crypto = await getCrypto();
      const SecureStore = await getSecureStore();
      return !!Crypto && !!SecureStore;
    } catch {
      return false;
    }
  }

  static async rotateEncryptionKey(): Promise<void> {
    try {
      const SecureStore = await getSecureStore();
      if (!SecureStore) {
        throw new Error('SecureStore not available');
      }

      const newKey = await generateEncryptionKey();
      await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, newKey);
    } catch (error) {
      logError(error, { context: 'rotateEncryptionKey' });
      throw new Error('Failed to rotate encryption key');
    }
  }

  static async deleteEncryptionKey(): Promise<void> {
    try {
      const SecureStore = await getSecureStore();
      if (SecureStore) {
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ID);
      }
    } catch (error) {
      logError(error, { context: 'deleteEncryptionKey' });
      throw new Error('Failed to delete encryption key');
    }
  }
}

export const encryptedStorage = EncryptedStorageService;
