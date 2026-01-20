import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { useRecipientStore, selectRecipients } from '../store/recipientStore';
import { RELATIONSHIPS } from '../types/recipient';

export default function RecipientsTab() {
  const router = useRouter();
  const recipients = useRecipientStore(selectRecipients);
  const { isLoading, error } = useRecipientStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getRelationshipLabel = (value: string) => {
    return RELATIONSHIPS.find(r => r.value === value)?.label || value;
  };

  const renderRecipientItem = ({ item }: { item: typeof recipients[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/recipients/${item.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.relationship}>{getRelationshipLabel(item.relationship)}</Text>
      {item.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          {item.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {item.interests.length > 3 && (
            <Text style={styles.moreInterests}>+{item.interests.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>👥</Text>
      </View>
      <Text style={styles.emptyTitle}>No Recipients Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first recipient to start finding perfect gifts
      </Text>
      <Button
        title="Add Recipient"
        onPress={() => router.push('/recipients/new')}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {error || 'Failed to load recipients'}
      </Text>
      <Button
        title="Try Again"
        onPress={onRefresh}
        variant="outline"
        style={styles.errorButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipients</Text>
        <Button
          title="Add Recipient"
          onPress={() => router.push('/recipients/new')}
          style={styles.addButton}
        />
      </View>

      {error ? (
        renderErrorState()
      ) : recipients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipients}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipientItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  addButton: {
    marginTop: SPACING.md,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.bgSecondary,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  relationship: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  interestTag: {
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  interestText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  moreInterests: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIconText: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  emptyButton: {
    width: '100%',
    maxWidth: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  errorButton: {
    width: 150,
  },
});
