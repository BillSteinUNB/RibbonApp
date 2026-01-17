/**
 * MINIMAL TEST LAYOUT
 * Testing if the app can even boot without any of our code
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ribbon App Loaded!</Text>
      <Text style={styles.subtext}>If you see this, React Native works.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E85D75',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
