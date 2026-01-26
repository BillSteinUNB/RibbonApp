import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';
import { SPACING, FONTS, RADIUS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormSelect, RangeSlider, DatePicker, ProgressStepper } from '../../components/forms';
import {
  RecipientFormData,
  RELATIONSHIPS,
  AGE_RANGES,
  GENDERS,
  OCCASION_TYPES,
  COMMON_INTERESTS,
} from '../../types/recipient';
import { useRecipientStore, selectRecipientById } from '../../store/recipientStore';
import { getTimestamp } from '../../utils/helpers';
import { ROUTES } from '../../constants/routes';
import { useUnsavedChanges, hasFormChanged } from '../../hooks/useUnsavedChanges';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simplified 2-step form (matching new.tsx)
const STEPS = [
  { title: 'Basics', description: 'Who is this gift for?' },
  { title: 'Details', description: 'Budget & occasion' },
];

// Interest icons for the grid
const INTEREST_ICONS: Record<string, string> = {
  'Technology': '💻',
  'Sports': '⚽',
  'Music': '🎵',
  'Cooking': '👨‍🍳',
  'Travel': '✈️',
  'Reading': '📚',
  'Fashion': '👗',
  'Fitness': '💪',
  'Gaming': '🎮',
  'Art': '🎨',
  'Photography': '📷',
  'Gardening': '🌱',
  'DIY/Crafts': '🔨',
  'Movies/TV': '🎬',
  'Food & Dining': '🍽️',
  'Outdoor Activities': '🏕️',
  'Science': '🔬',
  'History': '📜',
  'Pets': '🐾',
  'Fashion & Beauty': '💄',
};

