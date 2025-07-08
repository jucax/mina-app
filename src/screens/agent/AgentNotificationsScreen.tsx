import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ProposalService, Proposal } from '../../services/proposalService';
import { FONTS } from '../../styles/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const AgentNotificationsScreen = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await ProposalService.getProposalsByAgent();
      // Only show proposals that have been accepted or rejected
      setProposals((data || []).filter(p => p.status !== 'pending'));
    } catch (error) {
      console.error('Error fetching agent proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProposals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProposals();
    setRefreshing(false);
  };

  const handleNotificationPress = (index: number) => {
    setSelectedIndex(index);
    const proposal = proposals[index];
    if (proposal) {
      router.push({
        pathname: '/(agent)/proposal-response',
        params: { proposalId: proposal.id },
      });
    }
  };

  const getPropertyImage = (proposal: Proposal) => {
    if (proposal.property?.images && proposal.property.images.length > 0) {
      return { uri: proposal.property.images[0] };
    }
    return require('../../../assets/images/logo_login_screen.png');
  };

  const getNotificationTitle = (proposal: Proposal) => {
    if (proposal.status === 'accepted') {
      return '¡Propuesta Aceptada!';
    } else if (proposal.status === 'rejected') {
      return 'Propuesta Rechazada';
    } else {
      return 'Propuesta enviada';
    }
  };

  const getNotificationSubtitle = (proposal: Proposal) => {
    if (proposal.status === 'accepted') {
      return 'El propietario ha aceptado tu propuesta. ¡Revisa los detalles!';
    } else if (proposal.status === 'rejected') {
      return 'El propietario ha rechazado tu propuesta.';
    } else {
      return 'Tu propuesta está pendiente de respuesta.';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.customHeaderTitle}>Notificaciones:</Text>
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.customHeaderLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Notificaciones:</Text>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.customHeaderLogo}
          resizeMode="contain"
        />
      </View>
      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {proposals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes notificaciones aún</Text>
            <Text style={styles.emptySubtext}>Cuando los propietarios respondan tus propuestas, aparecerán aquí</Text>
          </View>
        ) : (
          proposals.map((proposal, index) => (
            <TouchableOpacity
              key={proposal.id}
              onPress={() => handleNotificationPress(index)}
              style={[
                styles.notificationItem,
                selectedIndex === index && styles.notificationItemSelected,
              ]}
            >
              <Image
                source={getPropertyImage(proposal)}
                style={styles.notificationImage}
              />
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={2}>
                    {getNotificationTitle(proposal)}
                  </Text>
                </View>
                <Text style={styles.notificationSubtitle} numberOfLines={3}>
                  {getNotificationSubtitle(proposal)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#144E7A',
  },
  notificationsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  notificationItemSelected: {
    backgroundColor: 'rgba(255, 167, 51, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFA733',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  notificationImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 14,
    color: '#666666',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptySubtext: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#175B87',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#FFE9CC',
  },
  customHeaderTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  customHeaderLogo: {
    height: 48,
    width: 120,
    marginLeft: 12,
  },
  backButton: {
    marginRight: 16,
  },
});

export default AgentNotificationsScreen; 