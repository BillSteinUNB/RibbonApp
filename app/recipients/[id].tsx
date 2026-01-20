import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';

export default function RecipientDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>Recipient #{id}</Text>
            <Text style={styles.relationship}>Relationship</Text>
          </View>

          <Button
            title="Edit Recipient"
            onPress={() => {}}
            style={styles.button}
          />

          <Button
            title="Back to List"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
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
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.display,
  },
  relationship: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
  },
  button: {
    marginBottom: SPACING.md,
  },
});
