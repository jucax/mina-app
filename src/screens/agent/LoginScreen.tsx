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
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        throw error;
      }
      
      console.log('✅ Login successful!');
      console.log('User data:', data.user);
      console.log('Session:', data.session);
    } catch (error: any) {
      console.error('❌ Login failed:', error?.message);
      Alert.alert('Error', error?.message || 'An error occurred during login');
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
        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>INICIO DE SESION</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Usuario:</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor="#FFFFFF"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña:</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                selectionColor="#FFFFFF"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Footer with Houses Image and Create Account Button */}
            <View style={styles.footerContainer}>
              <Image
                source={require('../../../assets/images/footer_houses.png')}
                style={styles.footerImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.createAccountButton}
              >
                <Text style={styles.buttonText}>Crear una cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
  },
  logo: {
    height: height * 0.08,
    marginTop: height * 0.06,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: height * 0.035,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.04,
  },
  inputContainer: {
    width: width * 0.8,
    marginBottom: height * 0.035,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    color: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFFFFF',
    paddingVertical: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#F97316',
    width: width * 0.55,
    paddingVertical: height * 0.02,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: height * 0.035,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: height * 0.02,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  footerContainer: {
    width: '100%',
    height: height * 0.15,
    marginTop: height * 0.03,
    position: 'relative',
  },
  footerImage: {
    width: '100%',
    height: '100%',
  },
  createAccountButton: {
    backgroundColor: '#F97316',
    width: width * 0.55,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.03,
    alignSelf: 'center',
  },
});

export default LoginScreen;