import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>{t('app_name')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('login_to_continue')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder={t('username')}
            />

            <Input
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t('password')}
            />

            <Button
              title={t('login')}
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.linkContainer}
            >
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                {t('dont_have_account')}{' '}
              </Text>
              <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                {t('register')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
  },
  linkTextBold: {
    fontSize: 14,
    fontWeight: '600',
  },
});
