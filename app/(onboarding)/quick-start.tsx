/**
 * Quick Start - Welcome Screen
 * First screen after paywall completion
 * 
 * Psychology: Immediate engagement, builds anticipation
 * Goal: Get user excited to create their first recipient
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

export default function QuickStartScreen() {
  const router = useRouter();
  
  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const scaleIn = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 8,
        tension: 40,
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

  const handleGetStarted = () => {
    router.push('/(onboarding)/quick-recipient');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Animated Gift Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              opacity: fadeIn,
              transform: [{ scale: scaleIn }],
            }
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🎁</Text>
          </View>
          <View style={styles.sparkle1}>
            <Text style={styles.sparkleEmoji}>✨</Text>
          </View>
          <View style={styles.sparkle2}>
            <Text style={styles.sparkleEmoji}>✨</Text>
          </View>
          <View style={styles.sparkle3}>
            <Text style={styles.sparkleEmoji}>⭐</Text>
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
        >
          <Text style={styles.headline}>
            Let's Find Your{'\n'}
            <Text style={styles.headlineAccent}>First Perfect Gift!</Text>
          </Text>
          
          <Text style={styles.subhead}>
            In just 30 seconds, our AI will suggest{'\n'}
            personalized gift ideas tailored to your recipient.
          </Text>
        </Animated.View>

        {/* Steps Preview */}
        <Animated.View 
          style={[
            styles.stepsPreview,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }
          ]}
        >
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Tell us who the gift is for</Text>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Pick a few of their interests</Text>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, styles.stepNumberHighlight]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Get 5 perfect gift ideas!</Text>
          </View>
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View 
        style={[
          styles.footer,
          { opacity: fadeIn }
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>Get Started</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>
        
        <Text style={styles.timeEstimate}>Takes less than 30 seconds</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 56,
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 10,
    right: 0,
  },
  sparkleEmoji: {
    fontSize: 24,
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
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  stepsPreview: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberHighlight: {
    backgroundColor: COLORS.accentPrimary,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  stepConnector: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.border,
    marginLeft: 13,
    marginVertical: 4,
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
  timeEstimate: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
