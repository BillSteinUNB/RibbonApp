/**
 * FAQ data structure for the Help Center
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategoryType;
}

export type FAQCategoryType = 'getting-started' | 'profile' | 'gifts' | 'billing' | 'troubleshooting';

export interface FAQCategory {
  id: FAQCategoryType;
  title: string;
  icon: string;
}

export const FAQ_CATEGORIES: { id: FAQCategoryType; title: string; icon: string }[] = [
  { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
  { id: 'profile', title: 'Profile & Preferences', icon: '👤' },
  { id: 'gifts', title: 'Gifts & Recipients', icon: '🎁' },
  { id: 'billing', title: 'Billing & Subscription', icon: '💳' },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' },
];

export const FAQ_ITEMS: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'getting-started',
    question: 'What is Ribbon?',
    answer: 'Ribbon is an AI-powered gift recommendation app that helps you find the perfect gifts for the important people in your life. Simply add information about a recipient, and our AI will suggest personalized gift ideas based on their interests, preferences, and your budget.',
  },
  {
    id: 'gs-2',
    category: 'getting-started',
    question: 'How do I add a recipient?',
    answer: 'Tap the "Add Recipient" button on the main screen, then fill in the recipient\'s details including their name, relationship to you, interests, budget range, and the occasion you\'re shopping for. The more information you provide, the better our gift suggestions will be.',
  },
  {
    id: 'gs-3',
    category: 'getting-started',
    question: 'How does the free trial work?',
    answer: 'New users receive a limited number of free gift generations. Once you\'ve used your free generations, you can continue using the app with our premium subscription or upgrade for unlimited gift ideas.',
  },
  {
    id: 'gs-4',
    category: 'getting-started',
    question: 'Can I save and organize gift ideas?',
    answer: 'Yes! You can save gift ideas that interest you, mark gifts as purchased when you buy them, and view your complete gift history for each recipient. This helps you track what you\'ve given in the past and avoid repetition.',
  },

  // Profile & Settings
  {
    id: 'acc-1',
    category: 'profile',
    question: 'Do I need to create an account?',
    answer: 'No account required. Ribbon stores your profile and gift history locally on your device so you can start using the app immediately.',
  },
  {
    id: 'acc-2',
    category: 'profile',
    question: 'How do I update my profile?',
    answer: 'Go to Settings and select "Edit Profile" to update your name and preferences. Changes are saved automatically on your device.',
  },
  {
    id: 'acc-3',
    category: 'profile',
    question: 'How do I reset my data?',
    answer: 'All data is stored locally. To start fresh, clear Ribbon\'s storage in your device settings or reinstall the app.',
  },
  {
    id: 'acc-4',
    category: 'profile',
    question: 'How do I enable or disable notifications?',
    answer: 'Go to Settings > Notifications. You can toggle occasion reminders, weekly digest emails, and other notifications on or off based on your preferences.',
  },

  // Gifts & Recipients
  {
    id: 'gift-1',
    category: 'gifts',
    question: 'How are gift suggestions generated?',
    answer: 'Our AI analyzes the recipient\'s profile including their interests, age range, relationship to you, budget, occasion, and any past gifts you\'ve given. It then generates personalized gift suggestions that match these criteria.',
  },
  {
    id: 'gift-2',
    category: 'gifts',
    question: 'Can I refine gift suggestions?',
    answer: 'Yes! Premium users can refine gift suggestions by providing feedback on the initial results. Tell us what you liked or didn\'t like about the suggestions, and our AI will generate new, improved recommendations.',
  },
  {
    id: 'gift-3',
    category: 'gifts',
    question: 'How do I edit a recipient\'s information?',
    answer: 'Go to the recipient\'s detail page and tap the edit (pencil) icon in the top right corner. You can update any of their information including interests, budget, and occasion details.',
  },
  {
    id: 'gift-4',
    category: 'gifts',
    question: 'Can I duplicate a recipient?',
    answer: 'Yes, this is useful when shopping for multiple family members with similar interests. On the recipient detail page, you can duplicate the recipient and then make any necessary adjustments.',
  },
  {
    id: 'gift-5',
    category: 'gifts',
    question: 'How do I see my full gift history?',
    answer: 'On the recipient detail page, tap "View all gifts" to see a complete history of all gift suggestions generated for that recipient. You can search, filter, and sort the list to find specific gifts.',
  },

  // Billing & Subscription
  {
    id: 'bill-1',
    category: 'billing',
    question: 'What\'s included in the premium subscription?',
    answer: 'Premium includes unlimited gift generations, the ability to refine gift suggestions, access to advanced filtering options, and priority support. You also get early access to new features.',
  },
  {
    id: 'bill-2',
    category: 'billing',
    question: 'What are the pricing options?',
    answer: 'We offer both monthly and annual subscription plans. The annual plan provides significant savings compared to the monthly plan. Check the Pricing page for current rates and any special offers.',
  },
  {
    id: 'bill-3',
    category: 'billing',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime from Settings > Subscription > Manage Subscription. Your access will continue until the end of your current billing period.',
  },
  {
    id: 'bill-4',
    category: 'billing',
    question: 'Can I switch between monthly and annual plans?',
    answer: 'Yes! You can change your plan anytime from Settings > Subscription. The change will take effect at your next billing date.',
  },
  {
    id: 'bill-5',
    category: 'billing',
    question: 'How do I restore purchases?',
    answer: 'Open the Premium tab and tap "Restore Purchases" to recover your subscription and purchases.',
  },

  // Troubleshooting
  {
    id: 'tr-1',
    category: 'troubleshooting',
    question: 'Gift generation is taking too long. What should I do?',
    answer: 'Gift generation typically takes 5-10 seconds. If it\'s taking longer, try closing and reopening the app. Ensure you have a stable internet connection. If the problem persists, contact support.',
  },
  {
    id: 'tr-2',
    category: 'troubleshooting',
    question: 'The app keeps crashing. How do I fix it?',
    answer: 'Try restarting the app first. If that doesn\'t work, reinstall the app. Your data is stored locally, so export anything important before reinstalling. If issues continue, please contact support.',
  },
  {
    id: 'tr-3',
    category: 'troubleshooting',
    question: 'I can\'t see my recipients or gift history.',
    answer: 'Data is stored locally on your device. If items are missing, try restarting the app. If the issue persists, check available storage and contact support.',
  },
  {
    id: 'tr-4',
    category: 'troubleshooting',
    question: 'How do I contact support?',
    answer: 'You can reach our support team by email at support@ribbonapp.com. We typically respond within 24-48 hours on business days. For bug reports or feature requests, you can also visit our GitHub repository.',
  },
];

export const CONTACT_INFO = {
  supportEmail: 'contact@billstein.dev',
  bugReportEmail: 'contact@billstein.dev',
  featureRequestEmail: 'contact@billstein.dev',
  documentationUrl: 'https://billsteinunb.github.io/RibbonApp/',
  githubUrl: 'https://github.com/BillSteinUNB/RibbonApp/issues',
};

export const SUPPORT_SUBJECTS = {
  general: 'Support Request',
  bug: 'Bug Report',
  feature: 'Feature Request',
  billing: 'Billing Question',
};
