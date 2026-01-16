import { z } from 'zod';

/**
 * Form validation helpers with Zod schemas
 */

/**
 * Email validation
 */
const emailSchema = z.string().email('Invalid email address');

export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Please enter a valid email address' 
    };
  }
}

/**
 * Required field validation
 */
export function validateRequired(value: any): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

/**
 * String length validation
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  if (min !== undefined && value.length < min) {
    return { 
      valid: false, 
      error: `Must be at least ${min} characters` 
    };
  }
  
  if (max !== undefined && value.length > max) {
    return { 
      valid: false, 
      error: `Must be no more than ${max} characters` 
    };
  }
  
  return { valid: true };
}

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T) => { valid: boolean; error?: string }>
): (value: T) => { valid: boolean; error?: string } {
  return (value) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

/**
 * Phone number validation (US/Canada)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Please enter a valid 10-digit phone number' };
  }
  
  return { valid: true };
}

/**
 * Number range validation
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  if (isNaN(value)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  
  if (min !== undefined && value < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  
  if (max !== undefined && value > max) {
    return { valid: false, error: `Must be no more than ${max}` };
  }
  
  return { valid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Date validation
 */
export function validateDate(date: Date | string): { valid: boolean; error?: string } {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }
  
  return { valid: true };
}

/**
 * Validate array minimum length
 */
export function validateArrayMinLength(
  array: any[],
  min: number
): { valid: boolean; error?: string } {
  if (!Array.isArray(array) || array.length < min) {
    return {
      valid: false,
      error: `Please select at least ${min} item${min > 1 ? 's' : ''}`
    };
  }
  return { valid: true };
}

/**
 * Strong password validation
 * Requirements:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  return { valid: true };
}

/**
 * Safe JSON parsing result type
 */
export type SafeJSONResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safe JSON parsing with size limits and validation
 * Prevents DoS attacks from malformed or oversized JSON
 *
 * @param input - The string to parse
 * @param maxSize - Maximum allowed size in bytes (default: 1MB)
 * @param maxDepth - Maximum nesting depth allowed (default: 20)
 */
export function safeJSONParse<T = unknown>(
  input: unknown,
  maxSize: number = 1024 * 1024,
  maxDepth: number = 20
): SafeJSONResult<T> {
  // Validate input is a string
  if (typeof input !== 'string') {
    return { success: false, error: 'Input must be a string' };
  }

  // Check size limit
  const byteSize = new TextEncoder().encode(input).length;
  if (byteSize > maxSize) {
    return { success: false, error: `JSON exceeds maximum size of ${maxSize} bytes` };
  }

  // Check for empty input
  if (input.trim().length === 0) {
    return { success: false, error: 'Empty JSON input' };
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    return {
      success: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`
    };
  }

  // Check depth
  const depth = getObjectDepth(parsed);
  if (depth > maxDepth) {
    return { success: false, error: `JSON exceeds maximum nesting depth of ${maxDepth}` };
  }

  return { success: true, data: parsed as T };
}

/**
 * Calculate the nesting depth of an object/array
 */
function getObjectDepth(obj: unknown, currentDepth: number = 0): number {
  if (currentDepth > 100) {
    return currentDepth; // Prevent stack overflow on circular references
  }

  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return currentDepth + 1;
    return Math.max(...obj.map(item => getObjectDepth(item, currentDepth + 1)));
  }

  const values = Object.values(obj);
  if (values.length === 0) return currentDepth + 1;
  return Math.max(...values.map(val => getObjectDepth(val, currentDepth + 1)));
}

/**
 * Sanitize user input for safe embedding in AI prompts
 * Prevents prompt injection attacks by neutralizing instruction-like patterns
 *
 * @param input - The user-provided string to sanitize
 * @param maxLength - Maximum allowed length (default: 500)
 */
export function sanitizeForPrompt(input: string | undefined | null, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);

  // Remove or neutralize instruction-like patterns (case-insensitive)
  const dangerousPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
    /disregard\s+(all\s+)?(previous|prior|above|earlier)/gi,
    /forget\s+(everything|all|what)\s+(you\s+)?(know|learned|were\s+told)/gi,
    /you\s+are\s+now\s+a?/gi,
    /pretend\s+(you\s+are|to\s+be)/gi,
    /act\s+as\s+(if\s+you\s+are|a)/gi,
    /new\s+instructions?:/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /user\s*:/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /```[a-z]*\n/gi,
    /\{\{.*?\}\}/g,
    /\$\{.*?\}/g,
  ];

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  // Remove control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace (collapse multiple spaces/newlines)
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Sanitize an array of strings for prompt embedding
 */
export function sanitizeArrayForPrompt(items: string[] | undefined | null, maxLength: number = 100): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return items.map(item => sanitizeForPrompt(item, maxLength)).filter(item => item.length > 0);
}
