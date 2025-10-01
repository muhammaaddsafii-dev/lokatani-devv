import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const isFarmer = user?.role === 'farmer';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {isFarmer && (
        <Tabs.Screen
          name="my-products"
          options={{
            title: t('my_products'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {isFarmer && (
        <Tabs.Screen
          name="add-product"
          options={{
            title: t('add_product'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {!isFarmer && (
        <Tabs.Screen
          name="cart"
          options={{
            title: t('cart'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden tabs */}
      {isFarmer && <Tabs.Screen name="cart" options={{ href: null }} />}
      {!isFarmer && <Tabs.Screen name="my-products" options={{ href: null }} />}
      {!isFarmer && <Tabs.Screen name="add-product" options={{ href: null }} />}
    </Tabs>
  );
}
