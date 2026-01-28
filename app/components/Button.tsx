import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, FONTS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  icon?: React.ReactNode;
  style?: any;
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button({ title, onPress, variant = 'primary', icon, style, disabled, isLoading }: ButtonProps) {
  const getBgColor = () => {
    if (disabled) return COLORS.bgSubtle;
    switch (variant) {
      case 'primary': return COLORS.accentPrimary;
      case 'secondary': return COLORS.accentSoft;
      case 'ghost': return 'transparent';
      case 'outline': return 'transparent';
      default: return COLORS.accentPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.accentPrimary;
      case 'ghost': return COLORS.textSecondary;
      case 'outline': return COLORS.accentPrimary;
      default: return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: isLoading || false, disabled: disabled || false }}
      style={[
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? COLORS.accentPrimary : 'transparent',
          shadowOpacity: variant === 'primary' ? 0.1 : 0,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.display,
  },
});
