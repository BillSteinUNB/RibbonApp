import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FormSelect, MultiSelect, RangeSlider, DatePicker, ProgressStepper } from '../components/forms';
import {
  RecipientFormData,
  Recipient,
  RELATIONSHIPS,
  AGE_RANGES,
  GENDERS,
  OCCASION_TYPES,
  COMMON_INTERESTS,
} from '../types/recipient';
import { useRecipientStore } from '../store/recipientStore';
import { generateId, getTimestamp } from '../utils/helpers';

const DRAFT_STORAGE_KEY = '@ribbon/recipient-draft';

const STEPS = [
  { title: 'Basic', description: 'Tell us about who this gift is for' },
  { title: 'Interests', description: "What do they enjoy?" },
  { title: 'Budget', description: 'Set your budget and occasion' },
  { title: 'Review', description: 'Review and save' },
];

const initialFormData: RecipientFormData = {
  name: '',
  relationship: '',
  ageRange: '',
  gender: '',
  interests: [],
  dislikes: '',
  budget: { minimum: 25, maximum: 100, currency: 'USD' },
  occasion: { type: 'birthday', date: undefined, customName: '' },
  pastGifts: [],
  notes: '',
};

export default function NewRecipientScreen() {
  const router = useRouter();
  const addRecipient = useRecipientStore(state => state.addRecipient);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RecipientFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const { formData: draftData, step } = JSON.parse(savedDraft);
          setFormData(draftData);
          setCurrentStep(step);
        }
      } catch (error) {
        console.warn('Failed to load draft:', error);
      } finally {
        setIsDraftLoaded(true);
      }
    };
    loadDraft();
  }, []);

  const saveDraft = useCallback(async (data: RecipientFormData, step: number) => {
    try {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData: data, step }));
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, []);

  useEffect(() => {
    if (isDraftLoaded) {
      saveDraft(formData, currentStep);
    }
  }, [formData, currentStep, isDraftLoaded, saveDraft]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.relationship) newErrors.relationship = 'Relationship is required';
        break;
      case 1:
        if (formData.interests.length === 0) newErrors.interests = 'Select at least one interest';
        break;
      case 2:
        if (formData.budget.minimum > formData.budget.maximum) {
          newErrors.budget = 'Minimum cannot exceed maximum';
        }
        break;
    }

    setErrors(newErrors);
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
      const now = getTimestamp();
      const recipient: Recipient = {
        ...formData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        giftHistory: [],
      };
      addRecipient(recipient);
      await clearDraft();
      router.replace('/(tabs)/recipients');
    } catch (error) {
      setErrors({ submit: 'Failed to save recipient. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
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

            <FormSelect
              label="Age Range (Optional)"
              value={formData.ageRange || ''}
              options={AGE_RANGES.map(a => ({ label: a.label, value: a.value }))}
              onSelect={(value) => setFormData({ ...formData, ageRange: value })}
              placeholder="Select age range"
            />

            <FormSelect
              label="Gender (Optional)"
              value={formData.gender || ''}
              options={GENDERS.map(g => ({ label: g.label, value: g.value }))}
              onSelect={(value) => setFormData({ ...formData, gender: value })}
              placeholder="Select gender"
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <MultiSelect
              label="Interests"
              selected={formData.interests}
              options={[...COMMON_INTERESTS]}
              onSelectionChange={(selected) => setFormData({ ...formData, interests: selected })}
              placeholder="Search or add interests..."
              error={errors.interests}
              allowCustom
            />

            <Input
              label="Dislikes or Allergies (Optional)"
              value={formData.dislikes}
              onChangeText={(text) => setFormData({ ...formData, dislikes: text })}
              placeholder="e.g., No nuts, doesn't like blue..."
              multiline
              numberOfLines={3}
            />

            <Input
              label="Past Gifts (Optional)"
              value={formData.pastGifts.join(', ')}
              onChangeText={(text) => setFormData({
                ...formData,
                pastGifts: text.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="e.g., Watch, Books, Scarf..."
              multiline
              numberOfLines={2}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
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
            />

            <Input
              label="Additional Notes (Optional)"
              value={formData.notes || ''}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Any other details that might help..."
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Review Details</Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Name</Text>
                <Text style={styles.reviewValue}>{formData.name}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Relationship</Text>
                <Text style={styles.reviewValue}>
                  {RELATIONSHIPS.find(r => r.value === formData.relationship)?.label}
                </Text>
              </View>

              {formData.ageRange && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Age Range</Text>
                  <Text style={styles.reviewValue}>
                    {AGE_RANGES.find(a => a.value === formData.ageRange)?.label}
                  </Text>
                </View>
              )}

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Interests</Text>
                <Text style={styles.reviewValue}>{formData.interests.join(', ')}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Budget</Text>
                <Text style={styles.reviewValue}>
                  ${formData.budget.minimum} - ${formData.budget.maximum}
                </Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Occasion</Text>
                <Text style={styles.reviewValue}>
                  {OCCASION_TYPES.find(o => o.value === formData.occasion.type)?.label}
                </Text>
              </View>

              {formData.dislikes && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Dislikes</Text>
                  <Text style={styles.reviewValue}>{formData.dislikes}</Text>
                </View>
              )}
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
      <View style={styles.header}>
        <Text style={styles.title}>Add Recipient</Text>
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
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={currentStep === STEPS.length - 1 ? 'Save' : 'Next'}
          onPress={handleNext}
          disabled={isSubmitting}
          style={styles.footerButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 60,
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.display,
  },
  reviewSection: {
    marginBottom: SPACING.md,
  },
  reviewLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  submitError: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
