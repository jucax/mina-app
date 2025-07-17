import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { PropertyService } from '../../services/propertyService';
import { usePropertyForm } from '../../contexts/PropertyFormContext';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OwnerSubmissionScreen = () => {
  const { formData, resetFormData, isLoaded } = usePropertyForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saveProperty = async () => {
      // Wait for form data to be loaded
      if (!isLoaded) {
        console.log('⏳ Waiting for form data to load...');
        return;
      }

      setIsLoading(true);
      try {
        // Debug: Log the form data
        console.log('🔍 Form data before saving:', formData);
        console.log('🔍 Intent value:', formData.intent);
        console.log('🔍 Timeline value:', formData.timeline);
        console.log('🔍 Price value:', formData.price);
        console.log('🔍 Property type value:', formData.property_type);
        console.log('🔍 State value:', formData.state);
        console.log('🔍 Commission value:', formData.commission_percentage);

        // Mark registration as complete
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { has_completed_registration: true }
          });
        }

        // Save property to database
        const property = await PropertyService.createProperty(formData);
        
        if (property && property.id) {
          console.log('✅ Property saved successfully:', property.id);
          
          // Publish the property (change status from draft to active)
          try {
            const publishedProperty = await PropertyService.publishProperty(property.id);
            if (publishedProperty) {
              console.log('✅ Property published successfully:', publishedProperty.id);
            } else {
              console.log('⚠️ Property saved but could not be published');
            }
          } catch (publishError) {
            console.error('❌ Error publishing property:', publishError);
            // Don't fail the whole process if publishing fails
          }
          
          // Reset form data after successful save
          resetFormData();
        } else {
          throw new Error('Failed to save property');
        }
      } catch (error) {
        console.error('❌ Error saving property:', error);
        Alert.alert(
          'Error',
          'Hubo un problema al guardar tu propiedad. Por favor, intenta de nuevo.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    saveProperty();
  }, [isLoaded]); // Only depend on isLoaded

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.centeredContent}>
        {!isLoaded ? (
          <>
            <Text style={styles.title}>
              Cargando datos...
            </Text>
            <Text style={styles.subtitle}>
              Por favor espera mientras cargamos tu información.
            </Text>
          </>
        ) : isLoading ? (
          <>
            <Text style={styles.title}>
              Guardando tu propiedad...
            </Text>
            <Text style={styles.subtitle}>
              Por favor espera mientras procesamos tu información.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.successContainer}>
            <Text style={styles.title}>
              ¡FELICIDADES!
            </Text>
            <Text style={styles.subtitle}>
              Tu propiedad ha sido publicada con éxito y muy pronto asesores inmobiliarios estarán interesados en vender tu propiedad.
            </Text>
            

            <Text style={styles.title}>
              ¡RECUERDA!
            </Text>
            <Text style={styles.subtitle}>
              Tú eliges con quién apoyarte para vender/rentar, te recomendamos escuchar por lo menos 3 propuestas de lo que tienen para ofrecerte. Tu # telefónico solo lo verán asesores interesados en promover tu propiedad. ¡Ellos te llamarán!
            </Text>

            <Text style={styles.title}>
              ¡NO OLVIDES!
            </Text>
            <Text style={styles.subtitle}>
              Marca tu propiedad dentro de la aplicación una vez que decidan con quién colaborar. Así evitarás que se sigan poniendo en contacto contigo.
            </Text>

            <Image
              source={require('../../../assets/images/logo_login_screen.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.comenzarButton}
              onPress={() => router.push('/(owner)/home')}
            >
              <Text style={styles.comenzarButtonText}>
                Comenzar
              </Text>
            </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/(owner)/home')}
        disabled={isLoading}
      >
        <Ionicons name="home" size={width * 0.08} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.06,
  },
  logo: {
    height: height * 0.08,
    width: width * 0.4,
    marginTop: height * 0.03,
    marginBottom: height * 0.03,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  homeButton: {
    position: 'absolute',
    top: 40,
    right: 0,
    padding: 16,
  },
  comenzarButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    marginTop: 32,
    marginBottom: 32,
    alignSelf: 'center',
  },
  comenzarButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
    width: '100%',
  },
});

export default OwnerSubmissionScreen; 