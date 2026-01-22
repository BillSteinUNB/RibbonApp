import { z } from 'zod';

/**
 * Recipient data models and validation schemas
 */

export interface Recipient {
  id: string;
  name: string;
  relationship: string;
  ageRange?: string;
  gender?: string;
  interests: string[];
  dislikes: string;
  budget: Budget;
  occasion: Occasion;
  pastGifts: string[];
  notes?: string;
  giftHistory?: GiftIdea[];
  createdAt: string;
  updatedAt: string;
  lastGiftConsultation?: string;
}

export interface Budget {
  minimum: number;
  maximum: number;
  currency: string;
}

export interface Occasion {
  type: 'birthday' | 'holiday' | 'anniversary' | 'wedding' | 'other';
  date?: string;
  customName?: string;
}

export interface GiftIdea {
  id: string;
  recipientId: string;
  name: string;
  description: string;
  reasoning: string;
  price: string;
  category: string;
  url?: string;
  stores: string[];
  tags: string[];
  isSaved: boolean;
  isPurchased: boolean;
  generatedAt: string;
  // Refinement fields
  isRefined?: boolean;
  refinementFeedback?: 'liked' | 'disliked' | null;
  generationSessionId?: string;
}

/**
 * Generation Session for tracking refinements
 */
export interface GenerationSession {
  id: string;
  recipientId: string;
  createdAt: string;
  hasBeenRefined: boolean;
  originalGiftIds: string[];
  refinedGiftIds?: string[];
  refinementData?: {
    likedGiftIds: string[];
    dislikedGiftIds: string[];
    instructions: string;
    refinedAt: string;
  };
}

/**
 * Validation schemas
 */

export const budgetSchema = z.object({
  minimum: z.number().min(0, 'Minimum budget cannot be negative').max(10000, 'Budget exceeds maximum limit of 10,000'),
  maximum: z.number().min(1, 'Maximum budget must be at least 1').max(10000, 'Budget exceeds maximum limit of 10,000'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
}).refine(data => data.maximum >= data.minimum, {
  message: 'Maximum budget must be greater than or equal to minimum',
  path: ['maximum'],
});

export const occasionSchema = z.object({
  type: z.enum(['birthday', 'holiday', 'anniversary', 'wedding', 'other']),
  date: z.string().optional(),
  customName: z.string().optional(),
});

export const giftIdeaSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  name: z.string(),
  description: z.string(),
  reasoning: z.string(),
  price: z.string(),
  category: z.string(),
  url: z.string().optional(),
  stores: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isSaved: z.boolean().default(false),
  isPurchased: z.boolean().default(false),
  generatedAt: z.string(),
  isRefined: z.boolean().optional(),
  refinementFeedback: z.enum(['liked', 'disliked']).nullable().optional(),
  generationSessionId: z.string().optional(),
});

export const recipientSchema = z.object({
  id: z.string().min(1, 'Recipient ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(1, 'Relationship is required'),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
  dislikes: z.string().optional(),
  budget: budgetSchema,
  occasion: occasionSchema,
  pastGifts: z.array(z.string()).default([]),
  notes: z.string().optional(),
  giftHistory: z.array(giftIdeaSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastGiftConsultation: z.string().optional(),
});

/**
 * Recipient creation form data (without generated fields)
 */
export interface RecipientFormData {
  name: string;
  relationship: string;
  ageRange?: string;
  gender?: string;
  interests: string[];
  dislikes: string;
  budget: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  occasion: {
    type: 'birthday' | 'holiday' | 'anniversary' | 'wedding' | 'other';
    date?: string;
    customName?: string;
  };
  pastGifts: string[];
  notes?: string;
}

/**
 * Form validation schema
 */
export const recipientFormSchema = recipientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastGiftConsultation: true,
  giftHistory: true,
});

/**
 * Constants for dropdowns
 */

export const AGE_RANGES = [
  { value: '0-12', label: '0-12 years' },
  { value: '13-17', label: '13-17 years' },
  { value: '18-24', label: '18-24 years' },
  { value: '25-34', label: '25-34 years' },
  { value: '35-44', label: '35-44 years' },
  { value: '45-54', label: '45-54 years' },
  { value: '55-64', label: '55-64 years' },
  { value: '65+', label: '65+ years' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

export const RELATIONSHIPS = [
  { value: 'partner', label: 'Partner/Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'coworker', label: 'Coworker' },
  { value: 'boss', label: 'Boss/Manager' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'client', label: 'Client' },
  { value: 'other', label: 'Other' },
] as const;

export const OCCASION_TYPES = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'other', label: 'Other' },
] as const;

export const COMMON_INTERESTS = [
  'Technology',
  'Sports',
  'Music',
  'Cooking',
  'Travel',
  'Reading',
  'Fashion',
  'Fitness',
  'Gaming',
  'Art',
  'Photography',
  'Gardening',
  'DIY/Crafts',
  'Movies/TV',
  'Food & Dining',
  'Outdoor Activities',
  'Science',
  'History',
  'Pets',
  'Fashion & Beauty',
] as const;

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
] as const;
