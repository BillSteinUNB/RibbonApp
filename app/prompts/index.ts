import type { Recipient } from '../types/recipient';
import { SYSTEM_PROMPT } from './system.prompt';
import { generateBirthdayPrompt } from './birthday.prompt';
import { generateHolidayPrompt } from './holiday.prompt';
import { generateAnniversaryPrompt } from './anniversary.prompt';
import { generateCustomPrompt } from './custom.prompt';

/**
 * System prompt exported for AI service to use
 */
export { SYSTEM_PROMPT };

/**
 * Get appropriate prompt for gift suggestion based on occasion type
 */
export function getPromptForOccasion(
  recipient: Recipient,
  count: number = 5
): string {
  switch (recipient.occasion.type) {
    case 'birthday':
      return generateBirthdayPrompt(recipient, count);
    
    case 'holiday':
      return generateHolidayPrompt(recipient, count);
    
    case 'anniversary':
    case 'wedding':
      return generateAnniversaryPrompt(recipient, count);
    
    case 'other':
      if (recipient.occasion.customName) {
        return generateCustomPrompt(recipient, count);
      }
      // Fall through to generic if no custom name
    default:
      // Generic/default prompt for regular gifts
      return generateBirthdayPrompt(recipient, count);
  }
}

/**
 * Get user prompt for gift suggestion (used by AI service)
 * Exported for direct use if needed
 */
export function getUserPrompt(
  recipient: Recipient,
  count: number = 5
): string {
  return getPromptForOccasion(recipient, count);
}
