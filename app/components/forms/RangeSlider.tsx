import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TextInput, TouchableOpacity } from 'react-native';
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
  giftCount?: number;
  onGiftCountChange?: (count: number | undefined) => void;
  showGiftCount?: boolean;
  error?: string;
}

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;

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
  giftCount,
  onGiftCountChange,
  showGiftCount = true,
  error,
}: RangeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(SLIDER_WIDTH);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const minPos = useRef(new Animated.Value(0)).current;
  const maxPos = useRef(new Animated.Value(1)).current;

  // Check if current values exceed slider max (indicating custom mode)
  useEffect(() => {
    if (minValue > max || maxValue > max) {
      setIsCustomMode(true);
      setCustomMin(String(minValue));
      setCustomMax(String(maxValue));
    }
  }, []);

  const valueToPosition = useCallback((value: number) => {
    return (value - min) / (max - min);
  }, [min, max]);

  const positionToValue = useCallback((position: number) => {
    const rawValue = position * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const updateMinPosition = useCallback(() => {
    const pos = valueToPosition(minValue);
    minPos.setValue(pos);
  }, [minValue, valueToPosition, minPos]);

  const updateMaxPosition = useCallback(() => {
    const pos = valueToPosition(maxValue);
    maxPos.setValue(pos);
  }, [maxValue, valueToPosition, maxPos]);

  React.useEffect(() => {
    updateMinPosition();
    updateMaxPosition();
  }, [minValue, maxValue, updateMinPosition, updateMaxPosition]);

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(0, Math.min(valueToPosition(maxValue) - 0.05, gestureState.moveX / sliderWidth));
        const newValue = positionToValue(newPos);
        if (newValue < maxValue) {
          onMinChange(newValue);
        }
      },
    })
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(valueToPosition(minValue) + 0.05, Math.min(1, gestureState.moveX / sliderWidth));
        const newValue = positionToValue(newPos);
        if (newValue > minValue) {
          onMaxChange(newValue);
        }
      },
    })
  ).current;

  const presets = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25-$50', min: 25, max: 50 },
    { label: '$50-$100', min: 50, max: 100 },
    { label: '$100-$250', min: 100, max: 250 },
    { label: '$250-$500', min: 250, max: 500 },
    { label: '$500+', min: 500, max: 1000 },
  ];

  const handlePresetSelect = (preset: { min: number; max: number }) => {
    setIsCustomMode(false);
    setCustomMin('');
    setCustomMax('');
    onMinChange(preset.min);
    onMaxChange(preset.max);
  };

  const handleCustomSelect = () => {
    setIsCustomMode(true);
    setCustomMin(String(minValue));
    setCustomMax(String(maxValue));
  };

  const handleCustomMinChange = (text: string) => {
    setCustomMin(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 0 && num <= 10000) {
      onMinChange(num);
    }
  };

  const handleCustomMaxChange = (text: string) => {
    setCustomMax(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 10000) {
      onMaxChange(num);
    }
  };

  const isPresetSelected = (preset: { min: number; max: number }) => {
    return !isCustomMode && minValue === preset.min && maxValue === preset.max;
  };

  const formatValue = (value: number) => {
    if (isCustomMode) {
      return `${currency}${value.toLocaleString()}`;
    }
    if (value >= 1000) return `${currency}1000+`;
    return `${currency}${value}`;
  };

  const perItemBudget = giftCount && giftCount > 0 
    ? Math.round((maxValue - minValue) / 2 / giftCount + minValue / giftCount)
    : null;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.valueDisplay}>
        <Text style={styles.valueText}>
          {formatValue(minValue)} - {formatValue(maxValue)}
        </Text>
        {perItemBudget && (
          <Text style={styles.perItemText}>
            ~{currency}{perItemBudget} per gift
          </Text>
        )}
      </View>

      {!isCustomMode && (
        <>
          <View
            style={styles.sliderContainer}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.track} />
            <Animated.View
              style={[
                styles.selectedTrack,
                {
                  left: minPos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, sliderWidth],
                  }),
                  right: maxPos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [sliderWidth, 0],
                  }),
                }
              ]}
            />
            <Animated.View
              {...minPanResponder.panHandlers}
              style={[
                styles.thumb,
                {
                  left: minPos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-THUMB_SIZE / 2, sliderWidth - THUMB_SIZE / 2],
                  }),
                }
              ]}
            >
              <View style={styles.thumbInner} />
            </Animated.View>
            <Animated.View
              {...maxPanResponder.panHandlers}
              style={[
                styles.thumb,
                {
                  left: maxPos.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-THUMB_SIZE / 2, sliderWidth - THUMB_SIZE / 2],
                  }),
                }
              ]}
            >
              <View style={styles.thumbInner} />
            </Animated.View>
          </View>

          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>{currency}0</Text>
            <Text style={styles.rangeLabel}>{currency}500</Text>
            <Text style={styles.rangeLabel}>{currency}1000+</Text>
          </View>
        </>
      )}

      <Text style={styles.quickSelectLabel}>Quick Select:</Text>
      <View style={styles.presets}>
        {presets.map((preset, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.presetButton,
              isPresetSelected(preset) && styles.presetButtonSelected,
            ]}
            onPress={() => handlePresetSelect(preset)}
          >
            <Text style={[
              styles.presetText,
              isPresetSelected(preset) && styles.presetTextSelected,
            ]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.presetButton,
            isCustomMode && styles.presetButtonSelected,
          ]}
          onPress={handleCustomSelect}
        >
          <Text style={[
            styles.presetText,
            isCustomMode && styles.presetTextSelected,
          ]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {isCustomMode && (
        <View style={styles.customInputContainer}>
          <View style={styles.customInputWrapper}>
            <Text style={styles.customInputLabel}>Min</Text>
            <TextInput
              style={styles.customInput}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={customMin}
              onChangeText={handleCustomMinChange}
            />
          </View>
          <Text style={styles.customInputDash}>–</Text>
          <View style={styles.customInputWrapper}>
            <Text style={styles.customInputLabel}>Max</Text>
            <TextInput
              style={styles.customInput}
              placeholder="1000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={customMax}
              onChangeText={handleCustomMaxChange}
            />
          </View>
          <Text style={styles.customInputHint}>Max: {currency}10,000</Text>
        </View>
      )}

      {showGiftCount && onGiftCountChange && (
        <View style={styles.giftCountContainer}>
          <Text style={styles.giftCountLabel}>Number of gifts (optional)</Text>
          <View style={styles.giftCountRow}>
            {[1, 2, 3, 5].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.giftCountButton,
                  giftCount === count && styles.giftCountButtonSelected,
                ]}
                onPress={() => onGiftCountChange(giftCount === count ? undefined : count)}
              >
                <Text style={[
                  styles.giftCountText,
                  giftCount === count && styles.giftCountTextSelected,
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.giftCountInput}
              placeholder="Other"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={giftCount && ![1, 2, 3, 5].includes(giftCount) ? String(giftCount) : ''}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0 && num <= 20) {
                  onGiftCountChange(num);
                } else if (text === '') {
                  onGiftCountChange(undefined);
                }
              }}
            />
          </View>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  valueDisplay: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  perItemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginHorizontal: THUMB_SIZE / 2,
    marginBottom: SPACING.xs,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: TRACK_HEIGHT / 2,
  },
  selectedTrack: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    backgroundColor: COLORS.accentPrimary,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.accentPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentPrimary,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  rangeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
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
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  presetTextSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  giftCountContainer: {
    marginTop: SPACING.sm,
  },
  giftCountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  giftCountRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  giftCountButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  giftCountButtonSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  giftCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  giftCountTextSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  giftCountInput: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  customInputWrapper: {
    flex: 1,
    minWidth: 80,
  },
  customInputLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  customInput: {
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customInputDash: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  customInputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
