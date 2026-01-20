import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS } from './constants';
import { Button } from './components/Button';

export default function HelpScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Email: support@ribbon.com');
  };

  return (
    <View style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>How can we help you?</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Questions</Text>
            <Text style={styles.faqItem}>How does Ribbon work?</Text>
            <Text style={styles.faqItem}>How do I add a recipient?</Text>
            <Text style={styles.faqItem}>How are gift suggestions personalized?</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.contactText}>Still need help? Reach out to our support team.</Text>

            <Button
              title="Contact Support"
              onPress={handleContactSupport}
              style={styles.button}
            />

            <Button
              title="Back to Home"
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
            />
          </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl * 2,
    fontFamily: FONTS.body,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.body,
  },
  faqItem: {
    fontSize: 16,
    color: COLORS.textSecondary,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.body,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.body,
  },
  button: {
    marginBottom: SPACING.md,
  },
});
