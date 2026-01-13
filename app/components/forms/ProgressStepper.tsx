import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Step Labels */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View
              style={[
                styles.stepDot,
                index <= currentStep && styles.stepDotCompleted,
                index === currentStep && styles.stepDotActive,
              ]}
            >
              {index <= currentStep && (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive,
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.full,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.accentSoft,
  },
  stepDotActive: {
    backgroundColor: COLORS.accentPrimary,
  },
  stepNumber: {
    fontSize: 12,
    color: COLORS.accentPrimary,
    fontWeight: '600',
    fontFamily: FONTS.body,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  stepLabelActive: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
