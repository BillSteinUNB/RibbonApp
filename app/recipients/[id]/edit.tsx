import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  FormSelect, 
  MultiSelect, 
  RangeSlider, 
  DatePicker,
  ProgressStepper 
} from '../../components/forms';
import { recipientService } from '../../services/recipientService';
import { useRecipientStore } from '../../store/recipientStore';
import { errorLogger } from '../../services/errorLogger';
import type { RecipientFormData } from '../../types/recipient';
import { 
  AGE_RANGES, 
  GENDERS, 
  RELATIONSHIPS, 
  OCCASION_TYPES, 
  COMMON_INTERESTS,
  CURRENCIES,
} from '../../types/recipient';

const STEPS = ['Basic Info', 'Interests & Preferences', 'Budget & Occasion', 'Additional Details'];

export default function EditRecipientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const updateRecipient = useRecipientStore((state) => state.updateRecipient);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Partial<RecipientFormData>>({
    name: '',
    relationship: '',
    ageRange: undefined,
    gender: undefined,
    interests: [],
    dislikes: '',
    budget: {
      minimum: 20,
      maximum: 100,
      currency: 'USD',
    },
    occasion: {
      type: 'birthday' as const,
    },
    pastGifts: [],
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RecipientFormData, string>>>({});

  // Load recipient data on mount
  useEffect(() => {
    if (id) {
      loadRecipient();
    }
  }, [id]);

  const loadRecipient = async () => {
    if (!id) return;
    
    setIsLoadingRecipient(true);
    try {
      const recipient = await recipientService.getRecipient(id);
      if (!recipient) {
        Alert.alert('Error', 'Recipient not found');
        router.back();
        return;
      }

      setFormData({
        name: recipient.name,
        relationship: recipient.relationship,
        ageRange: recipient.ageRange,
        gender: recipient.gender,
        interests: recipient.interests,
        dislikes: recipient.dislikes,
        budget: recipient.budget,
        occasion: recipient.occasion,
        pastGifts: recipient.pastGifts || [],
        notes: recipient.notes || '',
      });

      // Set custom interests (those not in COMMON_INTERESTS)
      const custom = recipient.interests.filter(
        (interest) => !COMMON_INTERESTS.includes(interest as (typeof COMMON_INTERESTS)[number])
      );
      setCustomInterests(custom);

    } catch (error) {
      Alert.alert('Error', 'Failed to load recipient');
      errorLogger.log(error, { context: 'loadRecipientForEdit', id });
      router.back();
    } finally {
      setIsLoadingRecipient(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof RecipientFormData, string>> = {};

    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.name?.trim()) {
          newErrors.name = 'Name is required';
        }
        if (!formData.relationship) {
          newErrors.relationship = 'Relationship is required';
        }
        break;

      case 1: // Interests & Preferences
        if (!formData.interests || formData.interests.length === 0) {
          newErrors.interests = 'At least one interest is required';
        }
        break;

      case 2: // Budget & Occasion
        if (formData.budget?.minimum === undefined || formData.budget?.maximum === undefined) {
          newErrors.budget = 'Budget range is required';
        }
        if ((formData.budget?.minimum ?? 0) > (formData.budget?.maximum ?? 0)) {
          newErrors.budget = 'Minimum budget cannot exceed maximum';
        }
        break;

      case 3: // Additional Details
        // No required fields here
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!id) {
      Alert.alert('Error', 'Recipient ID is required');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const updatedRecipient = await recipientService.updateRecipient(id, formData);
      updateRecipient(id, updatedRecipient);
      
      Alert.alert(
        'Success!',
        'Recipient updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update recipient. Please try again.');
      errorLogger.log(error, { context: 'updateRecipient', id });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (value: string) => {
    const currentInterests = formData.interests || [];
    if (currentInterests.includes(value)) {
      setFormData({
        ...formData,
        interests: currentInterests.filter((i) => i !== value),
      });
    } else {
      setFormData({
        ...formData,
        interests: [...currentInterests, value],
      });
    }
  };

  const addCustomInterest = (value: string) => {
    if (value && !(formData.interests || []).includes(value)) {
      setFormData({
        ...formData,
        interests: [...(formData.interests || []), value],
      });
      setCustomInterests([...customInterests, value]);
    }
  };

  if (isLoadingRecipient) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Recipient' }} />
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipient...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Edit Recipient',
        headerShown: true,
        presentation: 'modal',
      }} />
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Progress Stepper */}
            <ProgressStepper steps={STEPS} currentStep={currentStep} />

            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <View style={styles.form}>
                <Input
                  label="Recipient Name"
                  value={formData.name || ''}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., John Smith"
                  error={errors.name}
                />

                <FormSelect
                  label="Relationship"
                  value={formData.relationship || ''}
                  options={RELATIONSHIPS.map(r => ({ label: r.label, value: r.value }))}
                  onSelect={(option) => setFormData({ ...formData, relationship: option.value })}
                  placeholder="Select relationship"
                  error={errors.relationship}
                />

                <FormSelect
                  label="Age Range (Optional)"
                  value={formData.ageRange || ''}
                  options={AGE_RANGES.map(r => ({ label: r.label, value: r.value }))}
                  onSelect={(option) => setFormData({ ...formData, ageRange: option.value })}
                  placeholder="Select age range"
                />

                <FormSelect
                  label="Gender (Optional)"
                  value={formData.gender || ''}
                  options={GENDERS.map(g => ({ label: g.label, value: g.value }))}
                  onSelect={(option) => setFormData({ ...formData, gender: option.value })}
                  placeholder="Select gender"
                />
              </View>
            )}

            {/* Step 1: Interests & Preferences */}
            {currentStep === 1 && (
              <View style={styles.form}>
                <MultiSelect
                  label="Interests"
                  values={formData.interests || []}
                  options={[
                    ...COMMON_INTERESTS.map(i => ({ label: i, value: i })),
                    ...customInterests.map(i => ({ label: i, value: i })),
                  ]}
                  onToggle={toggleInterest}
                  onAddCustom={addCustomInterest}
                  placeholder="Select interests"
                  error={errors.interests}
                />

                <Input
                  label="Dislikes / Allergies (Optional)"
                  value={formData.dislikes || ''}
                  onChangeText={(text) => setFormData({ ...formData, dislikes: text })}
                  placeholder="e.g., Flowers, nuts, chocolate..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Step 2: Budget & Occasion */}
            {currentStep === 2 && (
              <View style={styles.form}>
                <FormSelect
                  label="Currency"
                  value={formData.budget?.currency || 'USD'}
                  options={CURRENCIES.map(c => ({ label: c.label, value: c.value }))}
                  onSelect={(option) => setFormData({
                    ...formData,
                    budget: { ...formData.budget!, currency: option.value },
                  })}
                />

                <RangeSlider
                  label="Budget Range"
                  min={0}
                  max={500}
                  value={{
                    min: formData.budget?.minimum || 20,
                    max: formData.budget?.maximum || 100,
                  }}
                  onChange={(value) => setFormData({
                    ...formData,
                    budget: { 
                      minimum: value.min, 
                      maximum: value.max,
                      currency: formData.budget?.currency || 'USD',
                    },
                  })}
                  step={10}
                  error={errors.budget}
                />

                <FormSelect
                  label="Occasion Type"
                  value={formData.occasion?.type || ''}
                  options={OCCASION_TYPES.map(o => ({ label: o.label, value: o.value }))}
                  onSelect={(option) => setFormData({
                    ...formData,
                    occasion: { ...formData.occasion!, type: option.value as any, customName: option.value === 'other' ? '' : undefined },
                  })}
                />

                {formData.occasion?.type === 'other' && (
                  <Input
                    label="Custom Occasion Name"
                    value={formData.occasion.customName || ''}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      occasion: { ...formData.occasion!, customName: text },
                    })}
                    placeholder="e.g., Housewarming"
                  />
                )}

                <DatePicker
                  label="Occasion Date (Optional)"
                  value={formData.occasion?.date}
                  onSelect={(date) => setFormData({
                    ...formData,
                    occasion: { ...formData.occasion!, date },
                  })}
                  placeholder="Select date"
                />
              </View>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <View style={styles.form}>
                <Input
                  label="Past Gifts (Optional)"
                  value={Array.isArray(formData.pastGifts) ? formData.pastGifts.join(', ') : ''}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    pastGifts: text.split(',').map(gift => gift.trim()).filter(gift => gift.length > 0),
                  })}
                  placeholder="e.g., Wallet, tie, watch..."
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Additional Notes (Optional)"
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Any other information that might help..."
                  multiline
                  numberOfLines={4}
                />

                {/* Review Summary */}
                <View style={styles.summary}>
                  <Text style={styles.summaryTitle}>Summary</Text>
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Name:</Text> {formData.name}
                  </Text>
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Relationship:</Text> {formData.relationship}
                  </Text>
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Interests:</Text> {formData.interests?.length || 0} selected
                  </Text>
                  <Text style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Budget:</Text> {formData.budget?.currency} ${formData.budget?.minimum} - ${formData.budget?.maximum}
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.navigation}>
              {currentStep > 0 && (
                <Button
                  title="Back"
                  onPress={handleBack}
                  variant="outline"
                  style={styles.backButton}
                />
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button
                  title="Next"
                  onPress={handleNext}
                  disabled={isLoading}
                  style={[styles.nextButton, { flex: currentStep > 0 ? 1 : 0 }]}
                />
              ) : (
                <Button
                  title="Save Changes"
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={[styles.nextButton, { flex: currentStep > 0 ? 1 : 0 }]}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  summary: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  summaryItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  summaryLabel: {
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
  },
});
