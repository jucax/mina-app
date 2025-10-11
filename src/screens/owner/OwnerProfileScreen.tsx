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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { AccountDeletionService } from '../../services/accountDeletionService';

const { width } = Dimensions.get('window');

interface OwnerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
}

const OwnerProfileScreen = () => {
  // Safe parameter extraction with error handling
  let params: any = {};
  let ownerId: string | undefined = undefined;
  
  try {
    params = useLocalSearchParams();
    ownerId = Array.isArray(params.ownerId) ? params.ownerId[0] : params.ownerId;
  } catch (error) {
    console.error('Error getting search params:', error);
    // Fallback to undefined if there's an error
    ownerId = undefined;
  }
  
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);

  // Check if we're viewing another owner's profile
  useEffect(() => {
    if (ownerId && ownerId !== 'current') {
      setIsViewingOtherProfile(true);
    }
  }, [ownerId]);

  const loadOwnerProfile = async () => {
    try {
      setLoading(true);
      
      if (isViewingOtherProfile && ownerId) {
        // Load another owner's profile
        const { data, error } = await supabase
          .from('owners')
          .select('id, full_name, email, phone, avatar_url, created_at')
          .eq('id', ownerId)
          .single();

        if (error) {
          console.error('Error fetching other owner profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil del propietario.');
          return;
        }

        setOwnerProfile(data);
      } else {
        // Load current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          Alert.alert('Error', 'Usuario no autenticado.');
          return;
        }

        // Get user auth data to find owner_id
        const { data: userAuth, error: userAuthError } = await supabase
          .from('user_auth')
          .select('owner_id')
          .eq('id', user.id)
          .single();

        if (userAuthError || !userAuth?.owner_id) {
          Alert.alert('Error', 'No se encontró el perfil del propietario.');
          return;
        }

        // Fetch owner profile
        const { data, error } = await supabase
          .from('owners')
          .select('id, full_name, email, phone, avatar_url, created_at')
          .eq('id', userAuth.owner_id)
          .single();

        if (error) {
          console.error('Error fetching owner profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil.');
          return;
        }

        setOwnerProfile(data);
      }
    } catch (error) {
      console.error('Error in loadOwnerProfile:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerProfile();
  }, [isViewingOtherProfile, ownerId]);

  const handleEditProfile = () => {
    if (ownerProfile?.id) {
      router.push({
        pathname: '/(owner)/profile/edit',
        params: { id: ownerProfile.id }
      });
    }
  };

  const handleChangePassword = () => {
    router.push('/(owner)/change-password');
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
    AccountDeletionService.confirmAccountDeletion('owner', async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !ownerProfile?.id) {
          Alert.alert('Error', 'No se pudo obtener la información del usuario.');
          return;
        }

        // Show loading state
        Alert.alert('Eliminando cuenta...', 'Por favor espera.');

        const success = await AccountDeletionService.deleteOwnerAccount(
          ownerProfile.id,
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

  if (!ownerProfile) {
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
            onPress={loadOwnerProfile}
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
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {ownerProfile.avatar_url ? (
              <Image
                source={{ uri: ownerProfile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{ownerProfile.full_name}</Text>
          <Text style={styles.email}>{ownerProfile.email}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{ownerProfile.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{ownerProfile.phone || 'No especificado'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {new Date(ownerProfile.created_at).toLocaleDateString('es-MX')}
            </Text>
          </View>
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
});

export default OwnerProfileScreen;
