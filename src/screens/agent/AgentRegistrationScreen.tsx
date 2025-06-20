import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

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
}

const Dropdown = ({ label, value, items, onChange, disabled = false }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
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
  const [notWorksAtAgency, setNotWorksAtAgency] = useState(false);

  const handleAgencySelection = (isYes: boolean) => {
    setWorksAtAgency(isYes);
    setNotWorksAtAgency(!isYes);
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
              style={styles.input}
              value={cp}
              onChangeText={setCp}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <Dropdown
              label="País:"
              value={selectedPais}
              items={['México']}
              onChange={setSelectedPais}
              disabled={true}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Dropdown
              label="Estado:"
              value={selectedEstado}
              items={estados}
              onChange={setSelectedEstado}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Alcaldía o municipio:</Text>
            <TextInput
              style={styles.input}
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
              style={styles.input}
              value={colonia}
              onChangeText={setColonia}
              placeholder="Ingresa tu colonia"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Calle:</Text>
            <TextInput
              style={styles.input}
              value={calle}
              onChangeText={setCalle}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>¿Cuántos años tienes de experiencia?</Text>
            <TextInput
              style={styles.input}
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
              style={styles.input}
              value={propertiesSold}
              onChangeText={setPropertiesSold}
              keyboardType="numeric"
              placeholder="Ej: 15"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Con qué porcentaje de comisión trabajas?
        </Text>

        <View style={styles.commissionContainer}>
          {[4, 5, 6].map((percent) => (
            <TouchableOpacity
              key={percent}
              style={[
                styles.commissionButton,
                selectedCommission === percent && styles.commissionButtonSelected
              ]}
              onPress={() => setSelectedCommission(percent)}
            >
              <Text style={[
                styles.commissionButtonText,
                selectedCommission === percent && styles.commissionButtonTextSelected
              ]}>
                {percent}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          ¿Trabajas en alguna inmobiliaria?
        </Text>

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

          {worksAtAgency && (
            <View style={styles.agencyInputContainer}>
              <Text style={styles.checkboxLabel}>¿Cual?</Text>
              <TextInput
                style={styles.agencyInput}
                value={agencyName}
                onChangeText={setAgencyName}
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Deja una breve descripción de ti y tu trabajo.
        </Text>

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Respuesta abierta"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/(agent)/submission')}
        >
          <Text style={styles.registerButtonText}>Registrarme</Text>
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
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle2: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
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
  commissionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  commissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    marginHorizontal: 8,
  },
  commissionButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  commissionButtonText: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  commissionButtonTextSelected: {
    color: COLORS.white,
  },
  agencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  agencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default AgentRegistrationScreen; 