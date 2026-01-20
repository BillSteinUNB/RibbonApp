import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './components/Button';
import { COLORS, SPACING, FONTS } from './constants';

export default function OnboardingScreen() {
  const router = useRouter();
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
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
            onPress={handleSkip}
            variant="outline"
            style={styles.button}
          />
        </ScrollView>
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
    padding: SPACING.xl,
    justifyContent: 'center',
    paddingTop: 100,
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
    backgroundColor: COLORS.bgSubtle,
    marginHorizontal: SPACING.xs,
  },
  paginationDotActive: {
    backgroundColor: COLORS.accentPrimary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  description: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    lineHeight: 26,
    fontFamily: FONTS.body,
  },
  button: {
    marginBottom: SPACING.md,
  },
});
