import { getEnvVar } from '../config/env';
import { errorLogger } from './errorLogger';

/**
 * AI Service Configuration
 * Now routes through Supabase Edge Function to keep API key secure
 */
const AI_CONFIG = {
  // Supabase Edge Function URL
  functionUrl: `${getEnvVar('EXPO_PUBLIC_SUPABASE_URL')}/functions/v1/generate-gifts`,
  supabaseAnonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  requestCount: 5,
} as const;

/**
 * AI Service
 * Manages gift generation via Supabase Edge Function
 * API key is stored securely in Supabase secrets, not exposed to client
 */
class AIService {
  private isInitialized = false;

  /**
   * Initialize AI service
   */
  initialize(): void {
    if (this.isInitialized) return;

    if (!AI_CONFIG.functionUrl || !AI_CONFIG.supabaseAnonKey) {
      throw new Error('Supabase configuration is not set');
    }

    this.isInitialized = true;
  }

  /**
   * Generate gift suggestions via secure Edge Function
   */
  async generateGiftSuggestions(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      const response = await fetch(AI_CONFIG.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.supabaseAnonKey}`,
          'apikey': AI_CONFIG.supabaseAnonKey || '',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      errorLogger.log(error, { context: 'generateGiftSuggestions' });
      throw new Error('Failed to generate gift suggestions');
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return !!(AI_CONFIG.functionUrl && AI_CONFIG.supabaseAnonKey);
  }

  /**
   * Get AI configuration (public info only)
   */
  getConfig() {
    return {
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      topP: AI_CONFIG.topP,
      requestCount: AI_CONFIG.requestCount,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
