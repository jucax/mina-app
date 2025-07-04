import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { agentService, userAuthService } from '../../services/databaseService';
import { supabase } from '../../services/supabase';
import { Agent } from '../../types/database';
import { StripeService, subscriptionPlans } from '../../services/stripeService';

const { width, height } = Dimensions.get('window');

const AgentSubscriptionScreen = () => {
  const params = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Por favor selecciona un plan de suscripción');
      return;
    }

    // Navigate to payment screen with selected plan
    router.push({
      pathname: '/(agent)/payment',
      params: { planId: selectedPlan }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(general)/login');
          }
        }}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Elige tu plan de
        </Text>
        <Text style={styles.subtitle}>
          SUSCRIPCIÓN
        </Text>

        <Text style={styles.description}>
          Selecciona el plan que mejor se adapte a tus necesidades
        </Text>

        {/* Features Square - Top */}
        <View style={styles.featuresSquare}>
          <Text style={styles.featuresTitle}>Incluye en todos los planes:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Acceso a todas las propiedades</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Contacto directo con propietarios</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Notificaciones de nuevas propiedades</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Soporte prioritario</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Dashboard personalizado</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>Reportes de actividad</Text>
            </View>
          </View>
        </View>

        {/* Plan Selection - 2-1 Layout */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Selecciona tu plan:</Text>
          
          {/* First Row - 2 plans */}
          <View style={styles.plansRow}>
            {subscriptionPlans.slice(0, 2).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planSquare,
                  selectedPlan === plan.id && styles.planSquareSelected
                ]}
                onPress={() => handlePlanSelection(plan.id)}
              >
                <Text style={[
                  styles.planName,
                  selectedPlan === plan.id && styles.planNameSelected
                ]}>
                  {plan.name}
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === plan.id && styles.planPriceSelected
                ]}>
                  {StripeService.formatPrice(plan.price)}
                </Text>
                <Text style={[
                  styles.planPeriod,
                  selectedPlan === plan.id && styles.planPeriodSelected
                ]}>
                  /{plan.period}
                </Text>
                
                {selectedPlan === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Second Row - 1 plan */}
          <View style={styles.plansRow}>
            <View style={styles.singlePlanContainer}>
              <TouchableOpacity
                style={[
                  styles.planSquare,
                  selectedPlan === subscriptionPlans[2].id && styles.planSquareSelected
                ]}
                onPress={() => handlePlanSelection(subscriptionPlans[2].id)}
              >
                <Text style={[
                  styles.planName,
                  selectedPlan === subscriptionPlans[2].id && styles.planNameSelected
                ]}>
                  {subscriptionPlans[2].name}
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === subscriptionPlans[2].id && styles.planPriceSelected
                ]}>
                  {StripeService.formatPrice(subscriptionPlans[2].price)}
                </Text>
                <Text style={[
                  styles.planPeriod,
                  selectedPlan === subscriptionPlans[2].id && styles.planPeriodSelected
                ]}>
                  /{subscriptionPlans[2].period}
                </Text>
                
                {selectedPlan === subscriptionPlans[2].id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPlan || loading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Continuando...' : 'Continuar al Pago'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.termsButton}>
          <Text style={styles.termsText}>
            CONSULTA TÉRMINOS Y CONDICIONES
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  logo: {
    height: 40,
    marginTop: 32,
    alignSelf: 'center',
  },
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 32,
  },
  subtitle: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  featuresSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuresTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 12,
  },
  plansContainer: {
    marginBottom: 32,
  },
  plansTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  singlePlanContainer: {
    flex: 1,
    alignItems: 'center',
  },
  planSquare: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 120,
  },
  planSquareSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.white,
  },
  planName: {
    ...FONTS.title,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planNameSelected: {
    color: COLORS.white,
  },
  planPrice: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  planPriceSelected: {
    color: COLORS.white,
  },
  planPeriod: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  planPeriodSelected: {
    color: COLORS.white,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  termsButton: {
    alignSelf: 'center',
  },
  termsText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '300',
    letterSpacing: 1.1,
  },
});

export default AgentSubscriptionScreen; 