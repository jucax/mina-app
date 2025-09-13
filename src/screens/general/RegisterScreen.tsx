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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseAnonKey } from '../../services/supabase';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import { router } from 'expo-router';
import { ownerService, agentService, userAuthService } from '../../services/databaseService';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
// import { useAuthRequest, discovery as googleDiscovery } from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { clearAllFormData } from '../../utils/formDataUtils';

const { width, height } = Dimensions.get('window');

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isOwner, setIsOwner] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  
  // Password requirements state
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Clear any existing form data when component mounts
  useEffect(() => {
    const clearExistingFormData = async () => {
      try {
        console.log('🔄 Clearing existing form data for new user registration...');
        await clearAllFormData();
        console.log('✅ Existing form data cleared successfully');
      } catch (error) {
        console.error('❌ Error clearing existing form data:', error);
      }
    };

    clearExistingFormData();
  }, []);

  // Password requirements validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Google OAuth configuration (commented out for MVP)
  // const redirectUri = makeRedirectUri({ useProxy: true });
  // console.log('Expo Google OAuth redirectUri:', redirectUri);
  // const [request, response, promptAsync] = useAuthRequest({
  //   androidClientId: 'YOUR_ANDROID_CLIENT_ID', // TODO: Replace with your Android client ID
  //   iosClientId: '985617163979-2c62q4hke63pdcpqb5mpmm8svgc8kg2f.apps.googleusercontent.com',         // TODO: Replace with your iOS client ID
  //   webClientId: '985617163979-o5sh4q0qao5q2s12sg6bh2vu3md4o5hf.apps.googleusercontent.com',         // TODO: Replace with your Web client ID
  //   redirectUri,
  //   // Optionally add scopes if needed
  // }, googleDiscovery);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Por favor, concede permiso para acceder a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // const result = await promptAsync(); // This line is commented out
      // if (result.type === 'success' && result.authentication?.idToken) { // This line is commented out
      //   // Sign in with Supabase using the Google id token // This line is commented out
      //   const { data, error } = await supabase.auth.signInWithIdToken({ // This line is commented out
      //     provider: 'google', // This line is commented out
      //     token: result.authentication.idToken, // This line is commented out
      //   }); // This line is commented out
      //   if (error) { // This line is commented out
      //     Alert.alert('Error', error.message); // This line is commented out
      //     return; // This line is commented out
      //   } // This line is commented out
      //   // Redirect user after successful sign in // This line is commented out
      //   const isOwner = data.user?.user_metadata?.is_owner; // This line is commented out
      //   const hasCompletedRegistration = data.user?.user_metadata?.has_completed_registration; // This line is commented out
      //   if (!hasCompletedRegistration) { // This line is commented out
      //     if (isOwner) { // This line is commented out
      //       router.replace('/(owner)/intent' as any); // This line is commented out
      //     } else { // This line is commented out
      //       router.replace('/(agent)/registration' as any); // This line is commented out
      //     } // This line is commented out
      //   } else { // This line is commented out
      //     router.replace(`/(${isOwner ? 'owner' : 'agent'})/home` as any); // This line is commented out
      //   } // This line is commented out
      // } else if (result.type === 'error') { // This line is commented out
      //   Alert.alert('Error', 'Google sign-in failed'); // This line is commented out
      // } // This line is commented out
      // The following lines are commented out as per the edit hint
      Alert.alert('Google Sign-in', 'Google authentication is currently disabled.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Ocurrió un error durante el inicio de sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !repeatPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!privacyAccepted) {
      Alert.alert('Error', 'Por favor, acepta la política de privacidad');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Intentando registrar con:', email);

      // Clear any existing form data before registration
      await clearAllFormData();

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            is_owner: isOwner,
            has_completed_registration: false,
          },
        },
      });

      if (authError) {
        console.error('❌ Error de registro:', authError.message);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      const userId = authData.user.id;
      let avatarUrl: string | undefined = undefined;

      // Upload profile image if selected
      if (profileImage) {
        console.log('📤 Starting profile image upload process...');
        console.log('📁 Profile image URI:', profileImage);
        try {
          const fileExt = profileImage.split('.').pop();
          const fileName = `${userId}.${fileExt}`;
          const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
          const bucket = 'profile-images';
          const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

          // Use the exported anon key
          // Determine content type
          let contentType = 'image/jpeg';
          if (fileExt === 'png') contentType = 'image/png';
          if (fileExt === 'webp') contentType = 'image/webp';

          // Upload the file using FileSystem.uploadAsync
          console.log('🚀 Uploading to Supabase Storage REST endpoint...');
          const uploadRes = await FileSystem.uploadAsync(uploadUrl, profileImage, {
            httpMethod: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': contentType,
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          });

          console.log('📤 uploadAsync response:', uploadRes);

          if (uploadRes.status !== 200 && uploadRes.status !== 201) {
            throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.body}`);
          }

          // Construct the public URL
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
          avatarUrl = publicUrl;
          console.log('✅ Profile image uploaded and public URL:', publicUrl);
        } catch (err) {
          console.error('❌ Profile image upload process failed:', err);
        }
      } else {
        console.log('ℹ️ No profile image selected, skipping upload');
      }

      if (isOwner) {
        // Create owner profile FIRST
        const { error: ownerError } = await ownerService.createOwner({
          full_name: name,
          email,
          phone,
          avatar_url: avatarUrl,
        }, userId);
        if (ownerError) throw ownerError;

        // Now create user_auth record
        const { error: authError2 } = await userAuthService.createUserAuth(userId, 'owner', userId);
        if (authError2) throw authError2;

        Alert.alert(
          'Registro Exitoso',
          'Tu cuenta ha sido creada exitosamente. Te redirigiremos a completar tu registro.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(owner)/intent' as any),
            },
          ]
        );
      } else {
        // Create agent profile FIRST
        const { error: agentError } = await agentService.createAgent({
          full_name: name,
          email,
          phone,
          avatar_url: avatarUrl,
          country: 'México',
          works_at_agency: false,
        }, userId);
        if (agentError) throw agentError;

        // Now create user_auth record
        const { error: authError2 } = await userAuthService.createUserAuth(userId, 'agent', userId);
        if (authError2) throw authError2;

        Alert.alert(
          'Registro Exitoso',
          'Tu cuenta ha sido creada exitosamente. Te redirigiremos a completar tu registro.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(agent)/subscription' as any),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Registro fallido:', error?.message);
      Alert.alert('Error', error?.message || 'Ocurrió un error durante el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[commonStyles.container, styles.container]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {/* Logo */}
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={commonStyles.headerLogo}
            resizeMode="contain"
          />

          {/* Profile Picture */}
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>Agregar foto de perfil</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.labelWithAsterisk}>Nombre completo: *</Text>
              <TextInput
                style={commonStyles.input}
                value={name}
                onChangeText={setName}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor={COLORS.white}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelWithAsterisk}>Número de teléfono: *</Text>
              <TextInput
                style={commonStyles.input}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                selectionColor={COLORS.white}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelWithAsterisk}>Correo electrónico: *</Text>
              <TextInput
                style={commonStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor={COLORS.white}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelWithAsterisk}>Contraseña: *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[commonStyles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  secureTextEntry={!showPassword}
                  selectionColor={COLORS.white}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password Requirements */}
              {passwordFocused && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordRequirements.minLength ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordRequirements.minLength ? COLORS.secondary : COLORS.lightGray}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.minLength ? COLORS.secondary : COLORS.lightGray }
                    ]}>
                      Mínimo 8 caracteres
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordRequirements.hasUppercase ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordRequirements.hasUppercase ? COLORS.secondary : COLORS.lightGray}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasUppercase ? COLORS.secondary : COLORS.lightGray }
                    ]}>
                      Al menos una mayúscula
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordRequirements.hasLowercase ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordRequirements.hasLowercase ? COLORS.secondary : COLORS.lightGray}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasLowercase ? COLORS.secondary : COLORS.lightGray }
                    ]}>
                      Al menos una minúscula
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordRequirements.hasNumber ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordRequirements.hasNumber ? COLORS.secondary : COLORS.lightGray}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasNumber ? COLORS.secondary : COLORS.lightGray }
                    ]}>
                      Al menos un número
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordRequirements.hasSpecialChar ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordRequirements.hasSpecialChar ? COLORS.secondary : COLORS.lightGray}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordRequirements.hasSpecialChar ? COLORS.secondary : COLORS.lightGray }
                    ]}>
                      Al menos un carácter especial
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelWithAsterisk}>Repetir contraseña: *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[commonStyles.input, styles.passwordInput]}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  placeholder=""
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  secureTextEntry={!showRepeatPassword}
                  selectionColor={COLORS.white}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                >
                  <Ionicons
                    name={showRepeatPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, isOwner && styles.userTypeButtonActive]}
                onPress={() => setIsOwner(true)}
              >
                <Text style={[styles.userTypeText, isOwner && styles.userTypeTextActive]}>
                  Propietario
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, !isOwner && styles.userTypeButtonActive]}
                onPress={() => setIsOwner(false)}
              >
                <Text style={[styles.userTypeText, !isOwner && styles.userTypeTextActive]}>
                  Agente
                </Text>
              </TouchableOpacity>
            </View>

            {/* Google Sign In Button (removed for MVP) */}
            {/*
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Image
                source={require('../../../assets/images/logos/google_logo.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                Continuar con Google
              </Text>
            </TouchableOpacity>
            */}

            {/* Privacy Policy */}
            <View style={styles.privacyContainer}>
              <TouchableOpacity
                style={styles.privacyContent}
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
              >
                <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                  {privacyAccepted && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.privacyText}>
                  Acepto Aviso de Privacidad *
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                commonStyles.button,
                commonStyles.primaryButton,
                loading && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={commonStyles.buttonText}>
                {loading ? 'Registrando...' : 'Crear una cuenta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.margin.large,
    alignItems: 'center',
  },
  logoMargin: {
    marginTop: height * 0.08,
  },
  profileImageContainer: {
    marginTop: SIZES.margin.large,
    width: Math.max(width * 0.26, 80), // Responsive with minimum size
    height: Math.max(width * 0.26, 80),
    borderRadius: Math.max(width * 0.13, 40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8, // Add padding for larger text
  },
  profileImageText: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.font, 12), // Responsive font size
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.26)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SIZES.margin.large,
  },
  inputContainer: {
    width: Math.min(width * 0.85, 320), // Responsive width with maximum
    marginBottom: SIZES.margin.medium,
  },
  labelWithAsterisk: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.medium, 14), // Responsive font size
    marginBottom: 8,
    fontWeight: '600',
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50, // Space for eye button
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
  },
  passwordRequirements: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  requirementsTitle: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.font, 12),
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: Math.max(SIZES.font - 2, 10),
    marginLeft: 8,
    flex: 1,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.medium,
    flexWrap: 'wrap', // Allow wrapping for smaller screens
  },
  userTypeButton: {
    paddingHorizontal: Math.max(SIZES.padding.medium, 16),
    paddingVertical: Math.max(SIZES.padding.small, 12),
    borderRadius: 20,
    marginHorizontal: SIZES.margin.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 100, // Ensure minimum button size
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  userTypeText: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.font, 12),
    textAlign: 'center',
  },
  userTypeTextActive: {
    fontWeight: 'bold',
  },
  privacyContainer: {
    width: Math.min(width * 0.85, 320),
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.large,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping for larger text
  },
  checkbox: {
    width: Math.max(20, 18), // Responsive checkbox size
    height: Math.max(20, 18),
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2, // Align with text
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  privacyText: {
    color: COLORS.white,
    fontSize: Math.max(SIZES.font, 12),
    flex: 1, // Allow text to take remaining space
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    width: Math.min(width * 0.8, 300),
    paddingVertical: Math.max(SIZES.padding.medium, 16),
    borderRadius: 24,
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.medium,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: SIZES.margin.small,
  },
  googleButtonText: {
    color: COLORS.black,
    fontSize: Math.max(SIZES.font, 12),
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
});

export default RegisterScreen;
