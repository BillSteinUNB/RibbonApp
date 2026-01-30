import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, Alert } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, FONTS, RADIUS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/Button';
import { FormSelect } from '../../components/forms';
import { useRecipientStore, selectRecipientById } from '../../store/recipientStore';
import { useGiftStore } from '../../store/giftStore';
import { giftService } from '../../services/giftService';
import type { GiftIdea } from '../../types/recipient';
import { ROUTES } from '../../constants/routes';
import { analyticsGifts } from '../../utils/analytics';
import { useAuthStore } from '../../store/authStore';

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
  onShop: () => void;
  colors: ReturnType<typeof import('../../hooks/useTheme').useTheme>['colors'];
  isDark: boolean;
}

function GiftCard({ gift, onSave, onMarkPurchased, onShop, colors, isDark }: GiftCardProps) {
  const cardStyles = useMemo(() => createCardStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={cardStyles.giftCard} accessibilityRole="button" accessibilityLabel={`${gift.name}, ${gift.price}, ${gift.category}`}>
      <View style={cardStyles.giftHeader}>
        <View style={cardStyles.giftCategoryBadge}>
          <Text style={cardStyles.giftCategoryText}>{gift.category}</Text>
        </View>
        <View style={cardStyles.priceContainer}>
          <Text style={cardStyles.giftPrice}>{gift.price}</Text>
          <Text style={cardStyles.priceDisclaimer}>Prices may vary</Text>
        </View>
      </View>

      <Text style={cardStyles.giftName}>{gift.name}</Text>
      <Text style={cardStyles.giftDescription}>{gift.description}</Text>

      <View style={cardStyles.reasoningContainer}>
        <Text style={cardStyles.reasoningLabel}>Why this works:</Text>
        <Text style={cardStyles.reasoningText}>{gift.reasoning}</Text>
      </View>

      {gift.tags.length > 0 && (
        <View style={cardStyles.tagsContainer}>
          {gift.tags.slice(0, 4).map((tag, index) => (
            <View key={index} style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={cardStyles.giftActions}>
        <TouchableOpacity
          style={[cardStyles.actionButton, cardStyles.actionButtonShop]}
          onPress={onShop}
          accessibilityRole="button"
          accessibilityLabel={`Search Online for ${gift.name}`}
        >
          <View style={cardStyles.shopButtonContent}>
            <Search size={14} color={colors.white} accessibilityElementsHidden={true} importantForAccessibility="no" />
            <Text style={cardStyles.actionButtonTextShop}>Search Online</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[cardStyles.actionButton, gift.isSaved && cardStyles.actionButtonActive]}
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel={gift.isSaved ? "Unsave gift" : "Save gift"}
        >
          <Text style={[cardStyles.actionButtonText, gift.isSaved && cardStyles.actionButtonTextActive]}>
            {gift.isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[cardStyles.actionButton, gift.isPurchased && cardStyles.actionButtonPurchased]}
          onPress={onMarkPurchased}
          accessibilityRole="button"
          accessibilityLabel={gift.isPurchased ? "Mark as not purchased" : "Mark as purchased"}
        >
          <Text style={[cardStyles.actionButtonText, gift.isPurchased && cardStyles.actionButtonTextPurchased]}>
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
  const { colors, isDark } = useTheme();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [regenerateCount, setRegenerateCount] = useState(0);

  const styles = useMemo(() => createStyles(colors), [colors]);

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
    const gift = currentGifts.find(g => g.id === giftId);
    if (isSaved) {
      unsaveGift(giftId);
    } else {
      saveGift(giftId);
      // Track gift saved
      if (gift) {
        const user = useAuthStore.getState().getOrCreateUser();
        analyticsGifts.save({
          category: gift.category,
          giftName: gift.name,
        }, user.id);
      }
    }
  };

  const handleMarkPurchased = (giftId: string) => {
    const gift = currentGifts.find(g => g.id === giftId);
    markAsPurchased(giftId);
    // Track gift purchased
    if (gift) {
      const user = useAuthStore.getState().getOrCreateUser();
      analyticsGifts.markPurchased({
        category: gift.category,
        priceRange: gift.price,
      }, user.id);
    }
  };

  const handleShop = (url: string | undefined, giftName: string) => {
    const searchUrl = url || `https://www.google.com/search?q=${encodeURIComponent(giftName + ' gift buy')}`;
    Linking.openURL(searchUrl);
    // Track shop clicked
    const user = useAuthStore.getState().getOrCreateUser();
    analyticsGifts.shopClicked({
      giftName: giftName,
    }, user.id);
  };

  // Reset regenerate count when gifts are loaded successfully
  useEffect(() => {
    if (currentGifts.length > 0) {
      setRegenerateCount(0);
    }
  }, [currentGifts.length]);

  const handleRegenerate = () => {
    const newCount = regenerateCount + 1;
    setRegenerateCount(newCount);

    if (newCount >= 3) {
      Alert.alert(
        'Generation Issue',
        'Generation is having trouble. Please check your connection and try again later.',
        [
          {
            text: 'OK',
            onPress: () => router.replace(ROUTES.TABS.RECIPIENTS),
          },
        ]
      );
    } else {
      router.replace(ROUTES.RECIPIENTS.IDEAS(recipientId));
    }
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
            onShop={() => handleShop(item.url, item.name)}
            colors={colors}
            isDark={isDark}
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

const createStyles = (colors: ReturnType<typeof import('../../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
  footerButton: {
    flex: 1,
  },
});

const createCardStyles = (colors: ReturnType<typeof import('../../hooks/useTheme').useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  giftCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  giftCategoryBadge: {
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  giftCategoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentPrimary,
    fontFamily: FONTS.body,
  },
  priceDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: FONTS.body,
    fontStyle: 'italic',
    marginTop: 2,
  },
  giftName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  giftDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
  },
  reasoningContainer: {
    backgroundColor: colors.bgSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
    textTransform: 'uppercase',
  },
  reasoningText: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 11,
    color: colors.textMuted,
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
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentPrimary,
  },
  actionButtonPurchased: {
    backgroundColor: isDark ? '#1A3D2A' : '#DCFCE7',
    borderColor: colors.accentSuccess,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: FONTS.body,
  },
  actionButtonTextActive: {
    color: colors.accentPrimary,
  },
  actionButtonTextPurchased: {
    color: isDark ? '#86EFAC' : '#166534',
  },
  actionButtonShop: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  shopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonTextShop: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    fontFamily: FONTS.body,
  },
});
