export interface Subscription {
  userId: string;
  plan: 'free' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'canceling' | 'expired';
  startDate: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  paymentProvider: 'stripe' | 'revenuecat' | 'apple' | 'google' | 'none';
  providerCustomerId?: string;
  providerSubscriptionId?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'week' | 'month' | 'year';
  features: string[];
  popular?: boolean;
  storeProductId?: string; // For RevenueCat/IAP
  type?: 'subscription' | 'consumable';
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'weekly',
    name: 'Pro Weekly',
    price: 3.99,
    currency: 'USD',
    interval: 'week',
    features: [
      'Unlimited gift generations',
      'Unlimited recipients',
      'Gift history & tracking',
    ],
    storeProductId: 'weekly',
    type: 'subscription',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 8.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited gift generations',
      'Advanced AI persona analysis',
      'Unlimited recipients',
      'Gift history & tracking',
      'Priority support',
    ],
    storeProductId: 'monthly',
    type: 'subscription',
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 24.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'All Monthly features',
      'Save 77%',
      'Early access to new features',
    ],
    popular: true,
    storeProductId: 'yearly',
    type: 'subscription',
  },
];

// Consumable product for one-time purchases (e.g., extra gift generations)
export interface ConsumableProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number; // Number of gift generations included
  storeProductId: string;
}

export const CONSUMABLE_PRODUCTS: ConsumableProduct[] = [
  {
    id: 'consumable',
    name: '5 Extra Gift Generations',
    price: 2.99,
    currency: 'USD',
    credits: 5,
    storeProductId: 'consumable',
  },
];
