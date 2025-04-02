import React from 'react';
import { View, Text, Image, ViewStyle, StyleSheet } from 'react-native';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string;
  label?: string;
  className?: string;
}

const sizes = {
  small: 32,
  medium: 40,
  large: 48,
};

export function Avatar({ size = 'medium', imageUrl, label, className = '' }: AvatarProps) {
  const dimension = sizes[size];

  return (
    <View
      className={`bg-gray-300 rounded-full overflow-hidden items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: dimension, height: dimension }}
        />
      ) : (
        <Text className="text-white font-semibold" style={{ fontSize: dimension * 0.4 }}>
          {label || '?'}
        </Text>
      )}
    </View>
  );
} 