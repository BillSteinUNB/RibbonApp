/**
 * Onboarding Screen 1: The Hook
 * Pain point agitation - "Tired of giving forgettable gifts?"
 * 
 * Psychology: Opens the "bleeding neck" (Sabri Suby)
 * Needs addressed: Variety, Connection (Tony Robbins)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';

const { width, height } = Dimensions.get('window');

export default function OnboardingHook() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/(onboarding)/value');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Visual - Gift with question mark */}
        <View style={styles.visualContainer}>
          <View style={styles.giftBox}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <View style={styles.questionMark}>
              <Text style={styles.questionMarkText}>?</Text>
            </View>
          </View>
        </View>

        {/* Headline - The Pain Point */}
        <Text style={styles.headline}>
          Tired of Giving{'\n'}
          <Text style={styles.headlineAccent}>Forgettable</Text> Gifts?
        </Text>

        {/* Subhead - Twist the knife */}
        <Text style={styles.subhead}>
          That moment when they open it...{'\n'}
          and you see the polite smile.
        </Text>

        {/* Pain points */}
        <View style={styles.painPoints}>
          <Text style={styles.painPoint}>
            😅 "Oh... it's nice. Thanks."
          </Text>
          <Text style={styles.painPoint}>
            🤔 Hours of scrolling, still no idea
          </Text>
          <Text style={styles.painPoint}>
            💸 Spent too much on something meh
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>Find the Perfect Gift</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  giftBox: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  giftEmoji: {
    fontSize: 64,
  },
  questionMark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: SPACING.lg,
  },
  headlineAccent: {
    color: COLORS.accentPrimary,
  },
  subhead: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.xxl,
  },
  painPoints: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  painPoint: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
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
