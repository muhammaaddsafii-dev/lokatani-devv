import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import id from './locales/id.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  if (!savedLanguage) {
    // Use device language if available
    const deviceLanguage = Localization.locale.split('-')[0];
    savedLanguage = ['id', 'en'].includes(deviceLanguage) ? deviceLanguage : 'id';
  }

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        id: { translation: id },
      },
      lng: savedLanguage,
      fallbackLng: 'id',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

initI18n();

export default i18n;
