import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants';

interface MultiSelectProps {
  label?: string;
  selected: string[];
  options: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  allowCustom?: boolean;
  maxSelections?: number;
}

export function MultiSelect({
  label,
  selected,
  options,
  onSelectionChange,
  placeholder = 'Search or add...',
  error,
  allowCustom = true,
  maxSelections,
}: MultiSelectProps) {
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchText.toLowerCase()) &&
    !selected.includes(opt)
  );

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onSelectionChange(selected.filter(s => s !== option));
    } else {
      if (maxSelections && selected.length >= maxSelections) return;
      onSelectionChange([...selected, option]);
    }
  };

  const handleAddCustom = () => {
    if (!searchText.trim()) return;
    if (selected.includes(searchText.trim())) return;
    if (maxSelections && selected.length >= maxSelections) return;

    onSelectionChange([...selected, searchText.trim()]);
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {selected.length > 0 && (
        <View style={styles.selectedContainer}>
          {selected.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.chip}
              onPress={() => handleToggle(item)}
            >
              <Text style={styles.chipText}>{item}</Text>
              <Text style={styles.chipRemove}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput
        style={[styles.searchInput, error && styles.inputError]}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onSubmitEditing={allowCustom ? handleAddCustom : undefined}
        returnKeyType={allowCustom ? 'done' : 'default'}
      />

      {searchText.length > 0 && (
        <ScrollView style={styles.optionsList} nestedScrollEnabled>
          {filteredOptions.slice(0, 5).map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => {
                handleToggle(option);
                setSearchText('');
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {allowCustom && searchText.trim() && !options.includes(searchText.trim()) && (
            <TouchableOpacity
              style={[styles.optionItem, styles.addCustom]}
              onPress={handleAddCustom}
            >
              <Text style={styles.addCustomText}>Add "{searchText.trim()}"</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {maxSelections && (
        <Text style={styles.helperText}>
          {selected.length}/{maxSelections} selected
        </Text>
      )}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  chipRemove: {
    fontSize: 18,
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  optionsList: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  addCustom: {
    backgroundColor: COLORS.bgSubtle,
  },
  addCustomText: {
    fontSize: 16,
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
});
