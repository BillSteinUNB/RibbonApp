export interface Recipient {
  id: string;
  name: string;
  relationship: string;
  ageRange: string;
  gender: string;
  interests: string[];
  dislikes: string;
  budget: string;
  pastGifts: string;
  savedIdeas: GiftIdea[];
}

export interface GiftIdea {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  price: string;
  category: string;
  isSaved: boolean;
  isPurchased: boolean;
}
