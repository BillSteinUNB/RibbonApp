import OpenAI from 'openai';
import { getEnvVar } from '../config/env';
import { errorLogger } from './errorLogger';

/**
 * MiniMax M2.1 Configuration
 * Uses OpenAI-compatible API format
 * Docs: https://platform.minimax.io/docs
 */
const AI_CONFIG = {
  apiKey: getEnvVar('EXPO_PUBLIC_AI_API_KEY'),
  baseUrl: 'https://api.minimax.io/v1',
  model: 'MiniMax-M2.1',
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  requestCount: 5,
} as const;

/**
 * AI Service
 * Manages MiniMax M2.1 API calls for gift generation
 * Uses OpenAI SDK with custom base URL for MiniMax compatibility
 */
class AIService {
  private client: OpenAI | null = null;
  private isInitialized = false;

  /**
   * Initialize MiniMax client (OpenAI-compatible)
   */
  initialize(): void {
    if (this.isInitialized) return;

    if (!AI_CONFIG.apiKey) {
      throw new Error('AI_API_KEY environment variable is not set');
    }

    try {
      this.client = new OpenAI({
        apiKey: AI_CONFIG.apiKey,
        baseURL: AI_CONFIG.baseUrl,
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
        top_p: AI_CONFIG.topP,
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
      baseUrl: AI_CONFIG.baseUrl,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      topP: AI_CONFIG.topP,
      requestCount: AI_CONFIG.requestCount,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
