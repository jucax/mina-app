import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const TestCardInfo = () => {
  const testCards = [
    { number: '4242 4242 4242 4242', description: 'Pago exitoso' },
    { number: '4000 0000 0000 0002', description: 'Tarjeta rechazada' },
    { number: '4000 0000 0000 9995', description: 'Fondos insuficientes' },
    { number: '4000 0025 0000 3155', description: 'Requiere autenticación' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
        <Text style={styles.title}>Tarjetas de Prueba</Text>
      </View>
      
      {testCards.map((card, index) => (
        <View key={index} style={styles.cardRow}>
          <Text style={styles.cardNumber}>{card.number}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
        </View>
      ))}
      
      <Text style={styles.note}>
        CVC: cualquier 3 dígitos | Expiración: cualquier fecha futura
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  cardDescription: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  note: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default TestCardInfo; 