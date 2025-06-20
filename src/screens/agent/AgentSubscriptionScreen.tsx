import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SubscriptionCardProps {
  title: string;
  price: string;
  selected: boolean;
  onPress: () => void;
}

const SubscriptionCard = ({ title, price, selected, onPress }: SubscriptionCardProps) => {
  const cardWidth = width * 0.4;
  
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardPrice}>{price}</Text>
      <Text style={styles.cardCurrency}>MXN</Text>
      <TouchableOpacity
        style={[
          styles.cardButton,
          selected && styles.cardButtonSelected
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.cardButtonText,
          selected && styles.cardButtonTextSelected
        ]}>
          {selected ? 'Seleccionado' : 'Seleccionar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const AgentSubscriptionScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>
            Elige el pago que
          </Text>
          <Text style={styles.subtitle}>
            se adapte a ti
          </Text>

          <Text style={styles.sectionTitle}>SUSCRIPCIONES</Text>

          <View style={styles.cardsContainer}>
            <View style={styles.cardsRow}>
              <SubscriptionCard
                title="Mensual"
                price="$1,000"
                selected={selectedIndex === 0}
                onPress={() => setSelectedIndex(0)}
              />
              <SubscriptionCard
                title="Semestral"
                price="$5,400"
                selected={selectedIndex === 1}
                onPress={() => setSelectedIndex(1)}
              />
            </View>
            <View style={styles.cardsRow}>
              <SubscriptionCard
                title="Anual"
                price="$9,600"
                selected={selectedIndex === 2}
                onPress={() => setSelectedIndex(2)}
              />
            </View>
          </View>

          <Text style={styles.termsText}>
            CONSULTA TERMINOS Y CONDICIONES
          </Text>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedIndex === null && styles.disabledButton
            ]}
            onPress={() => {
              if (selectedIndex !== null) {
                router.push('/(agent)/agent-registration');
              }
            }}
            disabled={selectedIndex === null}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingTop: height * 0.03,
    paddingBottom: height * 0.04,
  },
  logo: {
    height: height * 0.05,
    alignSelf: 'center',
    marginTop: 60,
    marginBottom: height * 0.04,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.white,
    textAlign: 'center',
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: height * 0.03,
    marginLeft: width * 0.08,
  },
  cardsContainer: {
    marginTop: height * 0.03,
    paddingHorizontal: width * 0.02,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  card: {
    marginHorizontal: width * 0.02,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.01,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: 'center',
  },
  cardTitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardPrice: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: height * 0.01,
  },
  cardCurrency: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    marginTop: height * 0.002,
  },
  cardButton: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: height * 0.012,
    marginTop: height * 0.01,
  },
  cardButtonSelected: {
    backgroundColor: COLORS.secondary,
  },
  cardButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardButtonTextSelected: {
    color: COLORS.white,
  },
  termsText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '300',
    letterSpacing: 1.1,
    textAlign: 'center',
    marginTop: height * 0.04,
    marginBottom: height * 0.015,
  },
  continueButton: {
    width: width * 0.8,
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: height * 0.02,
    alignSelf: 'center',
  },
  continueButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
});

export default AgentSubscriptionScreen; 