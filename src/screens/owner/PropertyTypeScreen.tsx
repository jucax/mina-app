import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const propertyTypes = [
  'Casa',
  'Departamento',
  'Terreno',
  'Oficina',
  'Local',
  'Bodega',
  'Edificio',
];

const PropertyTypeScreen = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [otherType, setOtherType] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Que tipo de
        </Text>
        <Text style={styles.subtitle}>
          propiedad es?
        </Text>

        <View style={styles.gridContainer}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                selectedType === type && styles.typeButtonSelected
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextSelected
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.otherButton,
            selectedType === 'Otro' && styles.otherButtonSelected
          ]}
          onPress={() => setSelectedType('Otro')}
        >
          <Text style={[
            styles.otherButtonText,
            selectedType === 'Otro' && styles.otherButtonTextSelected
          ]}>
            Otro
          </Text>
        </TouchableOpacity>

        {selectedType === 'Otro' && (
          <TextInput
            style={styles.otherInput}
            value={otherType}
            onChangeText={setOtherType}
            placeholder="Especifica el tipo de propiedad"
            placeholderTextColor={COLORS.gray}
          />
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled
          ]}
          onPress={() => router.push('/(owner)/property/documentation')}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>

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
    flexGrow: 1,
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
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 40,
    gap: 16,
  },
  typeButton: {
    width: width * 0.4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 8,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.secondary,
  },
  typeButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: COLORS.white,
  },
  otherButton: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  otherButtonSelected: {
    backgroundColor: COLORS.secondary,
  },
  otherButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otherButtonTextSelected: {
    color: COLORS.white,
  },
  otherInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    fontSize: 18,
    color: COLORS.black,
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    marginTop: 40,
    marginBottom: 32,
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
    top: 0,
    left: 0,
    padding: 16,
  },
});

export default PropertyTypeScreen; 