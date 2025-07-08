import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width, height } = Dimensions.get('window');
const BUTTON_WIDTH = width * 0.8; // Use 80% of width for all buttons

const timeOptions = [
  'De inmediato',
  '1 a 3 meses',
  '4 meses o mas',
  'En cuanto se pueda',
];

const OwnerIntentSelectionScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [selectedIntent, setSelectedIntent] = useState<string | null>(formData.intent);
  const [selectedTime, setSelectedTime] = useState<string | null>(formData.timeline);

  // Update local state when formData changes (for data persistence)
  useEffect(() => {
    setSelectedIntent(formData.intent);
    setSelectedTime(formData.timeline);
  }, [formData]);

  const intents = [
    {
      id: 'sell',
      title: 'Vender',
      icon: 'cash',
    },
    {
      id: 'rent',
      title: 'Rentar',
      icon: 'home',
    },
    {
      id: 'both',
      title: 'Ambos',
      icon: 'swap-horizontal',
    },
  ];

  const handleContinue = () => {
    if (selectedIntent && selectedTime) {
      // Save to context
      updateFormData({
        intent: selectedIntent as 'sell' | 'rent' | 'both',
        timeline: selectedTime,
      });
      
      router.push({
        pathname: '/(owner)/property/price',
        params: { intent: selectedIntent, when: selectedTime }
      });
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo_login_screen.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Cuando piensas</Text>
          <Text style={styles.titleHighlight}>Vender o Rentar?</Text>
          <Text style={styles.title}>tu propiedad</Text>
        </View>

        <View style={styles.intentsContainer}>
          {intents.map((intent) => (
            <TouchableOpacity
              key={intent.id}
              style={[
                styles.intentCard,
                selectedIntent === intent.id && styles.selectedIntentCard,
              ]}
              onPress={() => {
                setSelectedIntent(intent.id);
                setSelectedTime(null); // reset time when changing intent
              }}
            >
              <Ionicons
                name={intent.icon as any}
                size={24}
                color={selectedIntent === intent.id ? COLORS.white : COLORS.primary}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.intentTitle,
                  selectedIntent === intent.id && styles.selectedIntentText,
                ]}
              >
                {intent.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeOptionsContainer}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.timeOption,
                selectedTime === option && styles.selectedTimeOption,
                !selectedIntent && styles.disabledTimeOption,
              ]}
              onPress={() => selectedIntent && setSelectedTime(option)}
              disabled={!selectedIntent}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  selectedTime === option && styles.selectedTimeOptionText,
                  !selectedIntent && styles.disabledTimeOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedIntent || !selectedTime) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedIntent || !selectedTime}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40, // More space for iPhone camera area
    marginBottom: 40,
    width: '100%',
  },
  logo: {
    height: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 36,
    width: '100%',
  },
  title: {
    ...FONTS.title,
    fontSize: 36,
    color: COLORS.white,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  titleHighlight: {
    ...FONTS.title,
    fontSize: 36,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  intentsContainer: {
    marginBottom: 24,
    width: BUTTON_WIDTH,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  selectedIntentCard: {
    backgroundColor: COLORS.secondary,
  },
  intentTitle: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedIntentText: {
    color: COLORS.white,
  },
  timeOptionsContainer: {
    marginTop: 8,
    width: BUTTON_WIDTH,
    alignSelf: 'center',
  },
  timeOption: {
    backgroundColor: '#E6ECF2',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  selectedTimeOption: {
    backgroundColor: COLORS.secondary,
  },
  timeOptionText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedTimeOptionText: {
    color: COLORS.white,
  },
  disabledTimeOption: {
    opacity: 0.5,
  },
  disabledTimeOptionText: {
    color: COLORS.gray,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    width: BUTTON_WIDTH,
    alignSelf: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  continueButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
});

export default OwnerIntentSelectionScreen; 