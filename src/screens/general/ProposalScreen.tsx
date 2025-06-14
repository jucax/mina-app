import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Mock data for proposals
const proposals = {
  '1': {
    image: require('../../../assets/images/property1.png'),
    agentImage: require('../../../assets/images/logo_login_screen.png'),
    agentName: 'Miguel de Mina',
    price: '1,500,000',
    commission: '3',
    timeToSell: '3 meses',
    strategy: 'Marketing digital y redes sociales',
    message: 'Me gustaría ayudarte a vender tu propiedad. Tengo experiencia en el mercado y una red de clientes interesados. ¿Te gustaría que trabajemos juntos?',
  },
  // Add more proposals as needed
};

const ProposalScreen = () => {
  const { notificationId } = useLocalSearchParams();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // Get proposal data based on notification ID
  const proposal = proposals[notificationId as keyof typeof proposals] || proposals['1'];

  const handleAccept = () => {
    setIsAccepted(!isAccepted);
    setIsRejected(false);
    // TODO: Implement accept logic
  };

  const handleReject = () => {
    setIsRejected(!isRejected);
    setIsAccepted(false);
    // TODO: Implement reject logic
  };

  const handleAgentPress = () => {
    router.push({
      pathname: '/(general)/agent-profile',
      params: {
        agentImage: proposal.agentImage,
        agentName: proposal.agentName,
        agency: 'REMAX',
        experience: '4',
        propertiesSold: '10',
        commission: '4%',
        city: 'Ciudad de Mexico',
        contact: '552564564',
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Propuesta de Valor</Text>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Property Image */}
        <Image
          source={proposal.image}
          style={styles.propertyImage}
          resizeMode="cover"
        />

        {/* Agent Info */}
        <View style={styles.agentContainer}>
          <TouchableOpacity onPress={handleAgentPress}>
            <Image
              source={proposal.agentImage}
              style={styles.agentImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.agentInfo}
            onPress={handleAgentPress}
          >
            <Text style={styles.agentName}>{proposal.agentName}</Text>
            <Text style={styles.agentTitle}>Asesor Inmobiliario</Text>
          </TouchableOpacity>
        </View>

        {/* Proposal Details */}
        <Text style={styles.sectionTitle}>Detalles de la Propuesta</Text>
        <View style={styles.detailsContainer}>
          <DetailRow label="Precio Sugerido:" value={`$${proposal.price}`} />
          <DetailRow label="Comisión:" value={`${proposal.commission}%`} />
          <DetailRow label="Tiempo de Venta:" value={proposal.timeToSell} />
          <DetailRow label="Estrategia:" value={proposal.strategy} />
        </View>

        {/* Message */}
        <Text style={styles.sectionTitle}>Mensaje del Asesor</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{proposal.message}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              isRejected && styles.actionButtonActive,
            ]}
            onPress={handleReject}
          >
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              isAccepted && styles.actionButtonActive,
            ]}
            onPress={handleAccept}
          >
            <Text style={styles.actionButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#144E7A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: height * 0.025,
    backgroundColor: '#144E7A',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.075,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  logo: {
    height: height * 0.05,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  agentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  agentTitle: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  messageContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  messageText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
  },
  actionButton: {
    width: width * 0.4,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonActive: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProposalScreen; 