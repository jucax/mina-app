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
  const { formData, resetFormData } = usePropertyForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saveProperty = async () => {
      setIsLoading(true);
      try {
        // Mark registration as complete
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { has_completed_registration: true }
          });
        }

        // Save property to database
        const property = await PropertyService.createProperty(formData);
        
        if (property) {
          console.log('✅ Property saved successfully:', property.id);
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
  }, [formData, resetFormData]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {isLoading ? (
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
  content: {
    padding: width * 0.06,
  },
  logo: {
    height: height * 0.05,
    marginTop: height * 0.02,
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
});

export default OwnerSubmissionScreen; 