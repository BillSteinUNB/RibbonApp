import OpenAI from 'openai';
import { getEnvVar } from '../config/env';
import { errorLogger } from './errorLogger';

/**
 * OpenAI Configuration
 */
const AI_CONFIG = {
  apiKey: getEnvVar('EXPO_PUBLIC_AI_API_KEY'),
  model: 'gpt-4-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  requestCount: 5,
} as const;

/**
 * AI Service
 * Manages OpenAI API calls for gift generation
 */
class AIService {
  private client: OpenAI | null = null;
  private isInitialized = false;

  /**
   * Initialize OpenAI client
   */
  initialize(): void {
    if (this.isInitialized) return;

    if (!AI_CONFIG.apiKey) {
      throw new Error('AI_API_KEY environment variable is not set');
    }

    try {
      this.client = new OpenAI({
        apiKey: AI_CONFIG.apiKey,
        dangerouslyAllowBrowser: true,
      });
      this.isInitialized = true;
    } catch (error) {
      errorLogger.log(error, { context: 'AI Service initialization' });
      throw error;
    }
  }

  /**
   * Generate gift suggestions
   */
  async generateGiftSuggestions(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      errorLogger.log(error, { context: 'generateGiftSuggestions' });
      throw new Error('Failed to generate gift suggestions');
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return !!AI_CONFIG.apiKey;
  }

  /**
   * Get AI configuration
   */
  getConfig() {
    return {
      model: AI_CONFIG.model,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      requestCount: AI_CONFIG.requestCount,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
