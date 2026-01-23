import type { GiftIdea } from '../types/recipient';
import { z } from 'zod';
import { generateId, getTimestamp } from '../utils/helpers';
import { errorLogger } from './errorLogger';
import { safeJSONParse } from '../utils/validation';

/**
 * Raw Gift Idea Schema (from AI response)
 * Made flexible to handle different AI model response formats
 */
const rawGiftIdeaSchema = z.object({
  name: z.string().min(1, 'Gift name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reasoning: z.string().optional().default('A thoughtful gift choice.'),
  price: z.union([z.string(), z.number()]).transform(val =>
    typeof val === 'number' ? `$${val}` : val
  ),
  category: z.string().min(1, 'Category is required'),
  url: z.string().url().nullable().optional(),
  stores: z.array(z.string()).default([]),
  tags: z.array(z.string()).default(['gift']),
});

/**
 * Gift Array Schema
 */
const giftArraySchema = z.array(rawGiftIdeaSchema);

/**
 * Gift Parser Service
 * Parses and validates AI-generated gift suggestions
 */
class GiftParser {
  /**
   * Parse JSON response from AI
   */
  async parseResponse(response: string, recipientId: string): Promise<GiftIdea[]> {
    try {
      const cleanedResponse = this.cleanResponse(response);

      // Use safe JSON parsing with size and depth limits
      const parseResult = safeJSONParse(cleanedResponse, 512 * 1024, 10); // 512KB max, 10 depth max
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      const validatedGifts = giftArraySchema.parse(parseResult.data);
      return this.transformToGiftIdeas(validatedGifts, recipientId);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean the AI response
   * Remove markdown code blocks, thinking sections, extra text, etc.
   * Handles MiniMax M2.1 format with <think> sections
   */
  private cleanResponse(response: string): string {
    let cleaned = response;

    // Remove MiniMax <think>...</think> reasoning sections
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```/g, '');

    // Extract JSON array
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }

    return cleaned.trim();
  }

  /**
   * Transform validated gifts to GiftIdea format
   */
  private transformToGiftIdeas(
    rawGifts: z.infer<typeof rawGiftIdeaSchema>[],
    recipientId: string
  ): GiftIdea[] {
    return rawGifts.map((gift) => ({
      id: this.generateId(),
      recipientId,
      name: gift.name,
      description: gift.description,
      reasoning: gift.reasoning,
      price: gift.price,
      category: this.normalizeCategory(gift.category),
      url: gift.url ?? undefined,
      stores: gift.stores ?? [],
      tags: this.normalizeTags(gift.tags),
      isSaved: false,
      isPurchased: false,
      generatedAt: getTimestamp(),
    }));
  }

  /**
   * Normalize category to standard format
   */
  private normalizeCategory(category: string): string {
    const standardCategories = [
      'Tech', 'Fashion', 'Experience', 'Home', 'Food', 'Books',
      'Games', 'Sports', 'Art', 'Music', 'Health', 'Beauty',
      'Kids', 'Pets', 'Travel', 'Jewelry', 'Accessories',
      'Electronics', 'Kitchen', 'Garden', 'DIY', 'Collectibles',
      'Seasonal', 'Subscriptions', 'Gift Cards', 'Charity',
    ];

    const normalized = category.trim();
    return standardCategories.includes(normalized) ? normalized : 'Other';
  }

  /**
   * Normalize tags
   * Convert to lowercase and remove duplicates
   */
  private normalizeTags(tags: string[]): string[] {
    return [
      ...new Set(
        tags.map(tag => tag.toLowerCase().trim())
      )
    ].slice(0, 10); // Limit to 10 tags
  }

  /**
   * Generate unique ID for gift
   */
  private generateId(): string {
    return `gift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate a single gift idea
   */
  validateGiftIdea(gift: unknown): {
    valid: boolean;
    error?: string;
  } {
    try {
      rawGiftIdeaSchema.parse(gift);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // @ts-ignore
        const errorMessage = error.errors?.[0]?.message || 'Invalid gift idea format';
        return {
          valid: false,
          error: errorMessage,
        };
      }
      return {
        valid: false,
        error: 'Unknown validation error',
      };
    }
  }

}

// Export singleton instance
export const giftParser = new GiftParser();
