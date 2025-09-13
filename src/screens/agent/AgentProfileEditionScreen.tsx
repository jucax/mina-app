import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
// @ts-ignore
//import { Picker } from '@react-native-picker/picker';
//import Dropdown from '../../components/Dropdown';

const { width } = Dimensions.get('window');

interface AgentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  agency_name?: string;
  // subscription_plan?: string; // Removed - column doesn't exist
  avatar_url?: string;
  created_at?: string;
  postal_code?: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  country?: string;
  experience_years?: number;
  properties_sold?: number;
  commission_percentage?: number;
  works_at_agency?: boolean;
  description?: string;
}

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

const AgentProfileEditionScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profileData, setProfileData] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [realEstateAgency, setRealEstateAgency] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [country, setCountry] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [propertiesSold, setPropertiesSold] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('');
  const [worksAtAgency, setWorksAtAgency] = useState<boolean | null>(null);
  const [notWorksAtAgency, setNotWorksAtAgency] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');
  // const [subscriptionPlan, setSubscriptionPlan] = useState(''); // Removed - column doesn't exist

  // const planOptions = []; // Removed - subscription_plan column doesn't exist

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (id) {
          const { data, error } = await supabase
            .from('agents')
            .select('id, full_name, email, phone, agency_name, avatar_url, postal_code, state, municipality, neighborhood, street, country, experience_years, properties_sold, commission_percentage, works_at_agency, description')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Error fetching profile data:', error);
            Alert.alert(
              'Error',
              'No se pudo cargar la información del perfil.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
          }

          setProfileData(data as AgentProfile);
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setRealEstateAgency(data.agency_name || '');
          setPostalCode(data.postal_code || '');
          setState(data.state || '');
          setMunicipality(data.municipality || '');
          setNeighborhood(data.neighborhood || '');
          setStreet(data.street || '');
          setCountry(data.country || '');
          setExperienceYears(data.experience_years?.toString() || '');
          setPropertiesSold(data.properties_sold?.toString() || '');
          setCommissionPercentage(data.commission_percentage?.toString() || '');
          setWorksAtAgency(data.works_at_agency);
          setNotWorksAtAgency(!data.works_at_agency);
          setDescription(data.description || '');
          // setSubscriptionPlan(data.subscription_plan || ''); // Removed - column doesn't exist
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del perfil.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleSave = async () => {
    if (!profileData?.id) return;

    // Basic validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'El teléfono es requerido.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        agency_name: realEstateAgency.trim() || null,
        postal_code: postalCode.trim() || null,
        state: state.trim() || null,
        municipality: municipality.trim() || null,
        neighborhood: neighborhood.trim() || null,
        street: street.trim() || null,
        country: country.trim() || null,
        experience_years: experienceYears.trim() ? parseInt(experienceYears.trim()) : null,
        properties_sold: propertiesSold.trim() ? parseInt(propertiesSold.trim()) : null,
        commission_percentage: commissionPercentage.trim() ? parseInt(commissionPercentage.trim()) : null,
        works_at_agency: worksAtAgency,
        description: description.trim() || null,
        // subscription_plan: subscriptionPlan.trim() || null, // Removed - column doesn't exist
      };

      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', profileData.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert(
          'Error',
          'No se pudo actualizar el perfil. Por favor, intenta de nuevo.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Profile updated successfully, navigating back...');
      Alert.alert(
        'Éxito',
        'El perfil ha sido actualizado correctamente. Los cambios se reflejarán al regresar.',
        [{ 
          text: 'OK', 
          onPress: () => {
            console.log('🔄 Navigating back to profile screen...');
            router.back();
          }
        }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el perfil. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAgencySelection = (isYes: boolean) => {
    setWorksAtAgency(isYes);
    setNotWorksAtAgency(!isYes);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Perfil no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.white} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Editar Perfil
        </Text>

        <Text style={styles.sectionTitle}>
          Información Personal
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre completo:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Correo electrónico:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ingresa tu número de teléfono"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Información Profesional
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Inmobiliaria:</Text>
          <TextInput
            style={styles.input}
            value={realEstateAgency}
            onChangeText={setRealEstateAgency}
            placeholder="Ingresa el nombre de tu inmobiliaria"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Código Postal:</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="Ingresa tu código postal"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Estado:</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="Ingresa tu estado"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Municipio:</Text>
          <TextInput
            style={styles.input}
            value={municipality}
            onChangeText={setMunicipality}
            placeholder="Ingresa tu municipio"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Colonia:</Text>
          <TextInput
            style={styles.input}
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Ingresa tu colonia"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Calle:</Text>
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Ingresa tu calle"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>País:</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="Ingresa tu país"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Años de Experiencia:</Text>
          <TextInput
            style={styles.input}
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="Ingresa tus años de experiencia"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Propiedades Vendidas:</Text>
          <TextInput
            style={styles.input}
            value={propertiesSold}
            onChangeText={setPropertiesSold}
            placeholder="Ingresa el número de propiedades vendidas"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Porcentaje de Comisión:</Text>
          <TextInput
            style={styles.input}
            value={commissionPercentage}
            onChangeText={setCommissionPercentage}
            placeholder="Ingresa tu porcentaje de comisión"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>¿Trabaja en inmobiliaria?</Text>
          <View style={styles.agencyContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleAgencySelection(true)}
            >
              <View style={[
                styles.checkbox,
                worksAtAgency === true && styles.checkboxSelected
              ]}>
                {worksAtAgency === true && (
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Sí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleAgencySelection(false)}
            >
              <View style={[
                styles.checkbox,
                worksAtAgency === false && styles.checkboxSelected
              ]}>
                {worksAtAgency === false && (
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>No</Text>
            </TouchableOpacity>
          </View>

          {worksAtAgency === true && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de la inmobiliaria:</Text>
              <TextInput
                style={styles.input}
                value={realEstateAgency}
                onChangeText={setRealEstateAgency}
                placeholder="Ingresa el nombre de la inmobiliaria"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Descripción:</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingresa una descripción"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />
        </View>

        {/* Subscription plan section removed - column doesn't exist in database */}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
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
  title: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 32,
    width: width * 0.8,
    alignSelf: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38, // Match standard input height
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  dropdownInputDisabled: {
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: width * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.black,
    flex: 1,
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
  },
  agencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.secondary,
  },
  checkboxLabel: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default AgentProfileEditionScreen; 