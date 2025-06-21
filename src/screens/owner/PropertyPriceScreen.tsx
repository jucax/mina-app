import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width, height } = Dimensions.get('window');

const PropertyPriceScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [price, setPrice] = useState(formData.price);

  const handleContinue = () => {
    if (price) {
      // Save to context
      updateFormData({ price });
      router.push('/(owner)/property/type');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Valor aproximado
        </Text>
        <Text style={styles.subtitle}>
          de tu Propiedad
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Precio aproximado:
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.black}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !price && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!price}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 0,
  },
  title: {
    ...FONTS.title,
    fontSize: 36,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
  },
  subtitle: {
    ...FONTS.title,
    fontSize: 36,
    color: COLORS.white,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  inputLabel: {
    ...FONTS.title,
    fontSize: 26,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  inputPrefix: {
    fontSize: 32,
    color: COLORS.black,
    fontWeight: 'bold',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 32,
    color: COLORS.black,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
});

export default PropertyPriceScreen; 