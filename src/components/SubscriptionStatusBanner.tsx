import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../styles/globalStyles';
import { SubscriptionValidity } from '../services/subscriptionService';

interface SubscriptionStatusBannerProps {
  subscriptionValidity: SubscriptionValidity | null;
  onRenew: () => void;
}

export const SubscriptionStatusBanner: React.FC<SubscriptionStatusBannerProps> = ({
  subscriptionValidity,
  onRenew,
}) => {
  if (!subscriptionValidity || !subscriptionValidity.is_valid) {
    return null;
  }

  const getBannerStyle = () => {
    if (!subscriptionValidity.is_valid) {
      return styles.expiredBanner;
    } else if (subscriptionValidity.days_remaining <= 7) {
      return styles.warningBanner;
    } else {
      return styles.infoBanner;
    }
  };

  const getIcon = () => {
    if (!subscriptionValidity.is_valid) {
      return 'alert-circle';
    } else if (subscriptionValidity.days_remaining <= 7) {
      return 'warning';
    } else {
      return 'information-circle';
    }
  };

  const getMessage = () => {
    if (!subscriptionValidity.is_valid) {
      return 'Tu suscripción ha expirado. Por favor, renueva tu plan para continuar usando la aplicación.';
    } else if (subscriptionValidity.days_remaining <= 7) {
      return `Tu suscripción ${subscriptionValidity.plan_type} expira en ${subscriptionValidity.days_remaining} días. Considera renovar pronto.`;
    } else {
      return `Tu suscripción ${subscriptionValidity.plan_type} está activa.`;
    }
  };

  return (
    <View style={[styles.banner, getBannerStyle()]}>
      <Ionicons 
        name={getIcon()} 
        size={20} 
        color={COLORS.white} 
      />
      <Text style={styles.bannerText}>
        {getMessage()}
      </Text>
      <TouchableOpacity
        style={styles.renewButton}
        onPress={onRenew}
      >
        <Text style={styles.renewButtonText}>
          {!subscriptionValidity.is_valid ? 'Renovar' : 'Ver Planes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  expiredBanner: {
    backgroundColor: '#FF4444',
  },
  warningBanner: {
    backgroundColor: '#FF9500',
  },
  infoBanner: {
    backgroundColor: COLORS.secondary,
  },
  bannerText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
    marginLeft: 8,
  },
  renewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  renewButtonText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default SubscriptionStatusBanner;
