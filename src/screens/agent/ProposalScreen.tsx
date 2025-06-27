import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { ViewTrackingService } from '../../services/viewTrackingService';
import { ProposalService } from '../../services/proposalService';
import { Property as PropertyType } from '../../types/property';

const { width, height } = Dimensions.get('window');

const ProposalScreen = () => {
  const { propertyId, propertyData } = useLocalSearchParams<{ 
    propertyId: string; 
    propertyData: string;
  }>();
  const [proposalText, setProposalText] = useState('');
  const [sending, setSending] = useState(false);
  const [property, setProperty] = useState<PropertyType | null>(null);

  useEffect(() => {
    if (propertyData) {
      try {
        const parsedProperty = JSON.parse(propertyData);
        setProperty(parsedProperty);
      } catch (error) {
        console.error('Error parsing property data:', error);
      }
    }
  }, [propertyData]);

  const handleSendProposal = async () => {
    if (!proposalText.trim()) {
      Alert.alert('Error', 'Por favor escribe tu propuesta antes de enviarla.');
      return;
    }

    if (!propertyId) {
      Alert.alert('Error', 'ID de propiedad no válido.');
      return;
    }

    setSending(true);
    try {
      // Send the proposal
      await ProposalService.createProposal({
        property_id: propertyId,
        proposal_text: proposalText.trim(),
      });
      
      // Increment offer count when proposal is sent
      await ViewTrackingService.incrementPropertyOffers(propertyId);
      
      Alert.alert(
        '¡Propuesta Enviada!',
        'Tu propuesta ha sido enviada correctamente al propietario. Te notificaremos cuando responda.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error sending proposal:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar la propuesta. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Enviar Propuesta
        </Text>

        {property && (
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>
              {property.property_type} en {property.intent === 'sell' ? 'VENTA' : 'RENTA'}
            </Text>
            <Text style={styles.propertyLocation}>
              {property.municipality}, {property.state}
            </Text>
            <Text style={styles.propertyPrice}>
              {formatPrice(property.price)}
            </Text>
            <Text style={styles.propertyCommission}>
              Comisión: {property.commission_percentage}%
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Tu Propuesta
        </Text>

        <Text style={styles.description}>
          Escribe tu propuesta para el propietario. Incluye información sobre:
        </Text>

        <View style={styles.bulletPoints}>
          <Text style={styles.bulletPoint}>• Tu experiencia en el mercado inmobiliario</Text>
          <Text style={styles.bulletPoint}>• Tu estrategia de venta/renta</Text>
          <Text style={styles.bulletPoint}>• Tiempo estimado para cerrar la operación</Text>
          <Text style={styles.bulletPoint}>• Servicios adicionales que ofreces</Text>
          <Text style={styles.bulletPoint}>• Por qué eres la mejor opción</Text>
        </View>

        <TextInput
          style={styles.proposalInput}
          value={proposalText}
          onChangeText={setProposalText}
          placeholder="Escribe tu propuesta aquí..."
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendProposal}
          disabled={sending}
        >
          <Ionicons name="send" size={24} color={COLORS.white} />
          <Text style={styles.sendButtonText}>
            {sending ? 'Enviando...' : 'Enviar Propuesta'}
          </Text>
        </TouchableOpacity>
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
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  propertyInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  propertyTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyLocation: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  propertyPrice: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyCommission: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 16,
  },
  bulletPoints: {
    marginBottom: 24,
  },
  bulletPoint: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
    paddingLeft: 8,
  },
  proposalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    alignSelf: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
});

export default ProposalScreen; 