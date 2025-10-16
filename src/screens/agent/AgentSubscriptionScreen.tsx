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
const isTablet = width >= 768; // iPad starts at 768px width

// Prices without IVA for display purposes
const displayPrices = {
  mensual: 500,
  semestral: 2500,
  anual: 4500
};

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

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>CRECER tu CARTERA</Text>
          <Text style={styles.subtitle}>
            Accede a todas las propiedades disponibles y conecta directamente con propietarios
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="home" size={20} color={COLORS.secondary} />
            <Text style={styles.featureText}>Acceso a todas las propiedades</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="call" size={20} color={COLORS.secondary} />
            <Text style={styles.featureText}>Contacto directo con propietarios</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="notifications" size={20} color={COLORS.secondary} />
            <Text style={styles.featureText}>Notificaciones de nuevas propiedades</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="headset" size={20} color={COLORS.secondary} />
            <Text style={styles.featureText}>Soporte prioritario</Text>
          </View>
        </View>

        {/* Plan Selection - Responsive Layout */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Selecciona tu plan:</Text>
          
          {isTablet ? (
            /* Single Row - All 3 plans with equal spacing (Tablet) */
            <View style={styles.plansRow}>
              {subscriptionPlans.map((plan) => (
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
                    {StripeService.formatPrice(displayPrices[plan.id as keyof typeof displayPrices])}
                  </Text>
                  <Text style={[
                    styles.planPeriod,
                    selectedPlan === plan.id && styles.planPeriodSelected
                  ]}>
                    /{plan.period}
                  </Text>
                  <Text style={[
                    styles.planIVA,
                    selectedPlan === plan.id && styles.planIVASelected
                  ]}>
                    No incluye IVA
                  </Text>
                  
                  {selectedPlan === plan.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Two Row Layout (Phone) */
            <View style={styles.plansGrid}>
              {/* First Row - Mensual and Semestral */}
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
                      {StripeService.formatPrice(displayPrices[plan.id as keyof typeof displayPrices])}
                    </Text>
                    <Text style={[
                      styles.planPeriod,
                      selectedPlan === plan.id && styles.planPeriodSelected
                    ]}>
                      /{plan.period}
                    </Text>
                    <Text style={[
                      styles.planIVA,
                      selectedPlan === plan.id && styles.planIVASelected
                    ]}>
                      No incluye IVA
                    </Text>
                    
                    {selectedPlan === plan.id && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Second Row - Anual (centered) */}
              <View style={styles.plansRow}>
                <View style={styles.centeredPlanContainer}>
                  <TouchableOpacity
                    style={[
                      styles.planSquare,
                      selectedPlan === 'anual' && styles.planSquareSelected
                    ]}
                    onPress={() => handlePlanSelection('anual')}
                  >
                    <Text style={[
                      styles.planName,
                      selectedPlan === 'anual' && styles.planNameSelected
                    ]}>
                      {subscriptionPlans[2].name}
                    </Text>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === 'anual' && styles.planPriceSelected
                    ]}>
                      {StripeService.formatPrice(displayPrices.anual)}
                    </Text>
                    <Text style={[
                      styles.planPeriod,
                      selectedPlan === 'anual' && styles.planPeriodSelected
                    ]}>
                      /{subscriptionPlans[2].period}
                    </Text>
                    <Text style={[
                      styles.planIVA,
                      selectedPlan === 'anual' && styles.planIVASelected
                    ]}>
                      No incluye IVA
                    </Text>
                    
                    {selectedPlan === 'anual' && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan}
        >
          <Text style={styles.continueButtonText}>
            Continuar
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <TouchableOpacity style={styles.termsButton}>
          <Text style={styles.termsText}>Términos y Condiciones</Text>
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
  logo: {
    height: 40,
    marginTop: 42,
    marginBottom: 24,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SIZES.margin.large,
  },
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.margin.small,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: SIZES.margin.large,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.medium,
  },
  featureText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: SIZES.margin.medium,
  },
  plansContainer: {
    marginBottom: SIZES.margin.large,
  },
  plansTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.margin.large,
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin.medium,
    paddingHorizontal: 16,
  },
  plansGrid: {
    marginBottom: SIZES.margin.medium,
  },
  planSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: SIZES.padding.medium,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    width: isTablet ? Math.min(width * 0.25, 140) : width * 0.42,
    position: 'relative',
    minHeight: 160,
    justifyContent: 'center',
    flex: 0,
    marginHorizontal: 6,
  },
  centeredPlanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  planNameSelected: {
    color: COLORS.white,
  },
  planPrice: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPriceSelected: {
    color: COLORS.white,
  },
  planPeriod: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  planPeriodSelected: {
    color: COLORS.white,
  },
  planIVA: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.7,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  planIVASelected: {
    color: COLORS.white,
    opacity: 0.9,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
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
