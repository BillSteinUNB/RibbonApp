import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Crown, Sparkles, RefreshCw, AlertCircle } from 'lucide-react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuthStore } from '../store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { SPACING, RADIUS, FONTS } from '../constants';
import { useTheme } from '../hooks/useTheme';

interface FallbackPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
}

const FALLBACK_PLANS: FallbackPlan[] = [
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$19.99',
    period: '/year',
    description: 'Unlimited gifts, AI features, best value',
    popular: true,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$4.99',
    period: '/month',
    description: 'Unlimited gifts and AI features',
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: '$2.99',
    period: '/week',
    description: 'Full access, cancel anytime',
  },
];

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, setSubscription, getOrCreateUser } = useAuthStore();
  const isPremium = user?.isPremium;

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasError, setHasError] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      await subscriptionService.initialize();
      const offerings = await subscriptionService.getOfferings();
      if (offerings?.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      setHasError(true);
      if (__DEV__) console.error('Failed to load offerings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const result = await subscriptionService.purchasePackage(pkg);
      if (result.success) {
        const activeUser = user ?? getOrCreateUser();
        const subscription = await subscriptionService.getSubscription(activeUser.id);
        setSubscription(subscription);
        Alert.alert('Success', 'Thank you for subscribing to Ribbon Pro!');
      } else if (result.error && result.error !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await subscriptionService.restorePurchases();
      if (result.success && result.isPremium) {
        const activeUser = user ?? getOrCreateUser();
        const subscription = await subscriptionService.getSubscription(activeUser.id);
        setSubscription(subscription);
        Alert.alert('Restored', 'Your subscription has been restored!');
      } else if (result.success) {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      } else {
        Alert.alert('Restore Failed', result.error || 'Could not restore purchases.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const formatPeriod = (pkg: PurchasesPackage) => {
    const id = pkg.identifier.toLowerCase();
    if (id.includes('yearly') || id.includes('annual')) return '/year';
    if (id.includes('monthly')) return '/month';
    if (id.includes('weekly')) return '/week';
    return '';
  };

  const getFallbackPlanPrice = (plan: FallbackPlan) => {
    // Try to match with loaded packages for real pricing
    const matchingPkg = packages.find(pkg => {
      const id = pkg.identifier.toLowerCase();
      if (plan.id === 'yearly') return id.includes('yearly') || id.includes('annual');
      if (plan.id === 'monthly') return id.includes('monthly');
      if (plan.id === 'weekly') return id.includes('weekly');
      return false;
    });
    return matchingPkg ? formatPrice(matchingPkg) : plan.price;
  };

  if (isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.lg }]}>
        <View style={styles.header}>
          <View style={styles.crownContainer}>
            <Crown size={48} color="#FFD700" fill="#FFD700" />
          </View>
          <Text style={styles.title}>You're a Pro!</Text>
          <Text style={styles.subtitle}>
            Thank you for supporting Ribbon
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Plan</Text>
          <Text style={styles.statusPlan}>
            {user?.subscription?.plan === 'yearly' ? 'Pro Yearly' :
             user?.subscription?.plan === 'weekly' ? 'Pro Weekly' :
             'Pro Monthly'}
          </Text>
          {user?.subscription?.endDate && (
            <Text style={styles.statusDate}>
              Renews: {new Date(user.subscription.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        <Text style={styles.manageText}>
          To manage your subscription, go to your device's App Store settings.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.lg }]}>
      <View style={styles.header}>
        <View style={styles.sparkleContainer}>
          <Sparkles size={40} color={colors.accentPrimary} />
        </View>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>
          Get unlimited gift ideas and advanced AI features
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : packages.length > 0 ? (
        <>
          {packages.map((pkg) => {
            const isPopular = pkg.identifier.toLowerCase().includes('yearly');
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.planCard, isPopular && styles.planCardPopular]}
                onPress={() => handlePurchase(pkg)}
                disabled={isPurchasing}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>BEST VALUE</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{pkg.product.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{formatPrice(pkg)}</Text>
                    <Text style={styles.planPeriod}>{formatPeriod(pkg)}</Text>
                  </View>
                </View>
                <Text style={styles.planDescription}>{pkg.product.description}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>All Pro plans include:</Text>
            {[
              'Unlimited gift generations',
              'Advanced AI persona analysis',
              'Unlimited recipients',
              'Gift history & tracking',
              'Priority support',
            ].map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={18} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        /* Fallback pricing when packages fail to load */
        <>
          {hasError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color={colors.accentWarning} />
              <Text style={styles.errorBannerText}>
                Unable to load live pricing. Showing standard prices.
              </Text>
            </View>
          )}

          {FALLBACK_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.planCardPopular]}
              onPress={() => {
                Alert.alert(
                  'Subscription Unavailable',
                  'Please try again in a moment or restore your purchase if you\'ve previously subscribed.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Retry', onPress: loadOfferings },
                  ]
                );
              }}
              disabled={isPurchasing}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{getFallbackPlanPrice(plan)}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>All Pro plans include:</Text>
            {[
              'Unlimited gift generations',
              'Advanced AI persona analysis',
              'Unlimited recipients',
              'Gift history & tracking',
              'Priority support',
            ].map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={18} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadOfferings}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accentPrimary} />
            ) : (
              <>
                <RefreshCw size={16} color={colors.accentPrimary} />
                <Text style={styles.retryText}>Retry Loading Prices</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity 
        style={styles.restoreButton} 
        onPress={handleRestore}
        disabled={isRestoring}
      >
        {isRestoring ? (
          <ActivityIndicator size="small" color={colors.accentPrimary} />
        ) : (
          <>
            <RefreshCw size={16} color={colors.accentPrimary} />
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Payment will be charged to your App Store account. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
      </Text>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  sparkleContainer: {
    marginBottom: 16,
  },
  crownContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  planCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planCardPopular: {
    borderColor: colors.accentPrimary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.body,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    fontFamily: FONTS.display,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentPrimary,
    fontFamily: FONTS.display,
  },
  planPeriod: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  featuresSection: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    fontFamily: FONTS.display,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.warningText,
    fontFamily: FONTS.body,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.body,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  restoreText: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.body,
  },
  statusCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: FONTS.body,
  },
  statusPlan: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    fontFamily: FONTS.display,
  },
  statusDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  manageText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    fontFamily: FONTS.body,
  },
});
