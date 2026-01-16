import type { Recipient } from '../types/recipient';
import { SYSTEM_PROMPT } from './system.prompt';
import { sanitizeForPrompt, sanitizeArrayForPrompt } from '../utils/validation';

/**
 * Holiday Prompt Template
 * Generates gift suggestions specifically for holiday occasions (Christmas, Hanukkah, etc.)
 */
export function generateHolidayPrompt(recipient: Recipient, requestCount: number = 5): string {
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

  return `I need ${requestCount} holiday gift suggestions for:

**Recipient Details:**
- Name: ${name}
- Relationship: ${relationship}
- Age: ${ageRange || 'Not specified'}
- Gender: ${gender || 'Not specified'}

**Interests:** ${interestsList}
**Dislikes/Allergies:** ${dislikes}

**Budget:** ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}

**Holiday Date:** ${formattedDate}

**Past Gifts:** ${pastGiftsList}
**Additional Notes:** ${notes}

**SPECIAL HOLIDAY CONSIDERATIONS:**
- Festive, cheer-giving gifts that capture holiday spirit
- Consider family-oriented gifts that bring everyone together
- Seasonal items that celebrate the joy of the holiday season
- Gifts that create holiday memories and traditions they'll cherish
- Include decorations, treats, and experiences perfect for holiday celebration
- Look for limited edition holiday products that make gifts memorable
- Consider religious or cultural aspects if appropriate for relationship
- Gifts that can be enjoyed during holiday celebrations
- Warm, cozy gifts that evoke holiday nostalgia
- Include gifts that represent the togetherness and generosity

**GENERAL REQUIREMENTS:**
1. Suggest ${requestCount} unique gift ideas within the budget
2. For each gift, provide: name, detailed description (2-3 sentences), reasoning why it fits, estimated price, and category
3. Avoid anything from the dislikes/allergies list
4. Make gifts feel festive and appropriate for holiday season
5. Include a mix of traditional, meaningful, and modern holiday gifts
6. If interest-based, connect gift to their love (e.g., their love of cooking, their love of music)
7. Consider gifts that create shared holiday experiences
8. Include gifts that set a festive atmosphere at home
9. Add a dash of holiday magic and cheer to each of the suggestions
10. Consider gifts that strengthen relationships during the holiday season

**RESPONSE FORMAT:**
Return a JSON array of gift ideas with this exact structure (no markdown, no extra text):
[
  {
    "name": "Gift Name",
    "description": "Detailed 2-3 sentence description",
    "reasoning": "Why this gift fits the the holiday spirit and the",
    "price": "Price range or specific price",
    "category": "Category (e.g., Seasonal, Home Decor, Experiences, Tech, Fashion, etc.)",
    "url": null,
    "stores": [],
    "tags": ["relevant", "keywords", "for", "filtering"]
  }
]`;
}
