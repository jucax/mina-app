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

const NotificationsScreen = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching proposals for owner...');
      const data = await ProposalService.getProposalsForOwner();
      console.log('✅ Proposals fetched:', data?.length || 0, 'proposals');
      console.log('📋 Proposals data:', data);
      setProposals(data);
    } catch (error) {
      console.error('❌ Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals on mount
  useEffect(() => {
    fetchProposals();
  }, []);

  // Refresh proposals when screen comes into focus
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
      // Navigate to proposal screen with the proposal ID
      router.push({
        pathname: '/(owner)/proposal-received',
        params: { proposalId: proposal.id },
      });
    }
  };

  const getPropertyImage = (proposal: Proposal) => {
    if (proposal.property?.images && proposal.property.images.length > 0) {
      return { uri: proposal.property.images[0] };
    }
    return require('../../../assets/images/property1.png');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  };

  const getNotificationTitle = (proposal: Proposal) => {
    if (proposal.status === 'accepted') {
      return '¡Propuesta Aceptada!';
    } else if (proposal.status === 'rejected') {
      return 'Propuesta Rechazada';
    } else {
      return '¡Tienes una nueva propuesta!';
    }
  };

  const getNotificationSubtitle = (proposal: Proposal) => {
    if (proposal.status === 'accepted') {
      return `${proposal.agent?.full_name || 'El asesor'} aceptó trabajar contigo. ¡Tu información de contacto ha sido compartida!`;
    } else if (proposal.status === 'rejected') {
      return `Has rechazado la propuesta de ${proposal.agent?.full_name || 'el asesor'}. No te preocupes, encontrarás al agente perfecto.`;
    } else {
      return `${proposal.agent?.full_name || 'Un asesor'} te ha enviado una propuesta para tu ${proposal.property?.property_type?.toLowerCase() || 'propiedad'}. ¡Dale un vistazo!`;
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
            <Text style={styles.emptySubtext}>Cuando los agentes te envíen propuestas, aparecerán aquí</Text>
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
                  <Text style={styles.notificationTime}>
                    {formatTimeAgo(proposal.created_at)}
                  </Text>
                </View>
                <Text style={styles.notificationSubtitle} numberOfLines={3}>
                  {getNotificationSubtitle(proposal)}
                </Text>
                {proposal.status === 'pending' && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pendiente</Text>
                  </View>
                )}
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#144E7A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  emptyText: {
    color: '#144E7A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FFA733',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  pendingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 16,
  },
});

export default NotificationsScreen; 