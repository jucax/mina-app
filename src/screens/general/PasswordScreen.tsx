import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Auth } from '../../services/Auth';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import { safeGoBack } from '../../utils/navigation';

const { width, height } = Dimensions.get('window');

const PasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, introduce tu correo electrónico');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico válido');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting to send password reset email to:', email);

      const { error, userExists } = await Auth.resetPassword(email);

      if (error) {
        console.error('❌ Password reset error:', error.message);
        
        if (!userExists) {
          Alert.alert(
            'Correo No Encontrado',
            'No se encontró una cuenta registrada con este correo electrónico. Por favor, verifica el correo o regístrate si aún no tienes una cuenta.',
            [{ text: 'OK' }]
          );
        } else {
          // Handle other errors
          if (error.message.includes('Too many requests')) {
            Alert.alert(
              'Demasiados Intentos',
              'Has realizado demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.'
            );
          } else {
            Alert.alert(
              'Error',
              'Ocurrió un error al enviar el correo de restablecimiento. Por favor, verifica tu conexión a internet e intenta de nuevo.'
            );
          }
        }
        return;
      }

      console.log('✅ Password reset email sent successfully');
      Alert.alert(
        'Correo Enviado',
        'Se han enviado las instrucciones para restablecer tu contraseña a tu correo electrónico. Por favor, revisa tu bandeja de entrada.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Password reset failed:', error?.message);
      Alert.alert(
        'Error',
        'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[commonStyles.container, styles.container]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
            onPress={() => safeGoBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
              style={commonStyles.headerLogo}
            resizeMode="contain"
          />

          {/* Title */}
            <Text style={[FONTS.title, styles.title]}>Recuperar Contraseña</Text>

          {/* Description */}
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Correo electrónico:</Text>
            <TextInput
                style={commonStyles.input}
              value={email}
              onChangeText={setEmail}
                placeholder=""
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
                selectionColor={COLORS.white}
                autoCorrect={false}
                spellCheck={false}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
              style={[commonStyles.button, commonStyles.primaryButton, loading && styles.continueButtonDisabled]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
              <Text style={commonStyles.buttonText}>
                {loading ? 'Enviando...' : 'Enviar Instrucciones'}
              </Text>
            </TouchableOpacity>

            {/* Additional Info */}
            <Text style={styles.additionalInfo}>
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo envío.
            </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.margin.large,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    marginTop: SIZES.margin.large,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: SIZES.font,
    textAlign: 'center',
    marginTop: SIZES.margin.medium,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: width * 0.8,
    marginTop: SIZES.margin.large,
    marginBottom: SIZES.margin.large,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  additionalInfo: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: SIZES.font,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginTop: SIZES.margin.medium,
  },
});

export default PasswordScreen; 