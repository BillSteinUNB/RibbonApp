import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS, SCREEN_WIDTH } from '../constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { recipientService } from '../services/recipientService';
import { useRecipientStore } from '../store/recipientStore';
import { getCountdown } from '../utils/dates';
import { errorLogger } from '../services/errorLogger';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react-native';

export default function RecipientsListScreen() {
  const router = useRouter();
  const recipients = useRecipientStore((state) => state.recipients);
  const setRecipients = useRecipientStore((state) => state.setRecipients);
  const removeRecipient = useRecipientStore((state) => state.removeRecipient);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await recipientService.getAllRecipients();
      setRecipients(data);
    } catch (error) {
      errorLogger.log(error, { context: 'loadRecipients' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Recipient',
      'Are you sure you want to delete this recipient? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await recipientService.deleteRecipient(id);
              removeRecipient(id);
              Alert.alert('Success', 'Recipient deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recipient');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredRecipients = recipients.filter((recipient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      recipient.name.toLowerCase().includes(query) ||
      recipient.relationship.toLowerCase().includes(query)
    );
  });

  const sortedRecipients = [...filteredRecipients].sort((a, b) => {
    // Sort by upcoming occasion
    const aDate = a.occasion.date ? new Date(a.occasion.date).getTime() : 0;
    const bDate = b.occasion.date ? new Date(b.occasion.date).getTime() : 0;
    if (aDate && bDate) {
      const now = Date.now();
      const aDiff = Math.abs(aDate - now);
      const bDiff = Math.abs(bDate - now);
      return aDiff - bDiff;
    }
    return bDate - aDate;
  });

  if (isLoading && recipients.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Recipients' }} />
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipients...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Recipients' }} />
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header with Search */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {/* Search modal */}}
          >
            <Search size={20} />
            {searchQuery ? (
              <Text style={styles.searchText}>{searchQuery}</Text>
            ) : (
              <Text style={styles.searchPlaceholder}>Search recipients...</Text>
            )}
          </TouchableOpacity>
          
          <Button
            title="Add"
            onPress={() => router.push('/recipients/new')}
            icon={<Plus size={20} />}
            style={styles.addButton}
          />
        </View>

        {/* Recipients List */}
        {sortedRecipients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Recipients Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first recipient to start finding perfect gifts!
            </Text>
            <Button
              title="Add Recipient"
              onPress={() => router.push('/recipients/new')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <ScrollView style={styles.list}>
            {sortedRecipients.map((recipient) => (
              <Card
                key={recipient.id}
                style={styles.recipientCard}
                onPress={() => router.push(`/recipients/${recipient.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.recipientName}>{recipient.name}</Text>
                    <Text style={styles.recipientRelationship}>
                      {recipient.relationship}
                    </Text>
                  </View>
                  
                  <View style={styles.cardHeaderRight}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {/* Edit */}}
                    >
                      <Edit2 size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.deleteButton]}
                      onPress={() => handleDelete(recipient.id)}
                      disabled={deletingId === recipient.id}
                    >
                      <Trash2 size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {recipient.occasion.date && (
                  <View style={styles.occasion}>
                    <Text style={styles.occasionType}>
                      {recipient.occasion.type.charAt(0).toUpperCase() + recipient.occasion.type.slice(1)}
                    </Text>
                    <Text style={styles.occasionDate}>
                      {getCountdown(recipient.occasion.date)}
                    </Text>
                  </View>
                )}

                {recipient.giftHistory && recipient.giftHistory.length > 0 && (
                  <View style={styles.history}>
                    <Text style={styles.historyText}>
                      {recipient.giftHistory.length} gift{recipient.giftHistory.length > 1 ? 's' : ''} generated
                    </Text>
                  </View>
                )}

                <View style={styles.interests}>
                  {(recipient.interests.slice(0, 3)).map((interest, index) => (
                    <View key={interest} style={styles.interestTag}>
                      <Text style={styles.interestTagText}>{interest}</Text>
                    </View>
                  ))}
                  {recipient.interests.length > 3 && (
                    <Text style={styles.moreText}>+{recipient.interests.length - 3}</Text>
                  )}
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
      
      {/* Floating Add Button (if needed) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/recipients/new')}
        >
          <Plus size={24} />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: SPACING.sm,
    backgroundColor: COLORS.bgSecondary,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: SPACING.sm,
  },
  searchText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
    padding: SPACING.md,
  },
  recipientCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.display,
  },
  recipientRelationship: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  deleteButton: {
    opacity: 0.7,
  },
  occasion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  occasionType: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.accentPrimary,
    marginRight: SPACING.xs,
    fontFamily: FONTS.body,
  },
  occasionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  history: {
    marginBottom: SPACING.sm,
  },
  historyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  interestTag: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  interestTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  moreText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontFamily: FONTS.body,
  },
  emptyButton: {
    width: SCREEN_WIDTH * 0.7,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
