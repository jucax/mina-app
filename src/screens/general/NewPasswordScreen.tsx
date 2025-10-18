import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PasswordRecoveryService } from '../../services/apiService';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import { safeGoBack } from '../../utils/navigation';

const { width, height } = Dimensions.get('window');

const NewPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  // Parse token from URL fragment or params
  useEffect(() => {
    // Expo Router puts query params in params, but Supabase sends the token as a fragment (#access_token=...)
    // Try to get it from params or from window.location.hash (web) or Linking.getInitialURL (native)
    let foundToken = null;
    if (params?.access_token) {
      foundToken = params.access_token as string;
    } else if (typeof window !== 'undefined' && window.location.hash) {
      // For web, parse from hash
      const match = window.location.hash.match(/access_token=([^&]+)/);
      if (match) foundToken = match[1];
    }
    setToken(foundToken);
    // Read identity verification inputs if present (from PasswordScreen)
    setEmail((params?.email as string) || null);
    setName((params?.name as string) || null);
    setPhone((params?.phone as string) || null);
    console.log('🔐 [NewPasswordScreen] Init', { hasToken: Boolean(foundToken), email: params?.email, hasName: Boolean(params?.name), hasPhone: Boolean(params?.phone) });
    setTokenChecked(true);
  }, [params]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, introduce y confirma tu nueva contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    // Two paths: with a Supabase reset token, or via admin verified identity
    const hasToken = Boolean(token);
    const hasIdentity = Boolean(email && name && phone);
    console.log('🔐 [NewPasswordScreen] Submit attempt', { hasToken, hasIdentity, email, name, phoneMasked: phone ? String(phone).slice(-4).padStart(String(phone).length, '*') : null });
    if (!hasToken && !hasIdentity) {
      Alert.alert('Error', 'No se pudo verificar la solicitud. Regresa e intenta de nuevo.');
      console.log('🔐 [NewPasswordScreen] Neither token nor identity present');
      return;
    }
    setLoading(true);
    try {
      if (hasToken) {
        // Standard Supabase flow
        console.log('🔐 [NewPasswordScreen] Using Supabase token flow');
        const { error } = await supabase.auth.setSession({
          access_token: token as string,
          refresh_token: token as string,
        });
        if (error) throw error;
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      } else if (hasIdentity) {
        // Admin flow via backend with name/email/phone verification
        console.log('🔐 [NewPasswordScreen] Using admin verification flow');
        await PasswordRecoveryService.resetPasswordWithVerification(
          email as string,
          name as string,
          phone as string,
          password
        );
      }
       Alert.alert(
         'Contraseña Actualizada',
         '¡Excelente! Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
         [
           {
             text: 'Iniciar Sesión',
             onPress: () => router.replace('/(general)/login'),
           },
         ]
       );
    } catch (error: any) {
      console.log('🔐 [NewPasswordScreen] Error updating password', error?.message);
      Alert.alert(
        'Error al Actualizar Contraseña',
        error?.message || 'No se pudo restablecer tu contraseña. Verifica tu información e intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🔐 [NewPasswordScreen] Submit finished');
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(general)/login')}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Image
              source={require('../../../assets/images/logo_login_screen.png')}
              style={commonStyles.headerLogo}
              resizeMode="contain"
            />

            <Text style={[FONTS.title, styles.title]}>Nueva Contraseña</Text>
            <Text style={styles.description}>
              Ingresa tu nueva contraseña dos veces para confirmar el cambio.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Nueva contraseña:</Text>
              <TextInput
                style={commonStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                autoCapitalize="none"
                selectionColor={COLORS.white}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Confirmar contraseña:</Text>
              <TextInput
                style={commonStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                autoCapitalize="none"
                selectionColor={COLORS.white}
              />
            </View>

            <TouchableOpacity
              style={[commonStyles.button, commonStyles.primaryButton, loading && styles.continueButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={commonStyles.buttonText}>
                {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </Text>
            </TouchableOpacity>
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
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.medium,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: SIZES.large,
    marginTop: SIZES.margin.medium,
  },
});

export default NewPasswordScreen; 