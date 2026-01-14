import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RefinementBottomSheet } from '../../components/RefinementBottomSheet';
import { recipientService } from '../../services/recipientService';
import { giftService } from '../../services/giftService';
import {
  X,
  Heart,
  ShoppingCart,
  Sparkles,
  Filter,
  ArrowUpDown,
  Crown
} from 'lucide-react-native';
import type { GiftIdea } from '../../types/recipient';
import { useRecipientStore } from '../../store/recipientStore';
import { useAuthStore } from '../../store/authStore';
import { useGiftStore } from '../../store/giftStore';

export default function GiftIdeasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setRecipients = useRecipientStore((state) => state.setRecipients);
  const isPremium = useAuthStore((state) => state.user?.isPremium ?? false);
  const createGenerationSession = useGiftStore((state) => state.createGenerationSession);
  const markSessionAsRefined = useGiftStore((state) => state.markSessionAsRefined);

  const [recipient, setRecipient] = useState<any>(null);
  const [gifts, setGifts] = useState<GiftIdea[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<GiftIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>('low-to-high');

  // Refinement state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showRefinementSheet, setShowRefinementSheet] = useState(false);
  const [canRefine, setCanRefine] = useState(true);

  useEffect(() => {
    if (id) {
      loadRecipientAndGenerate();
    }
  }, [id]);

  const loadRecipientAndGenerate = async () => {
    if (!id) return;

    setIsLoading(true);

    try {
      const recipientData = await recipientService.getRecipient(id);
      if (!recipientData) {
        Alert.alert('Error', 'Recipient not found');
        router.back();
        return;
      }

      setRecipient(recipientData);
      setIsProcessing(true);

      // Generate gifts with simulated progress
      const messages = [
        'Analyzing recipient preferences...',
        'Understanding interests and lifestyle...',
        'Brainstorming gift ideas...',
        'Refining suggestions for personalization...',
        'Finalizing gift list...',
      ];

      for (const message of messages) {
        setProgressMessage(message);
        await delay(800);
      }

      const generatedGifts = await giftService.generateWithProgress(
        recipientData,
        5,
        (message) => setProgressMessage(message)
      );

      setGifts(generatedGifts);
      setFilteredGifts(generatedGifts);

      // Create generation session for refinement tracking
      const sessionId = createGenerationSession(
        id,
        generatedGifts.map(g => g.id)
      );
      setCurrentSessionId(sessionId);
      setCanRefine(true);

      setIsProcessing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate gift ideas');
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGift = async (giftId: string) => {
    try {
      await giftService.saveGiftIdea(giftId);
      setGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, isSaved: !g.isSaved } : g))
      );
      setFilteredGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, isSaved: !g.isSaved } : g))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save gift');
    }
  };

  const handleUnsaveGift = async (giftId: string) => {
    try {
      await giftService.unsaveGiftIdea(giftId);
      setGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, isSaved: !g.isSaved } : g))
      );
      setFilteredGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, isSaved: !g.isSaved } : g))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to unsave gift');
    }
  };

  const handleMarkPurchased = (giftId: string) => {
    Alert.alert(
      'Mark as Purchased',
      'Are you sure you want to mark this gift as purchased?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await giftService.markAsPurchased(giftId, id);
              setGifts((prev) =>
                prev.map((g) => (g.id === giftId ? { ...g, isPurchased: !g.isPurchased } : g))
              );
              setFilteredGifts((prev) =>
                prev.map((g) => (g.id === giftId ? { ...g, isPurchased: !g.isPurchased } : g))
              );
              Alert.alert('Success', 'Gift marked as purchased!');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark as purchased');
            }
          },
        },
      ]
    );
  };

  const handleRegenerate = () => {
    if (recipient) {
      loadRecipientAndGenerate();
    }
  };

  const handleFilterByCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setFilteredGifts(gifts);
    } else {
      setSelectedCategory(category);
      const filtered = giftService.filterGiftsByCategory(gifts, category);
      setFilteredGifts(filtered);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'low-to-high' ? 'high-to-low' : 'low-to-high';
    setSortOrder(newOrder);
    const sorted = giftService.sortGiftsByPrice(filteredGifts, newOrder);
    setFilteredGifts(sorted);
  };

  const handleOpenRefinement = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Gift refinement is available with Ribbon Pro. Upgrade to refine your gift suggestions based on your feedback.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade to Pro',
            onPress: () => router.push('/pricing'),
          },
        ]
      );
      return;
    }

    if (!canRefine) {
      Alert.alert(
        'Refinement Already Used',
        'You can only refine results once per generation. To get new suggestions, use the Regenerate button.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (gifts.length === 0) {
      Alert.alert('No Gifts', 'Generate gifts first before refining.');
      return;
    }

    setShowRefinementSheet(true);
  };

  const handleSubmitRefinement = async (feedback: {
    likedGiftIds: string[];
    dislikedGiftIds: string[];
    instructions: string;
  }) => {
    setShowRefinementSheet(false);
    setIsProcessing(true);

    try {
      const likedGifts = gifts.filter(g => feedback.likedGiftIds.includes(g.id));
      const dislikedGifts = gifts.filter(g => feedback.dislikedGiftIds.includes(g.id));

      // Generate refined gifts with progress
      const refinedGifts = await giftService.refineWithProgress(
        recipient,
        currentSessionId!,
        likedGifts,
        dislikedGifts,
        feedback.instructions,
        5,
        (message) => setProgressMessage(message)
      );

      // Update state: keep gifts that weren't disliked, append refined gifts
      const keptGifts = gifts.filter(g => !feedback.dislikedGiftIds.includes(g.id));
      const updatedGifts = [...keptGifts, ...refinedGifts];

      setGifts(updatedGifts);
      setFilteredGifts(updatedGifts);

      // Mark session as refined
      markSessionAsRefined(currentSessionId!, {
        likedGiftIds: feedback.likedGiftIds,
        dislikedGiftIds: feedback.dislikedGiftIds,
        instructions: feedback.instructions,
        refinedAt: new Date().toISOString(),
      });

      setCanRefine(false);
      setIsProcessing(false);

      Alert.alert('Success', 'Your gift suggestions have been refined!');
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert('Error', error.message || 'Failed to refine gifts');
    }
  };

  const categories = Array.from(new Set(gifts.map((gift) => gift.category)));

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Gift Ideas',
        headerRight: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} />
          </TouchableOpacity>
        ),
      }} />
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Recipient Info Header */}
        {recipient && (
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{recipient.name}</Text>
              <Text style={styles.relationship}>{recipient.relationship}</Text>
            </View>
            <View style={styles.headerActions}>
              <Button
                title="Refine"
                onPress={handleOpenRefinement}
                icon={<Crown size={16} color={canRefine ? COLORS.accentSecondary : COLORS.textMuted} />}
                variant="outline"
                disabled={!canRefine || isProcessing}
                style={styles.refineButton}
              />
              <Button
                title="Regenerate"
                onPress={handleRegenerate}
                icon={<Sparkles size={16} />}
                variant="outline"
                style={styles.regenerateButton}
              />
            </View>
          </View>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressText}>{progressMessage}</Text>
          </Card>
        )}

        {/* Filter and Sort Controls */}
        <View style={styles.controls}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilter}
          >
            <TouchableOpacity
              style={[
                styles.categoryPill,
                !selectedCategory && styles.categoryPillActive,
              ]}
              onPress={() => {
                setSelectedCategory(null);
                setFilteredGifts(gifts);
              }}
            >
              <Text style={styles.categoryText}>All</Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillSelected,
                ]}
                onPress={() => handleFilterByCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category ? styles.categoryTextSelected : undefined,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSort}
          >
            <ArrowUpDown size={16} />
          </TouchableOpacity>
        </View>

        {/* Gifts List */}
        <ScrollView style={styles.giftsList}>
          {filteredGifts.map((gift) => (
            <Card key={gift.id} style={styles.giftCard}>
              <View style={styles.giftHeader}>
                <Text style={styles.giftName}>{gift.name}</Text>
                <View style={styles.giftActions}>
                  <TouchableOpacity
                    onPress={() => gift.isSaved ? handleUnsaveGift(gift.id) : handleSaveGift(gift.id)}
                  >
                    {/* @ts-ignore */}
                    {gift.isSaved ? <Heart size={20} color={COLORS.accentPrimary} /> : <Heart size={20} />}
                  </TouchableOpacity>
                  {!gift.isPurchased && (
                    <TouchableOpacity
                      onPress={() => handleMarkPurchased(gift.id)}
                      style={styles.purchaseButton}
                    >
                      <ShoppingCart size={20} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.giftCategoryRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{gift.category}</Text>
                </View>
                <Text style={styles.giftPrice}>{gift.price}</Text>
              </View>

              <Text style={styles.giftDescription}>{gift.description}</Text>

              <View style={styles.giftReasoning}>
                <Text style={styles.reasoningLabel}>Why this fits:</Text>
                <Text style={styles.reasoningText}>{gift.reasoning}</Text>
              </View>

              {gift.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {gift.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {gift.tags.length > 3 && (
                    <Text style={styles.moreText}>+{gift.tags.length - 3}</Text>
                  )}
                </View>
              )}
            </Card>
          ))}
        </ScrollView>

        {filteredGifts.length === 0 && !isProcessing && (
          <View style={styles.emptyState}>
            <Sparkles size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No gift ideas yet</Text>
          </View>
        )}
      </View>

      {/* Refinement Bottom Sheet */}
      <RefinementBottomSheet
        visible={showRefinementSheet}
        gifts={gifts}
        onClose={() => setShowRefinementSheet(false)}
        onSubmit={handleSubmitRefinement}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.bgSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.display,
  },
  relationship: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  refineButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  regenerateButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  progressCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    gap: SPACING.sm,
  },
  categoryFilter: {
    flex: 1,
  },
  categoryPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: SPACING.xs,
  },
  categoryPillActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.accentPrimary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  categoryTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sortButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.sm,
  },
  giftsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  giftCard: {
    marginBottom: SPACING.md,
  },
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  giftName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.display,
    },
  giftActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  purchaseButton: {
    padding: SPACING.sm,
  },
  giftCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  giftDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
  },
  giftReasoning: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  reasoningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontFamily: FONTS.body,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  tagText: {
      fontSize: 11,
      color: COLORS.textMuted,
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
  emptyText: {
      fontSize: 16,
      color: COLORS.textMuted,
      fontFamily: FONTS.body,
    marginTop: SPACING.xl,
    textAlign: 'center',
  },
});
