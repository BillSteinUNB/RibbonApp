import React, { useState } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../Button';

interface DatePickerProps {
  label?: string;
  value?: string;
  onSelect?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function DatePicker({
  label,
  value,
  onSelect,
  placeholder = 'Select a date',
  disabled = false,
  error,
}: DatePickerProps) {
  const [visible, setVisible] = useState(false);

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendar: Array<{ day: number | null; date: string; isToday: boolean }> = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push({ day: null, date: '', isToday: false });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.getTime() === today.getTime();
      calendar.push({
        day,
        date: date.toISOString(),
        isToday,
      });
    }

    return calendar;
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleMonthChange = (delta: number) => {
    const newMonth = selectedMonth + delta;
    if (newMonth > 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else if (newMonth < 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(newMonth);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    if (onSelect) {
      onSelect(dateStr);
    }
    setVisible(false);
  };

  const calendarData = generateCalendar(selectedYear, selectedMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.dateInput, error && styles.dateInputError, disabled && styles.dateInputDisabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatDate(value) || placeholder}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                <Text style={styles.navButton}>&lt;</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity onPress={() => handleMonthChange(1)}>
                <Text style={styles.navButton}>&gt;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <ScrollView>
              <View style={styles.calendarGrid}>
                {calendarData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      item.isToday && styles.dayToday,
                    ]}
                    onPress={() => item.day && handleDateSelect(item.date)}
                    disabled={item.day === null}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.day && styles.dayEmpty,
                      ]}
                    >
                      {item.day || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Button
              title="Cancel"
              onPress={() => setVisible(false)}
              variant="ghost"
              style={styles.modalButton}
            />
          </SafeAreaView>
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
  dateInput: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateInputError: {
    borderColor: COLORS.error,
  },
  dateInputDisabled: {
    opacity: 0.5,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontFamily: FONTS.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    margin: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  navButton: {
    fontSize: 24,
    color: COLORS.accentPrimary,
    paddingHorizontal: SPACING.lg,
    fontFamily: FONTS.body,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  dayToday: {
    backgroundColor: COLORS.accentSoft,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  dayEmpty: {
    color: 'transparent',
  },
  modalButton: {
    marginTop: SPACING.md,
  },
});
