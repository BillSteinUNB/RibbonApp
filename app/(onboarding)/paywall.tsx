/**
 * Onboarding Screen 5: Hard Paywall
 * The Close - "Start Your 3-Day Free Trial"
 * 
 * Psychology: Risk reversal, Godfather Offer (Suby/Hormozi)
 * Needs addressed: Certainty (guarantee), Significance (premium positioning)
 * 
 * HARD PAYWALL: No skip option - user must start trial or restore purchase
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { LEGAL_URLS } from '../constants/legal';
import { useOnboardingStore } from '../store/onboardingStore';
import { logger } from '../utils/logger';

type PlanType = 'weekly' | 'monthly' | 'yearly';

interface PlanOption {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
  pricePerWeek?: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$24.99',
    period: '/year',
    savings: 'SAVE 77%',
    popular: true,
    pricePerWeek: '$0.48/week',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$8.99',
    period: '/month',
    pricePerWeek: '$2.07/week',
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: '$3.99',
    period: '/week',
  },
];

const FEATURES = [
  'Unlimited gift generations',
  'Unlimited recipients',
  'AI-powered refinement',
  'Gift history & tracking',
  'Priority support',
];

export default function OnboardingPaywall() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const { startTrial, completeOnboarding } = useOnboardingStore();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleStartTrial = async () => {
    setIsLoading(true);
    logger.info('[Paywall] Starting trial with plan:', selectedPlan);

    try {
      // TODO: Integrate with RevenueCat for actual purchase
      // For now, simulate the trial start
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Start trial in store
      startTrial(selectedPlan);
      
      // Navigate to Quick Start flow instead of main app
      router.replace('/(onboarding)/quick-start');
      
    } catch (error) {
      logger.error('[Paywall] Trial start failed:', error);
      Alert.alert(
        'Something went wrong',
        'Please try again. If the problem persists, contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchase = async () => {
    setIsRestoring(true);
    logger.info('[Paywall] Restoring purchase');

    try {
      // TODO: Integrate with RevenueCat for actual restore
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If restore found a subscription, complete onboarding
      // For now, show message that no subscription found
      Alert.alert(
        'No subscription found',
        'We couldn\'t find an active subscription for your account. Start a free trial to get access.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      logger.error('[Paywall] Restore failed:', error);
      Alert.alert(
        'Restore failed',
        'Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleOpenTerms = async () => {
    try {
      await Linking.openURL(LEGAL_URLS.TERMS_OF_SERVICE);
    } catch (error) {
      logger.error('[Paywall] Failed to open Terms of Service:', error);
      Alert.alert('Error', 'Could not open Terms of Service');
    }
  };

  const handleOpenPrivacy = async () => {
    try {
      await Linking.openURL(LEGAL_URLS.PRIVACY_POLICY);
    } catch (error) {
      logger.error('[Paywall] Failed to open Privacy Policy:', error);
      Alert.alert('Error', 'Could not open Privacy Policy');
    }
  };

  const getTrialDays = () => 3;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.giftIcon}>
            <Text style={styles.giftEmoji}>🎁</Text>
          </View>
          <Text style={styles.headline}>
            Start Your{'\n'}
            <Text style={styles.headlineAccent}>{getTrialDays()}-Day Free Trial</Text>
          </Text>
          <Text style={styles.subhead}>
            Full access to all features. Cancel anytime.
          </Text>
        </View>

        {/* Plan selector */}
        <View style={styles.planSelector}>
          {PLAN_OPTIONS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planOption,
                selectedPlan === plan.id && styles.planOptionSelected,
                plan.popular && styles.planOptionPopular,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}
              
              <View style={styles.planRadio}>
                <View style={[
                  styles.radioOuter,
                  selectedPlan === plan.id && styles.radioOuterSelected,
                ]}>
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
              </View>
              
              <View style={styles.planDetails}>
                <View style={styles.planNameRow}>
                  <Text style={[
                    styles.planName,
                    selectedPlan === plan.id && styles.planNameSelected,
                  ]}>
                    {plan.name}
                  </Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.planPrice}>
                  {plan.price}
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </Text>
                {plan.pricePerWeek && (
                  <Text style={styles.pricePerWeek}>{plan.pricePerWeek}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features list */}
        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>RIBBON PRO INCLUDES</Text>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Guarantee */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeIcon}>🛡️</Text>
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>Risk-Free Guarantee</Text>
            <Text style={styles.guaranteeText}>
              No charge for {getTrialDays()} days. Cancel anytime in Settings.{'\n'}
              If you forget to cancel, email us within 7 days for a full refund.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer with CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
          onPress={handleStartTrial}
          activeOpacity={0.9}
          disabled={isLoading || isRestoring}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.trialNote}>
          {getTrialDays()}-day free trial, then {PLAN_OPTIONS.find(p => p.id === selectedPlan)?.price}
          {PLAN_OPTIONS.find(p => p.id === selectedPlan)?.period}
        </Text>

        {/* Restore purchase */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchase}
          disabled={isLoading || isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Text style={styles.restoreText}>Restore Purchase</Text>
          )}
        </TouchableOpacity>

        {/* Legal links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={handleOpenTerms}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity onPress={handleOpenPrivacy}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accentPrimary,
    width: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  giftIcon: {
    width: 64,
    height: 64,
    backgroundColor: colors.accentSoft,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  giftEmoji: {
    fontSize: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.xs,
  },
  headlineAccent: {
    color: colors.accentPrimary,
  },
  subhead: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  planSelector: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  planOptionSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentSoft,
  },
  planOptionPopular: {
    marginTop: SPACING.sm,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  planRadio: {
    marginRight: SPACING.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accentPrimary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentPrimary,
  },
  planDetails: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  planNameSelected: {
    color: colors.accentPrimary,
  },
  savingsBadge: {
    backgroundColor: colors.accentSuccess,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pricePerWeek: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  featuresBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureCheck: {
    fontSize: 16,
    color: colors.accentSuccess,
    marginRight: SPACING.sm,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  guaranteeBox: {
    flexDirection: 'row',
    backgroundColor: colors.bgSubtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  guaranteeIcon: {
    fontSize: 24,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  trialNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  restoreText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  legalLink: {
    fontSize: 11,
    color: colors.textMuted,
  },
  legalDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
