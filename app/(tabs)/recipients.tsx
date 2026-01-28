import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { SPACING, FONTS, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { useRecipientStore, selectRecipients } from '../store/recipientStore';
import { RELATIONSHIPS } from '../types/recipient';
import { ROUTES } from '../constants/routes';

export default function RecipientsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const recipients = useRecipientStore(selectRecipients);
  const { isLoading, error, setLoading } = useRecipientStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      // Rehydrate the store from persisted storage
      await useRecipientStore.persist.rehydrate();
    } catch (err) {
      if (__DEV__) console.warn('Failed to refresh recipients:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [setLoading]);

  const getRelationshipLabel = (value: string) => {
    return RELATIONSHIPS.find(r => r.value === value)?.label || value;
  };

  const renderRecipientItem = ({ item }: { item: typeof recipients[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(ROUTES.RECIPIENTS.DETAIL(item.id))}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${getRelationshipLabel(item.relationship)}`}
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
      <View style={styles.emptyIcon} accessibilityElementsHidden={true} importantForAccessibility="no">
        <Text style={styles.emptyIconText} accessibilityElementsHidden={true} importantForAccessibility="no">👥</Text>
      </View>
      <Text style={styles.emptyTitle}>No Recipients Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first recipient to start finding perfect gifts
      </Text>
      <Button
        title="Add Recipient"
        onPress={() => router.push(ROUTES.RECIPIENTS.NEW)}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.accentPrimary} />
      <Text style={styles.loadingText}>Loading recipients...</Text>
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
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.title}>Recipients</Text>
        <Button
          title="Add Recipient"
          onPress={() => router.push(ROUTES.RECIPIENTS.NEW)}
          style={styles.addButton}
        />
      </View>

      {error ? (
        renderErrorState()
      ) : isLoading && recipients.length === 0 ? (
        renderLoadingState()
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

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
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
    backgroundColor: colors.bgSecondary,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  relationship: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  interestText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  moreInterests: {
    fontSize: 11,
    color: colors.textMuted,
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
    backgroundColor: colors.bgSubtle,
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
    color: colors.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  errorButton: {
    width: 150,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
