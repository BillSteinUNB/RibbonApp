import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThumbsUp, ThumbsDown, Crown, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants';
import { Button } from './Button';
import type { GiftIdea } from '../types/recipient';

interface RefinementBottomSheetProps {
  visible: boolean;
  gifts: GiftIdea[];
  onClose: () => void;
  onSubmit: (feedback: {
    likedGiftIds: string[];
    dislikedGiftIds: string[];
    instructions: string;
  }) => void;
}

export function RefinementBottomSheet({
  visible,
  gifts,
  onClose,
  onSubmit,
}: RefinementBottomSheetProps) {
  const [giftFeedback, setGiftFeedback] = useState<Record<string, 'liked' | 'disliked' | null>>({});
  const [instructions, setInstructions] = useState('');

  const handleFeedbackToggle = (giftId: string, type: 'liked' | 'disliked') => {
    setGiftFeedback((prev: Record<string, 'liked' | 'disliked' | null>) => ({
      ...prev,
      [giftId]: prev[giftId] === type ? null : type,
    }));
  };

  const hasAnyFeedback =
    Object.values(giftFeedback).some(f => f !== null) ||
    instructions.trim().length >= 10;

  const handleSubmit = () => {
    const likedGiftIds = Object.entries(giftFeedback)
      .filter(([_, feedback]) => feedback === 'liked')
      .map(([id]) => id);

    const dislikedGiftIds = Object.entries(giftFeedback)
      .filter(([_, feedback]) => feedback === 'disliked')
      .map(([id]) => id);

    onSubmit({
      likedGiftIds,
      dislikedGiftIds,
      instructions: instructions.trim(),
    });

    // Reset state
    setGiftFeedback({});
    setInstructions('');
  };

  const handleClose = () => {
    setGiftFeedback({});
    setInstructions('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Crown size={20} color={COLORS.accentSecondary} />
              <Text style={styles.title}>Refine Results</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <Text style={styles.subtitle}>
            Help us improve your results by telling us what you liked or disliked.
          </Text>

          {/* Gift List */}
          <ScrollView
            style={styles.giftList}
            showsVerticalScrollIndicator={false}
          >
            {gifts.map(gift => (
              <View key={gift.id} style={styles.giftItem}>
                <View style={styles.giftInfo}>
                  <Text style={styles.giftName} numberOfLines={1}>
                    {gift.name}
                  </Text>
                  <View style={styles.giftMeta}>
                    <Text style={styles.giftCategory}>{gift.category}</Text>
                    <Text style={styles.giftPrice}>{gift.price}</Text>
                  </View>
                </View>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    onPress={() => handleFeedbackToggle(gift.id, 'liked')}
                    style={[
                      styles.feedbackButton,
                      giftFeedback[gift.id] === 'liked' && styles.likedButton,
                    ]}
                  >
                    <ThumbsUp
                      size={18}
                      color={
                        giftFeedback[gift.id] === 'liked'
                          ? COLORS.white
                          : COLORS.accentSuccess
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFeedbackToggle(gift.id, 'disliked')}
                    style={[
                      styles.feedbackButton,
                      giftFeedback[gift.id] === 'disliked' && styles.dislikedButton,
                    ]}
                  >
                    <ThumbsDown
                      size={18}
                      color={
                        giftFeedback[gift.id] === 'disliked'
                          ? COLORS.white
                          : COLORS.error
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Instructions (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 'Make them more affordable' or 'Focus on experiences'"
              placeholderTextColor={COLORS.textMuted}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Helper Text */}
          {!hasAnyFeedback && (
            <Text style={styles.helperText}>
              Select at least one gift or add instructions (min 10 characters)
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="ghost"
              style={styles.cancelButton}
            />
            <Button
              title="Refine Suggestions"
              onPress={handleSubmit}
              variant="primary"
              disabled={!hasAnyFeedback}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  giftList: {
    maxHeight: 250,
    marginBottom: SPACING.lg,
  },
  giftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  giftInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  giftName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  giftMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  giftCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  giftPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  feedbackButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  likedButton: {
    backgroundColor: COLORS.accentSuccess,
    borderColor: COLORS.accentSuccess,
  },
  dislikedButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
