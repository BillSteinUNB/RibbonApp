import { errorLogger } from './errorLogger';

/**
 * AI Service Configuration
 * Uses a custom backend endpoint for AI requests
 */
const DEFAULT_AI_CONFIG = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  requestCount: 5,
} as const;

function getRuntimeConfig() {
  const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL;
  const apiKey = process.env.EXPO_PUBLIC_AI_API_KEY;

  return {
    apiUrl: apiUrl || '',
    apiKey: apiKey || '',
    ...DEFAULT_AI_CONFIG,
  } as const;
}

/**
 * AI Service
 * Manages gift generation via an external API
 */
class AIService {
  private isInitialized = false;

  /**
   * Initialize AI service
   */
  initialize(): void {
    if (this.isInitialized) return;

    const config = getRuntimeConfig();

    if (!config.apiUrl) {
      throw new Error('AI API URL is not set');
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.apiKey) {
        headers.Authorization = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(config.apiUrl, {
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
    return !!config.apiUrl;
  }

  /**
   * Get diagnostic info for debugging
   */
  getDiagnostics(): {
    isAvailable: boolean;
    hasApiUrl: boolean;
    hasApiKey: boolean;
    apiUrl: string;
  } {
    const config = getRuntimeConfig();
    return {
      isAvailable: this.isAvailable(),
      hasApiUrl: !!process.env.EXPO_PUBLIC_AI_API_URL,
      hasApiKey: !!process.env.EXPO_PUBLIC_AI_API_KEY,
      apiUrl: config.apiUrl || 'Not configured',
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
