import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { recipientService } from '../services/recipientService';
import { useRecipientStore } from '../store/recipientStore';
import { formatDate, getCountdown } from '../utils/dates';
import { Gift, Edit2, Trash2, Sparkles } from 'lucide-react-native';
import type { Recipient } from '../types/recipient';

export default function RecipientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const updateRecipient = useRecipientStore((state) => state.updateRecipient);
  const removeRecipient = useRecipientStore((state) => state.removeRecipient);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecipient();
    }
  }, [id]);

  const loadRecipient = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await recipientService.getRecipient(id);
      setRecipient(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipient');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/recipients/${id}/edit`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipient',
      'Are you sure you want to delete this recipient? All gift history will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await recipientService.deleteRecipient(id);
              removeRecipient(id);
              Alert.alert('Success', 'Recipient deleted');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recipient');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleGenerateGifts = () => {
    router.push(`/recipients/${id}/generate`);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Recipient Details' }} />
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </>
    );
  }

  if (!recipient) {
    return (
      <>
        <Stack.Screen options={{ title: 'Recipient Details' }} />
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipient not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: recipient.name,
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Edit2 size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              style={[styles.headerButton, isDeleting && styles.headerButtonDisabled]} 
              disabled={isDeleting}
            >
              <Trash2 size={20} />
            </TouchableOpacity>
          </View>
        ),
      }} />
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{recipient.name}</Text>
          <Text style={styles.relationship}>{recipient.relationship}</Text>
          
          {recipient.occasion.type && (
            <View style={styles.occasionBadge}>
              <Gift size={16} />
              <Text style={styles.occasionText}>
                {recipient.occasion.customName || recipient.occasion.type.charAt(0).toUpperCase() + recipient.occasion.type.slice(1)}
              </Text>
              {recipient.occasion.date && (
                <>
                  <Text style={styles.occasionSeparator}> · </Text>
                  <Text style={styles.occasionDate}>{getCountdown(recipient.occasion.date)}</Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Gifts Generated</Text>
            <Text style={styles.statValue}>{recipient.giftHistory?.length || 0}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={styles.statValue}>
              {recipient.budget.currency} ${recipient.budget.minimum} - ${recipient.budget.maximum}
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Interests</Text>
            <Text style={styles.statValue}>{recipient.interests.length}</Text>
          </Card>
        </View>

        {/* Generate Gifts Button */}
        <View style={styles.generateSection}>
          <Button
            title="Generate Gift Ideas"
            onPress={handleGenerateGifts}
            icon={<Sparkles size={20} />}
            style={styles.generateButton}
          />
        </View>

        {/* Basic Info Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Basic Info</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age Range</Text>
            <Text style={styles.infoValue}>{recipient.ageRange || 'Not specified'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{recipient.gender || 'Not specified'}</Text>
          </View>

          {recipient.lastGiftConsultation && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Consultation</Text>
              <Text style={styles.infoValue}>{formatDate(recipient.lastGiftConsultation, 'medium')}</Text>
            </View>
          )}
        </Card>

        {/* Interests Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Interests</Text>
          
          <View style={styles.interestsGrid}>
            {recipient.interests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Dislikes Card */}
        {recipient.dislikes && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Dislikes / Allergies</Text>
            <Text style={styles.dislikesText}>{recipient.dislikes}</Text>
          </Card>
        )}

        {/* Occasion Details */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Occasion</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {recipient.occasion.customName || recipient.occasion.type}
            </Text>
          </View>

          {recipient.occasion.date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(recipient.occasion.date)}</Text>
            </View>
          )}
        </Card>

        {/* Budget Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Budget Range</Text>
          
          <View style={styles.budgetContainer}>
            <View style={styles.budgetLabel}>
              <Text style={styles.budgetText}>Minimum</Text>
              <Text style={styles.budgetAmount}>{recipient.budget.currency} ${recipient.budget.minimum}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetLabel}>
              <Text style={styles.budgetText}>Maximum</Text>
              <Text style={styles.budgetAmount}>{recipient.budget.currency} ${recipient.budget.maximum}</Text>
            </View>
          </View>
        </Card>

        {/* Past Gifts Card */}
        {recipient.pastGifts && recipient.pastGifts.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Past Gifts</Text>
            <Text style={styles.pastGiftsText}>{recipient.pastGifts}</Text>
          </Card>
        )}

        {/* Notes Card */}
        {recipient.notes && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{recipient.notes}</Text>
          </Card>
        )}

        {/* Gift History Card */}
        {recipient.giftHistory && recipient.giftHistory.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Gift History ({recipient.giftHistory.length})</Text>
            
            {recipient.giftHistory.slice(0, 3).map((gift, index) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftHistoryItem}
                onPress={() => {/* Navigate to gift details */}}
              >
                <View style={styles.giftHistoryLeft}>
                  <Text style={styles.giftHistoryName}>{gift.name}</Text>
                  <Text style={styles.giftHistoryCategory}>{gift.category}</Text>
                </View>
                <View style={styles.giftHistoryRight}>
                  <Text style={styles.giftHistoryPrice}>{gift.price}</Text>
                  <Text style={styles.giftHistoryDate}>
                    {formatDate(gift.generatedAt, 'short')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {recipient.giftHistory.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push(`/recipients/${id}/gifts`)}
              >
                <Text style={styles.viewAllText}>View all {recipient.giftHistory.length} gifts</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    fontFamily: FONTS.body,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.bgSecondary,
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
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
  },
  occasionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  occasionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.accentPrimary,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.body,
  },
  occasionSeparator: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  occasionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  generateSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  generateButton: {
    width: '100%',
  },
  card: {
    margin: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  interestTag: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  interestText: {
    fontSize: 13,
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  dislikesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  budgetLabel: {
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  budgetDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  pastGiftsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  giftHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  giftHistoryLeft: {
    flex: 1,
  },
  giftHistoryRight: {
    alignItems: 'flex-end',
  },
  giftHistoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.body,
  },
  giftHistoryCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  giftHistoryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    marginBottom: 2,
    fontFamily: FONTS.display,
  },
  giftHistoryDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  viewAllButton: {
    marginTop: SPACING.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    textAlign: 'center',
    fontFamily: FONTS.body,
  },
  footerSpace: {
    height: SPACING.xxl,
  },
});
