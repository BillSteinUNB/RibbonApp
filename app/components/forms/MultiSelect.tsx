import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../Button';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  values: string[];
  options: MultiSelectOption[];
  onToggle: (value: string) => void;
  onAddCustom?: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function MultiSelect({
  label,
  values,
  options,
  onToggle,
  onAddCustom,
  placeholder = 'Select options',
  error,
}: MultiSelectProps) {
  const [customValue, setCustomValue] = useState('');

  const handleAddCustom = () => {
    if (customValue.trim() && onAddCustom) {
      onAddCustom(customValue.trim());
      setCustomValue('');
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Selected Pills */}
      {values.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillsRow}>
              {values.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <TouchableOpacity
                    key={value}
                    style={styles.pill}
                    onPress={() => onToggle(value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pillText}>{option?.label || value}</Text>
                    <Text style={styles.pillRemove}> × </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Available Options */}
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onToggle(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionCheckbox}>
                {isSelected ? '[X]' : '[ ]'}
              </Text>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Custom Option Input */}
      {onAddCustom && (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            value={customValue}
            onChangeText={setCustomValue}
            placeholder="Add custom interest"
            placeholderTextColor={COLORS.textMuted}
          />
          <Button
            title="Add"
            onPress={handleAddCustom}
            variant="outline"
            disabled={!customValue.trim()}
            style={styles.addButton}
          />
        </View>
      )}

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
  selectedContainer: {
    marginBottom: SPACING.sm,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  pillText: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  pillRemove: {
    fontSize: 16,
    color: COLORS.accentPrimary,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.body,
  },
  optionsList: {
    maxHeight: 200,
    marginBottom: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.accentSoft,
  },
  optionCheckbox: {
    fontSize: 18,
    marginRight: SPACING.sm,
    fontFamily: FONTS.body,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  optionTextSelected: {
    fontWeight: '500',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
});
