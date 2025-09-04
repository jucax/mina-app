import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase, supabaseAnonKey } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../styles/globalStyles';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

interface OwnerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at?: string;
}

const OwnerProfileScreen = () => {
  const params = useLocalSearchParams();
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // Check if we're viewing another owner's profile (from params) or current user's profile
  const isViewingOtherProfile = params.agentImage && params.agentName;

  const fetchProfile = async () => {
    try {
      if (isViewingOtherProfile) {
        // Use the profile data from params (for viewing other owners)
        console.log('👥 Viewing other owner profile from params');
        setOwnerProfile({
          id: '',
          full_name: params.agentName as string,
          email: '',
          phone: params.contact as string,
          avatar_url: params.agentImage as string,
        });
      } else {
        // Fetch current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔍 Current user (Owner Profile):', user?.id);
        
        if (user) {
          // First check if user is an owner
          const { data: userAuth, error: userAuthError } = await supabase
            .from('user_auth')
            .select('user_type, owner_id')
            .eq('id', user.id)
            .single();

          if (userAuthError) {
            console.error('❌ Error fetching user auth (Owner Profile):', userAuthError);
            return;
          }

          console.log('🔍 User auth data (Owner Profile):', userAuth);

          if (userAuth?.user_type === 'owner' && userAuth?.owner_id) {
            // Fetch owner profile
            const { data: ownerProfile, error } = await supabase
              .from('owners')
              .select('id, full_name, email, phone, avatar_url, created_at')
              .eq('id', userAuth.owner_id)
              .single();

            if (error) {
              console.error('❌ Error fetching owner profile (Owner Profile):', error);
            } else {
              console.log('✅ Owner profile fetched successfully (Owner Profile):', ownerProfile);
              setOwnerProfile(ownerProfile);
            }
          } else {
            console.log('⚠️ User is not an owner or owner_id not found (Owner Profile)');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile (Owner Profile):', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isViewingOtherProfile]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Por favor, concede permiso para acceder a tus fotos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!ownerProfile?.id || isViewingOtherProfile) return;

    try {
      setImageUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      console.log('📤 Starting profile image upload process...');
      console.log('📁 Profile image URI:', imageUri);

      // Use the SAME logic as RegisterScreen - FileSystem.uploadAsync method
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
      const bucket = 'profile-images';
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

      // Determine content type (same as RegisterScreen)
      let contentType = 'image/jpeg';
      if (fileExt === 'png') contentType = 'image/png';
      if (fileExt === 'webp') contentType = 'image/webp';

      // First, try to delete existing file to avoid duplicate error
      console.log('🗑️ Attempting to delete existing profile image...');
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([fileName]);
        
        if (deleteError) {
          console.log('ℹ️ No existing file to delete or delete failed (this is OK):', deleteError.message);
        } else {
          console.log('✅ Existing file deleted successfully');
        }
      } catch (deleteErr) {
        console.log('ℹ️ Delete operation failed (this is OK):', deleteErr);
      }

      // Upload the file using FileSystem.uploadAsync (SAME as RegisterScreen)
      console.log('🚀 Uploading to Supabase Storage REST endpoint using FileSystem.uploadAsync...');
      const uploadRes = await FileSystem.uploadAsync(uploadUrl, imageUri, {
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

      // Construct the public URL (same as RegisterScreen)
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
      console.log('✅ Profile image uploaded and public URL:', publicUrl);

      // Update database
      const { error: updateError } = await supabase
        .from('owners')
        .update({ avatar_url: publicUrl })
        .eq('id', ownerProfile.id);

      if (updateError) throw updateError;

      // Update local state immediately
      setOwnerProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      console.log('✅ Local state updated with new avatar URL');

      // Also refresh the profile from database to ensure consistency
      console.log('🔄 Refreshing profile from database...');
      await fetchProfile();
      console.log('✅ Profile refreshed from database');

      Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
      console.log('✅ Profile image updated successfully');

    } catch (error) {
      console.error('❌ Error uploading profile image:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen de perfil');
    } finally {
      setImageUploading(false);
    }
  };

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const handleEditProfile = () => {
    if (ownerProfile?.id) {
      router.push({
        pathname: '/(owner)/profile/edit',
        params: { id: ownerProfile.id }
      });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      ) : ownerProfile ? (
        <ScrollView style={styles.scrollView}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Perfil</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            {ownerProfile.avatar_url ? (
              <Image
                source={{ uri: ownerProfile.avatar_url }}
                style={styles.profileImage}
                onError={() => {}}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.white} />
              </View>
            )}
            
            {/* Only show change button for own profile */}
            {!isViewingOtherProfile && (
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={imageUploading}
              >
                <Ionicons 
                  name={ownerProfile.avatar_url ? "camera" : "add-circle"} 
                  size={16} 
                  color={COLORS.white} 
                />
                <Text style={styles.changeImageButtonText}>
                  {imageUploading 
                    ? 'Subiendo...' 
                    : ownerProfile.avatar_url 
                      ? 'Cambiar imagen' 
                      : 'Agregar imagen'
                  }
                </Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.profileName}>{ownerProfile.full_name}</Text>
            <Text style={styles.profileTitle}>Propietario</Text>
          </View>

          {/* Profile Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <InfoRow 
              icon="person" 
              label="Nombre completo" 
              value={ownerProfile.full_name} 
            />
            
            <InfoRow 
              icon="mail" 
              label="Correo electrónico" 
              value={ownerProfile.email} 
            />
            
            <InfoRow 
              icon="call" 
              label="Teléfono" 
              value={ownerProfile.phone} 
            />
            
            <InfoRow 
              icon="calendar" 
              label="Miembro desde" 
              value={formatDate(ownerProfile.created_at || '')} 
            />
          </View>

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
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace('/(general)/login');
              }}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.secondary} />
              <Text style={[styles.editButtonText, { color: COLORS.secondary }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: 16,
  },
  profileTitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  changeImageButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
});

export default OwnerProfileScreen;
