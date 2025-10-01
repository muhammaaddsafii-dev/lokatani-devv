import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../src/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
