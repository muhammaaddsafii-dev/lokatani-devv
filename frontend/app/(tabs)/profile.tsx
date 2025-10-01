import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../src/i18n';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    changeLanguage(newLang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('user_info')}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('name')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.name}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="at-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('username')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.username}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('phone')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.phone}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name={user?.role === 'farmer' ? 'leaf-outline' : 'cart-outline'}
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('role')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {t(user?.role || '')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings')}
          </Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('language')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: colors.primary }]}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <Text style={styles.languageButtonText}>
                {i18n.language === 'id' ? 'ID' : 'EN'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('theme')}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                {theme === 'light' ? t('light_mode') : t('dark_mode')}
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={theme === 'dark' ? colors.primary : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title={t('logout')}
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
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
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeLabel: {
    fontSize: 14,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  logoutButton: {
    width: '100%',
  },
});
