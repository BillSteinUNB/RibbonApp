import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants';
import { Button } from './Button';
import { checkNetworkConnectivity } from '../hooks/useNetworkStatus';

interface OfflineOverlayProps {
  isVisible: boolean;
  onRetry?: () => void;
}

/**
 * Full-screen overlay shown when the device is offline.
 * Blocks interaction with the app until connectivity is restored.
 */
export function OfflineOverlay({ isVisible, onRetry }: OfflineOverlayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isVisible) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    const isConnected = await checkNetworkConnectivity();
    setIsRetrying(false);

    if (isConnected && onRetry) {
      onRetry();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <WifiOff stroke={COLORS.textMuted} size={64} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>No Internet Connection</Text>

        <Text style={styles.message}>
          Ribbon requires an internet connection to generate personalized gift suggestions.
          Please check your connection and try again.
        </Text>

        <Button
          title={isRetrying ? 'Checking...' : 'Try Again'}
          onPress={handleRetry}
          disabled={isRetrying}
          style={styles.retryButton}
        />

        {isRetrying && (
          <ActivityIndicator
            size="small"
            color={COLORS.accentPrimary}
            style={styles.spinner}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    padding: SPACING.xxl,
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.body,
  },
  retryButton: {
    minWidth: 160,
  },
  spinner: {
    marginTop: SPACING.md,
  },
});
