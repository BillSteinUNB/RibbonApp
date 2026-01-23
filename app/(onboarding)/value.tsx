/**
 * Onboarding Screen 2: The Dream Outcome
 * Transformation - "Give Gifts That Actually Mean Something"
 * 
 * Psychology: Sells the vacation, not the plane flight (Hormozi)
 * Needs addressed: Significance, Growth (Tony Robbins)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';

export default function OnboardingValue() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/(onboarding)/how-it-works');
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
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Main content */}
      <View style={styles.content}>
        {/* Visual - Happy reaction */}
        <View style={styles.visualContainer}>
          <View style={styles.reactionCircle}>
            <Text style={styles.reactionEmoji}>🥹</Text>
          </View>
          <View style={styles.sparkles}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={[styles.sparkle, styles.sparkleRight]}>✨</Text>
          </View>
        </View>

        {/* Headline - The Transformation */}
        <Text style={styles.headline}>
          Give Gifts That{'\n'}
          <Text style={styles.headlineAccent}>Actually Mean</Text>{'\n'}
          Something
        </Text>

        {/* Subhead */}
        <Text style={styles.subhead}>
          AI-powered recommendations tailored{'\n'}
          to who they really are
        </Text>

        {/* Value bullets */}
        <View style={styles.valueBullets}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <Text style={styles.bulletEmoji}>🎯</Text>
            </View>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Personalized, Not Generic</Text>
              <Text style={styles.bulletText}>
                Based on their actual interests, not random suggestions
              </Text>
            </View>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <Text style={styles.bulletEmoji}>💰</Text>
            </View>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Budget-Smart</Text>
              <Text style={styles.bulletText}>
                Options that feel expensive without breaking the bank
              </Text>
            </View>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <Text style={styles.bulletEmoji}>🏆</Text>
            </View>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Be the Best Gift Giver</Text>
              <Text style={styles.bulletText}>
                Get the credit for finding something perfect
              </Text>
            </View>
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
          <Text style={styles.ctaText}>See How It Works</Text>
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
    justifyContent: 'center',
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  reactionCircle: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 56,
  },
  sparkles: {
    position: 'absolute',
    width: 150,
    height: 100,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
    top: 0,
    left: 10,
  },
  sparkleRight: {
    left: 'auto',
    right: 10,
    top: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: SPACING.md,
  },
  headlineAccent: {
    color: COLORS.accentPrimary,
  },
  subhead: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  valueBullets: {
    gap: SPACING.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  bulletIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  bulletEmoji: {
    fontSize: 22,
  },
  bulletContent: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
