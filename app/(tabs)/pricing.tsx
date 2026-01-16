import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Star } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { biometricAuthService } from '../services/biometricAuthService';
import { PRICING_PLANS } from '../types/subscription';

export default function PricingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, setSubscription } = useAuthStore();
  const isPremium = user?.isPremium;

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    // Check if biometric is enabled and available
    const biometricEnabled = await biometricAuthService.isBiometricEnabled();
    const biometricAvailable = await biometricAuthService.checkAvailability();

    if (biometricEnabled && biometricAvailable) {
      // Require biometric authentication before subscription changes
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
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    
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
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Unlock Full Potential</Text>
        <Text style={styles.subtitle}>
          Get unlimited gift ideas and advanced AI features
        </Text>
      </View>

      {PRICING_PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            plan.popular && styles.popularCard,
            isPremium && user?.subscription?.plan === plan.id && styles.activeCard
          ]}
          onPress={() => handleSubscribe(plan.id)}
          disabled={loading || (isPremium && user?.subscription?.plan === plan.id)}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
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
                <Check size={20} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={[
            styles.button,
            plan.popular && styles.popularButton,
            isPremium && user?.subscription?.plan === plan.id && styles.activeButton
          ]}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isPremium && user?.subscription?.plan === plan.id 
                  ? 'Current Plan' 
                  : `Subscribe ${plan.interval === 'year' ? 'Yearly' : 'Monthly'}`}
              </Text>
            )}
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
        Subscriptions automatically renew unless auto-renew is turned off at least 24-hours before the end of the current period.
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
    marginBottom: 30,
    marginTop: 20,
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
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
  activeCard: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
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
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  interval: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#4B5563',
  },
  button: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#FF4B4B',
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
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
    marginTop: 20,
    lineHeight: 18,
  },
});
