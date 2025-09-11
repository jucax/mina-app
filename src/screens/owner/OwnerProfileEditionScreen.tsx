import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

interface OwnerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

const OwnerProfileEditionScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [profileData, setProfileData] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (id) {
          const { data, error } = await supabase
            .from('owners')
            .select('id, full_name, email, phone, avatar_url')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Error fetching profile data:', error);
            Alert.alert(
              'Error',
              'No se pudo cargar la información del perfil.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
          }

          setProfileData(data);
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del perfil.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleSave = async () => {
    if (!profileData?.id) return;

    // Basic validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'El teléfono es requerido.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      const { error } = await supabase
        .from('owners')
        .update(updates)
        .eq('id', profileData.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert(
          'Error',
          'No se pudo actualizar el perfil. Por favor, intenta de nuevo.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Éxito',
        'El perfil ha sido actualizado correctamente.',
        [{ 
          text: 'OK', 
          onPress: () => {
            router.back();
          }
        }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el perfil. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Perfil no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Editar Perfil
        </Text>

        <Text style={styles.sectionTitle}>
          Información Personal
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre completo:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Correo electrónico:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ingresa tu número de teléfono"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 32,
    width: width * 0.8,
    alignSelf: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
});

export default OwnerProfileEditionScreen;
