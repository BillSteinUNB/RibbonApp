import type { Recipient } from '../types/recipient';
import { SYSTEM_PROMPT } from './system.prompt';

/**
 * Anniversary Prompt Template
 * Generates gift suggestions specifically for anniversary and wedding occasions
 */
export function generateAnniversaryPrompt(recipient: Recipient, requestCount: number = 5): string {
  const formattedDate = recipient.occasion.date
    ? new Date(recipient.occasion.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not specified';

  const interestsList = recipient.interests.join(', ') || 'Not specified';
  const pastGiftsList = recipient.pastGifts?.join(', ') || 'None';

  const isWedding = recipient.occasion.type === 'wedding';
  const occasionType = isWedding ? 'Wedding' : 'Anniversary';

  return `I need ${requestCount} ${occasionType.toLowerCase()} gift suggestions for:

**Recipient Details:**
- Name: ${recipient.name}
- Relationship: ${recipient.relationship}
- Age: ${recipient.ageRange || 'Not specified'}
- Gender: ${recipient.gender || 'Not specified'}

**Interests:** ${interestsList}
**Dislikes/Allergies:** ${recipient.dislikes || 'None'}

**Budget:** ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}

**${occasionType} Date:** ${formattedDate}

**Past Gifts:** ${pastGiftsList}
**Additional Notes:** ${recipient.notes || 'None'}

**SPECIAL ${occasionType.toUpperCase()} CONSIDERATIONS:**
${isWedding ? `- Wedding gifts that celebrate the start of a new life together
- Consider gifts for the couple to use in their home or experiences
- Include thoughtful gifts for both partners or couple sharing
- Look for items that celebrate their unique love story and bond
- Consider personalized wedding gifts (names, dates, special meaning)
- Include gifts for different wedding roles: for the couple, for friends, for family
- Emphasis on romance and making memories together
- Consider gifts that honor their cultural or personal preferences` : `- Gifts celebrating the love and a journey together over the years
- Include gifts that cherish the memories and celebrate your bond
- Prefer gifts that can be shared or experienced together
- Include romantic, thoughtful gifts that show deep understanding
- Consider milestone anniversaries (1st, 5th, 10th, 25th, 50th)
- Include personalized items and anniversary-specific mementos
- Look for creative ways to celebrate their love story
- Focus on emotional significance of the relationship`}
${isWedding ? 'Wedding gifts should be memorable and set them up for their new chapter' : 'Anniversary gifts should be romantic and nostalgic'}
- Include traditional gifts mixed with modern, thoughtful choices

**GENERAL REQUIREMENTS:**
1. Suggest ${requestCount} unique gift ideas within the budget
2. For each gift, provide: name, detailed description (2-3 sentences), reasoning why it fits for their ${occasionType.toLowerCase()} and celebrates their love
3. Avoid anything from the dislikes/allergies list
4. Make gifts feel meaningful and celebrating of their bond
5. Include a mix of romantic, sentimental and practical gifts
6. If interest-based, connect gift to shared hobbies or interests
7. Consider gifts that create new memories together
8. Include personalized or customized gift options where appropriate
9. For high-budget weddings, suggest memorable luxury gifts
10. ${isWedding ? 'Suggest gifts appropriate for their wedding party/celebration' : 'Make them feel special and deeply appreciated by you'}

**RESPONSE FORMAT:**
Return a JSON array of gift ideas with this exact structure (no markdown, no extra text):
[
  {
    "name": "Gift Name",
    "description": "Detailed 2-3 sentence description",
    "reasoning": "Why this gift celebrates the ${occasionType.toLowerCase()} and your relationship",
    "price": "Price range or specific price",
    "category": "Category (e.g., Romantic, Experience, Home, Fashion, Jewelry, etc.)",
    "url": null,
    "stores": [],
    "tags": ["relevant", "keywords", "for", "filtering"]
  }
]`;
}
