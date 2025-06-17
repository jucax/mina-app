import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PropertyPriceScreen = () => {
  const [price, setPrice] = useState('');

  return (
    <View style={styles.container}>
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
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="$ "
            placeholderTextColor={COLORS.black}
          />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(owner)/property/type')}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
    marginTop: 32,
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    fontSize: 32,
    color: COLORS.black,
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    position: 'absolute',
    bottom: 32,
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
    top: 0,
    left: 0,
    padding: 16,
  },
});

export default PropertyPriceScreen; 