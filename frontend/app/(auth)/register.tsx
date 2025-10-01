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

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'farmer' | 'buyer'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await register(username, password, name, phone, role);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to register');
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
            <Text style={[styles.title, { color: colors.primary }]}>{t('register')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('register_to_continue')}
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

            <Input
              label={t('name')}
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
            />

            <Input
              label={t('phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder={t('phone')}
            />

            <View style={styles.roleSection}>
              <Text style={[styles.roleLabel, { color: colors.text }]}>
                {t('select_role')}
              </Text>
              
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    {
                      backgroundColor: role === 'farmer' ? colors.primary : colors.surface,
                      borderColor: role === 'farmer' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setRole('farmer')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roleButtonTitle,
                      { color: role === 'farmer' ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t('i_am_farmer')}
                  </Text>
                  <Text
                    style={[
                      styles.roleButtonDesc,
                      { color: role === 'farmer' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {t('farmer_desc')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    {
                      backgroundColor: role === 'buyer' ? colors.primary : colors.surface,
                      borderColor: role === 'buyer' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setRole('buyer')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roleButtonTitle,
                      { color: role === 'buyer' ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t('i_am_buyer')}
                  </Text>
                  <Text
                    style={[
                      styles.roleButtonDesc,
                      { color: role === 'buyer' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {t('buyer_desc')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={t('register')}
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.linkContainer}
            >
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                {t('already_have_account')}{' '}
              </Text>
              <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                {t('login')}
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
    padding: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtons: {
    gap: 12,
  },
  roleButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  roleButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleButtonDesc: {
    fontSize: 13,
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
