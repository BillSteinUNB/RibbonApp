/**
 * Quick Generating - Loading Animation for Quick Start
 * Shows while AI generates gift ideas
 * 
 * Reuses animation patterns from ideas.tsx but in onboarding context
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { useRecipientStore, selectRecipientById } from '../store/recipientStore';
import { useGiftStore } from '../store/giftStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { giftService } from '../services/giftService';
import type { GiftIdea } from '../types/recipient';
import { logger } from '../utils/logger';
import { ROUTES } from '../constants/routes';

const PROGRESS_MESSAGES = [
  'Analyzing preferences...',
  'Understanding their style...',
  'Brainstorming ideas...',
  'Finding perfect matches...',
  'Finalizing suggestions...',
];

export default function QuickGeneratingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const { setCurrentGifts, setAllGifts, createGenerationSession, setIsGenerating } = useGiftStore();
  const { setQuickStartGifts, completeQuickStart } = useOnboardingStore();

  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);

  // Animations
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  // Spin animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      spin.stop();
      pulse.stop();
    };
  }, []);

  // Progress message cycling with variable timing (faster at start, slower toward end)
  // Cap progress at 80% until completion
  useEffect(() => {
    const baseIntervals = [1500, 2000, 2500, 3000, 4000]; // Slower as we progress
    let timeoutId: ReturnType<typeof setTimeout>;

    const cycleMessage = (index: number) => {
      if (index >= PROGRESS_MESSAGES.length) return;

      const nextIndex = index + 1;
      const intervalDuration = baseIntervals[Math.min(index, baseIntervals.length - 1)];

      timeoutId = setTimeout(() => {
        setCurrentMessageIndex(nextIndex);
        setProgressMessage(PROGRESS_MESSAGES[nextIndex] || PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1]);

        // Cap visual progress at 80% until actual completion
        const visualProgress = Math.min(((nextIndex + 1) / PROGRESS_MESSAGES.length) * 100, 80);
        Animated.timing(progressValue, {
          toValue: visualProgress,
          duration: 500,
          useNativeDriver: false,
        }).start();

        if (nextIndex < PROGRESS_MESSAGES.length - 1) {
          cycleMessage(nextIndex);
        }
      }, intervalDuration);
    };

    cycleMessage(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Generate gifts
  useEffect(() => {
    if (!recipient || isCancelled) return;

    const generateGifts = async () => {
      setIsGenerating(true);
      try {
        logger.info('[QuickGenerating] Starting generation for:', recipient.name);
        
        const result = await giftService.generateGifts(recipient, 5);
        
        if (isCancelled) return;

        const sessionId = createGenerationSession(
          recipient.id,
          result.gifts.map((g: GiftIdea) => g.id)
        );

        const giftsWithSession = result.gifts.map((gift: GiftIdea) => ({
          ...gift,
          generationSessionId: sessionId,
        }));

        const existingGifts = useGiftStore.getState().allGifts;
        setAllGifts([...existingGifts, ...giftsWithSession]);
        setCurrentGifts(giftsWithSession);
        setIsGenerating(false);

        // Store gifts in onboarding store for success screen
        setQuickStartGifts(giftsWithSession);

        logger.info('[QuickGenerating] Generation complete, navigating to success');
        
        // Navigate to success screen
        router.replace(ROUTES.ONBOARDING.QUICK_SUCCESS(recipientId));
        
      } catch (err) {
        if (isCancelled) return;
        
        logger.error('[QuickGenerating] Generation failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate gift ideas';
        setError(errorMessage);
        setIsGenerating(false);
      }
    };

    generateGifts();
  }, [recipient, isCancelled, recipientId, retryCounter]);

  const handleCancel = () => {
    setIsCancelled(true);
    setIsGenerating(false);
    // Go back to quick-recipient
    router.back();
  };

  const handleRetry = () => {
    setError(null);
    setIsCancelled(false);
    setCurrentMessageIndex(0);
    setProgressMessage(PROGRESS_MESSAGES[0]);
    progressValue.setValue(0);
    setRetryCounter(prev => prev + 1);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Gift Generation?',
      'Your recipient has been saved. You can find them in your Recipients list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            completeQuickStart();
            router.replace(ROUTES.TABS.RECIPIENTS);
          },
        },
      ]
    );
  };

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>😕</Text>
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={handleRetry} style={styles.errorButton} />
          <Button
            title="Skip for now"
            onPress={handleSkip}
            variant="outline"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Recipient not found
  if (!recipient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Recipient not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.errorButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Spinner */}
        <Animated.View
          style={[
            styles.spinnerContainer,
            { transform: [{ scale: pulseValue }] }
          ]}
        >
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spinAnimation }] }
            ]}
          />
          <View style={styles.giftIcon}>
            <Text style={styles.giftEmoji}>🎁</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Finding Perfect Gifts</Text>
        <Text style={styles.subtitle}>for {recipient.name}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressMessage}>{progressMessage}</Text>
        </View>

        {/* Step Indicators */}
        <View style={styles.stepsContainer}>
          {PROGRESS_MESSAGES.map((message, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  index <= currentMessageIndex && styles.stepDotActive,
                ]}
              />
              <Text
                style={[
                  styles.stepText,
                  index <= currentMessageIndex && styles.stepTextActive,
                ]}
              >
                {message.replace('...', '')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  spinner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.border,
    borderTopColor: COLORS.accentPrimary,
  },
  giftIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 3,
  },
  progressMessage: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepsContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginRight: SPACING.md,
  },
  stepDotActive: {
    backgroundColor: COLORS.accentSuccess,
  },
  stepText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stepTextActive: {
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  errorButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
});
