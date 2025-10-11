import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { AccountDeletionService } from '../../services/accountDeletionService';

const { width } = Dimensions.get('window');

interface AgentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  works_at_agency: boolean;
  agency_name?: string;
  description: string;
  created_at: string;
  // Additional fields from registration
  postal_code?: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  country?: string;
  experience_years?: number;
  properties_sold?: number;
  commission_percentage?: number;
}

const AgentProfileScreen = () => {
  console.log('🚀 AgentProfileScreen component loaded - this should show comprehensive profile info');
  console.log('📍 Current route: /(agent)/profile');
  console.log('🔍 This is the COMPREHENSIVE profile screen with all sections!');
  
  // Safe parameter extraction with error handling
  // Safe parameter extraction with error handling
  let params: any = {};
  let agentId: string | undefined = undefined;
  
  try {
    params = useLocalSearchParams();
    agentId = Array.isArray(params.agentId) ? params.agentId[0] : params.agentId;
  } catch (error) {
    console.error('Error getting search params:', error);
    // Fallback to undefined if there's an error
    agentId = undefined;
  }
  
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if we're viewing another agent's profile
  useEffect(() => {
    if (agentId && agentId !== 'current') {
      setIsViewingOtherProfile(true);
    }
  }, [agentId]);

    const loadAgentProfile = async () => {
    console.log('🔍 Loading agent profile data...');
    console.log('📊 Current agentProfile state before load:', agentProfile);
    try {
      setLoading(true);
      
      if (isViewingOtherProfile && agentId) {
        // Load another agent's profile
        const { data, error } = await supabase
          .from('agents')
          .select('id, full_name, email, phone, avatar_url, works_at_agency, agency_name, description, created_at, postal_code, state, municipality, neighborhood, street, country, experience_years, properties_sold, commission_percentage')
          .eq('id', agentId)
          .single();

        if (error) {
          console.error('Error fetching other agent profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil del agente.');
          return;
        }

        console.log('✅ Profile data loaded successfully:', data);
        setAgentProfile(data);
        } else {
        // Load current user's profile
          const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          Alert.alert('Error', 'Usuario no autenticado.');
          return;
        }

        // Get user auth data to find agent_id
            const { data: userAuth, error: userAuthError } = await supabase
              .from('user_auth')
          .select('agent_id')
              .eq('id', user.id)
              .single();

        if (userAuthError || !userAuth?.agent_id) {
          Alert.alert('Error', 'No se encontró el perfil del agente.');
              return;
            }

              // Fetch agent profile
        const { data, error } = await supabase
                .from('agents')
          .select('id, full_name, email, phone, avatar_url, works_at_agency, agency_name, description, created_at, postal_code, state, municipality, neighborhood, street, country, experience_years, properties_sold, commission_percentage')
                .eq('id', userAuth.agent_id)
                .single();

              if (error) {
          console.error('Error fetching agent profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil.');
          return;
        }

        console.log('✅ Profile data loaded successfully:', data);
        setAgentProfile(data);
        }
      } catch (error) {
      console.error('Error in loadAgentProfile:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAgentProfile();
  }, [isViewingOtherProfile, agentId]);

  // Reload profile data when screen comes into focus (e.g., returning from edit screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 AgentProfileScreen focused - reloading profile data...');
      loadAgentProfile();
    }, [isViewingOtherProfile, agentId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgentProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    if (agentProfile?.id) {
      router.push({
        pathname: '/(agent)/profile/edit',
        params: { id: agentProfile.id }
      });
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto.');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        Alert.alert('Error', 'No se pudo cerrar sesión.');
        return;
      }
      
      // Clear form data on logout
      const { clearAllFormData } = await import('../../utils/formDataUtils');
      await clearAllFormData();
      
      router.replace('/(general)/login');
    } catch (error) {
      console.error('Error in logout:', error);
      Alert.alert('Error', 'Ocurrió un error al cerrar sesión.');
    }
  };

  const handleDeleteAccount = async () => {
    AccountDeletionService.confirmAccountDeletion('agent', async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !agentProfile?.id) {
          Alert.alert('Error', 'No se pudo obtener la información del usuario.');
          return;
        }

        // Show loading state
        Alert.alert('Eliminando cuenta...', 'Por favor espera.');

        const success = await AccountDeletionService.deleteAgentAccount(
          agentProfile.id,
          user.id
        );

        if (success) {
          // Clear form data
          const { clearAllFormData } = await import('../../utils/formDataUtils');
          await clearAllFormData();
          
          Alert.alert(
            'Cuenta Eliminada',
            'Tu cuenta ha sido eliminada exitosamente.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(general)/login'),
              },
            ]
          );
        } else {
          Alert.alert(
            'Error',
            'No se pudo eliminar la cuenta. Por favor intenta de nuevo o contacta soporte.'
          );
        }
      } catch (error) {
        console.error('Error in handleDeleteAccount:', error);
        Alert.alert('Error', 'Ocurrió un error al eliminar la cuenta.');
      }
    });
  };

  if (loading) {
  return (
    <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!agentProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorTitle}>Perfil no encontrado</Text>
          <Text style={styles.errorSubtitle}>
            No se pudo cargar la información del perfil
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAgentProfile}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
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
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {agentProfile.avatar_url ? (
              <Image
                source={{ uri: agentProfile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{agentProfile.full_name}</Text>
          <Text style={styles.email}>{agentProfile.email}</Text>
          {agentProfile.works_at_agency && agentProfile.agency_name && (
            <Text style={styles.agencyName}>{agentProfile.agency_name}</Text>
          )}
          </View>

        <View style={styles.infoSection}>
          {/* 🎯 RENDERING COMPREHENSIVE PROFILE SECTIONS! */}
          {/* Personal Information */}
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{agentProfile.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{agentProfile.phone || 'No especificado'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {new Date(agentProfile.created_at).toLocaleDateString('es-MX')}
            </Text>
          </View>

          {/* Location Information */}
          <Text style={styles.sectionTitle}>Información de Ubicación</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Estado</Text>
            {agentProfile.state ? (
              <Text style={styles.infoValue}>{agentProfile.state}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="business" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Municipio</Text>
            {agentProfile.municipality ? (
              <Text style={styles.infoValue}>{agentProfile.municipality}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="home" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Colonia</Text>
            {agentProfile.neighborhood ? (
              <Text style={styles.infoValue}>{agentProfile.neighborhood}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="map" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Calle</Text>
            {agentProfile.street ? (
              <Text style={styles.infoValue}>{agentProfile.street}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Código Postal</Text>
            {agentProfile.postal_code ? (
              <Text style={styles.infoValue}>{agentProfile.postal_code}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Professional Information */}
          <Text style={styles.sectionTitle}>Información Profesional</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Años de Experiencia</Text>
            {agentProfile.experience_years ? (
              <Text style={styles.infoValue}>{agentProfile.experience_years} años</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="home" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Propiedades Vendidas</Text>
            {agentProfile.properties_sold ? (
              <Text style={styles.infoValue}>{agentProfile.properties_sold}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="cash" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Porcentaje de Comisión</Text>
            {agentProfile.commission_percentage ? (
              <Text style={styles.infoValue}>{agentProfile.commission_percentage}%</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({
                  pathname: '/(agent)/profile/edit',
                  params: { id: agentProfile.id }
                })}
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="business" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Trabaja en Inmobiliaria</Text>
            <Text style={styles.infoValue}>
              {agentProfile.works_at_agency ? 'Sí' : 'No'}
              {agentProfile.works_at_agency && agentProfile.agency_name && ' - ' + agentProfile.agency_name}
            </Text>
          </View>

          {agentProfile.description && (
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionLabel}>Descripción</Text>
              <Text style={styles.descriptionValue}>{agentProfile.description}</Text>
            </View>
          )}
        </View>

          {!isViewingOtherProfile && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <Ionicons name="key" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Cambiar Contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          </View>
          )}
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  agencyName: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
    opacity: 0.8,
  },
  infoValue: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  descriptionItem: {
    marginTop: 8,
  },
  descriptionLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  descriptionValue: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 22,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
  },
  deleteButton: {
    backgroundColor: '#CC0000',
  },
  actionButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default AgentProfileScreen; 
