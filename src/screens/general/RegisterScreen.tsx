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
              onPress: () => router.replace('/(agent)/registration' as any),
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
              <Text style={commonStyles.label}>Nombre completo:</Text>
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
              <Text style={commonStyles.label}>Número de teléfono:</Text>
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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Contraseña:</Text>
              <TextInput
                style={commonStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                selectionColor={COLORS.white}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Repetir contraseña:</Text>
              <TextInput
                style={commonStyles.input}
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                selectionColor={COLORS.white}
              />
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
                  Acepto Aviso de Privacidad
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
    width: width * 0.26,
    height: width * 0.26,
    borderRadius: width * 0.13,
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
  },
  profileImageText: {
    color: COLORS.white,
    fontSize: SIZES.font,
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
    width: width * 0.8,
    marginBottom: SIZES.margin.medium,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.medium,
  },
  userTypeButton: {
    paddingHorizontal: SIZES.padding.medium,
    paddingVertical: SIZES.padding.small,
    borderRadius: 20,
    marginHorizontal: SIZES.margin.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  userTypeText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  userTypeTextActive: {
    fontWeight: 'bold',
  },
  privacyContainer: {
    width: width * 0.8,
    marginTop: SIZES.margin.medium,
    marginBottom: SIZES.margin.large,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  privacyText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    width: width * 0.8,
    paddingVertical: SIZES.padding.medium,
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
    fontSize: SIZES.font,
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