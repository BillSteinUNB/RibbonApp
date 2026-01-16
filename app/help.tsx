import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from './constants';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { FAQ_ITEMS, FAQ_CATEGORIES, CONTACT_INFO, SUPPORT_SUBJECTS } from './constants/faq';
import { FAQCategoryType } from './constants/faq';
import { ChevronDown, ChevronUp, Mail, ExternalLink, Bug, Lightbulb, MessageCircle, Shield, FileText } from 'lucide-react-native';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<FAQCategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = async () => {
    const email = CONTACT_INFO.supportEmail;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject || SUPPORT_SUBJECTS.general)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoLink);
      if (canOpen) {
        await Linking.openURL(mailtoLink);
      } else {
        Alert.alert('Error', 'Email app not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const handleBugReport = async () => {
    const email = CONTACT_INFO.bugReportEmail;
    const subjectLine = SUPPORT_SUBJECTS.bug;
    const body = `Describe the bug:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nAdditional information:`;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoLink);
      if (canOpen) {
        await Linking.openURL(mailtoLink);
      } else {
        Alert.alert('Error', 'Email app not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const handleFeatureRequest = async () => {
    const email = CONTACT_INFO.featureRequestEmail;
    const subjectLine = SUPPORT_SUBJECTS.feature;
    const body = `Feature description:\n\nWhy would this be useful:\n\nUse case:\n`;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoLink);
      if (canOpen) {
        await Linking.openURL(mailtoLink);
      } else {
        Alert.alert('Error', 'Email app not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const openDocumentation = async () => {
    try {
      await Linking.openURL(CONTACT_INFO.documentationUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open documentation');
    }
  };

  const openGitHubIssues = async () => {
    try {
      await Linking.openURL(CONTACT_INFO.githubUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open GitHub');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Help Center' }} />
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
              <MessageCircle size={20} color={COLORS.textSecondary} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={handleContactSupport}>
            <View style={styles.quickActionIcon}>
              <Mail size={24} color={COLORS.accentPrimary} />
            </View>
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionDescription}>Get help with any issue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handleBugReport}>
            <View style={styles.quickActionIcon}>
              <Bug size={24} color={COLORS.error} />
            </View>
            <Text style={styles.quickActionTitle}>Report a Bug</Text>
            <Text style={styles.quickActionDescription}>Let us know about issues</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handleFeatureRequest}>
            <View style={styles.quickActionIcon}>
              <Lightbulb size={24} color={COLORS.accentSecondary} />
            </View>
            <Text style={styles.quickActionTitle}>Suggest a Feature</Text>
            <Text style={styles.quickActionDescription}>Share your ideas</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {FAQ_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqList}>
            {filteredFAQs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No results found' : 'No FAQs available'}
                </Text>
              </View>
            ) : (
              filteredFAQs.map((faq) => (
                <Card key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(faq.id)}
                    style={styles.faqHeader}
                  >
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    {expandedItems.has(faq.id) ? (
                      <ChevronUp size={20} color={COLORS.accentPrimary} />
                    ) : (
                      <ChevronDown size={20} color={COLORS.textMuted} />
                    )}
                  </TouchableOpacity>
                  {expandedItems.has(faq.id) && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </Card>
              ))
            )}
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Resources</Text>
          
          <TouchableOpacity style={styles.resourceCard} onPress={openDocumentation}>
            <View style={styles.resourceIcon}>
              <FileText size={20} color={COLORS.textSecondary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Documentation</Text>
              <Text style={styles.resourceDescription}>Read our complete documentation</Text>
            </View>
            <ExternalLink size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard} onPress={openGitHubIssues}>
            <View style={styles.resourceIcon}>
              <Bug size={20} color={COLORS.textSecondary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>GitHub Issues</Text>
              <Text style={styles.resourceDescription}>View and track issues</Text>
            </View>
            <ExternalLink size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard} onPress={() => Linking.openURL('https://billsteinunb.github.io/RibbonApp/privacy.html')}>
            <View style={styles.resourceIcon}>
              <Shield size={20} color={COLORS.textSecondary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceDescription}>Learn how we protect your data</Text>
            </View>
            <ExternalLink size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        <View style={styles.contactFormSection}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <Card style={styles.contactFormCard}>
            <Input
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="What's this about?"
            />
            <Input
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 120 }}
            />
            <Button
              title="Send Message"
              onPress={handleContactSupport}
              style={styles.sendButton}
            />
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Still need help?</Text>
          <Text style={styles.footerEmail}>{CONTACT_INFO.supportEmail}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSubtle,
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
  quickActionsSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  quickActionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  quickActionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  faqSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  categoryFilter: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  faqList: {
    gap: SPACING.sm,
  },
  faqCard: {
    padding: SPACING.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
    fontFamily: FONTS.display,
  },
  faqAnswer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontFamily: FONTS.body,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  resourcesSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    fontFamily: FONTS.display,
  },
  resourceDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  contactFormSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactFormCard: {
    padding: SPACING.lg,
  },
  sendButton: {
    marginTop: SPACING.md,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.body,
  },
  footerEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.display,
  },
});
