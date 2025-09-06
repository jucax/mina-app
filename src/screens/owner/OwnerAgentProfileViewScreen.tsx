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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 OwnerAgentProfileViewScreen mounted');
    console.log('📋 Received params:', { agentId });
    
    const fetchAgentProfile = async () => {
      try {
        if (!agentId) {
          console.log('❌ No agentId provided');
          setError('ID del agente no encontrado');
          return;
        }

        console.log('🔍 Fetching agent profile for ID:', agentId);

        // First, let's check if the agent exists
        const { data: agentCheck, error: checkError } = await supabase
          .from('agents')
          .select('id')
          .eq('id', agentId)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking agent existence:', checkError);
          setError('Error al verificar el agente');
          return;
        }

        if (!agentCheck) {
          console.log('❌ Agent not found with ID:', agentId);
          setError('Agente no encontrado');
          return;
        }

        console.log('✅ Agent exists, fetching full profile...');

        // Now fetch the full agent profile
        const { data: agentProfile, error: fetchError } = await supabase
          .from('agents')
          .select(`
            id, 
            full_name, 
            email, 
            phone, 
            agency_name, 
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
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Error fetching agent profile:', fetchError);
          setError('Error al cargar el perfil del agente');
          return;
        }

        if (!agentProfile) {
          console.log('❌ Agent profile not found');
          setError('Perfil del agente no encontrado');
          return;
        }

        console.log('✅ Agent profile fetched successfully:', agentProfile);
        setAgentProfile(agentProfile);
      } catch (error) {
        console.error('❌ Error in fetchAgentProfile:', error);
        setError('Ocurrió un error al cargar el perfil');
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
      day: 'numeric'
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil del agente...</Text>
        </View>
      </View>
    );
  }

  if (error || !agentProfile) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.secondary} />
          <Text style={styles.errorText}>
            {error || 'No se pudo cargar el perfil del agente'}
          </Text>
          <Text style={styles.errorSubtext}>
            El agente puede haber eliminado su cuenta o no estar disponible.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setError(null);
              setLoading(true);
              // Retry the fetch
              const fetchAgentProfile = async () => {
                try {
                  if (!agentId) return;
                  
                  const { data: agentProfile, error: fetchError } = await supabase
                    .from('agents')
                    .select(`
                      id, 
                      full_name, 
                      email, 
                      phone, 
                      agency_name, 
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
                    .maybeSingle();

                  if (fetchError || !agentProfile) {
                    setError('Agente no encontrado');
                  } else {
                    setAgentProfile(agentProfile);
                    setError(null);
                  }
                } catch (error) {
                  setError('Error al cargar el perfil');
                } finally {
                  setLoading(false);
                }
              };
              
              fetchAgentProfile();
            }}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
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
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>{agentProfile.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>{agentProfile.phone}</Text>
          </View>
          
          {agentProfile.postal_code && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>
                {agentProfile.street && `${agentProfile.street}, `}
                {agentProfile.neighborhood && `${agentProfile.neighborhood}, `}
                {agentProfile.municipality && `${agentProfile.municipality}, `}
                {agentProfile.state && `${agentProfile.state}, `}
                {agentProfile.postal_code}
              </Text>
            </View>
          )}
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Profesional</Text>
          
          {agentProfile.experience_years && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>{agentProfile.experience_years} años de experiencia</Text>
            </View>
          )}
          
          {agentProfile.properties_sold && (
            <View style={styles.infoRow}>
              <Ionicons name="home" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>{agentProfile.properties_sold} propiedades vendidas</Text>
            </View>
          )}
          
          {agentProfile.commission_percentage && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag" size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>Comisión: {agentProfile.commission_percentage}%</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>
              {agentProfile.works_at_agency ? 'Trabaja en inmobiliaria' : 'Independiente'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {agentProfile.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{agentProfile.description}</Text>
          </View>
        )}

        {/* Member Since */}
        {agentProfile.created_at && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Miembro desde</Text>
            <Text style={styles.infoText}>{formatDate(agentProfile.created_at)}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  agentName: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  agentTitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  agentAgency: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
  },
  descriptionText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  errorSubtext: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.7,
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
    fontWeight: 'bold',
  },
  backButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});

export default OwnerAgentProfileViewScreen;
