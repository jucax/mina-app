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
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width, height } = Dimensions.get('window');

// Mexican states data
const estados = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

// Municipalities by state (simplified - you can expand this)
const municipiosPorEstado: { [key: string]: string[] } = {
  'Ciudad de México': [
    'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa de Morelos',
    'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras',
    'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'
  ],
  'Jalisco': [
    'Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tonalá', 'Tlajomulco de Zúñiga',
    'El Salto', 'Puerto Vallarta', 'Lagos de Moreno', 'Tepatitlán de Morelos', 'Zapotlán el Grande'
  ],
  'Nuevo León': [
    'Monterrey', 'Guadalupe', 'San Nicolás de los Garza', 'General Escobedo', 'Santa Catarina',
    'San Pedro Garza García', 'Juárez', 'Linares', 'Apodaca', 'General Zuazua'
  ],
  'Baja California': [
    'Tijuana', 'Mexicali', 'Ensenada', 'San Quintín', 'Rosarito', 'Tecate', 'San Felipe'
  ],
  'Sonora': [
    'Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Huatabampo',
    'Navojoa', 'Puerto Peñasco', 'Cananea', 'Guaymas', 'Héroes de Nacozari'
  ],
  // Add more states and their municipalities as needed
};

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

const PropertyDetailsScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  
  // Location fields
  const [cp, setCp] = useState(formData.postal_code);
  const [municipio, setMunicipio] = useState(formData.municipality);
  const [calle, setCalle] = useState(formData.street);
  const [selectedPais, setSelectedPais] = useState<string>(formData.country);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(formData.state);
  const [selectedColonia, setSelectedColonia] = useState<string | null>(formData.neighborhood);
  
  // Property characteristics
  const [superficie, setSuperficie] = useState(formData.land_area);
  const [construccion, setConstruccion] = useState(formData.construction_area);
  const [cuartos, setCuartos] = useState(formData.bedrooms);
  const [banos, setBanos] = useState(formData.bathrooms);
  const [mediosBanos, setMediosBanos] = useState(formData.half_bathrooms);
  const [amenidades, setAmenidades] = useState(formData.amenities);
  const [infoAdicional, setInfoAdicional] = useState(formData.additional_info);
  const [selectedImages, setSelectedImages] = useState<string[]>(formData.images);
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

  // Get municipalities based on selected state
  const municipiosDisponibles = selectedEstado ? municipiosPorEstado[selectedEstado] || [] : [];

  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado);
    setSelectedColonia(null); // Reset colonia when estado changes
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setShowDeleteIndex(null);
  };

  const handleContinue = () => {
    // Save to context
    updateFormData({
      postal_code: cp,
      municipality: municipio,
      street: calle,
      country: selectedPais,
      state: selectedEstado,
      neighborhood: selectedColonia,
      land_area: superficie,
      construction_area: construccion,
      bedrooms: cuartos,
      bathrooms: banos,
      half_bathrooms: mediosBanos,
      amenities: amenidades,
      additional_info: infoAdicional,
      images: selectedImages,
    });
    
    router.push('/(owner)/property/compensation');
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

        <Text style={styles.sectionTitle}>
          Datos de ubicacion:
        </Text>

        <View style={styles.rowGap}>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Código Postal:</Text>
            <TextInput
              style={styles.input}
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
            />
          </View>
        </View>

        <View style={styles.rowGap}>
          <View style={styles.inputContainerSmall}>
            <Dropdown
              label="Estado:"
              value={selectedEstado}
              items={estados}
              onChange={handleEstadoChange}
            />
          </View>
          <View style={styles.inputContainerSmall}>
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

        <View style={styles.rowGap}>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Colonia:</Text>
            <TextInput
              style={styles.input}
              value={selectedColonia || ''}
              editable={false}
              placeholder="Colonia 1"
            />
          </View>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Calle:</Text>
            <TextInput
              style={styles.input}
              value={calle}
              onChangeText={setCalle}
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>
          Características de la propiedad:
        </Text>

        <View style={styles.rowGap3}>
          <View style={styles.inputContainerTiny}>
            <Text style={styles.inputLabel}>Superficie:</Text>
            <TextInput
              style={styles.input}
              value={superficie}
              onChangeText={setSuperficie}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainerTiny}>
            <Text style={styles.inputLabel}>Construccion:</Text>
            <TextInput
              style={styles.input}
              value={construccion}
              onChangeText={setConstruccion}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.rowGap3}>
          <View style={styles.inputContainerTiny3}>
            <Text style={styles.inputLabel}>Cuartos:</Text>
            <TextInput
              style={styles.input}
              value={cuartos}
              onChangeText={setCuartos}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainerTiny3}>
            <Text style={styles.inputLabel}>Baños:</Text>
            <TextInput
              style={styles.input}
              value={banos}
              onChangeText={setBanos}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainerTiny3}>
            <Text style={styles.inputLabel}>Medios Baños:</Text>
            <TextInput
              style={styles.input}
              value={mediosBanos}
              onChangeText={setMediosBanos}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>
          Cuenta con amenidades?
        </Text>

        <TextInput
          style={styles.textArea}
          value={amenidades}
          onChangeText={setAmenidades}
          placeholder="Respuesta abierta"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <Text style={styles.sectionTitleSmall}>
          Información adicional que deba saber el asesor.
        </Text>

        <TextInput
          style={styles.textArea}
          value={infoAdicional}
          onChangeText={setInfoAdicional}
          placeholder="Respuesta abierta"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <Text style={styles.sectionTitleSmall}>
          Sube imágenes de tu propiedad
        </Text>
        <Text style={styles.subtitle}>
          (Fachada, sala, cocina, cuartos, etc.)
        </Text>

        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImages}
        >
          {selectedImages.length === 0 ? (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
              <Text style={styles.uploadText}>Subir archivos</Text>
            </View>
          ) : (
            <ScrollView horizontal>
              {selectedImages.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.uploadedImageWrapper}
                  activeOpacity={0.8}
                  onPress={() => setShowDeleteIndex(index)}
                >
                  <Image
                    source={{ uri }}
                    style={styles.uploadedImage}
                  />
                  {showDeleteIndex === index && (
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="trash" size={28} color={COLORS.secondary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
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
    marginTop: Platform.OS === 'ios' ? 60 : 40,
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
  sectionTitleSmall: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowGap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  rowGap3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  inputContainerSmall: {
    flex: 1,
    maxWidth: width * 0.45,
  },
  inputContainerTiny: {
    flex: 1,
    maxWidth: width * 0.45,
  },
  inputContainerTiny3: {
    flex: 1,
    maxWidth: width * 0.29,
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
  textArea: {
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
  imageUploadButton: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginTop: 8,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    ...FONTS.regular,
    color: COLORS.primary,
    marginTop: 4,
  },
  uploadedImageWrapper: {
    position: 'relative',
    margin: 4,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deleteIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 2,
    zIndex: 10,
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
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    padding: 16,
    zIndex: 10,
  },
  dropdownDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    borderRadius: 12,
    width: width * 0.8,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownItemText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
  },
});

export default PropertyDetailsScreen; 