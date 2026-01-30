/**
 * Onboarding Screen 4: Social Proof
 * Testimonials and stats - "Join 10,000+ Happy Gift Givers"
 * 
 * Psychology: Stack proof to maximize belief (Suby, Hormozi)
 * Needs addressed: Certainty, Significance (Tony Robbins)
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';
import { ROUTES } from '../constants/routes';
import { analyticsOnboarding } from '../utils/analytics';

const TESTIMONIALS = [
  {
    quote: "My mom actually cried. In a good way.",
    name: "Sarah M.",
    context: "Birthday gift",
    emoji: "😭",
  },
  {
    quote: "Saved my anniversary. The AI knew exactly what she'd love.",
    name: "Mike T.",
    context: "Anniversary",
    emoji: "💕",
  },
  {
    quote: "This is my go-to app for every birthday now.",
    name: "Jessica R.",
    context: "Multiple occasions",
    emoji: "🎂",
  },
  {
    quote: "Found the perfect graduation gift in under a minute.",
    name: "David L.",
    context: "Graduation",
    emoji: "🎓",
  },
];

export default function OnboardingSocialProof() {
  const router = useRouter();

  // Track onboarding step viewed
  React.useEffect(() => {
    analyticsOnboarding.stepViewed('social-proof');
  }, []);

  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleIn, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push(ROUTES.ONBOARDING.PAYWALL);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress indicator */}
      <View style={styles.progressContainer} accessibilityRole="progressbar" accessibilityLabel="Step 4 of 5">
        <View style={styles.progressDot} accessibilityLabel="Step 1 of 5" />
        <View style={styles.progressDot} accessibilityLabel="Step 2 of 5" />
        <View style={styles.progressDot} accessibilityLabel="Step 3 of 5" />
        <View style={[styles.progressDot, styles.progressDotActive]} accessibilityLabel="Step 4 of 5" />
        <View style={styles.progressDot} accessibilityLabel="Step 5 of 5" />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityRole="button" accessibilityLabel="Go back">
        <Text style={styles.backButtonText} accessibilityElementsHidden={true} importantForAccessibility="no">←</Text>
      </TouchableOpacity>

      {/* Main content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating badge */}
        <Animated.View 
          style={[
            styles.ratingBadge,
            { opacity: fadeIn, transform: [{ scale: scaleIn }] }
          ]}
        >
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.ratingText}>4.9 / 5</Text>
        </Animated.View>

        {/* Headline */}
        <Text style={styles.headline}>
          Join <Text style={styles.headlineAccent}>Thousands of</Text>{'\n'}
          Happy Gift Givers
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>AI Trained on Gift Ideas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Happy Recipients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>30s</Text>
            <Text style={styles.statLabel}>Avg. Time</Text>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialSection} accessibilityRole="text">
          <Text style={styles.sectionTitle}>REAL USERS, REAL RESULTS</Text>
          
          {TESTIMONIALS.map((testimonial, index) => (
            <Animated.View
              key={index}
              style={[
                styles.testimonialCard,
                {
                  opacity: fadeIn,
                  transform: [{
                    translateY: fadeIn.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
              accessibilityRole="text"
            >
              <View style={styles.testimonialEmoji} accessibilityElementsHidden={true} importantForAccessibility="no">
                <Text style={styles.emoji} accessibilityElementsHidden={true} importantForAccessibility="no">{testimonial.emoji}</Text>
              </View>
              <View style={styles.testimonialContent}>
                <Text style={styles.testimonialQuote} accessibilityRole="text">
                  "{testimonial.quote}"
                </Text>
                <View style={styles.testimonialMeta}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialContext}>• {testimonial.context}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Trust badges */}
        <View style={styles.trustBadges} accessibilityRole="text">
          <View style={styles.trustBadge} accessibilityRole="text">
            <Text style={styles.trustIcon} accessibilityElementsHidden={true} importantForAccessibility="no">🔒</Text>
            <Text style={styles.trustText}>Secure</Text>
          </View>
          <View style={styles.trustBadge} accessibilityRole="text">
            <Text style={styles.trustIcon} accessibilityElementsHidden={true} importantForAccessibility="no">⚡</Text>
            <Text style={styles.trustText}>Fast</Text>
          </View>
          <View style={styles.trustBadge} accessibilityRole="text">
            <Text style={styles.trustIcon} accessibilityElementsHidden={true} importantForAccessibility="no">🎯</Text>
            <Text style={styles.trustText}>Accurate</Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Start Finding Gifts, continue to next step"
        >
          <Text style={styles.ctaText}>Start Finding Gifts</Text>
          <Text style={styles.ctaArrow} accessibilityElementsHidden={true} importantForAccessibility="no">→</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  ratingBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stars: {
    fontSize: 16,
    color: COLORS.accentSecondary,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accentPrimary,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.accentPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  testimonialSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  testimonialCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  testimonialEmoji: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  testimonialContent: {
    flex: 1,
  },
  testimonialQuote: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 4,
  },
  testimonialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  testimonialContext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  trustBadge: {
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  trustText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.bgPrimary,
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
