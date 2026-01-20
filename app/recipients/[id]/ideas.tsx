import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../../components/Button';
import { useRecipientStore, selectRecipientById } from '../../store/recipientStore';
import { useGiftStore } from '../../store/giftStore';
import { giftService } from '../../services/giftService';
import type { GiftIdea } from '../../types/recipient';

const PROGRESS_MESSAGES = [
  'Analyzing recipient preferences...',
  'Understanding lifestyle and interests...',
  'Brainstorming gift ideas...',
  'Considering budget constraints...',
  'Refining suggestions for personalization...',
  'Finalizing gift list...',
];

export default function GiftGenerationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const { setCurrentGifts, createGenerationSession, setIsGenerating, setError } = useGiftStore();

  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [error, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelled, setIsCancelled] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

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
  }, [spinValue, pulseValue]);

  useEffect(() => {
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
  }, [progressValue]);

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

        setCurrentGifts(giftsWithSession);
        setIsGenerating(false);
        router.replace(`/recipients/${recipientId}/results`);
      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate gift ideas';
        setLocalError(errorMessage);
        setError(errorMessage);
        setIsGenerating(false);
        setIsLoading(false);
      }
    };

    generateGifts();
  }, [recipient, isCancelled, recipientId, router, setCurrentGifts, createGenerationSession, setIsGenerating, setError]);

  const handleCancel = () => {
    setIsCancelled(true);
    setIsGenerating(false);
    router.back();
  };

  const handleRetry = () => {
    setLocalError(null);
    setIsLoading(true);
    setIsCancelled(false);
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

  if (error) {
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
  spinnerInner: {
    width: '100%',
    height: '100%',
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
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.border,
    marginRight: SPACING.md,
  },
  stepDotActive: {
    backgroundColor: COLORS.accentSuccess,
  },
  stepText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.error,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONTS.body,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginBottom: SPACING.md,
  },
});
