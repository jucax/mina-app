import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionTrackingService, SubscriptionStatus } from '../../services/subscriptionTrackingService';

const { width } = Dimensions.get('window');

const AgentSubscriptionStatusScreen = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await SubscriptionTrackingService.getCurrentUserSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription status:', error);
      Alert.alert('Error', 'No se pudo cargar el estado de la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = () => {
    router.push('/(agent)/subscription');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'expired':
        return '#FF4444';
      case 'cancelled':
        return '#FF9500';
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      case 'inactive':
        return 'Inactiva';
      default:
        return 'Desconocido';
    }
  };

  const getPlanText = (plan: string | null) => {
    if (!plan) return 'No disponible';
    switch (plan.toLowerCase()) {
      case 'mensual':
        return 'Plan Mensual';
      case 'semestral':
        return 'Plan Semestral';
      case 'anual':
        return 'Plan Anual';
      default:
        return plan;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Cargando estado de suscripción...</Text>
        </View>
      </View>
    );
  }

  if (!subscriptionStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.gray} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorSubtitle}>
            No se pudo cargar el estado de la suscripción
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSubscriptionStatus}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
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
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="card" size={60} color={COLORS.white} />
          <Text style={styles.title}>Estado de Suscripción</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(subscriptionStatus.status) }
                ]} 
              />
              <Text style={styles.statusText}>
                {getStatusText(subscriptionStatus.status)}
              </Text>
            </View>
            <Text style={styles.planText}>
              {getPlanText(subscriptionStatus.plan)}
            </Text>
          </View>

          {subscriptionStatus.message && (
            <View style={styles.messageContainer}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.messageText}>{subscriptionStatus.message}</Text>
            </View>
          )}
        </View>

        {/* Subscription Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalles de la Suscripción</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>
              {getPlanText(subscriptionStatus.plan)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(subscriptionStatus.status) }]}>
              {getStatusText(subscriptionStatus.status)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Inicio</Text>
            <Text style={styles.detailValue}>
              {formatDate(subscriptionStatus.startDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Vencimiento</Text>
            <Text style={styles.detailValue}>
              {formatDate(subscriptionStatus.endDate)}
            </Text>
          </View>

          {subscriptionStatus.daysRemaining !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Días Restantes</Text>
              <Text style={[
                styles.detailValue,
                { color: subscriptionStatus.daysRemaining <= 7 ? '#FF4444' : COLORS.primary }
              ]}>
                {subscriptionStatus.daysRemaining} días
              </Text>
            </View>
          )}
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Beneficios de tu Suscripción</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>Acceso a todas las propiedades</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>Contacto directo con propietarios</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>Notificaciones de nuevas propiedades</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>Soporte prioritario</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!subscriptionStatus.isActive && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRenewSubscription}
            >
              <Ionicons name="card" size={24} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>
                {subscriptionStatus.status === 'expired' ? 'Renovar Suscripción' : 'Suscribirse'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(agent)/subscription')}
          >
            <Ionicons name="list" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Ver Planes</Text>
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
  content: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
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
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
  },
  planText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  messageText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
    flex: 1,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  detailValue: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  secondaryButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AgentSubscriptionStatusScreen;
