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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handlePasswordReset = async () => {
    console.log('🔐 [PasswordScreen] Start identity capture', { hasName: Boolean(name), hasEmail: Boolean(email), hasPhone: Boolean(phone) });
    if (!name) {
      Alert.alert('Error', 'Por favor, introduce tu nombre completo');
      console.log('🔐 [PasswordScreen] Missing name');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Por favor, introduce tu correo electrónico');
      console.log('🔐 [PasswordScreen] Missing email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico válido');
      console.log('🔐 [PasswordScreen] Invalid email format');
      return;
    }
    if (!phone) {
      Alert.alert('Error', 'Por favor, introduce tu número de teléfono');
      console.log('🔐 [PasswordScreen] Missing phone');
      return;
    }
    console.log('🔐 [PasswordScreen] Identity captured OK, verifying account...', { email, name, phoneMasked: String(phone).slice(-4).padStart(String(phone).length, '*') });
    setVerifying(true);
    try {
      // Verify account exists with these details before proceeding
      const response = await fetch('https://mina-app-ten.vercel.app/api/password-recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone }),
      });
      const result = await response.json();
      if (response.ok && result.found) {
        Alert.alert(
          'Cuenta Encontrada',
          'Tu identidad ha sido verificada exitosamente. Ahora puedes establecer una nueva contraseña.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                router.push({
                  pathname: '/(general)/new-password',
                  params: { email, name, phone },
                } as any);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Datos No Coinciden',
          'Los datos proporcionados no coinciden con ninguna cuenta registrada. Verifica tu información e intenta de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('🔐 [PasswordScreen] Verification error:', error);
      Alert.alert(
        'Error de Verificación',
        'No se pudo verificar tu cuenta en este momento. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setVerifying(false);
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
            Ingresa tu nombre, correo y teléfono para verificar tu identidad y establecer una nueva contraseña.
          </Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Nombre completo:</Text>
            <TextInput
                style={commonStyles.input}
              value={name}
              onChangeText={setName}
                placeholder=""
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoCapitalize="words"
                selectionColor={COLORS.white}
                autoCorrect={false}
                spellCheck={false}
            />
          </View>

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

          {/* Phone Input */}
          <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Teléfono:</Text>
            <TextInput
                style={commonStyles.input}
              value={phone}
              onChangeText={setPhone}
                placeholder=""
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="phone-pad"
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
            disabled={verifying}
          >
              <Text style={commonStyles.buttonText}>
                {verifying ? 'Verificando...' : 'Continuar'}
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