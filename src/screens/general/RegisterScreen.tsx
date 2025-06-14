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

const { width, height } = Dimensions.get('window');

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
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

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !repeatPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!privacyAccepted) {
      Alert.alert('Error', 'Please accept the privacy policy');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting to register with:', email);

      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            is_owner: isOwner,
          },
        },
      });

      if (error) {
        console.error('❌ Registration error:', error.message);
        throw error;
      }

      console.log('✅ Registration successful!');
      console.log('User data:', data.user);

      // Upload profile image if selected
      if (profileImage) {
        const fileExt = profileImage.split('.').pop();
        const fileName = `${data.user?.id}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert image to blob
        const response = await fetch(profileImage);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
          });

        if (uploadError) {
          console.error('❌ Image upload error:', uploadError.message);
        } else {
          console.log('✅ Profile image uploaded successfully');
        }
      }

      Alert.alert('Success', 'Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('❌ Registration failed:', error?.message);
      Alert.alert('Error', error?.message || 'An error occurred during registration');
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

          {/* Profile Picture */}
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>Add profile photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              selectionColor="#FFFFFF"
            />

            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="phone-pad"
              selectionColor="#FFFFFF"
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#FFFFFF"
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              secureTextEntry
              selectionColor="#FFFFFF"
            />

            <TextInput
              style={styles.input}
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              placeholder="Repeat Password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              secureTextEntry
              selectionColor="#FFFFFF"
            />

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, isOwner && styles.userTypeButtonActive]}
                onPress={() => setIsOwner(true)}
              >
                <Text style={[styles.userTypeText, isOwner && styles.userTypeTextActive]}>
                  Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, !isOwner && styles.userTypeButtonActive]}
                onPress={() => setIsOwner(false)}
              >
                <Text style={[styles.userTypeText, !isOwner && styles.userTypeTextActive]}>
                  Agent
                </Text>
              </TouchableOpacity>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.privacyContainer}
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
            >
              <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]} />
              <Text style={styles.privacyText}>
                I accept the privacy policy and terms of service
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registering...' : 'Register'}
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
    backgroundColor: '#144E7A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.02,
    alignItems: 'center',
  },
  logo: {
    height: height * 0.05,
    marginTop: height * 0.03,
  },
  profileImageContainer: {
    marginTop: height * 0.03,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.26)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  input: {
    width: width * 0.7,
    color: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFFFFF',
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: height * 0.02,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },
  userTypeButton: {
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    marginHorizontal: width * 0.02,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userTypeButtonActive: {
    backgroundColor: '#FFA733',
  },
  userTypeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  userTypeTextActive: {
    fontWeight: 'bold',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#FFA733',
    borderColor: '#FFA733',
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#FFA733',
    width: width * 0.55,
    paddingVertical: height * 0.02,
    borderRadius: 24,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 