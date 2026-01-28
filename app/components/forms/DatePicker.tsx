import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() ?? new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value?.getDate() ?? 1);

  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a date is disabled based on minDate/maxDate
  const isDateDisabled = (month: number, day: number): boolean => {
    const checkDate = new Date(currentYear, month, day);
    if (minDate && checkDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
      return true;
    }
    if (maxDate && checkDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
      return true;
    }
    return false;
  };

  const isMonthDisabled = (month: number): boolean => {
    // A month is disabled if all days in it are disabled
    const daysInThisMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInThisMonth; day++) {
      if (!isDateDisabled(month, day)) {
        return false;
      }
    }
    return true;
  };

  const handleConfirm = () => {
    const year = new Date().getFullYear();
    const date = new Date(year, selectedMonth, selectedDay);
    onChange(date);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.selectButton, error && styles.selectError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Date</Text>

            <Text style={styles.sectionLabel}>Month</Text>
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => {
                const disabled = isMonthDisabled(index);
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      selectedMonth === index && styles.monthButtonSelected,
                      disabled && styles.monthButtonDisabled,
                    ]}
                    onPress={() => !disabled && setSelectedMonth(index)}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.monthText,
                      selectedMonth === index && styles.monthTextSelected,
                      disabled && styles.monthTextDisabled,
                    ]}>
                      {month.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Day</Text>
            <View style={styles.dayGrid}>
              {days.map((day) => {
                const disabled = isDateDisabled(selectedMonth, day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day && styles.dayButtonSelected,
                      disabled && styles.dayButtonDisabled,
                    ]}
                    onPress={() => !disabled && setSelectedDay(day)}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.dayText,
                      selectedDay === day && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  selectButton: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectError: {
    borderColor: COLORS.error,
  },
  selectText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  icon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    width: '100%',
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  monthButton: {
    width: '23%',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgSubtle,
  },
  monthButtonSelected: {
    backgroundColor: COLORS.accentPrimary,
  },
  monthButtonDisabled: {
    opacity: 0.4,
  },
  monthText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  monthTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  monthTextDisabled: {
    color: COLORS.textMuted,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgSubtle,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.accentPrimary,
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  dayTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: COLORS.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSubtle,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentPrimary,
  },
  confirmText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    fontFamily: FONTS.body,
  },
});
