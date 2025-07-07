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
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width } = Dimensions.get('window');

const propertyTypes = [
  'Casa',
  'Departamento',
  'Terreno',
  'Oficina',
  'Local',
  'Bodega',
  'Edificio',
  'Otro',
];

function chunkArray(array: string[], size: number) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const GRID_COLUMNS = 2;
const GRID_BUTTON_WIDTH = width * 0.38; // More compact, still fits 'Departamento' with some compression

const PropertyTypeScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [selectedType, setSelectedType] = useState<string | null>(formData.property_type);
  const [otherType, setOtherType] = useState(formData.other_type);
  const [showValidation, setShowValidation] = useState(false);

  // Split propertyTypes into rows of 2 for a two-column grid
  const typeRows = chunkArray(propertyTypes, GRID_COLUMNS);

  const validateFields = () => {
    const isValid = selectedType && (selectedType !== 'Otro' || (selectedType === 'Otro' && otherType.trim() !== ''));
    return {
      isValid,
      missingFields: isValid ? [] : ['property_type'],
    };
  };

  const handleContinue = () => {
    const validation = validateFields();
    
    if (!validation.isValid) {
      setShowValidation(true);
      Alert.alert(
        'Campo Requerido',
        'Por favor, selecciona un tipo de propiedad.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Save to context
    updateFormData({
      property_type: selectedType,
      other_type: selectedType === 'Otro' ? otherType : '',
    });
    router.push('/(owner)/property/documentation');
  };

  const getButtonStyle = (type: string) => {
    const validation = validateFields();
    const isMissing = validation.missingFields.includes('property_type');
    
    return [
      styles.typeButton,
      selectedType === type && styles.typeButtonSelected,
      showValidation && isMissing && styles.typeButtonError
    ];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
          propiedad es? *
        </Text>

        <View style={styles.gridContainer}>
          {typeRows.map((row, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {row.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={getButtonStyle(type)}
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
              {row.length < GRID_COLUMNS && <View style={[styles.typeButton, {backgroundColor: 'transparent'}]} />} {/* Empty cell for alignment if odd number */}
            </View>
          ))}
        </View>

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
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginTop: Platform.OS === 'ios' ? 60 : 40,
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
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeButton: {
    width: GRID_BUTTON_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
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
  otherInput: {
    width: GRID_BUTTON_WIDTH * 2 + 16, // full grid width
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    fontSize: 18,
    color: COLORS.black,
    alignSelf: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    marginTop: 40,
    marginBottom: 32,
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
  typeButtonError: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
});

export default PropertyTypeScreen; 