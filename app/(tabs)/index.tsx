import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gift, Plus, Sparkles, Calendar } from 'lucide-react-native';
import { SPACING, FONTS, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { useRecipientStore } from '../store/recipientStore';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { recipients } = useRecipientStore();

  const upcomingOccasions = recipients
    .filter(r => r.occasion?.date)
    .sort((a, b) => new Date(a.occasion.date!).getTime() - new Date(b.occasion.date!).getTime())
    .slice(0, 3);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.lg }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.profile?.name || 'Friend'}!</Text>
          <Text style={styles.subGreeting}>Ready to find the perfect gift?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push(ROUTES.TABS.SETTINGS)}
        >
          <Text style={styles.profileInitial}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.accentPrimary }]}
          onPress={() => router.push(ROUTES.RECIPIENTS.NEW)}
        >
          <Plus stroke="white" size={24} />
          <Text style={styles.actionTextLight}>New Recipient</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.bgSecondary }]}
          onPress={() => router.push(ROUTES.TABS.RECIPIENTS)}
        >
          <Gift stroke={colors.accentPrimary} size={24} />
          <Text style={styles.actionTextDark}>My Recipients</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Occasions</Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.TABS.RECIPIENTS)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingOccasions.length > 0 ? (
          upcomingOccasions.map(recipient => (
            <Card 
              key={recipient.id} 
              style={styles.occasionCard}
              onPress={() => router.push(ROUTES.RECIPIENTS.DETAIL(recipient.id))}
            >
              <View style={styles.occasionIcon}>
                <Calendar stroke={colors.accentPrimary} size={20} />
              </View>
              <View style={styles.occasionInfo}>
                <Text style={styles.occasionName}>{recipient.name}</Text>
                <Text style={styles.occasionType}>
                  {recipient.occasion.type} • {new Date(recipient.occasion.date!).toLocaleDateString()}
                </Text>
              </View>
              <Sparkles stroke="#FFD700" size={16} />
            </Card>
          ))
        ) : (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming occasions.</Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.RECIPIENTS.NEW)}>
              <Text style={styles.emptyLink}>Add a recipient to get started!</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gift Giving Tips</Text>
        <Card style={[styles.tipCard, isDark && styles.tipCardDark]}>
          <Text style={[styles.tipTitle, isDark && styles.tipTitleDark]}>Did you know?</Text>
          <Text style={[styles.tipText, isDark && styles.tipTextDark]}>
            Adding specific interests like "Hiking" or "Watercolor Painting" helps our AI suggest much more personalized gifts!
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: FONTS.display,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: FONTS.body,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accentPrimary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTextLight: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  actionTextDark: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: FONTS.display,
  },
  seeAll: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  occasionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  occasionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  occasionInfo: {
    flex: 1,
  },
  occasionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: FONTS.body,
  },
  occasionType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptyLink: {
    fontSize: 16,
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1,
  },
  tipCardDark: {
    backgroundColor: '#3D3520',
    borderColor: '#92702A',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: SPACING.xs,
  },
  tipTitleDark: {
    color: '#FCD34D',
  },
  tipText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  tipTextDark: {
    color: '#E5C07A',
  },
});
