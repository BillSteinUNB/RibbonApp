export interface Subscription {
  userId: string;
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'canceling' | 'expired';
  startDate: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  paymentProvider: 'stripe' | 'revenuecat' | 'none';
  providerCustomerId?: string;
  providerSubscriptionId?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  storeProductId?: string; // For RevenueCat/IAP
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited gift generations',
      'Advanced AI persona analysis',
      'Unlimited recipients',
      'Gift history & tracking',
      'Priority support'
    ],
    storeProductId: 'ribbon_pro_monthly'
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 49.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'All Monthly features',
      'Save 17%',
      'Early access to new features'
    ],
    popular: true,
    storeProductId: 'ribbon_pro_yearly'
  }
];
