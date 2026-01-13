import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';

interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  step?: number;
  error?: string;
}

export function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  step = 10,
  error,
}: RangeSliderProps) {
  const trackWidth = 280;
  const thumbSize = 20;

  const getThumbPosition = (val: number) => {
    if (min === max) return 0;
    return ((val - min) / (max - min)) * trackWidth;
  };

  const getValueFromPosition = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleMinMove = (gesture: any) => {
    const newValue = getValueFromPosition(gesture.moveX);
    if (newValue >= min && newValue <= value.max - step) {
      onChange({ ...value, min: newValue });
    }
  };

  const handleMaxMove = (gesture: any) => {
    const newValue = getValueFromPosition(gesture.moveX);
    if (newValue >= value.min + step && newValue <= max) {
      onChange({ ...value, max: newValue });
    }
  };

  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => handleMinMove(gesture),
  });

  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => handleMaxMove(gesture),
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.sliderContainer}>
        <Text style={styles.minLabel}>${value.min}</Text>

        <View style={styles.trackContainer}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  left: getThumbPosition(value.min),
                  width: getThumbPosition(value.max) - getThumbPosition(value.min),
                },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[styles.thumb, { left: getThumbPosition(value.min) - thumbSize / 2 }]}
            {...minPanResponder.panHandlers}
            activeOpacity={0.8}
          />

          <TouchableOpacity
            style={[styles.thumb, { left: getThumbPosition(value.max) - thumbSize / 2 }]}
            {...maxPanResponder.panHandlers}
            activeOpacity={0.8}
          />
        </View>

        <Text style={styles.maxLabel}>${value.max}</Text>
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
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  minLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  maxLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  trackContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: COLORS.border,
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.accentPrimary,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accentPrimary,
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
});
