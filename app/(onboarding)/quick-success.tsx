/**
 * Quick Success - Celebration Screen with Confetti
 * Shows after AI generates gift ideas successfully
 * 
 * Psychology: Dopamine hit at the reveal moment
 * Creates the "magic moment" that hooks users
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, SPACING, RADIUS } from '../constants';
import { useRecipientStore, selectRecipientById } from '../store/recipientStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useGiftStore } from '../store/giftStore';
import { ROUTES } from '../constants/routes';

const { width } = Dimensions.get('window');

export default function QuickSuccessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const { quickStartGifts, completeQuickStart } = useOnboardingStore();
  const { currentGifts } = useGiftStore();
  
  const gifts = quickStartGifts.length > 0 ? quickStartGifts : currentGifts;
  const topGift = gifts[0];
  
  const confettiRef = useRef<any>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fire confetti
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    
    // Animate content
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Stop confetti after a while
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewAll = () => {
    completeQuickStart();
    router.replace(ROUTES.RECIPIENTS.RESULTS(recipientId));
  };

  const handleGoHome = () => {
    completeQuickStart();
    router.replace('/(tabs)');
  };

  if (!recipient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleGoHome}>
            <Text style={styles.errorButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          fadeOut
          autoStart={false}
          colors={[COLORS.accentPrimary, COLORS.accentSecondary, COLORS.accentSuccess, '#FFD700', '#FF69B4']}
        />
      )}
      
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🎉</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text style={styles.headline}>
            Found <Text style={styles.headlineAccent}>{gifts.length} Perfect Gifts!</Text>
          </Text>
          <Text style={styles.subhead}>
            for {recipient.name}
          </Text>
        </Animated.View>

        {/* Top Gift Preview */}
        {topGift && (
          <Animated.View 
            style={[
              styles.giftPreview,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.giftPreviewHeader}>
              <Text style={styles.topPickBadge}>⭐ TOP PICK</Text>
              <Text style={styles.giftPrice}>{topGift.price}</Text>
            </View>
            <Text style={styles.giftName}>{topGift.name}</Text>
            <Text style={styles.giftDescription} numberOfLines={2}>
              {topGift.description}
            </Text>
            <View style={styles.giftReasoning}>
              <Text style={styles.reasoningLabel}>Why it's perfect:</Text>
              <Text style={styles.reasoningText} numberOfLines={2}>
                {topGift.reasoning}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* More Gifts Teaser */}
        {gifts.length > 1 && (
          <Animated.View
            style={[
              styles.moreGifts,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.moreGiftsText}>
              + {gifts.length - 1} more amazing gift ideas waiting for you
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Actions */}
      <Animated.View 
        style={[
          styles.footer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewAll}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>View All Gift Ideas</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
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
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 50,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headlineAccent: {
    color: COLORS.accentPrimary,
  },
  subhead: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  giftPreview: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.accentPrimary,
  },
  giftPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topPickBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentSecondary,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  giftName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  giftDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  giftReasoning: {
    backgroundColor: COLORS.bgSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  reasoningLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  reasoningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  moreGifts: {
    marginTop: SPACING.lg,
  },
  moreGiftsText: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  primaryButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorButton: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  errorButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
