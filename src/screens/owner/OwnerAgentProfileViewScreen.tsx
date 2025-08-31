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
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

interface AgentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  agency_name?: string;
  license_number?: string;
  subscription_plan?: string;
  avatar_url?: string;
  created_at?: string;
  postal_code?: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  country?: string;
  experience_years?: number;
  properties_sold?: number;
  commission_percentage?: number;
  works_at_agency?: boolean;
  description?: string;
}

const OwnerAgentProfileViewScreen = () => {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 OwnerAgentProfileViewScreen mounted');
    console.log('📋 Received params:', { agentId });
    
    const fetchAgentProfile = async () => {
      try {
        if (!agentId) {
          console.log('❌ No agentId provided');
          Alert.alert('Error', 'ID del agente no encontrado');
          return;
        }

        console.log('🔍 Fetching agent profile for ID:', agentId);

        const { data: agentProfile, error } = await supabase
          .from('agents')
          .select(`
            id, 
            full_name, 
            email, 
            phone, 
            agency_name, 
            license_number,
            subscription_plan, 
            avatar_url, 
            created_at, 
            postal_code, 
            state, 
            municipality, 
            neighborhood, 
            street, 
            country, 
            experience_years, 
            properties_sold, 
            commission_percentage, 
            works_at_agency, 
            description
          `)
          .eq('id', agentId)
          .single();

        if (error) {
          console.error('❌ Error fetching agent profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil del agente');
          return;
        }

        console.log('✅ Agent profile fetched successfully:', agentProfile);
        setAgentProfile(agentProfile);
      } catch (error) {
        console.error('❌ Error in fetchAgentProfile:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentProfile();
  }, [agentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProfileImage = () => {
    if (agentProfile?.avatar_url) {
      return { uri: agentProfile.avatar_url };
    }
    return require('../../../assets/images/icon.png');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil del agente...</Text>
        </View>
      </View>
    );
  }

  if (!agentProfile) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Perfil del agente no encontrado</Text>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Perfil del Agente</Text>

        {/* Agent Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={getProfileImage()}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.agentName}>{agentProfile.full_name}</Text>
            <Text style={styles.agentTitle}>Asesor Inmobiliario</Text>
            {agentProfile.agency_name && (
              <Text style={styles.agentAgency}>{agentProfile.agency_name}</Text>
            )}
            {agentProfile.subscription_plan && (
              <View style={styles.planBadge}>
                <Text style={styles.planText}>{agentProfile.subscription_plan.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>{agentProfile.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>{agentProfile.phone}</Text>
            </View>
            {agentProfile.license_number && (
              <View style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>Licencia: {agentProfile.license_number}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Experience Information */}
        {(agentProfile.experience_years || agentProfile.properties_sold) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            <View style={styles.sectionContent}>
              {agentProfile.experience_years && (
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>{agentProfile.experience_years} años de experiencia</Text>
                </View>
              )}
              {agentProfile.properties_sold && (
                <View style={styles.infoItem}>
                  <Ionicons name="home" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>{agentProfile.properties_sold} propiedades vendidas</Text>
                </View>
              )}
              {agentProfile.commission_percentage && (
                <View style={styles.infoItem}>
                  <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
                  <Text style={styles.infoText}>Comisión: {agentProfile.commission_percentage}%</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Location Information */}
        {(agentProfile.state || agentProfile.municipality) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  {[agentProfile.municipality, agentProfile.state].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {agentProfile.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.descriptionText}>{agentProfile.description}</Text>
            </View>
          </View>
        )}

        {/* Member Since */}
        {agentProfile.created_at && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Miembro desde</Text>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>{formatDate(agentProfile.created_at)}</Text>
              </View>
            </View>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },
  title: {
    ...FONTS.title,
    fontSize: Math.max(SIZES.extraLarge, 24),
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  profileInfo: {
    alignItems: 'center',
  },
  agentName: {
    ...FONTS.title,
    fontSize: Math.max(SIZES.large, 20),
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  agentTitle: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.medium, 16),
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  agentAgency: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.font, 14),
    color: COLORS.secondary,
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.font - 2, 12),
    color: COLORS.white,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: Math.max(SIZES.large, 18),
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.font, 14),
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
  },
  descriptionText: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.font, 14),
    color: COLORS.white,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: Math.max(SIZES.medium, 16),
    color: COLORS.white,
  },
});

export default OwnerAgentProfileViewScreen; 