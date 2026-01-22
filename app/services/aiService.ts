import { errorLogger } from './errorLogger';

/**
 * AI Service Configuration
 * Uses Supabase Edge Function to securely proxy requests to MiniMax
 */
const DEFAULT_AI_CONFIG = {
  maxTokens: 2000,
  temperature: 0.7,
  topP: 0.95,
  requestCount: 5,
} as const;

function getRuntimeConfig() {
  const apiUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return {
    // Edge function URL: {supabase_url}/functions/v1/generate-gifts
    functionUrl: apiUrl ? `${apiUrl}/functions/v1/generate-gifts` : '',
    anonKey: anonKey || '',
    ...DEFAULT_AI_CONFIG,
  } as const;
}

/**
 * AI Service
 * Manages gift generation via Supabase Edge Function -> MiniMax
 */
class AIService {
  private isInitialized = false;

  /**
   * Initialize AI service
   */
  initialize(): void {
    if (this.isInitialized) return;

    const config = getRuntimeConfig();

    if (!config.functionUrl) {
      throw new Error('Supabase URL is not configured');
    }

    this.isInitialized = true;
  }

  /**
   * Generate gift suggestions via Supabase Edge Function
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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Supabase anon key if available
      if (config.anonKey) {
        headers['apikey'] = config.anonKey;
        headers['Authorization'] = `Bearer ${config.anonKey}`;
      }

      const response = await fetch(config.functionUrl, {
        method: 'POST',
        headers,
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
    return !!config.functionUrl;
  }

  /**
   * Get diagnostic info for debugging
   */
  getDiagnostics(): {
    isAvailable: boolean;
    hasSupabaseUrl: boolean;
    hasAnonKey: boolean;
    functionUrl: string;
  } {
    const config = getRuntimeConfig();
    return {
      isAvailable: this.isAvailable(),
      hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      functionUrl: config.functionUrl || 'Not configured',
    };
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
