import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useAgentForm } from '../../contexts/AgentFormContext';

const { width, height } = Dimensions.get('window');

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: '$299',
    period: 'mes',
    features: [
      'Acceso a 50 propiedades',
      'Contacto directo con propietarios',
      'Notificaciones de nuevas propiedades',
      'Soporte por email'
    ],
    description: 'Perfecto para comenzar en el mercado inmobiliario'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$599',
    period: 'mes',
    features: [
      'Acceso ilimitado a propiedades',
      'Contacto directo con propietarios',
      'Notificaciones prioritarias',
      'Soporte telefónico',
      'Estadísticas avanzadas',
      'Perfil destacado'
    ],
    description: 'Ideal para agentes experimentados'
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: '$999',
    period: 'mes',
    features: [
      'Todo lo de Premium',
      'Múltiples usuarios',
      'API de integración',
      'Soporte 24/7',
      'Capacitación personalizada',
      'Reportes personalizados'
    ],
    description: 'Para agencias y equipos grandes'
  }
];

const AgentSubscriptionScreen = () => {
  const { formData, updateFormData } = useAgentForm();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(formData.subscription_plan || null);

  const handleContinue = () => {
    if (selectedPlan) {
      // Save subscription plan to context
      updateFormData({
        subscription_plan: selectedPlan as 'basic' | 'premium' | 'enterprise'
      });
      
      router.push('/(agent)/agent-registration');
    }
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

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <Text style={[
                  styles.planName,
                  selectedPlan === plan.id && styles.planNameSelected
                ]}>
                  {plan.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[
                    styles.price,
                    selectedPlan === plan.id && styles.priceSelected
                  ]}>
                    {plan.price}
                  </Text>
                  <Text style={[
                    styles.period,
                    selectedPlan === plan.id && styles.periodSelected
                  ]}>
                    /{plan.period}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.planDescription,
                selectedPlan === plan.id && styles.planDescriptionSelected
              ]}>
                {plan.description}
              </Text>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={selectedPlan === plan.id ? COLORS.white : COLORS.secondary}
                    />
                    <Text style={[
                      styles.featureText,
                      selectedPlan === plan.id && styles.featureTextSelected
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
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
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  planNameSelected: {
    color: COLORS.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  priceSelected: {
    color: COLORS.white,
  },
  period: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  periodSelected: {
    color: COLORS.white,
  },
  planDescription: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 16,
  },
  planDescriptionSelected: {
    color: COLORS.white,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  featureTextSelected: {
    color: COLORS.white,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    alignSelf: 'center',
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
});

export default AgentSubscriptionScreen; 