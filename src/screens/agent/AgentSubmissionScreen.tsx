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
import { AgentService } from '../../services/agentService';
import { useAgentForm } from '../../contexts/AgentFormContext';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AgentSubmissionScreen = () => {
  const { formData, resetFormData, isLoaded } = useAgentForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saveAgent = async () => {
      // Wait for form data to be loaded
      if (!isLoaded) {
        console.log('⏳ Waiting for agent form data to load...');
        return;
      }

      setIsLoading(true);
      try {
        // Debug: Log the form data
        console.log('🔍 Agent form data before saving:', formData);
        console.log('🔍 Form data keys:', Object.keys(formData));
        console.log('🔍 Full name:', formData.full_name);
        console.log('🔍 Email:', formData.email);
        console.log('🔍 Phone:', formData.phone);

        // Validate required fields before saving
        const missingFields = [];
        if (!formData.full_name) missingFields.push('full_name');
        if (!formData.email) missingFields.push('email');
        if (!formData.phone) missingFields.push('phone');
        if (!formData.state) missingFields.push('state');
        if (!formData.municipality) missingFields.push('municipality');
        if (!formData.street) missingFields.push('street');
        if (!formData.postal_code) missingFields.push('postal_code');
        if (!formData.commission_percentage || formData.commission_percentage === 0) missingFields.push('commission_percentage');
        if (!formData.subscription_plan) missingFields.push('subscription_plan');

        if (missingFields.length > 0) {
          console.error('❌ Missing required fields:', missingFields);
          Alert.alert(
            'Campos Requeridos',
            `Faltan los siguientes campos: ${missingFields.join(', ')}. Por favor, completa todos los campos requeridos.`,
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }

        // Mark registration as complete
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { has_completed_registration: true }
          });
        }

        // Save agent to database
        const agent = await AgentService.createAgent(formData);
        
        if (agent) {
          console.log('✅ Agent saved successfully:', agent.id);
          // Reset form data after successful save
          resetFormData();
        } else {
          throw new Error('Failed to save agent');
        }
      } catch (error) {
        console.error('❌ Error saving agent:', error);
        Alert.alert(
          'Error',
          'Hubo un problema al guardar tu perfil. Por favor, intenta de nuevo.',
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

    saveAgent();
  }, [isLoaded]); // Only depend on isLoaded

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

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
              Guardando tu perfil...
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
              Tu perfil ha sido registrado con éxito. Muy pronto tendrás acceso a todas las propiedades disponibles.
            </Text>

            <Text style={styles.title}>
              ¡RECUERDA!
            </Text>
            <Text style={styles.subtitle}>
              Tu perfil será revisado por nuestro equipo y recibirás una notificación cuando sea aprobado. Esto puede tomar de 24 a 48 horas.
            </Text>

            <Text style={styles.title}>
              ¡NO OLVIDES!
            </Text>
            <Text style={styles.subtitle}>
              Una vez aprobado, podrás acceder a todas las propiedades y contactar directamente con los propietarios.
            </Text>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/(agent)/home')}
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

export default AgentSubmissionScreen; 