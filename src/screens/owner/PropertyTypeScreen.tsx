import React, { useState, useEffect } from 'react';
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

// Organized property types by category
const propertyCategories = {
  residential: {
    title: 'Residencial',
    icon: '🏠',
    types: ['Casa', 'Departamento', 'Edificio'],
    layout: 'multi-row' // Special layout for residential
  },
  commercial: {
    title: 'Comercial',
    icon: '🏢',
    types: ['Local', 'Oficina', 'Bodega'],
    layout: 'single-row'
  },
  landAndOther: {
    title: 'Otros',
    icon: '🌱',
    types: ['Terreno', 'Otro'],
    layout: 'single-row'
  }
};

const PropertyTypeScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [selectedType, setSelectedType] = useState<string | null>(formData.property_type);
  const [otherType, setOtherType] = useState(formData.other_type);
  const [showValidation, setShowValidation] = useState(false);

  // Update local state when formData changes (for data persistence)
  useEffect(() => {
    setSelectedType(formData.property_type);
    setOtherType(formData.other_type);
  }, [formData]);

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

  const renderCategory = (categoryKey: string, category: {
    title: string;
    icon: string;
    types: string[];
    layout: string;
  }) => {
    const isMultiRow = category.layout === 'multi-row';
    
    return (
      <View key={categoryKey} style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <View style={[styles.categoryTypes, isMultiRow && styles.categoryTypesMultiRow]}>
          {isMultiRow ? (
            // Special layout for residential: first row with 2 items, second row with 1
            <>
              <View style={styles.firstRow}>
                <TouchableOpacity
                  style={getButtonStyle(category.types[0])} // Casa
                  onPress={() => setSelectedType(category.types[0])}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === category.types[0] && styles.typeButtonTextSelected
                  ]}>
                    {category.types[0]}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={getButtonStyle(category.types[2])} // Edificio
                  onPress={() => setSelectedType(category.types[2])}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === category.types[2] && styles.typeButtonTextSelected
                  ]}>
                    {category.types[2]}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.secondRow}>
                <TouchableOpacity
                  style={getButtonStyle(category.types[1])} // Departamento
                  onPress={() => setSelectedType(category.types[1])}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === category.types[1] && styles.typeButtonTextSelected
                  ]}>
                    {category.types[1]}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Regular single-row layout for other categories
            category.types.map((type) => (
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
            ))
          )}
        </View>
      </View>
    );
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
          ¿Qué tipo de
        </Text>
        <Text style={styles.subtitle}>
          propiedad es? *
        </Text>

        <View style={styles.categoriesContainer}>
          {Object.entries(propertyCategories).map(([key, category]) => 
            renderCategory(key, category)
          )}
        </View>

        {selectedType === 'Otro' && (
          <View style={styles.otherInputContainer}>
            <Text style={styles.otherInputLabel}>Especifica el tipo:</Text>
            <TextInput
              style={styles.otherInput}
              value={otherType}
              onChangeText={setOtherType}
              placeholder="Ej: Rancho, Finca, etc."
              placeholderTextColor={COLORS.gray}
            />
          </View>
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
  categoriesContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  categoryContainer: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  categoryTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  categoryTypesMultiRow: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 20,
    gap: 12, // Use the same gap as other categories
  },
  secondRow: {
    width: '100%',
    alignItems: 'center',
  },
  typeButton: {
    minWidth: width * 0.25,
    maxWidth: width * 0.4, // Add max width for better proportions
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
  },
  typeButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: COLORS.white,
  },
  otherInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  otherInputLabel: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: 8,
  },
  otherInput: {
    width: width * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
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