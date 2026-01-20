import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants';

interface Step {
  title: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  style?: any;
}

export function ProgressStepper({ steps, currentStep, style }: ProgressStepperProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}>
                  {isCompleted ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.stepTitle,
                  isCompleted && styles.stepTitleCompleted,
                  isCurrent && styles.stepTitleCurrent,
                ]} numberOfLines={1}>
                  {step.title}
                </Text>
              </View>
              {!isLast && (
                <View style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {steps[currentStep]?.description && (
        <Text style={styles.description}>
          {steps[currentStep].description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  circleCompleted: {
    backgroundColor: COLORS.accentSuccess,
    borderColor: COLORS.accentSuccess,
  },
  circleCurrent: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  stepNumberCurrent: {
    color: COLORS.white,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  stepTitleCompleted: {
    color: COLORS.accentSuccess,
  },
  stepTitleCurrent: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  connector: {
    height: 2,
    width: 24,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  connectorCompleted: {
    backgroundColor: COLORS.accentSuccess,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
