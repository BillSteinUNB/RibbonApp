/**
 * Quick Recipient - Simplified 1-Screen Form
 * Part of Quick Start flow after paywall
 * 
 * Psychology: Minimize effort, get to value fast
 * Only asks for essential info: Name, Relationship, Interests, Budget
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../constants';
import { RELATIONSHIPS } from '../types/recipient';
import { useRecipientStore } from '../store/recipientStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { generateId, getTimestamp } from '../utils/helpers';
import { logger } from '../utils/logger';
import { ROUTES } from '../constants/routes';

// Quick interests grid - most common categories
const QUICK_INTERESTS = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🏕️' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
];

// Simple budget options
const BUDGET_OPTIONS = [
  { id: 'low', label: 'Under $50', min: 10, max: 50, emoji: '💵' },
  { id: 'medium', label: '$50 - $150', min: 50, max: 150, emoji: '💰' },
  { id: 'high', label: '$150+', min: 150, max: 500, emoji: '💎' },
];

export default function QuickRecipientScreen() {
  const router = useRouter();
  const addRecipient = useRecipientStore(state => state.addRecipient);
  const { setQuickStartRecipientId } = useOnboardingStore();
  
  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(i => i !== interestId);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 interests
      }
      return [...prev, interestId];
    });
    // Clear error when user selects
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!relationship) {
      newErrors.relationship = 'Please select a relationship';
    }
    // Interests are now optional - we'll just show a warning
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFindGifts = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const budget = BUDGET_OPTIONS.find(b => b.id === selectedBudget)!;
      const interests = selectedInterests.map(id => 
        QUICK_INTERESTS.find(i => i.id === id)?.label || id
      );
      
      const now = getTimestamp();
      const recipientId = generateId();
      
      const recipient = {
        id: recipientId,
        name: name.trim(),
        relationship,
        interests: interests.length > 0 ? interests : ['General'], // Fallback
        dislikes: '',
        budget: {
          minimum: budget.min,
          maximum: budget.max,
          currency: 'USD',
        },
        occasion: {
          type: 'other' as const,
        },
        pastGifts: [],
        createdAt: now,
        updatedAt: now,
        giftHistory: [],
      };
      
      // Save recipient
      addRecipient(recipient);
      
      // Store the ID for success screen
      setQuickStartRecipientId(recipientId);
      
      logger.info('[QuickRecipient] Created recipient:', recipientId);
      
      // Navigate to generating screen
      router.push(ROUTES.ONBOARDING.QUICK_GENERATING(recipientId));
      
    } catch (error) {
      logger.error('[QuickRecipient] Failed to create recipient:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getRelationshipLabel = () => {
    if (!relationship) return 'Select relationship';
    return RELATIONSHIPS.find(r => r.value === relationship)?.label || relationship;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Who's the gift for?</Text>
          <View style={styles.backButton} /> 
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Their Name</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.textInputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g., Mom, John, Sarah"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Relationship Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Relationship</Text>
            <TouchableOpacity
              style={[styles.selector, errors.relationship && styles.selectorError]}
              onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
            >
              <Text style={[
                styles.selectorText,
                !relationship && styles.selectorPlaceholder
              ]}>
                {getRelationshipLabel()}
              </Text>
              <Text style={styles.selectorArrow}>
                {showRelationshipPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {errors.relationship && <Text style={styles.errorText}>{errors.relationship}</Text>}
            
            {/* Relationship Options */}
            {showRelationshipPicker && (
              <View style={styles.pickerOptions}>
                {RELATIONSHIPS.map((rel) => (
                  <TouchableOpacity
                    key={rel.value}
                    style={[
                      styles.pickerOption,
                      relationship === rel.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setRelationship(rel.value);
                      setShowRelationshipPicker(false);
                      if (errors.relationship) setErrors(prev => ({ ...prev, relationship: '' }));
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      relationship === rel.value && styles.pickerOptionTextSelected
                    ]}>
                      {rel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Interests Grid */}
          <View style={styles.section}>
            <Text style={styles.label}>What are they into?</Text>
            <Text style={styles.sublabel}>
              Tap up to 5 interests {selectedInterests.length > 0 && `(${selectedInterests.length}/5)`}
            </Text>
            
            <View style={styles.interestsGrid}>
              {QUICK_INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.id) && styles.interestChipSelected
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text style={[
                    styles.interestLabel,
                    selectedInterests.includes(interest.id) && styles.interestLabelSelected
                  ]}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedInterests.length === 0 && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  💡 Adding interests helps us find better gifts
                </Text>
              </View>
            )}
          </View>

          {/* Budget Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Range</Text>
            <View style={styles.budgetOptions}>
              {BUDGET_OPTIONS.map((budget) => (
                <TouchableOpacity
                  key={budget.id}
                  style={[
                    styles.budgetOption,
                    selectedBudget === budget.id && styles.budgetOptionSelected
                  ]}
                  onPress={() => setSelectedBudget(budget.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.budgetEmoji}>{budget.emoji}</Text>
                  <Text style={[
                    styles.budgetLabel,
                    selectedBudget === budget.id && styles.budgetLabelSelected
                  ]}>
                    {budget.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mini Summary */}
          {name.trim() && relationship && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Quick Summary</Text>
              <Text style={styles.summaryText}>
                Finding gifts for <Text style={styles.summaryHighlight}>{name}</Text> 
                {' '}({RELATIONSHIPS.find(r => r.value === relationship)?.label})
                {selectedInterests.length > 0 && (
                  <Text> who likes {selectedInterests.map(id => 
                    QUICK_INTERESTS.find(i => i.id === id)?.label
                  ).join(', ')}</Text>
                )}
                {' '}within <Text style={styles.summaryHighlight}>
                  {BUDGET_OPTIONS.find(b => b.id === selectedBudget)?.label}
                </Text>
              </Text>
            </View>
          )}

          {errors.submit && (
            <Text style={styles.submitError}>{errors.submit}</Text>
          )}
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaButton, isSubmitting && styles.ctaButtonDisabled]}
            onPress={handleFindGifts}
            activeOpacity={0.9}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.ctaText}>Find Gift Ideas</Text>
                <Text style={styles.ctaEmoji}>🎁</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sublabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  selector: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorError: {
    borderColor: COLORS.error,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectorPlaceholder: {
    color: COLORS.textMuted,
  },
  selectorArrow: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  pickerOptions: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.accentSoft,
  },
  pickerOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  pickerOptionTextSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  interestChipSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  interestEmoji: {
    fontSize: 16,
  },
  interestLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  interestLabelSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  budgetOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  budgetOption: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  budgetOptionSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  budgetEmoji: {
    fontSize: 20,
  },
  budgetLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  budgetLabelSelected: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentPrimary,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  summaryHighlight: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  submitError: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  ctaButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  ctaEmoji: {
    fontSize: 20,
  },
});
