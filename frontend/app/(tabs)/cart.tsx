import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../../src/types';
import api from '../../src/services/api';
import { CartItemCard } from '../../src/components/CartItemCard';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await api.getCart();
      setCartItems(data.items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCart();
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.removeFromCart(productId);
      setCartItems(cartItems.filter((item) => item.product.id !== productId));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const items = cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      await api.createOrder(items, calculateTotal());
      
      Alert.alert(
        t('order_success'),
        t('order_completed'),
        [
          {
            text: t('back_to_home'),
            onPress: () => {
              setCartItems([]);
              router.push('/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('cart')}</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('empty_cart')}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            renderItem={({ item }) => (
              <CartItemCard item={item} onRemove={() => handleRemove(item.product.id)} />
            )}
          />

          <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total')}:</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {t('idr')} {calculateTotal().toLocaleString('id-ID')}
              </Text>
            </View>
            <Button
              title={t('checkout')}
              onPress={handleCheckout}
              loading={checkingOut}
              style={styles.checkoutButton}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkoutButton: {
    width: '100%',
  },
});
