import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabaseAnonKey } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface AgentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  country: string;
  state: string;
  municipality: string;
  neighborhood: string;
  street: string;
  postal_code: string;
  experience_years: string;
  properties_sold: string;
  commission_percentage: number;
  works_at_agency: boolean;
  agency_name?: string;
  description: string;
  created_at: string;
}

const AgentProfileScreen = () => {
  const params = useLocalSearchParams();
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if we're viewing another agent's profile
  useEffect(() => {
    if (params.agentId && params.agentId !== 'current') {
      setIsViewingOtherProfile(true);
    }
  }, [params.agentId]);

  const loadAgentProfile = async () => {
    try {
      setLoading(true);
      
      if (isViewingOtherProfile && params.agentId) {
        // Load another agent's profile
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', params.agentId)
          .single();

        if (error) {
          console.error('Error loading agent profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil del agente');
          return;
        }

        setAgentProfile(data);
      } else {
        // Load current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'No hay usuario autenticado');
          return;
        }

        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading agent profile:', error);
          Alert.alert('Error', 'No se pudo cargar tu perfil');
          return;
        }

        setAgentProfile(data);
      }
    } catch (error) {
      console.error('Error loading agent profile:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAgentProfile();
    }, [isViewingOtherProfile, params.agentId])
  );

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
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'No hay usuario autenticado');
        return;
      }

      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
      const bucket = 'profile-images';
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

      // Determine content type
      let contentType = 'image/jpeg';
      if (fileExt === 'png') contentType = 'image/png';
      if (fileExt === 'webp') contentType = 'image/webp';

      // Delete existing image first
      try {
        await supabase.storage.from(bucket).remove([fileName]);
        console.log('✅ Existing image deleted');
      } catch (deleteError) {
        console.log('ℹ️ No existing image to delete or error deleting:', deleteError);
      }

      // Upload new image
      const uploadRes = await FileSystem.uploadAsync(uploadUrl, imageUri, {
        httpMethod: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': contentType,
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (uploadRes.status !== 200 && uploadRes.status !== 201) {
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.body}`);
      }

      // Update agent profile with new image URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
      
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setAgentProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen de perfil');
    }
  };

  const handleEditProfile = () => {
    router.push('/(agent)/agent-registration' as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    try {
      // Clear all form data before logout
      console.log('🔄 Clearing form data before logout...');
      await AsyncStorage.multiRemove([
        'agentFormData',
        'propertyFormData',
        'propertyFormProgress'
      ]);
      console.log('✅ Form data cleared successfully');

      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login screen
      router.replace('/(general)/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Ocurrió un error al cerrar sesión');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {agentProfile ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isViewingOtherProfile ? 'Perfil del Agente' : 'Mi Perfil'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={isViewingOtherProfile ? undefined : pickImage}
              disabled={isViewingOtherProfile}
            >
              {agentProfile.avatar_url ? (
                <Image source={{ uri: agentProfile.avatar_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.white} />
                </View>
              )}
              {!isViewingOtherProfile && (
                <View style={styles.editImageButton}>
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{agentProfile.full_name}</Text>
              <Text style={styles.profileTitle}>Agente Inmobiliario</Text>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{agentProfile.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{agentProfile.phone}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Ubicación:</Text>
                <Text style={styles.infoValue}>
                  {agentProfile.street}, {agentProfile.neighborhood}, {agentProfile.municipality}, {agentProfile.state}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Profesional</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="briefcase" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Experiencia:</Text>
                <Text style={styles.infoValue}>{agentProfile.experience_years} años</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="home" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Propiedades vendidas:</Text>
                <Text style={styles.infoValue}>{agentProfile.properties_sold}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="percent" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Comisión:</Text>
                <Text style={styles.infoValue}>{agentProfile.commission_percentage}%</Text>
              </View>
              
              {agentProfile.works_at_agency && agentProfile.agency_name && (
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Agencia:</Text>
                  <Text style={styles.infoValue}>{agentProfile.agency_name}</Text>
                </View>
              )}
            </View>

            {agentProfile.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.description}>{agentProfile.description}</Text>
              </View>
            )}

            {/* Edit Button */}
            {!isViewingOtherProfile && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Ionicons name="create" size={24} color={COLORS.white} />
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            )}
            {/* Log Out Button */}
            {!isViewingOtherProfile && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.secondary, marginTop: 8 }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color={COLORS.secondary} />
                <Text style={[styles.editButtonText, { color: COLORS.secondary }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.large,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SIZES.padding.medium,
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.large,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin.medium,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SIZES.margin.small,
  },
  profileTitle: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    opacity: 0.8,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: SIZES.padding.large,
    paddingTop: SIZES.padding.large,
    paddingBottom: SIZES.padding.extraLarge,
    minHeight: height * 0.6,
  },
  section: {
    marginBottom: SIZES.margin.large,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.margin.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.medium,
    paddingVertical: SIZES.padding.small,
  },
  infoLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: SIZES.margin.small,
    marginRight: SIZES.margin.small,
    minWidth: 100,
  },
  infoValue: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    flex: 1,
  },
  description: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    lineHeight: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderRadius: 25,
    marginTop: SIZES.margin.large,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    marginLeft: SIZES.margin.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
  },
});

export default AgentProfileScreen;
