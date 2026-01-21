import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './components/Button';
import { SPACING, FONTS } from './constants';
import { useTheme } from './hooks/useTheme';
import { useUIStore } from './store/uiStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const setHasCompletedOnboarding = useUIStore(state => state.setHasCompletedOnboarding);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Ribbon',
      description: 'Find personalized gifts for everyone in your life with AI-powered recommendations.',
    },
    {
      title: 'Add Your Recipients',
      description: 'Start by adding the important people to you - family, friends, colleagues.',
    },
    {
      title: 'Get Perfect Gift Ideas',
      description: 'Our AI analyzes their preferences and suggests thoughtful gifts they will love.',
    },
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.xl }]}>
          <View style={styles.pagination}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentStep && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>

          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            style={styles.button}
          />

          <Button
            title="Skip"
            onPress={handleComplete}
            variant="outline"
            style={styles.button}
          />
        </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('./hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl * 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSubtle,
    marginHorizontal: SPACING.xs,
  },
  paginationDotActive: {
    backgroundColor: colors.accentPrimary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    lineHeight: 26,
    fontFamily: FONTS.body,
  },
  button: {
    marginBottom: SPACING.md,
  },
});
