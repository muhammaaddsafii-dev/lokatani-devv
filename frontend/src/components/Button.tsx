import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    };

    if (disabled) {
      return { ...base, backgroundColor: colors.border, ...style };
    }

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.primary, ...style };
      case 'secondary':
        return { ...base, backgroundColor: colors.primaryLight, ...style };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary, ...style };
      default:
        return { ...base, backgroundColor: colors.primary, ...style };
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    if (disabled) {
      return { ...base, color: colors.textSecondary };
    }

    if (variant === 'outline') {
      return { ...base, color: colors.primary };
    }

    return { ...base, color: '#FFFFFF' };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
