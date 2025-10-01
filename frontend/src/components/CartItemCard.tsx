import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CartItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image
        source={{ uri: item.product.image_base64 }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {t('idr')} {item.product.price.toLocaleString('id-ID')}
        </Text>
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>
          {t('quantity')}: {item.quantity}
        </Text>
        <Text style={[styles.subtotal, { color: colors.text }]}>
          {t('total')}: {t('idr')} {(item.product.price * item.quantity).toLocaleString('id-ID')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: colors.error }]}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 12,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
