import { GiftIdea } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const RELATIONSHIPS = ['Mom', 'Dad', 'Partner', 'Friend', 'Sibling', 'Child', 'Coworker', 'Other'];
export const AGE_RANGES = ['Under 18', '18-30', '31-50', '51-70', '70+'];
export const INTERESTS_LIST = [
  'Cooking', 'Reading', 'Fitness', 'Gaming',
  'Art', 'Gardening', 'Travel', 'Music',
  'Photo', 'Wellness', 'Fashion', 'DIY',
  'Wine', 'Coffee', 'Pets', 'Sports',
  'Tech', 'Movies'
];

export const MOCK_GIFT_IDEAS: GiftIdea[] = [
  {
    id: '1',
    name: 'Le Creuset Dutch Oven',
    description: 'Enameled Cast Iron Signature Round Dutch Oven, 5.5 qt.',
    reasoning: 'Perfect for her love of cooking and durable enough to last a lifetime.',
    price: '~$350',
    category: 'Cooking',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '2',
    name: 'Masterclass Subscription',
    description: 'Annual membership to learn from the world\'s best.',
    reasoning: 'Since she loves learning new skills, she can take cooking classes from Gordon Ramsay.',
    price: '$180/yr',
    category: 'Education',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '3',
    name: 'Aesop Hand Balm',
    description: 'Resurrection Aromatique Hand Balm',
    reasoning: 'A luxurious treat for her hands after gardening.',
    price: '$30',
    category: 'Wellness',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '4',
    name: 'Kindle Paperwhite',
    description: 'Waterproof e-reader with adjustable warm light.',
    reasoning: 'Great for reading in the bath or on the go without eye strain.',
    price: '$140',
    category: 'Tech',
    isSaved: false,
    isPurchased: false,
  },
];
