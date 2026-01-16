import type { Recipient } from '../types/recipient';
import { SYSTEM_PROMPT } from './system.prompt';
import { sanitizeForPrompt, sanitizeArrayForPrompt } from '../utils/validation';

/**
 * Birthday Prompt Template
 * Generates gift suggestions specifically for birthday occasions
 */
export function generateBirthdayPrompt(recipient: Recipient, requestCount: number = 5): string {
  const formattedDate = recipient.occasion.date
    ? new Date(recipient.occasion.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not specified';

  // Sanitize all user-provided inputs to prevent prompt injection
  const name = sanitizeForPrompt(recipient.name, 100);
  const relationship = sanitizeForPrompt(recipient.relationship, 50);
  const ageRange = sanitizeForPrompt(recipient.ageRange, 30);
  const gender = sanitizeForPrompt(recipient.gender, 30);
  const interestsList = sanitizeArrayForPrompt(recipient.interests, 100).join(', ') || 'Not specified';
  const dislikes = sanitizeForPrompt(recipient.dislikes, 300) || 'None';
  const pastGiftsList = sanitizeArrayForPrompt(recipient.pastGifts, 100).join(', ') || 'None';
  const notes = sanitizeForPrompt(recipient.notes, 500) || 'None';

  return `I need ${requestCount} birthday gift suggestions for:

**Recipient Details:**
- Name: ${name}
- Relationship: ${relationship}
- Age: ${ageRange || 'Not specified'}
- Gender: ${gender || 'Not specified'}

**Interests:** ${interestsList}
**Dislikes/Allergies:** ${dislikes}

**Budget:** ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}

**Birthday Date:** ${formattedDate}

**Past Gifts:** ${pastGiftsList}
**Additional Notes:** ${notes}

**SPECIAL BIRTHDAY CONSIDERATIONS:**
- Age-appropriate gifts that celebrate another year of life
- Consider milestone birthdays (18, 21, 30, 40, 50, 60, etc.) if applicable
- Prefer gifts that capture the celebrate their age or life stage
- Include nostalgic gifts that evoke childhood memories or celebrate maturity
- For milestone birthdays, suggest something extra special and memorable
- For children: age-appropriate toys and experiences
- For teens: trending gifts, tech, social experiences
- For adults: sophisticated, meaningful, or experience-based gifts
- Focus on gifts that make them feel special on their day

**GENERAL REQUIREMENTS:**
1. Suggest ${requestCount} unique gift ideas within the budget
2. For each gift, provide: name, detailed description (2-3 sentences), reasoning why it fits, estimated price, and category
3. Avoid anything from the dislikes/allergies list
4. Consider the make gifts with personal age and life stage relevant
5. Include a mix of heartfelt meaningful and fun celebratory gifts
6. If interest-based, explain the specific connection between gift and their interests
7. Include some gifts that create lasting memories
8. Consider gifts that can be shared with family/friends on birthday
9. Use warm congratulatory tone - this is their special day!
10. For milestone birthdays, add extra thoughtful touch

**RESPONSE FORMAT:**
Return a JSON array of gift ideas with this exact structure (no markdown, no extra text):
[
  {
    "name": "Gift Name",
    "description": "Detailed 2-3 sentence description",
    "reasoning": "Why this gift fits the birthday and the recipient",
    "price": "Price range or specific price",
    "category": "Category (e.g., Tech, Fashion, Experience, Home, Books, etc.)",
    "url": null,
    "stores": [],
    "tags": ["relevant", "keywords", "for", "filtering"]
  }
]`;
}
