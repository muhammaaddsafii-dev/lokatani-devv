import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Product } from '../../src/types';
import api from '../../src/services/api';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const isBuyer = user?.role === 'buyer';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await api.getProduct(id!);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await api.addToCart(product.id);
      Alert.alert('Success', 'Product added to cart', [
        {
          text: 'View Cart',
          onPress: () => router.push('/(tabs)/cart'),
        },
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.error}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Product not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Image
          source={{ uri: product.image_base64 }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {t('idr')} {product.price.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {product.location}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('farmer_name')}: {product.farmer_name}
            </Text>
          </View>

          <View style={[styles.descriptionSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>
              {t('description')}
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {isBuyer && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            title={t('add_to_cart')}
            onPress={handleAddToCart}
            loading={addingToCart}
            style={styles.addButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceRow: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  descriptionSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addButton: {
    width: '100%',
  },
});
