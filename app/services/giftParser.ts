import type { GiftIdea } from '../types/recipient';
import { z } from 'zod';
import { generateId, getTimestamp } from '../utils/helpers';
import { errorLogger } from './errorLogger';

/**
 * Raw Gift Idea Schema (from AI response)
 */
const rawGiftIdeaSchema = z.object({
  name: z.string().min(1, 'Gift name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reasoning: z.string().min(10, 'Reasoning must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  url: z.string().url().nullable().optional(),
  stores: z.array(z.string()).default([]),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
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
      const jsonContent = JSON.parse(cleanedResponse);
      const validatedGifts = giftArraySchema.parse(jsonContent);
      return this.transformToGiftIdeas(validatedGifts, recipientId);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean the the AI response
   * Remove markdown code blocks, extra text, etc.
   */
  private cleanResponse(response: string): string {
    let cleaned = response.replace(/```json\\n?/gi, '').replace(/```/g, '');
    
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

  /**
   * Fallback response when AI fails
   */
  getFallbackGifts(recipientId: string, count: number = 5): GiftIdea[] {
    const fallbackGifts = [
      {
        name: 'Personalized Photo Frame',
        description: 'A beautiful photo frame that can be customized with a favorite memory or photo.',
        reasoning: 'Classic gift that shows thoughtfulness and preserves cherished memories.',
        price: '$20 - $50',
        category: 'Home',
        stores: [],
        tags: ['personal', 'memorable', 'classic'],
      },
      {
        name: 'Gift Card to Favorite Store',
        description: 'A gift card to their favorite store, allowing them to choose something they truly want.',
        reasoning: 'Practical and ensures they get exactly what they need from a place they love.',
        price: 'Variable',
        category: 'Gift Cards',
        stores: [],
        tags: ['practical', 'flexible', 'useful'],
      },
      {
        name: 'Experience Gift',
        description: 'Tickets to a show, concert, or experience they would enjoy.',
        reasoning: 'Creates lasting memories and shows you know their interests.',
        price: '$25 - $200',
        category: 'Experience',
        stores: [],
        tags: ['memorable', 'fun', 'experiential'],
      },
      {
        name: 'Custom Coffee Mug',
        description: 'A high-quality coffee mug personalized with their name or favorite quote.',
        reasoning: 'Practical daily use item with personal touch, great for coffee or tea lovers.',
        price: '$15 - $30',
        category: 'Home',
        stores: [],
        tags: ['practical', 'personal', 'daily-use'],
      },
      {
        name: 'Book Collection',
        description: 'A curated collection of books based on their interests or a popular genre they enjoy.',
        reasoning: 'Shows thoughtfulness and provides entertainment and knowledge.',
        price: '$25 - $75',
        category: 'Books',
        stores: [],
        tags: ['entertaining', 'thoughtful', 'educational'],
      },
    ];

    return fallbackGifts.slice(0, count).map((gift) => ({
      ...gift,
      id: this.generateId(),
      recipientId,
      isSaved: false,
      isPurchased: false,
      generatedAt: getTimestamp(),
    }));
  }
}

// Export singleton instance
export const giftParser = new GiftParser();
