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
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
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

      // DEBUG: Check subscription status
      try {
        const { data: userAuth, error: userAuthError } = await supabase
          .from('user_auth')
          .select('agent_id, user_type')
          .eq('id', data.user.id)
          .single();
        
        console.log('🔍 DEBUG: User auth:', userAuth);
        
        if (userAuth?.agent_id) {
          const { data: agentData, error: agentError } = await supabase
            .from('agents')
            .select('current_plan_id, subscription_status, subscription_expires_at')
            .eq('id', userAuth.agent_id)
            .single();
          
          console.log('🔍 DEBUG: Agent data:', agentData);
          console.log('🔍 DEBUG: current_plan_id:', agentData?.current_plan_id);
          console.log('🔍 DEBUG: subscription_status:', agentData?.subscription_status);
          console.log('🔍 DEBUG: subscription_expires_at:', agentData?.subscription_expires_at);
        }
      } catch (debugError) {
        console.error('🔍 DEBUG: Error:', debugError);
      }

      // Check if user has completed registration
      const isOwner = data.user?.user_metadata?.is_owner;
      const hasCompletedRegistration = data.user?.user_metadata?.has_completed_registration;

      if (!hasCompletedRegistration) {
        // Redirect to the appropriate registration screen based on user type
        if (isOwner) {
          router.replace('/(owner)/intent' as any);
        } else {
          // For agents, check subscription status and profile completion
          try {
            const { data: userAuth, error: userAuthError } = await supabase
              .from('user_auth')
              .select('agent_id')
              .eq('id', data.user.id)
              .single();

            if (userAuth?.agent_id) {
              const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select('current_plan_id, subscription_status, description, experience_years, commission_percentage')
                .eq('id', userAuth.agent_id)
                .single();

              // Check if agent has completed profile (has essential fields filled)
              const hasCompletedProfile = agentData?.description && 
                                        agentData?.experience_years && 
                                        agentData?.commission_percentage;

              if (agentData?.current_plan_id && agentData?.subscription_status === 'active') {
                if (hasCompletedProfile) {
                  console.log('✅ Agent has active subscription and completed profile, redirecting to home');
                  router.replace('/(agent)/home' as any);
                  return;
                } else {
                  console.log('✅ Agent has active subscription but incomplete profile, redirecting to registration');
                  router.replace('/(agent)/registration' as any);
                  return;
                }
              } else {
                console.log('❌ Agent has no active subscription, redirecting to subscription');
                router.replace('/(agent)/subscription' as any);
                return;
              }
            }
          } catch (error) {
            console.error('❌ Error checking agent status:', error);
          }
          
          // If no agent data or error, send to subscription
          router.replace('/(agent)/subscription' as any);
        }
      } else {
        // User has completed registration, go to home screen
        // The SubscriptionContext will handle subscription checks for agents
        router.replace(`/(${isOwner ? 'owner' : 'agent'})/home` as any);
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error?.message);
      Alert.alert('Error', error?.message || 'Ocurrió un error durante el inicio de sesión');
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
            style={commonStyles.loginLogo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={[FONTS.title, styles.title]}>INICIO DE SESION</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Usuario:</Text>
              <TextInput
                style={commonStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor={COLORS.white}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
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

            {/* Login Button */}
            <TouchableOpacity
              style={[
                commonStyles.button,
                commonStyles.primaryButton,
                loading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={commonStyles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Browse as Guest Button */}
            <TouchableOpacity
              style={[commonStyles.button, styles.guestButton]}
              onPress={() => router.push('/(guest)/properties' as any)}
            >
              <Text style={styles.guestButtonText}>
                Explorar Propiedades
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/(general)/password')}
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
                style={[commonStyles.button, styles.createAccountButton]}
                onPress={() => router.push('/(general)/register')}
              >
                <Text style={commonStyles.buttonText}>Crear una cuenta</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.8,
  },
  logo: {
    height: height * 0.1,
    marginBottom: SIZES.margin.large,
  },
  title: {
    color: COLORS.white,
    marginBottom: SIZES.margin.large,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: width * 0.8,
    marginBottom: SIZES.margin.medium,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
    marginTop: SIZES.margin.medium,
  },
  guestButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: SIZES.margin.medium,
  },
  forgotPasswordText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    textDecorationLine: 'underline',
  },
  footerContainer: {
    width: '100%',
    height: height * 0.15,
    marginTop: SIZES.margin.large,
    position: 'relative',
  },
  footerImage: {
    width: '100%',
    height: '100%',
  },
  createAccountButton: {
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    bottom: SIZES.margin.medium,
    alignSelf: 'center',
  },
});

export default LoginScreen;