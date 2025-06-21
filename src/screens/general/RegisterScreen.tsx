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
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import { router } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import { makeRedirectUri } from 'expo-auth-session';
// import * as Google from 'expo-auth-session/providers/google';

const { width, height } = Dimensions.get('window');

// Initialize WebBrowser for OAuth
// WebBrowser.maybeCompleteAuthSession();

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

  // Google OAuth configuration
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   expoClientId: 'YOUR_EXPO_CLIENT_ID',
  //   iosClientId: 'YOUR_IOS_CLIENT_ID',
  //   androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  //   webClientId: 'YOUR_WEB_CLIENT_ID',
  // });

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
    Alert.alert('En desarrollo', 'Esta funcionalidad estará disponible próximamente');
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

      // Register with Supabase
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

      console.log('✅ Registro exitoso!');
      console.log('Datos del usuario:', authData.user);

      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: name,
            phone,
            is_owner: isOwner,
          },
        ]);

      if (profileError) {
        console.error('❌ Error al crear perfil:', profileError.message);
        throw profileError;
      }

      console.log('✅ Perfil creado exitosamente en la tabla profiles');

      // Upload profile image if selected
      if (profileImage) {
        const fileExt = profileImage.split('.').pop();
        const fileName = `${authData.user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        const response = await fetch(profileImage);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
          });

        if (uploadError) {
          console.error('❌ Error al subir la imagen:', uploadError.message);
        } else {
          console.log('✅ Imagen de perfil subida exitosamente');
          
          // Get the public URL
          const { data: { publicUrl } } = await supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

          console.log('🔗 Generated public URL:', publicUrl);
          console.log('📁 File path:', filePath);

          // Test if the URL is accessible
          try {
            const testResponse = await fetch(publicUrl, { method: 'HEAD' });
            console.log('🖼️ URL accessibility test:', testResponse.status, testResponse.ok ? '✅ Accessible' : '❌ Not accessible');
          } catch (fetchError) {
            console.error('❌ Error testing URL accessibility:', fetchError);
          }

          // Update the profile with the image URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('❌ Error al actualizar perfil con imagen:', updateError.message);
          } else {
            console.log('✅ URL de la imagen guardada en el perfil:', publicUrl);
          }
        }
      }

      Alert.alert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada exitosamente. Te redirigiremos a completar tu registro.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate directly to the appropriate registration screen based on user type
              if (isOwner) {
                router.replace('/(owner)/intent' as any);
              } else {
                router.replace('/(agent)/registration' as any);
              }
            },
          },
        ]
      );
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

            {/* Google Sign In Button */}
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

            {/* Privacy Policy */}
            <View style={styles.privacyContainer}>
              <TouchableOpacity
                style={styles.privacyContent}
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
              >
                <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]} />
                <Text style={styles.privacyText}>
                  Acepto la política de privacidad y los términos de servicio
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
                {loading ? 'Registrando...' : 'Crean una cuenta'}
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
});

export default RegisterScreen; 