import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PropertyCompensationScreen = () => {
  const [compensation, setCompensation] = useState('');
  const [comments, setComments] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.sectionTitle}>
          Compensación:
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>¿Cuánto esperas recibir por tu propiedad?</Text>
          <TextInput
            style={styles.input}
            value={compensation}
            onChangeText={setCompensation}
            keyboardType="numeric"
            placeholder="Ingresa el monto"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Comentarios adicionales:
        </Text>

        <TextInput
          style={styles.textArea}
          value={comments}
          onChangeText={setComments}
          placeholder="Escribe aquí tus comentarios"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(owner)/home')}
        >
          <Text style={styles.continueButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
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
    padding: 24,
  },
  logo: {
    height: 40,
    marginTop: 32,
    alignSelf: 'center',
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    height: 120,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    marginTop: 32,
    marginBottom: 32,
    alignSelf: 'center',
  },
  continueButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 16,
  },
});

export default PropertyCompensationScreen; 