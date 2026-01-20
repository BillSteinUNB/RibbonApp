import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { useRecipientStore, selectRecipientById } from '../store/recipientStore';
import { RELATIONSHIPS, AGE_RANGES, OCCASION_TYPES } from '../types/recipient';

export default function RecipientDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  const recipient = useRecipientStore(selectRecipientById(recipientId));

  if (!recipient) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Recipient not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.button} />
        </View>
      </View>
    );
  }

  const getRelationshipLabel = (value: string) => {
    return RELATIONSHIPS.find(r => r.value === value)?.label || value;
  };

  const getAgeRangeLabel = (value: string) => {
    return AGE_RANGES.find(a => a.value === value)?.label || value;
  };

  const getOccasionLabel = (value: string) => {
    return OCCASION_TYPES.find(o => o.value === value)?.label || value;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{recipient.name}</Text>
          <Text style={styles.relationship}>{getRelationshipLabel(recipient.relationship)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          {recipient.ageRange && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age Range</Text>
              <Text style={styles.detailValue}>{getAgeRangeLabel(recipient.ageRange)}</Text>
            </View>
          )}

          {recipient.gender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{recipient.gender}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {recipient.interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
          
          {recipient.dislikes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dislikes</Text>
              <Text style={styles.detailValue}>{recipient.dislikes}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <Text style={styles.budgetText}>
            ${recipient.budget.minimum} - ${recipient.budget.maximum} {recipient.budget.currency}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occasion</Text>
          <Text style={styles.detailValue}>
            {getOccasionLabel(recipient.occasion.type)}
            {recipient.occasion.date && ` on ${new Date(recipient.occasion.date).toLocaleDateString()}`}
          </Text>
        </View>

        {recipient.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{recipient.notes}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/recipients/${recipientId}/edit`)}
          >
            <Text style={styles.editButtonText}>Edit Recipient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.giftIdeasButton}
            onPress={() => router.push(`/recipients/${recipientId}/ideas`)}
          >
            <Text style={styles.giftIdeasButtonText}>Find Gift Ideas</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Back to List"
          onPress={() => router.replace('/(tabs)/recipients')}
          variant="outline"
          style={styles.backButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  relationship: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  section: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  budgetText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  actionsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  editButton: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.body,
  },
  giftIdeasButton: {
    backgroundColor: COLORS.accentSecondary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  giftIdeasButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.body,
  },
  backButton: {
    marginTop: SPACING.md,
  },
  button: {
    width: '100%',
  },
});
