import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Crown, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { PRICING_PLANS } from '../types/subscription';

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPremium = user?.isPremium;

  if (isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.sparkleContainer}>
          <Sparkles size={40} color="#FF4B4B" />
        </View>
        <Text style={styles.title}>Premium Coming Soon</Text>
        <Text style={styles.subtitle}>
          Get unlimited gift ideas and advanced AI features
        </Text>
      </View>

      <View style={styles.comingSoonCard}>
        <Crown size={32} color="#FF4B4B" />
        <Text style={styles.comingSoonTitle}>We're working on it!</Text>
        <Text style={styles.comingSoonText}>
          Premium subscriptions will be available soon. In the meantime, enjoy the free features!
        </Text>
      </View>

      <Text style={styles.previewTitle}>What's included in Pro:</Text>

      {PRICING_PLANS.filter(p => p.id !== 'free').slice(0, 1).map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <View style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={18} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.disclaimer}>
        Subscriptions will be available through the App Store. Stay tuned!
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
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4B4B',
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuresList: {
    marginBottom: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4B5563',
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
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
