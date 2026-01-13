import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { Recipient, RecipientFormData } from '../types/recipient';
import { generateId, getTimestamp } from '../utils/helpers';
import { recipientFormSchema } from '../types/recipient';
import { z } from 'zod';

/**
 * Recipient Service
 * Manages recipient CRUD operations with persistence
 */
class RecipientService {
  private recipients: Recipient[] = [];

  /**
   * Load all recipients from storage
   */
  async loadRecipients(): Promise<Recipient[]> {
    try {
      const data = await storage.getItem<Recipient[]>(STORAGE_KEYS.RECIPIENTS);
      this.recipients = data || [];
      return this.recipients;
    } catch (error) {
      errorLogger.log(error, { context: 'loadRecipients' });
      throw new AppError('Failed to load recipients');
    }
  }

  /**
   * Save all recipients to storage
   */
  private async saveRecipients(): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.RECIPIENTS, this.recipients);
    } catch (error) {
      errorLogger.log(error, { context: 'saveRecipients' });
      throw new AppError('Failed to save recipients');
    }
  }

  /**
   * Create a new recipient
   */
  async createRecipient(formData: Partial<RecipientFormData>): Promise<Recipient> {
    try {
      // Validate form data
      const validatedData = recipientFormSchema.parse(formData);

      const newRecipient: Recipient = {
        ...validatedData,
        id: generateId(),
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
        pastGifts: validatedData.pastGifts || [],
        dislikes: validatedData.dislikes || '',
      };

      this.recipients.push(newRecipient);
      await this.saveRecipients();

      return newRecipient;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Invalid recipient data', 'VALIDATION_ERROR');
      }
      errorLogger.log(error, { context: 'createRecipient', formData });
      throw new AppError('Failed to create recipient');
    }
  }

  /**
   * Get recipient by ID
   */
  async getRecipient(id: string): Promise<Recipient | null> {
    try {
      await this.ensureLoaded();
      return this.recipients.find((r) => r.id === id) || null;
    } catch (error) {
      errorLogger.log(error, { context: 'getRecipient', id });
      throw new AppError('Failed to get recipient');
    }
  }

  /**
   * Get all recipients
   */
  async getAllRecipients(): Promise<Recipient[]> {
    try {
      await this.ensureLoaded();
      return [...this.recipients];
    } catch (error) {
      errorLogger.log(error, { context: 'getAllRecipients' });
      throw new AppError('Failed to get recipients');
    }
  }

  /**
   * Update recipient
   */
  async updateRecipient(id: string, updates: Partial<RecipientFormData>): Promise<Recipient> {
    try {
      await this.ensureLoaded();

      const index = this.recipients.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new AppError('Recipient not found', 'NOT_FOUND');
      }

      // Validate updates
      const currentRecipient = this.recipients[index];
      const recipientUpdate = recipientFormSchema.parse(updates);

      const updatedRecipient: Recipient = {
        ...currentRecipient,
        ...recipientUpdate,
        updatedAt: getTimestamp(),
      };

      this.recipients[index] = updatedRecipient;
      await this.saveRecipients();

      return updatedRecipient;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Invalid recipient data', 'VALIDATION_ERROR');
      }
      errorLogger.log(error, { context: 'updateRecipient', id });
      throw new AppError('Failed to update recipient');
    }
  }

  /**
   * Delete recipient
   */
  async deleteRecipient(id: string): Promise<void> {
    try {
      await this.ensureLoaded();

      const index = this.recipients.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new AppError('Recipient not found', 'NOT_FOUND');
      }

      this.recipients.splice(index, 1);
      await this.saveRecipients();
    } catch (error) {
      errorLogger.log(error, { context: 'deleteRecipient', id });
      throw new AppError('Failed to delete recipient');
    }
  }

  /**
   * Search recipients by query
   */
  async searchRecipients(query: string): Promise<Recipient[]> {
    try {
      await this.ensureLoaded();

      const lowerQuery = query.toLowerCase();
      return this.recipients.filter((recipient) =>
        recipient.name.toLowerCase().includes(lowerQuery) ||
        recipient.relationship.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      errorLogger.log(error, { context: 'searchRecipients', query });
      throw new AppError('Failed to search recipients');
    }
  }

  /**
   * Ensure recipients are loaded from storage
   */
  private async ensureLoaded(): Promise<void> {
    if (this.recipients.length === 0) {
      await this.loadRecipients();
    }
  }

  /**
   * Sort recipients by last gift consultation
   */
  async getRecipientsByRecentConsultation(limit?: number): Promise<Recipient[]> {
    try {
      await this.ensureLoaded();

      const sorted = [...this.recipients].sort((a, b) => {
        const aDate = a.lastGiftConsultation ? new Date(a.lastGiftConsultation).getTime() : 0;
        const bDate = b.lastGiftConsultation ? new Date(b.lastGiftConsultation).getTime() : 0;
        return bDate - aDate;
      });

      return limit ? sorted.slice(0, limit) : sorted;
    } catch (error) {
      errorLogger.log(error, { context: 'getRecipientsByRecentConsultation' });
      throw new AppError('Failed to get recipients');
    }
  }

  /**
   * Get upcoming occasions (sorted by date)
   */
  async getUpcomingOccasions(limit: number = 5): Promise<Array<{
    recipient: Recipient;
    daysUntil: number;
  }>> {
    try {
      await this.ensureLoaded();

      const now = new Date();
      const upcoming: Array<{
        recipient: Recipient;
        daysUntil: number;
      }> = [];

      for (const recipient of this.recipients) {
        if (recipient.occasion.date) {
          const occasionDate = new Date(recipient.occasion.date);
          if (occasionDate > now) {
            const daysUntil = Math.ceil(
              (occasionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            upcoming.push({ recipient, daysUntil });
          }
        }
      }

      return upcoming
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, limit);
    } catch (error) {
      errorLogger.log(error, { context: 'getUpcomingOccasions' });
      throw new AppError('Failed to get upcoming occasions');
    }
  }

  /**
   * Clear all recipients (for logout or testing)
   */
  async clearAll(): Promise<void> {
    try {
      this.recipients = [];
      await storage.removeItem(STORAGE_KEYS.RECIPIENTS);
    } catch (error) {
      errorLogger.log(error, { context: 'clearAllRecipients' });
      throw new AppError('Failed to clear recipients');
    }
  }
}

// Export singleton instance
export const recipientService = new RecipientService();
