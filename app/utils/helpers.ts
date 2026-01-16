import * as Crypto from 'expo-crypto';

/**
 * General helper utility functions
 */

/**
 * Generate a cryptographically secure unique ID (UUID v4 format)
 * Uses expo-crypto for secure random byte generation
 */
export function generateId(): string {
  const bytes = Crypto.getRandomBytes(16);

  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generate a cryptographically secure session ID
 * Format: prefix_timestamp_secureRandom
 */
export function generateSecureSessionId(prefix: string = 'session'): string {
  const bytes = Crypto.getRandomBytes(12);
  const randomPart = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${Date.now()}_${randomPart}`;
}

/**
 * Get current timestamp in ISO 8601 format
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
