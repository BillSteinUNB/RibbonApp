import { aiService } from './aiService';
import { giftParser } from './giftParser';
import { getPromptForOccasion } from '../prompts';
import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import type { GiftIdea, Recipient } from '../types/recipient';
import { useRecipientStore } from '../store/recipientStore';
import { useGiftStore } from '../store/giftStore';
import { useAuthStore } from '../store/authStore';

/**
 * Gift Generation Service
 * Manages the complete gift generation workflow
 */
class GiftService {
  /**
   * Generate gift ideas for a recipient
   */
  async generateGifts(
    recipient: Recipient,
    count: number = 5
  ): Promise<{
    gifts: GiftIdea[];
    duration: number;
    method: 'ai' | 'fallback';
  }> {
    const startTime = Date.now();
    
    try {
      // Check if AI service is configured
      if (!aiService.isAvailable()) {
        console.warn('AI service not configured, using fallback');
        return this.generateFallbackGifts(recipient, count, startTime);
      }

      // Select appropriate prompt based on occasion
      const userPrompt = getPromptForOccasion(recipient, count);
      const systemPrompt = 'You are a helpful and creative gift recommendation assistant.';

      // Initialize AI client
      aiService.initialize();

      // Call AI service
      const response = await aiService.generateGiftSuggestions(
        systemPrompt,
        userPrompt
      );

      // Parse response
      const gifts = await giftParser.parseResponse(response, recipient.id);

      // Decrement trial uses from auth service
      const decrementTrial = useAuthStore.getState().decrementTrialUses;
      decrementTrial();

      const duration = Date.now() - startTime;

      return {
        gifts,
        duration,
        method: 'ai',
      };
    } catch (error) {
      errorLogger.log(error, { context: 'generateGifts', recipientId: recipient.id });
      console.error('AI generation failed, using fallback:', error);
      return this.generateFallbackGifts(recipient, count, startTime);
    }
  }

  /**
   * Generate fallback gifts when AI fails
   */
  private generateFallbackGifts(
    recipient: Recipient,
    count: number,
    startTime: number
  ): {
    gifts: GiftIdea[];
    duration: number;
    method: 'fallback';
  } {
    const gifts = giftParser.getFallbackGifts(recipient.id, count);
    return {
      gifts,
      duration: Date.now() - startTime,
      method: 'fallback',
    };
  }

  /**
   * Save a gift idea
   */
  async saveGiftIdea(giftId: string): Promise<void> {
    try {
      const allGifts = useGiftStore.getState().allGifts;
      const gift = allGifts.find((g) => g.id === giftId);
      
      if (!gift) {
        throw new AppError('Gift not found', 'NOT_FOUND');
      }

      useGiftStore.getState().saveGift(giftId);
    } catch (error) {
      errorLogger.log(error, { context: 'saveGiftIdea', giftId });
      throw new AppError('Failed to save gift');
    }
  }

  /**
   * Unsave a gift idea
   */
  async unsaveGiftIdea(giftId: string): Promise<void> {
    try {
      useGiftStore.getState().unsaveGift(giftId);
    } catch (error) {
      errorLogger.log(error, { context: 'unsaveGiftIdea', giftId });
      throw new AppError('Failed to unsave gift');
    }
  }

  /**
   * Mark gift as purchased
   */
  async markAsPurchased(giftId: string, recipientId: string): Promise<void> {
    try {
      useGiftStore.getState().markAsPurchased(giftId);

      // Add to recipient's gift history
      const gift = useGiftStore.getState().allGifts.find(g => g.id === giftId);
      if (gift) {
        useRecipientStore.getState().addGiftToHistory(recipientId, gift);
      }
    } catch (error) {
      errorLogger.log(error, { context: 'markAsPurchased', giftId, recipientId });
      throw new AppError('Failed to mark gift as purchased');
    }
  }

  /**
   * Get saved gifts for a recipient
   */
  getSavedGifts(recipientId: string): GiftIdea[] {
    return useGiftStore.getState().savedGifts.filter(
      (gift) => gift.recipientId === recipientId
    );
  }

  /**
   * Get purchased gifts for a recipient
   */
  getPurchasedGifts(recipientId: string): GiftIdea[] {
    return useGiftStore.getState().purchasedGifts.filter(
      (gift) => gift.recipientId === recipientId
    );
  }

  /**
   * Get gift history for a recipient
   */
  getGiftHistory(recipientId: string): GiftIdea[] {
    return useGiftStore.getState().allGifts.filter(
      (gift) => gift.recipientId === recipientId
    ).sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  /**
   * Generate with progress messages
   */
  async generateWithProgress(
    recipient: Recipient,
    count: number = 5,
    onProgress?: (message: string) => void
  ): Promise<GiftIdea[]> {
    // Simulate progress messages before actual generation
    const messages = [
      'Analyzing recipient preferences...',
      'Understanding lifestyle and interests...',
      'Brainstorming gift ideas...',
      'Refining suggestions for personalization...',
      'Finalizing gift list...',
    ];

    for (const message of messages) {
      if (onProgress) {
        onProgress(message);
      }
      await this.delay(800);
    }

    try {
      const result = await this.generateGifts(recipient, count);
      
      if (onProgress) {
        onProgress('Gift suggestions ready!');
        await this.delay(300);
      }

      return result.gifts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Filter gifts by category
   */
  filterGiftsByCategory(gifts: GiftIdea[], category: string): GiftIdea[] {
    return gifts.filter((gift) =>
      gift.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Sort gifts by price
   */
  sortGiftsByPrice(
    gifts: GiftIdea[],
    order: 'low-to-high' | 'high-to-low' = 'low-to-high'
  ): GiftIdea[] {
    const extractPriceNumber = (price: string): number => {
      const match = price.match(/\$?([\d,]+)/);
      return match ? parseInt(match[1].replace(',', ''), 0) : 0;
    };

    return [...gifts].sort((a, b) => {
      const priceA = extractPriceNumber(a.price);
      const priceB = extractPriceNumber(b.price);
      return order === 'low-to-high' ? priceA - priceB : priceB - priceA;
    });
  }

  /**
   * Search gifts by tags
   */
  searchGiftsByTags(gifts: GiftIdea[], query: string): GiftIdea[] {
    const lowerQuery = query.toLowerCase();
    return gifts.filter((gift) =>
      gift.tags.some((tag) => tag.includes(lowerQuery)) ||
      gift.name.toLowerCase().includes(lowerQuery) ||
      gift.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get gift statistics
   */
  getGiftStats(gifts: GiftIdea[]): {
    total: number;
    saved: number;
    purchased: number;
    byCategory: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    
    gifts.forEach((gift) => {
      byCategory[gift.category] = (byCategory[gift.category] || 0) + 1;
    });

    return {
      total: gifts.length,
      saved: gifts.filter((g) => g.isSaved).length,
      purchased: gifts.filter((g) => g.isPurchased).length,
      byCategory,
    };
  }
}

// Export singleton instance
export const giftService = new GiftService();
export const useGiftService = () => giftService;
