import { errorLogger } from './errorLogger';

/**
 * AI Service Configuration
 * Now routes through Supabase Edge Function to keep API key secure
 */
const DEFAULT_AI_CONFIG = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  requestCount: 5,
} as const;

function getRuntimeConfig() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return {
    functionUrl: supabaseUrl ? `${supabaseUrl}/functions/v1/generate-gifts` : '',
    supabaseAnonKey: supabaseAnonKey || '',
    ...DEFAULT_AI_CONFIG,
  } as const;
}

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

    const config = getRuntimeConfig();

    if (!config.functionUrl || !config.supabaseAnonKey) {
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
      const config = getRuntimeConfig();
      const response = await fetch(config.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseAnonKey}`,
          'apikey': config.supabaseAnonKey || '',
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
    const config = getRuntimeConfig();
    return !!(config.functionUrl && config.supabaseAnonKey);
  }

  /**
   * Get AI configuration (public info only)
   */
  getConfig() {
    return {
      maxTokens: DEFAULT_AI_CONFIG.maxTokens,
      temperature: DEFAULT_AI_CONFIG.temperature,
      topP: DEFAULT_AI_CONFIG.topP,
      requestCount: DEFAULT_AI_CONFIG.requestCount,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
