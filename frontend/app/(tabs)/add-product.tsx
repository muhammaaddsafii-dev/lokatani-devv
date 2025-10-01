import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !location || !imageBase64) {
      Alert.alert('Error', 'Please fill all fields and upload an image');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await api.createProduct({
        name,
        description,
        price: priceNum,
        location,
        image_base64: imageBase64,
      });

      Alert.alert('Success', 'Product added successfully', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setDescription('');
            setPrice('');
            setLocation('');
            setImageBase64('');
            router.push('/(tabs)/my-products');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
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
            <Text style={[styles.title, { color: colors.text }]}>{t('add_product')}</Text>
          </View>

          <View style={styles.form}>
            <TouchableOpacity
              style={[
                styles.imageContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {imageBase64 ? (
                <Image source={{ uri: imageBase64 }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                    {t('upload_image')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Input
              label={t('product_name')}
              value={name}
              onChangeText={setName}
              placeholder={t('product_name')}
            />

            <Input
              label={t('description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('description')}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            <Input
              label={t('price')}
              value={price}
              onChangeText={setPrice}
              placeholder="50000"
              keyboardType="numeric"
            />

            <Input
              label={t('location')}
              value={location}
              onChangeText={setLocation}
              placeholder={t('location')}
            />

            <Button
              title={t('save')}
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
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
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
});
