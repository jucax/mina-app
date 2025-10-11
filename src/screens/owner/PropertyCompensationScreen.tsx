import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width } = Dimensions.get('window');

const commissionOptions = [
  {
    value: '4%',
    description:
      'Si bien pagaras menos en comisiones, es posible que la venta tome mas tiempo y no tenga tanta exposición. Te recomendamos analizar que te ofrece el asesor.',
  },
  {
    value: '5%',
    description:
      'Con esta comisión recibirás un servicio de buena calidad con estrategias de marketing adecuadas para vender tu propiedad de manera eficiente.',
  },
  {
    value: '6%',
    description:
      'Recibirás un servicio profesional por asesores de inmobiliarias calificadas, lo que aumentará las posibilidades de vender tu propiedad de manera segura, rápida y al mejor precio.',
  },
];

const PropertyCompensationScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [selectedCommission, setSelectedCommission] = useState<string | null>(formData.commission_percentage);

  // Validation function to check for missing data from previous screens
  const validateFormData = () => {
    const missingFields: string[] = [];

    // Check intent and timeline
    if (!formData.intent) {
      missingFields.push('intención de venta/renta');
    }
    if (!formData.timeline) {
      missingFields.push('tiempo para vender/rentar');
    }

    // Check price
    if (!formData.price || formData.price.trim() === '') {
      missingFields.push('precio de la propiedad');
    }

    // Check property type
    if (!formData.property_type) {
      missingFields.push('tipo de propiedad');
    }

    // Check location details
    if (!formData.state) {
      missingFields.push('estado');
    }
    if (!formData.municipality || formData.municipality.trim() === '') {
      missingFields.push('municipio/alcaldía');
    }
    if (!formData.street || formData.street.trim() === '') {
      missingFields.push('calle');
    }
    if (!formData.postal_code || formData.postal_code.trim() === '') {
      missingFields.push('código postal');
    }

    // Check property characteristics
    if (!formData.land_area || formData.land_area.trim() === '') {
      missingFields.push('superficie de terreno');
    }
    if (!formData.construction_area || formData.construction_area.trim() === '') {
      missingFields.push('superficie de construcción');
    }
    if (!formData.bedrooms || formData.bedrooms.trim() === '') {
      missingFields.push('número de cuartos');
    }
    if (!formData.bathrooms || formData.bathrooms.trim() === '') {
      missingFields.push('número de baños');
    }
    if (!formData.half_bathrooms || formData.half_bathrooms.trim() === '') {
      missingFields.push('número de medios baños');
    }
    if (!formData.amenities || formData.amenities.trim() === '') {
      missingFields.push('amenidades');
    }

    // Check images
    if (!formData.images || formData.images.length < 5) {
      missingFields.push('imágenes (mínimo 5)');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  const handlePublish = () => {
    // First check if commission is selected
    if (!selectedCommission) {
      Alert.alert(
        'Campo Requerido',
        'Por favor, selecciona un porcentaje de comisión.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Then validate all form data
    const validation = validateFormData();
    
    if (!validation.isValid) {
      const missingFieldsText = validation.missingFields
        .map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
        .join('\n');
      Alert.alert(
        'Datos Faltantes',
        `Faltan los siguientes datos de pantallas anteriores:\n\n${missingFieldsText}\n\nPor favor, regresa y completa toda la información requerida.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ir a Completar', 
            onPress: () => {
              // Navigate to the first screen with missing data
              if (!formData.intent || !formData.timeline) {
                router.push('/(owner)/intent');
              } else if (!formData.price) {
                router.push('/(owner)/property/price');
              } else if (!formData.property_type) {
                router.push('/(owner)/property/type');
              } else if (!formData.state || !formData.municipality || !formData.street || !formData.postal_code) {
                router.push('/(owner)/property/details');
              } else {
                router.push('/(owner)/property/details');
              }
            }
          }
        ]
      );
      return;
    }

    // Save to context and proceed
      updateFormData({
        commission_percentage: selectedCommission,
      });
      router.push('/(owner)/submission');
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

        <Text style={styles.topTitle}>Por ultimo!</Text>
        <View style={styles.centeredTitleBlock}>
          <Text style={styles.mainTitleCentered}>Que porcentaje de comisión estas dispuest@ a compartir?</Text>
        </View>

        <View style={styles.cardsContainer}>
          {commissionOptions.map((option, idx) => (
            <View key={option.value} style={styles.cardRow}>
              <View style={styles.percentCardSmall}>
                <Text style={styles.percentCardTextSmall}>{option.value}</Text>
              </View>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.selectLabel}>Selecciona tu respuesta:</Text>
        <View style={styles.percentButtonRow}>
          {commissionOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.typeButton,
                selectedCommission === option.value && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedCommission(option.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedCommission === option.value && styles.typeButtonTextSelected,
                ]}
              >
                {option.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.publishButton,
            !selectedCommission && styles.publishButtonDisabled,
          ]}
          onPress={handlePublish}
          disabled={!selectedCommission}
        >
          <Text style={styles.publishButtonText}>Publicar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(owner)/home' as any)}
        >
          <Text style={styles.skipButtonText}>Agregar propiedad más tarde</Text>
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
    padding: 24,
    alignItems: 'center',
    paddingBottom: 32,
  },
  logo: {
    height: 40,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  topTitle: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 32,
    textAlign: 'left',
    width: '100%',
  },
  centeredTitleBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  mainTitleCentered: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    lineHeight: 28,
  },
  cardsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  percentCardSmall: {
    backgroundColor: '#3EC1E9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentCardTextSmall: {
    ...FONTS.title,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  cardDescription: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  selectLabel: {
    ...FONTS.title,
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  percentButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  typeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  typeButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
    elevation: 6,
    transform: [{ scale: 1.08 }],
  },
  typeButtonText: {
    ...FONTS.title,
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: COLORS.white,
    textShadowColor: 'transparent',
  },
  publishButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 18,
    width: width * 0.7,
    alignSelf: 'center',
    marginTop: 16,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    ...FONTS.title,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 12,
    alignItems: 'center',
    width: width * 0.7,
    alignSelf: 'center',
  },
  skipButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 16,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});

export default PropertyCompensationScreen; 