import { z } from 'zod';
import { UserPreferences, DEFAULT_PREFERENCES } from './settings';

/**
 * User data models and schemas
 */

export interface User {
  id: string;
  email: string;
  createdAt: string;
  trialUsesRemaining: number;
  isPremium: boolean;
  premiumSince?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export { UserPreferences };

/**
 * User schema for validation
 */
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  createdAt: z.string(),
  trialUsesRemaining: z.number().int().min(0),
  isPremium: z.boolean(),
  premiumSince: z.string().optional(),
  profile: z.object({
    name: z.string().optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      notifications: z.object({
        emailUpdates: z.boolean(),
        pushNotifications: z.boolean(),
        marketing: z.boolean(),
        occasionReminders: z.boolean(),
        weeklyDigest: z.boolean(),
      }),
      analytics: z.object({
        enabled: z.boolean(),
        consentGiven: z.boolean(),
        consentDate: z.string().optional(),
      }),
      language: z.string(),
      currency: z.string(),
    }).optional(),
  }).optional(),
});

/**
 * User preferences schema
 */
export const userPreferencesSchema: z.ZodType<UserPreferences> = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  notifications: z.object({
    emailUpdates: z.boolean(),
    pushNotifications: z.boolean(),
    marketing: z.boolean(),
    occasionReminders: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
  analytics: z.object({
    enabled: z.boolean(),
    consentGiven: z.boolean(),
    consentDate: z.string().optional(),
  }),
  language: z.string(),
  currency: z.string(),
});

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData extends AuthCredentials {
  name?: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  email: string;
}

/**
 * Password update data
 */
export interface PasswordUpdateData {
  currentPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Type guards
 */
export function isPremiumUser(user: User | null): boolean {
  return user?.isPremium ?? false;
}

export function hasRemainingTrialUses(user: User | null): boolean {
  return (user?.trialUsesRemaining ?? 0) > 0;
}

export function canUseGiftGeneration(user: User | null): boolean {
  return isPremiumUser(user) || hasRemainingTrialUses(user);
}
