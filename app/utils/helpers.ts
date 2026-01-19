/**
 * General helper utility functions
 * 
 * CRITICAL: No static imports or require() of native modules (expo-crypto, etc.)
 * Uses ONLY Math.random() fallback to prevent any chance of native module crashes.
 */

function fallbackRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/**
 * Generate a unique ID (UUID v4 format)
 * Uses Math.random() - not cryptographically secure but safe for IDs
 */
export function generateId(): string {
  const bytes = fallbackRandomBytes(16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generate a session ID
 * Format: prefix_timestamp_random
 */
export function generateSecureSessionId(prefix: string = 'session'): string {
  const bytes = fallbackRandomBytes(12);
  
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