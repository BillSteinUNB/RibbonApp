import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { giftService } from '../../services/giftService';
import { recipientService } from '../../services/recipientService';
import { useRecipientStore } from '../../store/recipientStore';
import { formatDate } from '../../utils/dates';
import { Heart, ShoppingCart, Search, ChevronDown, Check } from 'lucide-react-native';
import type { GiftIdea } from '../../types/recipient';

type SortOption = 'date-desc' | 'date-asc' | 'price-low' | 'price-high' | 'category' | 'status';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
];

export default function GiftHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipient, setRecipient] = useState<string>('');
  const [gifts, setGifts] = useState<GiftIdea[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<GiftIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    if (id) {
      loadGifts();
    }
  }, [id]);

  useEffect(() => {
    filterAndSortGifts();
  }, [gifts, searchQuery, sortBy]);

  const loadGifts = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const recipientData = await recipientService.getRecipient(id);
      if (recipientData) {
        setRecipient(recipientData.name);
      }
      const giftHistory = giftService.getGiftHistory(id);
      setGifts(giftHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to load gift history');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortGifts = () => {
    let filtered = [...gifts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gift =>
        gift.name.toLowerCase().includes(query) ||
        gift.description.toLowerCase().includes(query) ||
        gift.category.toLowerCase().includes(query) ||
        gift.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
        case 'date-asc':
          return new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
        case 'price-low':
          return extractPriceNumber(a.price) - extractPriceNumber(b.price);
        case 'price-high':
          return extractPriceNumber(b.price) - extractPriceNumber(a.price);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          const statusOrder = { purchased: 0, saved: 1, none: 2 };
          const getStatus = (gift: GiftIdea) => {
            if (gift.isPurchased) return 'purchased';
            if (gift.isSaved) return 'saved';
            return 'none';
          };
          return statusOrder[getStatus(a) as keyof typeof statusOrder] - 
                 statusOrder[getStatus(b) as keyof typeof statusOrder];
        default:
          return 0;
      }
    });

    setFilteredGifts(filtered);
  };

  const extractPriceNumber = (price: string): number => {
    const match = price.match(/\$?([\d,]+)/);
    return match ? parseInt(match[1].replace(',', ''), 0) : 0;
  };

  const handleSaveGift = async (giftId: string) => {
    try {
      await giftService.saveGiftIdea(giftId);
      loadGifts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save gift');
    }
  };

  const handleUnsaveGift = async (giftId: string) => {
    try {
      await giftService.unsaveGiftIdea(giftId);
      loadGifts();
    } catch (error) {
      Alert.alert('Error', 'Failed to unsave gift');
    }
  };

  const handleMarkAsPurchased = async (giftId: string) => {
    if (!id) return;
    
    Alert.alert(
      'Mark as Purchased',
      'Have you purchased this gift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await giftService.markAsPurchased(giftId, id);
              loadGifts();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark gift as purchased');
            }
          }
        },
      ]
    );
  };

  const handleGiftPress = (gift: GiftIdea) => {
    // Show gift details in a modal
    Alert.alert(
      gift.name,
      `${gift.description}\n\nReasoning: ${gift.reasoning}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Mark Purchased',
          onPress: () => handleMarkAsPurchased(gift.id),
          style: gift.isPurchased ? 'cancel' : 'default'
        },
        {
          text: gift.isSaved ? 'Unsave' : 'Save',
          onPress: () => gift.isSaved ? handleUnsaveGift(gift.id) : handleSaveGift(gift.id)
        },
      ]
    );
  };

  const getStats = () => {
    return {
      total: gifts.length,
      saved: gifts.filter(g => g.isSaved).length,
      purchased: gifts.filter(g => g.isPurchased).length,
    };
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Gift History' }} />
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading gift history...</Text>
        </View>
      </>
    );
  }

  const stats = getStats();

  return (
    <>
      <Stack.Screen options={{ title: `${recipient}'s Gifts` }} />
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.purchased}</Text>
            <Text style={styles.statLabel}>Purchased</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search size={20} color={COLORS.textSecondary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gifts..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Text style={styles.sortButtonText}>
            Sort: {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
          </Text>
          <View style={[styles.chevron, showSortMenu && styles.chevronRotated]}>
            <ChevronDown 
              size={20} 
              color={COLORS.accentPrimary} 
            />
          </View>
        </TouchableOpacity>

        {/* Sort Menu */}
        {showSortMenu && (
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortMenuItem, sortBy === option.value && styles.sortMenuItemActive]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortMenu(false);
                }}
              >
                <Text style={[
                  styles.sortMenuItemText,
                  sortBy === option.value && styles.sortMenuItemTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Check size={16} color={COLORS.accentPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Gift List */}
        <ScrollView style={styles.giftList}>
          {filteredGifts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No gifts match your search' : 'No gift history yet'}
              </Text>
            </View>
          ) : (
            filteredGifts.map((gift) => (
              <Card key={gift.id} style={styles.giftCard} onPress={() => handleGiftPress(gift)}>
                <View style={styles.giftHeader}>
                  <View style={styles.giftHeaderLeft}>
                    <Text style={styles.giftName}>{gift.name}</Text>
                    <View style={styles.giftMeta}>
                      <Text style={styles.giftCategory}>{gift.category}</Text>
                      <Text style={styles.giftDate}>
                        {formatDate(gift.generatedAt, 'short')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.giftPriceContainer}>
                    <Text style={styles.giftPrice}>{gift.price}</Text>
                  </View>
                </View>

                <Text style={styles.giftDescription} numberOfLines={2}>
                  {gift.description}
                </Text>

                <View style={styles.giftTags}>
                  {gift.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.giftFooter}>
                  <View style={styles.giftActions}>
                    {gift.isSaved ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSaved]}
                        onPress={() => handleUnsaveGift(gift.id)}
                      >
                        <Heart size={18} fill={COLORS.accentPrimary} color={COLORS.accentPrimary} />
                        <Text style={styles.actionText}>Saved</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSaveGift(gift.id)}
                      >
                        <Heart size={18} color={COLORS.textMuted} />
                        <Text style={styles.actionText}>Save</Text>
                      </TouchableOpacity>
                    )}

                    {gift.isPurchased ? (
                      <View style={[styles.actionButton, styles.actionButtonPurchased]}>
                        <ShoppingCart size={18} fill={COLORS.accentSuccess} color={COLORS.accentSuccess} />
                        <Text style={[styles.actionText, styles.actionTextPurchased]}>Purchased</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMarkAsPurchased(gift.id)}
                      >
                        <ShoppingCart size={18} color={COLORS.textMuted} />
                        <Text style={styles.actionText}>Buy</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSecondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  chevron: {
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  sortMenu: {
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sortMenuItemActive: {
    backgroundColor: COLORS.accentSoft,
  },
  sortMenuItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  sortMenuItemTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  giftList: {
    flex: 1,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  giftCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  giftHeaderLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    marginBottom: SPACING.xs,
  },
  giftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  giftCategory: {
    fontSize: 12,
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  giftDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  giftPriceContainer: {
    alignItems: 'flex-end',
  },
  giftPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.display,
  },
  giftDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.body,
    marginBottom: SPACING.sm,
  },
  giftTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  giftFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  giftActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  actionButtonSaved: {
    backgroundColor: COLORS.accentSoft,
  },
  actionButtonPurchased: {
    backgroundColor: '#D1FAE5',
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  actionTextPurchased: {
    color: COLORS.accentSuccess,
    fontWeight: '600',
  },
});
