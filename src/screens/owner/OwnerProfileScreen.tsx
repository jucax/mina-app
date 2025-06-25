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
import { COLORS } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  is_owner: boolean;
}

const OwnerProfileScreen = () => {
  const params = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're viewing another owner's profile (from params) or current user's profile
  const isViewingOtherProfile = params.agentImage && params.agentName;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isViewingOtherProfile) {
          // Use the profile data from params (for viewing other owners)
          console.log('👥 Viewing other owner profile from params');
          setUserProfile({
            id: '',
            full_name: params.agentName as string,
            phone: params.contact as string,
            avatar_url: params.agentImage as string,
            is_owner: true,
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
                .select('id, full_name, phone, avatar_url')
                .eq('id', userAuth.owner_id)
                .single();

              if (error) {
                console.error('❌ Error fetching owner profile (Owner Profile):', error);
              } else {
                console.log('✅ Owner profile fetched successfully (Owner Profile):', ownerProfile);
                console.log('🖼️ Avatar URL (Owner Profile):', ownerProfile.avatar_url);
                
                // Transform to match the expected interface
                const profile = {
                  id: ownerProfile.id,
                  full_name: ownerProfile.full_name,
                  phone: ownerProfile.phone || '',
                  avatar_url: ownerProfile.avatar_url,
                  is_owner: true
                };
                
                setUserProfile(profile);
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

  // Log avatar URL when it changes
  useEffect(() => {
    if (userProfile?.avatar_url) {
      console.log('🧪 Final avatar URL to load (Owner Profile):', userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  const InfoBox = ({ value, label }: { value: string; label: string }) => (
    <View style={styles.infoBox}>
      <Text style={styles.infoBoxText}>
        {label === 'CONTACTO' || label === 'INMOBILIARIA'
          ? `${label}: ${value}`
          : `${value} ${label}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      ) : userProfile ? (
        <ScrollView>
          {/* Top Section with Logo and Profile Picture */}
          <View style={styles.topSection}>
            <Image
              source={require('../../../assets/images/logo_login_screen.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            {userProfile.avatar_url ? (
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={70} color={COLORS.white} />
              </View>
            )}
          </View>

          {/* White Card with Owner Info */}
          <View style={styles.infoCard}>
            <Text style={styles.agentName}>{userProfile.full_name}</Text>
            <Text style={styles.agentTitle}>Propietario</Text>
            <View style={styles.divider} />
            <Text style={styles.agentDescription}>
              Hola, mi nombre es {userProfile.full_name} y soy propietario de propiedades
            </Text>
          </View>

          {/* Info Boxes */}
          <View style={styles.infoBoxesContainer}>
            <InfoBox value={userProfile.phone || 'N/A'} label="CONTACTO" />
            <InfoBox value={userProfile.phone || 'N/A'} label="INMOBILIARIA" />
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
    backgroundColor: '#144E7A',
  },
  topSection: {
    height: height * 0.28,
    width: '100%',
    backgroundColor: '#144E7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 140,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 8,
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  profileImage: {
    position: 'absolute',
    top: height * 0.18,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    position: 'absolute',
    top: height * 0.18,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 24,
    marginTop: 0,
  },
  agentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 50,
  },
  agentTitle: {
    fontSize: 20,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  agentDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  infoBoxesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  infoBox: {
    backgroundColor: '#FFA733',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  infoBoxText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OwnerProfileScreen; 