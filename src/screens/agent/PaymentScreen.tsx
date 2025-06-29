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

const PaymentScreen = () => {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const plan = StripeService.getPlanById(planId || '');

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

  const handlePayment = async () => {
    if (!cardNumber || !expMonth || !expYear || !cvc || !cardholderName) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = await StripeService.processPayment(planId, {
        number: cardNumber,
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        cvc: cvc,
      });

      if (result.success) {
        Alert.alert(
          '¡Pago Exitoso!',
          'Tu suscripción ha sido activada correctamente.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(agent)/agent-registration'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
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
            {StripeService.formatPrice(plan.price)} / {plan.period}
          </Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

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

          {/* Card Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número de Tarjeta</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Expiry and CVC */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Mes</Text>
              <TextInput
                style={styles.input}
                value={expMonth}
                onChangeText={setExpMonth}
                placeholder="MM"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Año</Text>
              <TextInput
                style={styles.input}
                value={expYear}
                onChangeText={setExpYear}
                placeholder="YY"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.input}
                value={cvc}
                onChangeText={setCvc}
                placeholder="123"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
            <Text style={styles.securityText}>
              Tus datos están protegidos con encriptación SSL
            </Text>
          </View>
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
                Pagar {StripeService.formatPrice(plan.price)}
              </Text>
            </>
          )}
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