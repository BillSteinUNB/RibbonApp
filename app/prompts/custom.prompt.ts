import type { Recipient } from '../types/recipient';
import { SYSTEM_PROMPT } from './system.prompt';
import { sanitizeForPrompt, sanitizeArrayForPrompt } from '../utils/validation';

/**
 * Custom Occasion Prompt Template
 * Generates gift suggestions for custom occasions (e.g., Housewarming, Graduation, Retirement, etc.)
 */
export function generateCustomPrompt(recipient: Recipient, requestCount: number = 5): string {
  const occasionName = sanitizeForPrompt(recipient.occasion.customName, 100) || 'Special Occasion';
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

  return `I need ${requestCount} ${occasionName} gift suggestions for:

**Recipient Details:**
- Name: ${name}
- Relationship: ${relationship}
- Age: ${ageRange || 'Not specified'}
- Gender: ${gender || 'Not specified'}

**Interests:** ${interestsList}
**Dislikes/Allergies:** ${dislikes}

**Budget:** ${recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}

**${occasionName} Date:** ${formattedDate}

**Past Gifts:** ${pastGiftsList}
**Additional Notes:** ${notes}

**SPECIAL ${occasionName.toUpperCase()} CONSIDERATIONS:**
- Create thoughtful, meaningful gifts that honor this special celebration
- Consider items that would be useful or meaningful for this milestone
- Include gifts that can help them celebrate this life event appropriately
- Look for personalized or custom items that reference the ${occasionName} specifically
- Include some celebratory and congratulatory items for this occasion
- For housewarming: focus on new home setup, first apartment essentials, practical items
- For retirement: consider items for new chapter life, relaxing gifts, hobbies
- For graduation: celebrate success and future opportunities, career-related gifts
- For new job: gifts that celebrate new chapter, professional essentials
- Include gifts that create lasting memories of this milestone
- Make gifts feel personal to them and their specific situation

**GUIDELINES FOR ${occasionName.toUpperCase()}:**
${generateContextSpecificGuidelines(occasionName)}

**GENERAL REQUIREMENTS:**
1. Suggest ${requestCount} unique gift ideas within the budget
2. For each gift, provide: name, detailed description (2-3 sentences), reasoning why it's perfect for this ${occasionName.toLowerCase()}
3. Avoid anything from the dislikes/allergies list
4. Make gifts feel personal to ${recipient.name} and their specific situation
5. Include a mix of practical, celebratory, and sentimental gifts
6. If interest-based, explain connection to their interests relevant to ${occasionName.toLowerCase()}
7. Consider gifts that create memories of this special moment
8. Include items that appropriately mark this milestone
9. Make suggestions feel you truly understand what ${occasionName} means to them
10. Ensure gifts celebrate this significant life event appropriately

**RESPONSE FORMAT:**
Return a JSON array of gift ideas with this exact structure (no markdown, no extra text):
[
  {
    "name": "Gift Name",
    "description": "Detailed 2-3 sentence description",
    "reasoning": "Why this gift is perfect for ${occasionName} and celebrates this milestone with ${recipient.name}",
    "price": "Price range or specific price",
    "category": "Category (context-appropriate for ${occasionName})",
    "url": null,
    "stores": [],
    "tags": ["relevant", "keywords", "for", "filtering", "occasion:${occasionName.toLowerCase().replace(' ', '-')}"]
  }
]`;
}

/**
 * Generate context-specific guidelines based on the custom occasion type
 */
function generateContextSpecificGuidelines(occasionName: string): string {
  const lowerName = occasionName.toLowerCase();
  
  const guidelines: Record<string, string> = {
    housewarming: `- Practical home essentials for first apartment
- Kitchen and cooking items for new home
- Decorative items that help make it feel like home
- Tools or gadgets for setting up new space
- Plants or living items to bring life to spaces
- Comforting gifts that create a welcoming atmosphere`,
    
    retirement: `- Gifts celebrating new chapter of freedom
- Items for pursuing hobbies or interests
- Relaxing and wellness gifts for enjoying retirement
- Travel-related gifts for new adventures
- Personal items honoring their career and legacy
- Books, puzzles, and entertainment for leisure time`,
    
    graduation: `- Career-related items reflecting their field
- Gifts honoring this significant achievement
- Items celebrating academic or professional success
- Practical for their new adult life
- Sentimental items to mark this milestone
- Experience gifts for celebration and relaxation`,
    
    'new job': `- Professional essentials for their role
- Practical gifts for their workspace
- Items celebrating new career opportunities
- Comforting gifts reducing work stress
- Gifts that acknowledge their success and growth
- Business-related items for professional development`,
    
    promotion: `- Gifts celebrating career advancement
- Professional and luxury items honoring their success
- Congratulatory gifts for this achievement
- Practical gifts for higher responsibilities
- Celebratory items for their new position`,
    
    'baby shower': `- Essential baby and nursery items
- Gifts supporting the parenting journey
- Clothing and accessories for the baby
- Educational and development toys
- Comfort and care items for new parents
- Memory-making items for this special time`,
    
    'get well soon': `- Recovery and wellness gifts
- Comfort items for healing
- Entertainment and distraction gifts
- Gifts celebrating health and improvements
- Thoughtful items showing care and support
- Items making their recovery more comfortable`,
    
    'moving': `- Practical gifts for settling into new home
- Items for organizing and decorating
- Gifts that celebrate new chapter and fresh start
- Housewarming and housewarming essentials
- Items specific to making a house feel like home
- Moving logistics and storage solutions`,
    
    'thank you': `- Deeply personal gifts showing genuine appreciation
- Sentimental items that acknowledge the express gratitude and appreciation
- Customizable gifts that make them feel truly seen and valued
- Gifts that strengthen and honor relationships
- Include gifts that can be shared and enjoyed together
- Consider tokens of special moments in their relationship
- Make gifts that demonstrate understanding of their impact and support`,
  };
  
  return guidelines[lowerName] || `- Focus on items that appropriately celebrate this milestone
- Consider items that acknowledge significance of ${occasionName}
- Include gifts that create lasting memories of this special occasion
- Make suggestions personal and meaningful to ${occasionName.toLowerCase()}`;
}
