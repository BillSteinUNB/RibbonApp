import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';

export default function RecipientsTab() {
  const router = useRouter();

  const mockRecipients = [
    { id: '1', name: 'John Doe', relationship: 'Friend' },
    { id: '2', name: 'Jane Smith', relationship: 'Mother' },
    { id: '3', name: 'Bob Johnson', relationship: 'Brother' },
  ];

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

      <ScrollView>
        {mockRecipients.map((recipient) => (
          <TouchableOpacity
            key={recipient.id}
            style={styles.card}
            onPress={() => router.push(`/recipients/${recipient.id}`)}
          >
            <Text style={styles.name}>{recipient.name}</Text>
            <Text style={styles.relationship}>{recipient.relationship}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.bgSecondary,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
    fontFamily: FONTS.body,
  },
});
