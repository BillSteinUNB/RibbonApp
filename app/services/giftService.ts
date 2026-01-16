import { aiService } from './aiService';
import { giftParser } from './giftParser';
import { getPromptForOccasion } from '../prompts';
import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import { rateLimitService } from './rateLimitService';
import type { GiftIdea, Recipient, GenerationSession } from '../types/recipient';
import { useRecipientStore } from '../store/recipientStore';
import { useGiftStore } from '../store/giftStore';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';
import { sanitizeForPrompt, sanitizeArrayForPrompt } from '../utils/validation';

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
      // Get user info for rate limiting
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new AppError('User not authenticated', 'UNAUTHORIZED');
      }

      const userId = user.id;
      const isPremium = user.isPremium;

      // Check rate limit for AI generation (skip for fallback mode)
      if (aiService.isAvailable()) {
        const limitCheck = await rateLimitService.checkAndRecordGeneration(userId, isPremium);

        if (!limitCheck.allowed) {
          throw new AppError(
            `Daily limit reached. ${limitCheck.remainingHours} hours until reset.`,
            'RATE_LIMIT_EXCEEDED'
          );
        }
      } else {
        logger.warn('AI service not configured, using fallback');
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
      logger.warn('AI generation failed, using fallback');
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

  /**
   * Build refinement prompt with context from user feedback
   */
  private buildRefinementPrompt(
    recipient: Recipient,
    likedGifts: GiftIdea[],
    dislikedGifts: GiftIdea[],
    userInstructions: string,
    count: number
  ): string {
    // Sanitize all user-provided inputs to prevent prompt injection
    const name = sanitizeForPrompt(recipient.name, 100);
    const relationship = sanitizeForPrompt(recipient.relationship, 50);
    const ageRange = sanitizeForPrompt(recipient.ageRange, 30);
    const gender = sanitizeForPrompt(recipient.gender, 30);
    const interestsList = sanitizeArrayForPrompt(recipient.interests, 100).join(', ') || 'Not specified';
    const dislikes = sanitizeForPrompt(recipient.dislikes, 300) || 'None';
    const sanitizedInstructions = sanitizeForPrompt(userInstructions, 500) || 'Please suggest better alternatives based on my feedback.';
    const occasionCustomName = sanitizeForPrompt(recipient.occasion.customName, 100);

    // Format liked gifts
    const likedGiftsText = likedGifts.length > 0
      ? likedGifts.map(g =>
          `- ${g.name}: ${g.description} (Category: ${g.category}, Price: ${g.price}, Tags: ${g.tags.join(', ')})`
        ).join('\n')
      : 'None specified';

    // Format disliked gifts with reasons to avoid
    const dislikedGiftsText = dislikedGifts.length > 0
      ? dislikedGifts.map(g =>
          `- ${g.name}: ${g.description} (Category: ${g.category}) - AVOID similar items`
        ).join('\n')
      : 'None specified';

    return `I need ${count} REFINED gift suggestions based on previous recommendations that didn't quite fit.

**Recipient Context:**
- Name: ${name}
- Relationship: ${relationship}
- Age: ${ageRange || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Interests: ${interestsList}
- Dislikes/Allergies: ${dislikes}
- Budget: ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}
- Occasion: ${recipient.occasion.type}${occasionCustomName ? ` (${occasionCustomName})` : ''}

**GIFTS THE USER LIKED:**
${likedGiftsText}

**GIFTS THE USER DISLIKED:**
${dislikedGiftsText}

**USER'S REFINEMENT INSTRUCTIONS:**
"${sanitizedInstructions}"

**REFINEMENT REQUIREMENTS:**
1. Generate ${count} COMPLETELY NEW gift ideas (DO NOT repeat any gifts from above)
2. Build on patterns from LIKED gifts (similar categories, themes, price points, styles)
3. AVOID patterns from DISLIKED gifts (different categories, themes, styles)
4. Carefully incorporate the user's specific instructions
5. Stay within budget: ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}
6. Maintain the same occasion focus: ${recipient.occasion.type}
7. Consider recipient's core interests: ${interestsList}
8. Ensure variety across categories unless user requests focus on specific type
9. Be more specific and personalized than the original suggestions
10. If user said gifts were "too generic", be more creative and unique
11. If user said gifts were "too expensive", focus on lower end of budget
12. If user said gifts were "not personal enough", emphasize customization/personalization

**RESPONSE FORMAT:**
Return a JSON array of gift ideas with this exact structure (no markdown, no extra text):
[
  {
    "name": "Gift Name",
    "description": "Detailed 2-3 sentence description",
    "reasoning": "Why this refined gift addresses the user's feedback and fits better",
    "price": "Price range or specific price",
    "category": "Category (e.g., Tech, Fashion, Experience, Home, Books, etc.)",
    "url": null,
    "stores": [],
    "tags": ["relevant", "keywords", "for", "filtering"]
  }
]`;
  }

  /**
   * Refine gift ideas based on user feedback
   * Premium-only feature - does NOT decrement trial uses
   */
  async refineGifts(
    recipient: Recipient,
    sessionId: string,
    likedGifts: GiftIdea[],
    dislikedGifts: GiftIdea[],
    userInstructions: string,
    count: number = 5
  ): Promise<{
    gifts: GiftIdea[];
    duration: number;
    method: 'ai' | 'fallback';
  }> {
    const startTime = Date.now();

    try {
      // Get user info for rate limiting
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new AppError('User not authenticated', 'UNAUTHORIZED');
      }

      const userId = user.id;
      const isPremium = user.isPremium;

      // Validate session can be refined
      const canRefine = useGiftStore.getState().canRefineSession(sessionId);
      if (!canRefine) {
        throw new AppError('This generation has already been refined', 'REFINEMENT_LIMIT_REACHED');
      }

      // Check if AI service is configured
      if (!aiService.isAvailable()) {
        logger.warn('AI service not configured, cannot refine');
        throw new AppError('AI service unavailable for refinement', 'SERVICE_UNAVAILABLE');
      }

      // Check rate limit for refinement (premium only)
      const limitCheck = await rateLimitService.checkAndRecordRefinement(userId, isPremium);

      if (!limitCheck.allowed) {
        throw new AppError(
          `Daily refinement limit reached. ${limitCheck.remainingHours} hours until reset.`,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Build refinement prompt
      const systemPrompt = 'You are a helpful and creative gift recommendation assistant specializing in refining suggestions based on user feedback.';
      const userPrompt = this.buildRefinementPrompt(
        recipient,
        likedGifts,
        dislikedGifts,
        userInstructions,
        count
      );

      // Initialize AI client
      aiService.initialize();

      // Call AI service with refinement context
      const response = await aiService.generateGiftSuggestions(
        systemPrompt,
        userPrompt
      );

      // Parse response
      const refinedGifts = await giftParser.parseResponse(response, recipient.id);

      // Mark gifts as refined
      const giftsWithRefinementFlag = refinedGifts.map(gift => ({
        ...gift,
        isRefined: true,
        generationSessionId: sessionId,
      }));

      // NOTE: Do NOT decrement trial uses - this is a premium feature
      // and the user already used a generation for the initial gifts

      const duration = Date.now() - startTime;

      return {
        gifts: giftsWithRefinementFlag,
        duration,
        method: 'ai',
      };
    } catch (error) {
      errorLogger.log(error, { context: 'refineGifts', sessionId });
      throw error;
    }
  }

  /**
   * Refine with progress messages
   * Premium-only feature
   */
  async refineWithProgress(
    recipient: Recipient,
    sessionId: string,
    likedGifts: GiftIdea[],
    dislikedGifts: GiftIdea[],
    userInstructions: string,
    count: number = 5,
    onProgress?: (message: string) => void
  ): Promise<GiftIdea[]> {
    const messages = [
      'Analyzing your feedback...',
      'Understanding what you liked and disliked...',
      'Refining gift recommendations...',
      'Finding better matches...',
      'Finalizing refined suggestions...',
    ];

    for (const message of messages) {
      if (onProgress) {
        onProgress(message);
      }
      await this.delay(800);
    }

    try {
      const result = await this.refineGifts(
        recipient,
        sessionId,
        likedGifts,
        dislikedGifts,
        userInstructions,
        count
      );

      if (onProgress) {
        onProgress('Refined suggestions ready!');
        await this.delay(300);
      }

      return result.gifts;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const giftService = new GiftService();
export const useGiftService = () => giftService;
