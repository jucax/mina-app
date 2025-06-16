import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const OwnerIntentSelectionScreen = () => {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  const intents = [
    {
      id: 'sell',
      title: 'Vender',
      description: 'Quiero vender mi propiedad',
      icon: 'cash',
    },
    {
      id: 'rent',
      title: 'Rentar',
      description: 'Quiero rentar mi propiedad',
      icon: 'home',
    },
    {
      id: 'both',
      title: 'Ambos',
      description: 'Quiero vender o rentar mi propiedad',
      icon: 'swap-horizontal',
    },
  ];

  const handleContinue = () => {
    if (selectedIntent) {
      router.push({
        pathname: '/(owner)/property/price',
        params: { intent: selectedIntent }
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>¿Qué te gustaría hacer con tu propiedad?</Text>
        <Text style={styles.subtitle}>
          Selecciona la opción que mejor se adapte a tus necesidades
        </Text>

        <View style={styles.intentsContainer}>
          {intents.map((intent) => (
            <TouchableOpacity
              key={intent.id}
              style={[
                styles.intentCard,
                selectedIntent === intent.id && styles.selectedIntentCard,
              ]}
              onPress={() => setSelectedIntent(intent.id)}
            >
              <View style={styles.intentIconContainer}>
                <Ionicons
                  name={intent.icon as any}
                  size={32}
                  color={selectedIntent === intent.id ? COLORS.white : COLORS.primary}
                />
              </View>
              <View style={styles.intentTextContainer}>
                <Text
                  style={[
                    styles.intentTitle,
                    selectedIntent === intent.id && styles.selectedIntentText,
                  ]}
                >
                  {intent.title}
                </Text>
                <Text
                  style={[
                    styles.intentDescription,
                    selectedIntent === intent.id && styles.selectedIntentText,
                  ]}
                >
                  {intent.description}
                </Text>
              </View>
              {selectedIntent === intent.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedIntent && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedIntent}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 120,
    height: 40,
    marginLeft: 16,
  },
  title: {
    ...FONTS.title,
    fontSize: 28,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  intentsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  selectedIntentCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  intentTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.black,
  },
  intentDescription: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  selectedIntentText: {
    color: COLORS.white,
  },
  checkmarkContainer: {
    marginLeft: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default OwnerIntentSelectionScreen; 