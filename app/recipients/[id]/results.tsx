import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../../components/Button';
import { FormSelect } from '../../components/forms';
import { useRecipientStore, selectRecipientById } from '../../store/recipientStore';
import { useGiftStore } from '../../store/giftStore';
import { giftService } from '../../services/giftService';
import type { GiftIdea } from '../../types/recipient';
import { ROUTES } from '../../constants/routes';

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
  { label: 'Tech', value: 'tech' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Home', value: 'home' },
  { label: 'Books', value: 'books' },
  { label: 'Experience', value: 'experience' },
  { label: 'Other', value: 'other' },
];

const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'low-to-high' },
  { label: 'Price: High to Low', value: 'high-to-low' },
];

interface GiftCardProps {
  gift: GiftIdea;
  onSave: () => void;
  onMarkPurchased: () => void;
}

function GiftCard({ gift, onSave, onMarkPurchased }: GiftCardProps) {
  return (
    <View style={styles.giftCard}>
      <View style={styles.giftHeader}>
        <View style={styles.giftCategoryBadge}>
          <Text style={styles.giftCategoryText}>{gift.category}</Text>
        </View>
        <Text style={styles.giftPrice}>{gift.price}</Text>
      </View>
      
      <Text style={styles.giftName}>{gift.name}</Text>
      <Text style={styles.giftDescription}>{gift.description}</Text>
      
      <View style={styles.reasoningContainer}>
        <Text style={styles.reasoningLabel}>Why this works:</Text>
        <Text style={styles.reasoningText}>{gift.reasoning}</Text>
      </View>
      
      {gift.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {gift.tags.slice(0, 4).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.giftActions}>
        <TouchableOpacity
          style={[styles.actionButton, gift.isSaved && styles.actionButtonActive]}
          onPress={onSave}
        >
          <Text style={[styles.actionButtonText, gift.isSaved && styles.actionButtonTextActive]}>
            {gift.isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, gift.isPurchased && styles.actionButtonPurchased]}
          onPress={onMarkPurchased}
        >
          <Text style={[styles.actionButtonText, gift.isPurchased && styles.actionButtonTextPurchased]}>
            {gift.isPurchased ? 'Purchased' : 'Mark Purchased'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GiftResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const recipientId = typeof id === 'string' ? id : '';
  const recipient = useRecipientStore(selectRecipientById(recipientId));
  const { currentGifts, saveGift, unsaveGift, markAsPurchased } = useGiftStore();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low'>('low-to-high');

  const filteredAndSortedGifts = useMemo(() => {
    let gifts = [...currentGifts];
    
    if (categoryFilter !== 'all') {
      gifts = gifts.filter(
        (g) => g.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    return giftService.sortGiftsByPrice(gifts, sortBy);
  }, [currentGifts, categoryFilter, sortBy]);

  const handleSave = (giftId: string, isSaved: boolean) => {
    if (isSaved) {
      unsaveGift(giftId);
    } else {
      saveGift(giftId);
    }
  };

  const handleMarkPurchased = (giftId: string) => {
    markAsPurchased(giftId);
  };

  const handleRegenerate = () => {
    router.replace(ROUTES.RECIPIENTS.IDEAS(recipientId));
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Ideas</Text>
        <Text style={styles.subtitle}>for {recipient.name}</Text>
        
        <View style={styles.filterRow}>
          <View style={styles.filterSelect}>
            <FormSelect
              value={categoryFilter}
              options={CATEGORIES}
              onSelect={setCategoryFilter}
              placeholder="Category"
            />
          </View>
          
          <View style={styles.filterSelect}>
            <FormSelect
              value={sortBy}
              options={SORT_OPTIONS}
              onSelect={(val) => setSortBy(val as 'low-to-high' | 'high-to-low')}
              placeholder="Sort"
            />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredAndSortedGifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GiftCard
            gift={item}
            onSave={() => handleSave(item.id, item.isSaved)}
            onMarkPurchased={() => handleMarkPurchased(item.id)}
          />
        )}
        contentContainerStyle={styles.giftsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No gifts found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Button
          title="Generate New Ideas"
          onPress={handleRegenerate}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="Done"
          onPress={() => router.replace(ROUTES.TABS.RECIPIENTS)}
          style={styles.footerButton}
        />
      </View>
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
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filterSelect: {
    flex: 1,
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
  button: {
    width: '100%',
  },
  giftsList: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  giftCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  giftCategoryBadge: {
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  giftCategoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  giftName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  giftDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
  },
  reasoningContainer: {
    backgroundColor: COLORS.bgSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
  },
  reasoningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  giftActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  actionButtonPurchased: {
    backgroundColor: '#DCFCE7',
    borderColor: COLORS.accentSuccess,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  actionButtonTextActive: {
    color: COLORS.accentPrimary,
  },
  actionButtonTextPurchased: {
    color: '#166534',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
  },
  footerButton: {
    flex: 1,
  },
});
