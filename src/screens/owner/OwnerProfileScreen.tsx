import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../styles/globalStyles';

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

  // Check if we're viewing another owner's profile (from params) or current user's profile
  const isViewingOtherProfile = params.agentImage && params.agentName;

  useEffect(() => {
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