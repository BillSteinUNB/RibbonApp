/**
 * Onboarding Screen 3: How It Works
 * Quick demonstration - "30 Seconds to the Perfect Gift"
 * 
 * Psychology: Quick Win Engineering - minimize perceived effort/time (Hormozi)
 * Needs addressed: Certainty (Tony Robbins)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';
import { ROUTES } from '../constants/routes';

export default function OnboardingHowItWorks() {
  const router = useRouter();
  
  // Animation values for the steps
  const step1Opacity = useRef(new Animated.Value(0)).current;
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation for steps
    Animated.sequence([
      Animated.timing(step1Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(step2Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(step3Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push(ROUTES.ONBOARDING.SOCIAL_PROOF);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Main content */}
      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ QUICK & EASY</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          <Text style={styles.headlineAccent}>30 Seconds</Text> to{'\n'}
          the Perfect Gift
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {/* Step 1 */}
          <Animated.View style={[styles.step, { opacity: step1Opacity }]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tell us about them</Text>
              <Text style={styles.stepDescription}>
                Their interests, your relationship, your budget
              </Text>
            </View>
            <View style={styles.stepVisual}>
              <Text style={styles.stepEmoji}>📝</Text>
            </View>
          </Animated.View>

          {/* Connector */}
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
          </View>

          {/* Step 2 */}
          <Animated.View style={[styles.step, { opacity: step2Opacity }]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI works its magic</Text>
              <Text style={styles.stepDescription}>
                Analyzes personality and brainstorms ideas
              </Text>
            </View>
            <View style={styles.stepVisual}>
              <Text style={styles.stepEmoji}>🤖</Text>
            </View>
          </Animated.View>

          {/* Connector */}
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
          </View>

          {/* Step 3 */}
          <Animated.View style={[styles.step, { opacity: step3Opacity }]}>
            <View style={[styles.stepNumber, styles.stepNumberHighlight]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get perfect suggestions</Text>
              <Text style={styles.stepDescription}>
                5 personalized ideas with reasoning
              </Text>
            </View>
            <View style={styles.stepVisual}>
              <Text style={styles.stepEmoji}>🎁</Text>
            </View>
          </Animated.View>
        </View>

        {/* Result preview */}
        <View style={styles.resultPreview}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>EXAMPLE RESULT</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>For: Mom (Birthday)</Text>
            <Text style={styles.resultItem}>
              ✓ Personalized star map of her birthday sky
            </Text>
            <Text style={styles.resultItem}>
              ✓ Spa day experience gift card
            </Text>
            <Text style={styles.resultItem}>
              ✓ Custom photo book of family memories
            </Text>
            <Text style={styles.resultMore}>+ 2 more ideas...</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>See Real Results</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
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
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.accentPrimary,
    width: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentPrimary,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.xl,
  },
  headlineAccent: {
    color: COLORS.accentPrimary,
  },
  stepsContainer: {
    marginBottom: SPACING.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberHighlight: {
    backgroundColor: COLORS.accentPrimary,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  stepVisual: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 24,
  },
  connector: {
    height: 20,
    paddingLeft: 40,
  },
  connectorLine: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.border,
    marginLeft: 15,
  },
  resultPreview: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  resultHeader: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  resultCard: {
    padding: SPACING.md,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  resultItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resultMore: {
    fontSize: 12,
    color: COLORS.accentPrimary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  ctaButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  ctaArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
});
