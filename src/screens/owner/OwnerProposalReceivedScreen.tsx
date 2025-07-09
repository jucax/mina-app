import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { ProposalService, Proposal } from '../../services/proposalService';

const { width, height } = Dimensions.get('window');

const OwnerProposalReceivedScreen = () => {
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (proposalId) {
          const data = await ProposalService.getProposalById(proposalId);
          setProposal(data);
        }
      } catch (error) {
        console.error('Error fetching proposal:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la propuesta.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const handleAccept = async () => {
    if (!proposal) return;

    setResponding(true);
    try {
      await ProposalService.updateProposalStatus(proposal.id, 'accepted');
      
      Alert.alert(
        '¡Propuesta Aceptada!',
        '¡Felicidades! Tu información de contacto ha sido compartida con este agente. Él debería contactarte pronto para coordinar los siguientes pasos.',
        [{ text: 'OK', onPress: () => router.replace({ pathname: '/(owner)/notifications', params: { refresh: '1' } }) }]
      );
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      Alert.alert(
        'Error',
        'No se pudo aceptar la propuesta. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;

    setResponding(true);
    try {
      await ProposalService.updateProposalStatus(proposal.id, 'rejected');
      
      Alert.alert(
        'Propuesta Rechazada',
        'No te preocupes, hemos notificado al agente sobre tu decisión. Estamos seguros de que encontrarás al agente perfecto para tu propiedad.',
        [{ text: 'OK', onPress: () => router.replace({ pathname: '/(owner)/notifications', params: { refresh: '1' } }) }]
      );
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      Alert.alert(
        'Error',
        'No se pudo rechazar la propuesta. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setResponding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (proposal: Proposal) => {
    if (proposal.property?.images && proposal.property.images.length > 0) {
      return { uri: proposal.property.images[0] };
    }
    return require('../../../assets/images/logo_login_screen.png');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando propuesta...</Text>
        </View>
      </View>
    );
  }

  if (!proposal) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Propuesta no encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Remove header: back button and title */}
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.title}>
        Propuesta de Valor
      </Text> */}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          ¡Dale un vistazo a la propuesta que tiene el asesor inmobiliario para ti!
        </Text>

        {/* Property Image */}
        {proposal.property && (
          <Image
            source={getPropertyImage(proposal)}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        )}

        {/* Agent Info */}
        <View style={styles.agentContainer}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.agentImage}
          />
          <View style={styles.agentInfo}>
            <TouchableOpacity
              onPress={() => {
                if (proposal.agent_id) {
                  router.push({ pathname: '/(agent)/profile', params: { id: proposal.agent_id } });
                }
              }}
            >
              <Text style={styles.agentNameButton}>{proposal.agent?.full_name || 'Asesor'}</Text>
            </TouchableOpacity>
            <Text style={styles.agentTitle}>Asesor Inmobiliario</Text>
            {proposal.agent?.agency_name && (
              <Text style={styles.agentAgency}>{proposal.agent.agency_name}</Text>
            )}
          </View>
        </View>

        {/* Property Info */}
        {proposal.property && (
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>
              {proposal.property.property_type} en {proposal.property.intent === 'sell' ? 'VENTA' : 'RENTA'}
            </Text>
            <Text style={styles.propertyLocation}>
              {proposal.property.municipality}, {proposal.property.state}
            </Text>
            <Text style={styles.propertyPrice}>
              {formatPrice(proposal.property.price)}
            </Text>
          </View>
        )}

        {/* Agent Experience */}
        {proposal.agent && (
          <View style={styles.experienceContainer}>
            <Text style={styles.sectionTitle}>Experiencia del Asesor</Text>
            <View style={styles.experienceDetails}>
              {proposal.agent.experience_years && (
                <View style={styles.experienceItem}>
                  <Ionicons name="time" size={20} color={COLORS.secondary} />
                  <Text style={styles.experienceText}>{proposal.agent.experience_years} años de experiencia</Text>
                </View>
              )}
              {proposal.agent.properties_sold && (
                <View style={styles.experienceItem}>
                  <Ionicons name="home" size={20} color={COLORS.secondary} />
                  <Text style={styles.experienceText}>{proposal.agent.properties_sold} propiedades vendidas</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Proposal Message */}
        <Text style={styles.sectionTitle}>Mensaje del Asesor</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{proposal.proposal_text}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            disabled={responding}
          >
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={responding}
          >
            <Text style={styles.actionButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  agentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  agentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  agentName: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  agentTitle: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  agentAgency: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  propertyInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  propertyTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyLocation: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
  },
  propertyPrice: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  experienceContainer: {
    marginBottom: 20,
  },
  experienceDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  messageText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
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
  agentNameButton: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export const options = {
  headerShown: false,
};

export default OwnerProposalReceivedScreen; 