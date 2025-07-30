import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { StripeService, SubscriptionPlan } from '../../services/stripeService';
import { CardForm } from '@stripe/stripe-react-native';
import { useStripePayment } from '../../services/stripeService';
import TestCardInfo from '../../components/TestCardInfo';
import { supabase } from '../../services/supabase';

const PaymentScreen = () => {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [cardholderName, setCardholderName] = useState('');
  const plan = StripeService.getPlanById(planId || '');
  const isTestMode = StripeService.isTestMode();
  const { processPayment } = useStripePayment();

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plan no encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const sendConfirmationEmail = async (email: string, planName: string, amount: number, customerId: string) => {
    try {
      const response = await fetch('https://mina-app-ten.vercel.app/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          planName,
          amount,
          customerId,
        }),
      });

      if (response.ok) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send confirmation email');
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete || !cardholderName) {
      Alert.alert('Error', 'Por favor completa todos los campos y los datos de la tarjeta');
      return;
    }
    setLoading(true);
    try {
      // 1. Create payment intent
      const result = await StripeService.createPaymentIntent(planId);
      console.log('✅ Payment intent created:', result);
      
      // 2. Process payment with Stripe SDK
      const paymentResult = await processPayment(planId, result.clientSecret, cardDetails);
      
      if (paymentResult.error) {
        console.error('❌ Payment failed:', paymentResult.error);
        const errorMessage = (paymentResult.error as any)?.message || String(paymentResult.error) || 'No se pudo procesar el pago';
        Alert.alert('Error de Pago', errorMessage);
        return;
      }

      if (paymentResult.success && paymentResult.paymentIntent && String(paymentResult.paymentIntent.status) === 'succeeded') {
        // 3. Update user subscription in database
        const { data: { user } } = await supabase.auth.getUser();
        let dbError = null;
        if (user) {
          const { error } = await supabase
            .from('agents')
            .update({
              subscription_plan: planId,
              subscription_status: 'active',
              subscription_start_date: new Date().toISOString(),
              stripe_customer_id: result.customerId,
            })
            .eq('id', user.id);
          if (error) {
            dbError = error;
            console.error('❌ Error actualizando la base de datos:', error);
          } else {
            // 4. Send confirmation email
            await sendConfirmationEmail(
              user.email || 'test@example.com',
              plan.name,
              plan.price,
              result.customerId
            );
          }
        }
        Alert.alert(
          '¡Pago Exitoso!',
          dbError
            ? 'El pago fue exitoso, pero hubo un problema actualizando tu suscripción. Por favor contacta soporte.'
            : 'Tu suscripción ha sido activada correctamente.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(agent)/agent-registration'),
            },
          ]
        );
        return;
      }

      // Only show error if payment was not successful and not already handled
      Alert.alert('Error', 'No se pudo procesar el pago.');
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      Alert.alert('Error', error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Información de Pago</Text>
        </View>

        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>
            {StripeService.formatPrice(plan.price)} MXN / {plan.period}
          </Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        {/* Test Mode Indicator */}
        {isTestMode && (
          <View style={styles.testModeIndicator}>
            <Ionicons name="flask" size={16} color={COLORS.secondary} />
            <Text style={styles.testModeText}>MODO PRUEBA</Text>
          </View>
        )}

        {/* Payment Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Datos de la Tarjeta</Text>

          {/* Cardholder Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre del Titular</Text>
            <TextInput
              style={styles.input}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="Nombre como aparece en la tarjeta"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Stripe CardForm */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Datos de la Tarjeta</Text>
            <CardForm
              onFormComplete={setCardDetails}
              style={{ width: '100%', height: 180, marginVertical: 0 }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.gray,
                fontSize: 16,
              }}
            />
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
            <Text style={styles.securityText}>
              Tus datos están protegidos con encriptación SSL
            </Text>
          </View>

          {/* Stripe Branding */}
          <View style={styles.stripeBranding}>
            <Text style={styles.stripeText}>Pago seguro procesado por</Text>
            <View style={styles.stripeLogoContainer}>
              <Text style={styles.stripeLogo}>stripe</Text>
            </View>
          </View>

          {/* Test Card Info - Only show in test mode */}
          {isTestMode && <TestCardInfo />}
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="card" size={24} color={COLORS.white} />
              <Text style={styles.payButtonText}>
                Pagar {StripeService.formatPrice(plan.price)} MXN
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Skip Payment Button for testing */}
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: COLORS.gray, marginTop: 16 }]}
          onPress={() => {
            Alert.alert(
              '¡Pago simulado!',
              'Has saltado el pago para pruebas.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(agent)/agent-registration'),
                },
              ]
            );
          }}
        >
          <Ionicons name="play-forward" size={24} color={COLORS.white} />
          <Text style={styles.payButtonText}>Saltar Pago (Pruebas)</Text>
        </TouchableOpacity>

        {/* Simple Test Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: COLORS.secondary, marginTop: 16 }]}
          onPress={async () => {
            try {
              setLoading(true);
              // Simulate a successful payment without Stripe SDK
              const result = await StripeService.createPaymentIntent(planId);
              console.log('✅ Test payment intent created:', result);
              
              // Simulate successful payment
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { error } = await supabase
                  .from('agents')
                  .update({
                    subscription_plan: planId,
                    subscription_status: 'active',
                    subscription_start_date: new Date().toISOString(),
                    stripe_customer_id: result.customerId,
                  })
                  .eq('id', user.id);
                if (error) {
                  console.error('❌ Database update error:', error);
                } else {
                  // Send confirmation email for test payment
                  await sendConfirmationEmail(
                    user.email || 'test@example.com',
                    plan.name,
                    plan.price,
                    result.customerId
                  );
                }
              }
              
              Alert.alert(
                '¡Pago de Prueba Exitoso!',
                'Suscripción activada sin procesar tarjeta.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(agent)/agent-registration'),
                  },
                ]
              );
            } catch (error) {
              console.error('❌ Test payment error:', error);
              Alert.alert('Error', 'Error en pago de prueba');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Ionicons name="card-outline" size={24} color={COLORS.white} />
          <Text style={styles.payButtonText}>Pago de Prueba (Sin SDK)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  planSummary: {
    backgroundColor: COLORS.secondary,
    margin: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  planName: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
  },
  testModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 154, 51, 0.1)',
    paddingVertical: 8,
    marginHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  testModeText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  formContainer: {
    padding: 24,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 12,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  securityText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 8,
  },
  stripeBranding: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  stripeText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  stripeLogoContainer: {
    backgroundColor: '#6772E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stripeLogo: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 20,
  },
  backButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default PaymentScreen; 

// Hide the default navigation header
export const options = {
  headerShown: false,
}; 