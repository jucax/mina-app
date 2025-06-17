import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AgentSubmissionScreen = () => {
  useEffect(() => {
    // Mark registration as complete
    const markRegistrationComplete = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { has_completed_registration: true }
          });
        }
      } catch (error) {
        console.error('Error marking registration complete:', error);
      }
    };

    markRegistrationComplete();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo_login_screen.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          ¡FELICIDADES!
        </Text>
        <Text style={styles.message}>
          Es hora de crecer tu cartera de propiedades y sacarle el mayor provecho a la nueva era de CANVACEO DIGITAL.
        </Text>

        <Text style={styles.title}>
          ¡RECUERDA!
        </Text>
        <Text style={styles.message}>
          Brindar a nuestros clientes excelencia y una propuesta de valor única, nos ayudara a obtener referidos y así poder conseguir mas ventas.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/(agent)/home')}
      >
        <Ionicons name="home" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  logo: {
    height: 40,
    width: 100,
    marginLeft: 24,
    marginTop: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    ...FONTS.title,
    fontSize: 38,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 60,
  },
  homeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
});

export default AgentSubmissionScreen; 