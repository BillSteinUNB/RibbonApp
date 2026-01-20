import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';

interface RangeSliderProps {
  label?: string;
  minValue: number;
  maxValue: number;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  error?: string;
}

export function RangeSlider({
  label,
  minValue,
  maxValue,
  min = 0,
  max = 1000,
  step = 10,
  currency = '$',
  onMinChange,
  onMaxChange,
  error,
}: RangeSliderProps) {
  const presets = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25-$50', min: 25, max: 50 },
    { label: '$50-$100', min: 50, max: 100 },
    { label: '$100-$250', min: 100, max: 250 },
    { label: '$250+', min: 250, max: 1000 },
  ];

  const handlePresetSelect = (preset: { min: number; max: number }) => {
    onMinChange(preset.min);
    onMaxChange(preset.max);
  };

  const isPresetSelected = (preset: { min: number; max: number }) => {
    return minValue === preset.min && maxValue === preset.max;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.valueDisplay}>
        <Text style={styles.valueText}>
          {currency}{minValue} - {currency}{maxValue}
        </Text>
      </View>

      <View style={styles.presets}>
        {presets.map((preset, index) => (
          <View
            key={index}
            style={[
              styles.presetButton,
              isPresetSelected(preset) && styles.presetButtonSelected,
            ]}
            onTouchEnd={() => handlePresetSelect(preset)}
          >
            <Text style={[
              styles.presetText,
              isPresetSelected(preset) && styles.presetTextSelected,
            ]}>
              {preset.label}
            </Text>
          </View>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  valueDisplay: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  presetButton: {
    backgroundColor: COLORS.bgSubtle,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  presetText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  presetTextSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
});
