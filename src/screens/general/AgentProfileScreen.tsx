import React from 'react';
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

const { width, height } = Dimensions.get('window');

const AgentProfileScreen = () => {
  const params = useLocalSearchParams();
  const {
    agentImage,
    agentName,
    agency,
    experience,
    propertiesSold,
    commission,
    city,
    contact,
  } = params;

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
          <Image
            source={{ uri: agentImage as string }}
            style={styles.profileImage}
          />
        </View>

        {/* White Card with Agent Info */}
        <View style={styles.infoCard}>
          <Text style={styles.agentName}>{agentName}</Text>
          <Text style={styles.agentTitle}>Asesora inmobiliaria</Text>
          <View style={styles.divider} />
          <Text style={styles.agentDescription}>
            Hola, mi nombre es {agentName} y estaré encantado de ayudarte a cumplir tu objetivo
          </Text>
        </View>

        {/* Info Boxes */}
        <View style={styles.infoBoxesContainer}>
          <InfoBox value={experience as string} label="AÑOS DE EXPERIENCIA" />
          <InfoBox value={propertiesSold as string} label="PROPIEDADES VENDIDAS" />
          <InfoBox value={commission as string} label="DE COMISIÓN" />
          <InfoBox value={city as string} label="CIUDAD" />
          <InfoBox value={contact as string} label="CONTACTO" />
          <InfoBox value={agency as string} label="INMOBILIARIA" />
        </View>
      </ScrollView>
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
});

export default AgentProfileScreen; 