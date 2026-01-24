import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SPACING, FONTS, RADIUS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/Button';
import { useRecipientStore, selectRecipientById } from '../../store/recipientStore';
import { useGiftStore } from '../../store/giftStore';
import { giftService } from '../../services/giftService';
import type { GiftIdea } from '../../types/recipient';
import { ROUTES } from '../../constants/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PROGRESS_MESSAGES = [
  'Analyzing recipient preferences...',
  'Understanding lifestyle and interests...',
  'Brainstorming gift ideas...',
  'Considering budget constraints...',
  'Refining suggestions for personalization...',
  'Finalizing gift list...',
];

// Confetti colors that work in both light and dark mode
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'];

type ScreenState = 'loading' | 'celebration' | 'error';

export default function GiftGenerationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const { setCurrentGifts, setAllGifts, createGenerationSession, setIsGenerating, setError } = useGiftStore();
  const { colors, isDark } = useTheme();

  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [error, setLocalError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [generatedGifts, setGeneratedGifts] = useState<GiftIdea[]>([]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    if (screenState !== 'loading') return;

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
  }, [spinValue, pulseValue, screenState]);

  useEffect(() => {
    if (screenState !== 'loading') return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = (prev + 1) % PROGRESS_MESSAGES.length;
        setProgressMessage(PROGRESS_MESSAGES[next]);
        Animated.timing(progressValue, {
          toValue: ((next + 1) / PROGRESS_MESSAGES.length) * 100,
          duration: 500,
          useNativeDriver: false,
        }).start();
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [progressValue, screenState]);

  // Start celebration animation
  const startCelebration = (gifts: GiftIdea[]) => {
    setGeneratedGifts(gifts);
    setScreenState('celebration');

    // Fire confetti
    setTimeout(() => {
      confettiRef.current?.start();
    }, 100);

    // Animate the celebration card
    Animated.parallel([
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to results after delay
    setTimeout(() => {
      router.replace(ROUTES.RECIPIENTS.RESULTS(recipientId));
    }, 2500);
  };

  useEffect(() => {
    if (!recipient || isCancelled) return;

    const generateGifts = async () => {
      setIsGenerating(true);
      try {
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

        // Show celebration instead of immediately navigating
        startCelebration(giftsWithSession);
      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate gift ideas';
        setLocalError(errorMessage);
        setError(errorMessage);
        setIsGenerating(false);
        setScreenState('error');
      }
    };

    generateGifts();
  }, [recipient, isCancelled, retryToken, recipientId, router, setCurrentGifts, setAllGifts, createGenerationSession, setIsGenerating, setError]);

  const handleCancel = () => {
    setIsCancelled(true);
    setIsGenerating(false);
    router.back();
  };

  const handleRetry = () => {
    setLocalError(null);
    setScreenState('loading');
    setIsCancelled(false);
    setError(null);
    setCurrentMessageIndex(0);
    setProgressMessage(PROGRESS_MESSAGES[0]);
    progressValue.setValue(0);
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
    setRetryToken((prev) => prev + 1);
  };

  const handleViewResults = () => {
    router.replace(ROUTES.RECIPIENTS.RESULTS(recipientId));
  };

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!recipient) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Recipient Not Found</Text>
          <Text style={styles.errorMessage}>
            Could not find the recipient you're looking for.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.button} />
        </View>
      </View>
    );
  }

  if (screenState === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={handleRetry} style={styles.button} />
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  // Celebration State
  if (screenState === 'celebration') {
    const topGift = generatedGifts[0];
    return (
      <View style={styles.container}>
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={2500}
          explosionSpeed={350}
          colors={CONFETTI_COLORS}
        />
        
        <View style={styles.celebrationContent}>
          <Animated.View
            style={[
              styles.celebrationCard,
              {
                transform: [{ scale: celebrationScale }],
                opacity: celebrationOpacity,
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>
              Found {generatedGifts.length} Perfect Gifts!
            </Text>
            <Text style={styles.celebrationSubtitle}>
              for {recipient.name}
            </Text>

            {topGift && (
              <View style={styles.topGiftPreview}>
                <Text style={styles.topGiftLabel}>Top Pick</Text>
                <Text style={styles.topGiftName}>{topGift.name}</Text>
                <Text style={styles.topGiftPrice}>{topGift.price}</Text>
              </View>
            )}

            <Text style={styles.celebrationHint}>
              Taking you to your results...
            </Text>
          </Animated.View>

          <Button
            title="View All Gifts Now"
            onPress={handleViewResults}
            style={styles.celebrationButton}
          />
        </View>
      </View>
    );
  }

  // Loading State
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.spinner,
              {
                transform: [{ rotate: spinAnimation }],
              },
            ]}
          >
            <View style={styles.spinnerInner} />
          </Animated.View>
          <View style={styles.giftIcon}>
            <Text style={styles.giftEmoji}>🎁</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Finding Perfect Gifts</Text>
        <Text style={styles.subtitle}>for {recipient.name}</Text>

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

      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('../../hooks/useTheme').useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
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
    borderColor: colors.border,
    borderTopColor: colors.accentPrimary,
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  giftIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONTS.body,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 3,
  },
  progressMessage: {
    fontSize: 14,
    color: colors.accentPrimary,
    textAlign: 'center',
    fontFamily: FONTS.body,
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
    backgroundColor: colors.border,
    marginRight: SPACING.md,
  },
  stepDotActive: {
    backgroundColor: colors.accentSuccess,
  },
  stepText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  stepTextActive: {
    color: colors.textSecondary,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    width: '100%',
  },
  // Error State
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
    backgroundColor: isDark ? '#4A2020' : '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.error,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONTS.body,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  // Celebration State
  celebrationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  celebrationCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: FONTS.display,
    marginBottom: SPACING.xs,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.body,
    marginBottom: SPACING.lg,
  },
  topGiftPreview: {
    backgroundColor: colors.accentSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  topGiftLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  topGiftName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: FONTS.display,
    marginBottom: SPACING.xs,
  },
  topGiftPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
    fontFamily: FONTS.body,
  },
  celebrationHint: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: FONTS.body,
    fontStyle: 'italic',
  },
  celebrationButton: {
    marginTop: SPACING.xl,
    width: '100%',
    maxWidth: 280,
  },
});
