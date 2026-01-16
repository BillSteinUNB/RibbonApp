import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Crown, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { biometricAuthService } from '../services/biometricAuthService';
import * as revenueCat from '../services/revenueCatService';
import { PRICING_PLANS } from '../types/subscription';

export default function PricingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, setSubscription, syncFromRevenueCat } = useAuthStore();
  const isPremium = user?.isPremium;

  // Present RevenueCat Paywall (recommended approach)
  const handlePresentPaywall = async () => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    // Check if biometric is enabled and available
    const biometricEnabled = await biometricAuthService.isBiometricEnabled();
    const biometricAvailable = await biometricAuthService.checkAvailability();

    if (biometricEnabled && biometricAvailable) {
      const authenticated = await biometricAuthService.authenticate('Authenticate to subscribe');
      if (!authenticated) {
        Alert.alert('Authentication Required', 'Biometric authentication is required to manage subscriptions.');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await revenueCat.presentPaywall();

      if (result === 'purchased' || result === 'restored') {
        // Sync subscription status
        const customerInfo = await revenueCat.getCustomerInfo();
        syncFromRevenueCat(customerInfo);
        Alert.alert('Success', 'Welcome to Ribbon Pro!');
        router.back();
      } else if (result === 'error') {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
      // 'cancelled' and 'not_presented' are handled silently
    } catch (error) {
      const message = revenueCat.getErrorMessage(error);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe using custom UI (fallback)
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    // Check if biometric is enabled and available
    const biometricEnabled = await biometricAuthService.isBiometricEnabled();
    const biometricAvailable = await biometricAuthService.checkAvailability();

    if (biometricEnabled && biometricAvailable) {
      const authenticated = await biometricAuthService.authenticate('Authenticate to subscribe');
      if (!authenticated) {
        Alert.alert('Authentication Required', 'Biometric authentication is required to manage subscriptions.');
        return;
      }
    }

    setLoading(true);
    try {
      const subscription = await subscriptionService.subscribeToPlan(user.id, planId);
      setSubscription(subscription);
      Alert.alert('Success', 'Welcome to Ribbon Pro!');
      router.back();
    } catch (error) {
      if (!revenueCat.isUserCancellation(error)) {
        const message = revenueCat.getErrorMessage(error);
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    setLoading(true);
    try {
      const subscription = await subscriptionService.restorePurchases(user.id);
      if (subscription) {
        setSubscription(subscription);
        Alert.alert('Success', 'Purchases restored successfully');
      } else {
        Alert.alert('Info', 'No active subscription found');
      }
    } catch (error) {
      const message = revenueCat.getErrorMessage(error);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // If already premium, show current status
  if (isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.crownContainer}>
            {/* @ts-ignore */}
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
          {user?.subscription?.cancelAtPeriodEnd && (
            <Text style={styles.cancelingText}>
              Your subscription will not renew
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => subscriptionService.openCustomerCenter(user?.id, setSubscription)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.sparkleContainer}>
          {/* @ts-ignore */}
          <Sparkles size={40} color="#FF4B4B" />
        </View>
        <Text style={styles.title}>Unlock Full Potential</Text>
        <Text style={styles.subtitle}>
          Get unlimited gift ideas and advanced AI features
        </Text>
      </View>

      {/* Primary CTA - Opens RevenueCat Paywall */}
      <TouchableOpacity
        style={styles.paywallButton}
        onPress={handlePresentPaywall}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {/* @ts-ignore */}
            <Crown size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.paywallButtonText}>Upgrade to Pro</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>or choose a plan</Text>

      {/* Plan cards for custom selection */}
      {PRICING_PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            plan.popular && styles.popularCard,
          ]}
          onPress={() => handleSubscribe(plan.id)}
          disabled={loading}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Best Value</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>{plan.currency === 'USD' ? '$' : plan.currency}</Text>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.interval}>/{plan.interval}</Text>
            </View>
          </View>

          <View style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                {/* @ts-ignore */}
                <Check size={18} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={[
            styles.selectButton,
            plan.popular && styles.popularSelectButton,
          ]}>
            <Text style={[
              styles.selectButtonText,
              plan.popular && styles.popularSelectButtonText,
            ]}>
              Select Plan
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={loading}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Subscriptions automatically renew unless auto-renew is turned off at least 24-hours before the end of the current period. Payment will be charged to your App Store or Google Play account.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  paywallButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  paywallButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  popularCard: {
    borderColor: '#FF4B4B',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  interval: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 2,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4B5563',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  popularSelectButton: {
    backgroundColor: '#FF4B4B',
    borderColor: '#FF4B4B',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  popularSelectButtonText: {
    color: 'white',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusPlan: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statusDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelingText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  manageButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  manageButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    padding: 16,
  },
  restoreText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
