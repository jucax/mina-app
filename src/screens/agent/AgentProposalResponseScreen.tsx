import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { ProposalService, Proposal } from '../../services/proposalService';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

const AgentProposalResponseScreen = () => {
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerInfo, setOwnerInfo] = useState<{ full_name: string; email: string; phone: string } | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (proposalId) {
          const data = await ProposalService.getProposalById(proposalId);
          setProposal(data);
        }
      } catch (error) {
        console.error('Error fetching proposal:', error);
        Alert.alert('Error', 'No se pudo cargar la respuesta.', [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [proposalId]);

  // Always fetch owner info using owner_id
  useEffect(() => {
    const fetchOwner = async () => {
      if (proposal && proposal.owner_id) {
        setOwnerLoading(true);
        try {
          const { data, error } = await supabase
            .from('owners')
            .select('full_name, email, phone')
            .eq('id', proposal.owner_id)
            .single();
          if (!error && data) {
            setOwnerInfo(data);
          } else {
            setOwnerInfo(null);
          }
        } catch (err) {
          setOwnerInfo(null);
        } finally {
          setOwnerLoading(false);
        }
      }
    };
    fetchOwner();
  }, [proposal]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando respuesta...</Text>
        </View>
      </View>
    );
  }

  if (!proposal) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Respuesta no encontrada</Text>
        </View>
      </View>
    );
  }

  const getPropertyImage = (property: any) => {
    if (property?.images && property.images.length > 0) {
      return { uri: property.images[0] };
    }
    return require('../../../assets/images/logo_login_screen.png');
  };

  const getOwnerInfo = () => {
    if (ownerLoading) {
      return (
        <View style={styles.ownerInfoBox}>
          <Text style={styles.ownerInfoLabel}>Cargando información del propietario...</Text>
        </View>
      );
    }
    const name = ownerInfo?.full_name || 'No disponible';
    const email = ownerInfo?.email || 'No disponible';
    const phone = ownerInfo?.phone || 'No disponible';
    return (
      <View style={styles.ownerInfoBox}>
        <Text style={styles.ownerInfoLabel}>Propietario:</Text>
        <Text style={styles.ownerInfoValue}>{name}</Text>
        <View style={styles.ownerContactRow}>
          <Ionicons name="mail" size={20} color={COLORS.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.ownerContactValue}>{email}</Text>
        </View>
        <View style={styles.ownerContactRow}>
          <Ionicons name="call" size={20} color={COLORS.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.ownerContactValue}>{phone}</Text>
        </View>
      </View>
    );
  };

  const getStatusSection = () => {
    if (proposal.status === 'accepted') {
      return (
        <View style={styles.statusSectionAccepted}>
          <Ionicons name="checkmark-circle" size={48} color={COLORS.secondary} style={{ marginBottom: 8 }} />
          <Text style={styles.statusSubtitleAccepted}>Propuesta aceptada</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusSectionRejected}>
          <Ionicons name="close-circle" size={48} color="#FF6B6B" style={{ marginBottom: 8 }} />
          <Text style={styles.statusSubtitleRejected}>Propuesta rechazada</Text>
        </View>
      );
    }
  };

  const getStatusMessage = () => {
    if (proposal.status === 'accepted') {
      return (
        <Text style={styles.statusMessageAccepted}>
          Aquí tienes la información del propietario. Siéntete libre de llamarlo y concretar el trato directamente con él. No olvides regresar a la app para informarnos cómo te fue con la operación.
        </Text>
      );
    } else {
      return (
        <Text style={styles.statusMessageRejected}>
          Lo sentimos, el propietario ha rechazado tu propuesta. ¡Sigue buscando, seguro encontrarás la propiedad ideal para ti!
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {getStatusSection()}
        {proposal.property && (
          <Image
            source={getPropertyImage(proposal.property)}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>
            {proposal.property?.property_type} en {proposal.property?.intent === 'sell' ? 'VENTA' : 'RENTA'}
          </Text>
          <Text style={styles.propertyLocation}>
            {proposal.property?.municipality}, {proposal.property?.state}
          </Text>
        </View>
        {getOwnerInfo()}
        {getStatusMessage()}
        <Text style={styles.sectionTitle}>Tu Propuesta</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{proposal.proposal_text}</Text>
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
  title: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
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
  statusSectionAccepted: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusSubtitleAccepted: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSectionRejected: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusSubtitleRejected: {
    ...FONTS.title,
    fontSize: 22,
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ownerInfoBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
    alignItems: 'flex-start',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  ownerInfoLabel: {
    ...FONTS.title,
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  ownerInfoValue: {
    ...FONTS.title,
    color: COLORS.white,
    fontSize: 20,
    marginBottom: 8,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  ownerContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerContactValue: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 16,
  },
  statusMessageAccepted: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusMessageRejected: {
    ...FONTS.title,
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 12,
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
});

export default AgentProposalResponseScreen; 