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
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

const PasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, introduce tu correo electrónico');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting to send password reset email to:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'mina-app://reset-password',
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        throw error;
      }

      console.log('✅ Password reset email sent successfully');
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Password reset failed:', error?.message);
      Alert.alert('Error', error?.message || 'Ocurrió un error al enviar el correo de restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Recuperar Contraseña</Text>

          {/* Description */}
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico:"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#FFFFFF"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enviando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#144E7A',
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
    color: '#FFFFFF',
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    marginTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 48,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: width * 0.7,
    marginTop: 32,
    marginBottom: height * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#FFA733',
    width: width * 0.8,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PasswordScreen; 