export default function EditRecipientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const updateRecipient = useRecipientStore(state => state.updateRecipient);
  const removeRecipient = useRecipientStore(state => state.removeRecipient);
  const { colors, isDark } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RecipientFormData | null>(null);
  const [initialFormData, setInitialFormData] = useState<RecipientFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    if (recipient) {
      const recipientFormData: RecipientFormData = {
        name: recipient.name,
        relationship: recipient.relationship,
        ageRange: recipient.ageRange || '',
        gender: recipient.gender || '',
        interests: recipient.interests,
        dislikes: recipient.dislikes || '',
        budget: recipient.budget,
        occasion: recipient.occasion,
        pastGifts: recipient.pastGifts || [],
        notes: recipient.notes || '',
      };
      setFormData(recipientFormData);
      setInitialFormData(recipientFormData);
      
      // Auto-expand advanced options if any advanced fields have values
      if (recipient.ageRange || recipient.gender || recipient.dislikes || 
          (recipient.pastGifts && recipient.pastGifts.length > 0) || recipient.notes) {
        setShowAdvancedOptions(true);
      }
    }
  }, [recipient]);

  // Warn user when navigating away with unsaved changes
  const isDirty = formData && initialFormData ? hasFormChanged(formData, initialFormData) : false;
  useUnsavedChanges({
    isDirty,
    title: 'Discard Changes?',
    message: 'You have unsaved changes to this recipient. Are you sure you want to leave?',
  });

  const toggleInterest = (interest: string) => {
    if (!formData) return;
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
    // Clear warning when interests are added
    if (newInterests.length > 0 && warnings.interests) {
      setWarnings({ ...warnings, interests: '' });
    }
  };

  const toggleAdvancedOptions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  if (!recipient || !formData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Recipient not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.button} />
        </View>
      </View>
    );
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.relationship) newErrors.relationship = 'Relationship is required';
        // Interests are now optional with a warning instead of blocking
        if (formData.interests.length === 0) {
          newWarnings.interests = 'Adding interests helps us find better gifts';
        }
        break;
      case 1:
        if (formData.budget.minimum > formData.budget.maximum) {
          newErrors.budget = 'Minimum cannot exceed maximum';
        }
        break;
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      updateRecipient(recipientId, {
        ...formData,
        updatedAt: getTimestamp(),
      });
      router.back();
    } catch (error) {
      setErrors({ submit: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipient',
      `Are you sure you want to delete ${recipient.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              removeRecipient(recipientId);
              router.replace(ROUTES.TABS.RECIPIENTS);
            } catch (error) {
              setIsDeleting(false);
              Alert.alert('Error', 'Failed to delete recipient. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            {/* Essential Fields */}
            <Input
              label="Recipient Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Mom, John, Sarah"
              error={errors.name}
            />

            <FormSelect
              label="Relationship"
              value={formData.relationship}
              options={RELATIONSHIPS.map(r => ({ label: r.label, value: r.value }))}
              onSelect={(value) => setFormData({ ...formData, relationship: value })}
              placeholder="Select relationship"
              error={errors.relationship}
            />

            {/* Interest Grid */}
            <View style={styles.interestSection}>
              <Text style={styles.inputLabel}>Interests (Recommended)</Text>
              {warnings.interests && (
                <View style={styles.warningBanner}>
                  <AlertCircle stroke={colors.accentWarning} size={16} />
                  <Text style={styles.warningText}>{warnings.interests}</Text>
                </View>
              )}
              <View style={styles.interestGrid}>
                {COMMON_INTERESTS.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.interestChip,
                        isSelected && styles.interestChipSelected,
                      ]}
                      onPress={() => toggleInterest(interest)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.interestIcon}>
                        {INTEREST_ICONS[interest] || '✨'}
                      </Text>
                      <Text
                        style={[
                          styles.interestText,
                          isSelected && styles.interestTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {formData.interests.length > 0 && (
                <Text style={styles.selectedCount}>
                  {formData.interests.length} selected
                </Text>
              )}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            {/* Essential Fields */}
            <RangeSlider
              label="Budget Range"
              minValue={formData.budget.minimum}
              maxValue={formData.budget.maximum}
              onMinChange={(min) => setFormData({
                ...formData,
                budget: { ...formData.budget, minimum: min }
              })}
              onMaxChange={(max) => setFormData({
                ...formData,
                budget: { ...formData.budget, maximum: max }
              })}
              currency="$"
              error={errors.budget}
            />

            <FormSelect
              label="Occasion"
              value={formData.occasion.type}
              options={OCCASION_TYPES.map(o => ({ label: o.label, value: o.value }))}
              onSelect={(value) => setFormData({
                ...formData,
                occasion: { ...formData.occasion, type: value as any }
              })}
            />

            <DatePicker
              label="Occasion Date (Optional)"
              value={formData.occasion.date ? new Date(formData.occasion.date) : null}
              onChange={(date) => setFormData({
                ...formData,
                occasion: { ...formData.occasion, date: date.toISOString() }
              })}
              placeholder="Select date"
              minDate={new Date()}
            />

            {/* Collapsible Advanced Options */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={toggleAdvancedOptions}
              activeOpacity={0.7}
            >
              <Text style={styles.advancedToggleText}>Advanced Options</Text>
              {showAdvancedOptions ? (
                <ChevronUp stroke={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown stroke={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>

            {showAdvancedOptions && (
              <View style={styles.advancedOptions}>
                <FormSelect
                  label="Age Range"
                  value={formData.ageRange || ''}
                  options={AGE_RANGES.map(a => ({ label: a.label, value: a.value }))}
                  onSelect={(value) => setFormData({ ...formData, ageRange: value })}
                  placeholder="Select age range"
                />

                <FormSelect
                  label="Gender"
                  value={formData.gender || ''}
                  options={GENDERS.map(g => ({ label: g.label, value: g.value }))}
                  onSelect={(value) => setFormData({ ...formData, gender: value })}
                  placeholder="Select gender"
                />

                <Input
                  label="Dislikes or Allergies"
                  value={formData.dislikes}
                  onChangeText={(text) => setFormData({ ...formData, dislikes: text })}
                  placeholder="e.g., No nuts, doesn't like blue..."
                  multiline
                  numberOfLines={2}
                />

                <Input
                  label="Past Gifts"
                  value={formData.pastGifts.join('; ')}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    pastGifts: text.split(';').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Watch; Books; Nike Air Max 90..."
                  multiline
                  numberOfLines={2}
                />

                <Input
                  label="Additional Notes"
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Any other details that might help..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Mini Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Quick Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recipient:</Text>
                <Text style={styles.summaryValue}>{formData.name || '—'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Relationship:</Text>
                <Text style={styles.summaryValue}>
                  {RELATIONSHIPS.find(r => r.value === formData.relationship)?.label || '—'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Interests:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {formData.interests.length > 0 
                    ? formData.interests.slice(0, 3).join(', ') + (formData.interests.length > 3 ? '...' : '')
                    : '—'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Budget:</Text>
                <Text style={styles.summaryValue}>
                  ${formData.budget.minimum} - ${formData.budget.maximum}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Occasion:</Text>
                <Text style={styles.summaryValue}>
                  {OCCASION_TYPES.find(o => o.value === formData.occasion.type)?.label || '—'}
                </Text>
              </View>
            </View>

            {errors.submit && (
              <Text style={styles.submitError}>{errors.submit}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.title}>Edit Recipient</Text>
        <ProgressStepper steps={STEPS} currentStep={currentStep} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="outline"
          style={[styles.footerButton, styles.deleteButton]}
          disabled={isDeleting}
        />
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={currentStep === STEPS.length - 1 ? 'Save' : 'Next'}
          onPress={handleNext}
          disabled={isSubmitting || isDeleting}
          style={styles.footerButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../../hooks/useTheme').useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  button: {
    width: '100%',
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.display,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  // Interest Grid Styles
  interestSection: {
    marginTop: SPACING.md,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: SPACING.xs,
  },
  interestChipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentPrimary,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  interestTextSelected: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: SPACING.sm,
    fontFamily: FONTS.body,
  },
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  warningText: {
    fontSize: 13,
    color: colors.warningText,
    fontFamily: FONTS.body,
    flex: 1,
  },
  // Advanced Options
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  advancedOptions: {
    marginTop: SPACING.sm,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: SPACING.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: FONTS.body,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: SPACING.sm,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  submitError: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
