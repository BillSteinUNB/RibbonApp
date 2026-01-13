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
