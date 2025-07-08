import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { agentService } from '../../services/databaseService';
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

// Mexican states data
const estados = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

interface DropdownProps {
  label: string;
  value: string | null;
  items: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  style?: any;
}

const Dropdown = ({ label, value, items, onChange, disabled = false, style }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled, style]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownInput, disabled && styles.dropdownInputDisabled]}>
          {value || 'Selecciona'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={disabled ? COLORS.gray : COLORS.black} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const AgentRegistrationScreen = () => {
  // Local state for form fields
  const [cp, setCp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [experience, setExperience] = useState('');
  const [propertiesSold, setPropertiesSold] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPais, setSelectedPais] = useState<string>('México');
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<number | null>(null);
  const [worksAtAgency, setWorksAtAgency] = useState(false);
  const [notWorksAtAgency, setNotWorksAtAgency] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleAgencySelection = (isYes: boolean) => {
    setWorksAtAgency(isYes);
    setNotWorksAtAgency(!isYes);
  };

  const validateFields = () => {
    const requiredFields = {
      cp: cp.trim(),
      municipio: municipio.trim(),
      selectedEstado: selectedEstado,
      experience: experience.trim(),
      propertiesSold: propertiesSold.trim(),
      selectedCommission: selectedCommission,
      description: description.trim(),
      // colonia and calle are optional
    };
    const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value || value === '');
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(([key]) => key),
    };
  };

  const getInputStyle = (fieldName: string) => {
    const validation = validateFields();
    const isMissing = validation.missingFields.includes(fieldName);
    return [
      styles.input,
      showValidation && isMissing && styles.inputError
    ];
  };

  const handleContinue = async () => {
    const validation = validateFields();
    if (!validation.isValid) {
      setShowValidation(true);
      Alert.alert(
        'Campos Requeridos',
        'Por favor, completa todos los campos obligatorios marcados en rojo.',
        [{ text: 'OK' }]
      );
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Update agent profile with additional information
      const { error: updateError } = await agentService.updateAgent(user.id, {
        postal_code: cp,
        municipality: municipio,
        street: calle,
        neighborhood: colonia,
        experience_years: experience ? parseInt(experience) : undefined,
        properties_sold: propertiesSold ? parseInt(propertiesSold) : undefined,
        country: selectedPais,
        state: selectedEstado || undefined,
        commission_percentage: selectedCommission || undefined,
        works_at_agency: worksAtAgency,
        agency_name: agencyName || undefined,
        description: description || undefined,
      });

      if (updateError) {
        throw updateError;
      }

      // Navigate to submission screen
      router.replace('/(agent)/submission');
    } catch (error: any) {
      console.error('Error updating agent:', error);
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error al actualizar el perfil'
      );
    } finally {
      setLoading(false);
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
          Es momento de
        </Text>
        <Text style={styles.subtitle}>
          CRECER tu CARTERA
        </Text>
        <Text style={styles.subtitle2}>
          de propiedades
        </Text>

        <Text style={styles.sectionTitle}>
          Que zona quieres trabajar?
        </Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código Postal:</Text>
            <TextInput
              style={getInputStyle('cp')}
              value={cp}
              onChangeText={setCp}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainerSmall}>
            <Dropdown
              label="País:"
              value={selectedPais}
              items={['México']}
              onChange={setSelectedPais}
              disabled={true}
              style={styles.dropdown}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Dropdown
              label="Estado: *"
              value={selectedEstado}
              items={estados}
              onChange={setSelectedEstado}
              style={showValidation && !selectedEstado ? styles.dropdownMatchInput : null}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Alcaldía o municipio:</Text>
            <TextInput
              style={getInputStyle('municipio')}
              value={municipio}
              onChangeText={setMunicipio}
              placeholder="Ingresa tu alcaldía o municipio"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Colonia:</Text>
            <TextInput
              style={getInputStyle('colonia')}
              value={colonia}
              onChangeText={setColonia}
              placeholder="Ingresa tu colonia"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Calle:</Text>
            <TextInput
              style={getInputStyle('calle')}
              value={calle}
              onChangeText={setCalle}
              placeholder="Ingresa tu calle"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>¿Cuántos años tienes de experiencia?</Text>
            <TextInput
              style={getInputStyle('experience')}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
              placeholder="Ej: 3"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>¿Propiedades vendidas?</Text>
            <TextInput
              style={getInputStyle('propertiesSold')}
              value={propertiesSold}
              onChangeText={setPropertiesSold}
              keyboardType="numeric"
              placeholder="Ej: 15"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>¿Con qué porcentaje de comisión trabajas?</Text>
        <View style={styles.percentButtonRow}>
          {[4, 5, 6].map((percent) => (
            <TouchableOpacity
              key={percent}
              style={[
                styles.typeButton,
                selectedCommission === percent && styles.typeButtonSelected
              ]}
              onPress={() => setSelectedCommission(percent)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedCommission === percent && styles.typeButtonTextSelected
                ]}
              >
                {percent}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitleSmall}>¿Trabajas en alguna inmobiliaria?</Text>
        <View style={styles.agencyContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleAgencySelection(true)}
          >
            <View style={[
              styles.checkbox,
              worksAtAgency && styles.checkboxSelected
            ]}>
              {worksAtAgency && (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>SI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleAgencySelection(false)}
          >
            <View style={[
              styles.checkbox,
              notWorksAtAgency && styles.checkboxSelected
            ]}>
              {notWorksAtAgency && (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>No</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            <Text style={styles.checkboxLabel}>¿Cual?</Text>
            <TextInput
              style={styles.agencyInput}
              value={agencyName}
              onChangeText={setAgencyName}
              editable={worksAtAgency}
              placeholderTextColor="rgba(0,0,0,0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>Deja una breve descripción de ti y tu trabajo.</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Respuesta abierta"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
        />

        <TouchableOpacity
          style={[
            styles.registerButton,
            loading && styles.registerButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Guardando...' : 'Registrarme'}
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
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle2: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
  },
  sectionTitleSmall: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  inputContainerSmall: {
    flex: 1,
    maxWidth: width * 0.45,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 6,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    ...FONTS.regular,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  dropdownInput: {
    flex: 1,
    padding: 6,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownButton: {
    padding: 6,
  },
  percentButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  typeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  typeButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
    elevation: 6,
    transform: [{ scale: 1.08 }],
  },
  typeButtonText: {
    ...FONTS.title,
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: COLORS.white,
    textShadowColor: 'transparent',
  },
  agencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkboxLabel: {
    ...FONTS.regular,
    color: COLORS.white,
  },
  agencyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 6,
    fontSize: 14,
    color: COLORS.black,
    width: 120,
    marginLeft: 8,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 8,
    fontSize: 14,
    color: COLORS.black,
    height: 100,
    textAlignVertical: 'top',
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 32,
    width: width * 0.8,
    alignSelf: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 8,
    width: width * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.black,
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.gray,
  },
  dropdownInputDisabled: {
    color: COLORS.gray,
  },
  dropdownMatchInput: {
    borderColor: '#FF4444',
  },
  inputError: {
    borderColor: '#FF4444',
  },
});

export default AgentRegistrationScreen; 