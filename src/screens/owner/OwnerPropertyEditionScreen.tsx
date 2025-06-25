import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { PropertyService } from '../../services/propertyService';
import { Property as PropertyType } from '../../types/property';
import * as ImagePicker from 'expo-image-picker';

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

const OwnerPropertyEditionScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propertyData, setPropertyData] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [intent, setIntent] = useState<string>('sell');
  const [timeline, setTimeline] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [otherType, setOtherType] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [municipality, setMunicipality] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [landArea, setLandArea] = useState<string>('');
  const [constructionArea, setConstructionArea] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [halfBathrooms, setHalfBathrooms] = useState<string>('');
  const [amenities, setAmenities] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        if (id) {
          const data = await PropertyService.getPropertyById(id);
          setPropertyData(data);
          
          // Populate form fields with existing data
          if (data) {
            setIntent(data.intent || 'sell');
            setTimeline(data.timeline || '');
            setPrice(data.price?.toString() || '');
            setPropertyType(data.property_type || '');
            setOtherType(data.other_type || '');
            setCommissionPercentage(data.commission_percentage?.toString() || '');
            setPostalCode(data.postal_code || '');
            setState(data.state || '');
            setMunicipality(data.municipality || '');
            setNeighborhood(data.neighborhood || '');
            setStreet(data.street || '');
            setLandArea(data.land_area?.toString() || '');
            setConstructionArea(data.construction_area?.toString() || '');
            setBedrooms(data.bedrooms?.toString() || '');
            setBathrooms(data.bathrooms?.toString() || '');
            setHalfBathrooms(data.half_bathrooms?.toString() || '');
            setAmenities(data.amenities || '');
            setAdditionalInfo(data.additional_info || '');
            setImages(data.images || []);
          }
        }
      } catch (error) {
        console.error('Error fetching property data:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información de la propiedad.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setShowDeleteIndex(null);
  };

  const handleSave = async () => {
    if (!propertyData || !propertyData.id) return;

    setSaving(true);
    try {
      const updates: Partial<PropertyType> = {
        intent: (intent as 'sell' | 'rent') || 'sell',
        timeline,
        price: parseFloat(price),
        property_type: propertyType,
        other_type: otherType || undefined,
        commission_percentage: parseFloat(commissionPercentage),
        postal_code: postalCode,
        state,
        municipality,
        neighborhood: neighborhood || undefined,
        street,
        land_area: landArea ? parseFloat(landArea) : undefined,
        construction_area: constructionArea ? parseFloat(constructionArea) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        half_bathrooms: halfBathrooms ? parseInt(halfBathrooms) : undefined,
        amenities: amenities || undefined,
        additional_info: additionalInfo || undefined,
        images: images.length > 0 ? images : undefined,
      };

      await PropertyService.updateProperty(propertyData.id, updates);
      
      // Refresh the property data
      const updatedData = await PropertyService.getPropertyById(propertyData.id);
      setPropertyData(updatedData);
      
      Alert.alert(
        'Éxito',
        'La propiedad ha sido actualizada correctamente.',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Navigate back to property detail screen
            router.back();
          }
        }]
      );
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar la propiedad. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando propiedad...</Text>
        </View>
      </View>
    );
  }

  if (!propertyData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Propiedad no encontrada</Text>
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
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Editar Propiedad
        </Text>

        <Text style={styles.sectionTitle}>
          Información Básica
        </Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Dropdown
              label="Intención:"
              value={intent}
              items={['sell', 'rent']}
              onChange={setIntent}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Timeline:</Text>
            <TextInput
              style={styles.input}
              value={timeline}
              onChangeText={setTimeline}
              placeholder="Ej: 3 meses"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Precio:</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Ej: 1500000"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Comisión (%):</Text>
            <TextInput
              style={styles.input}
              value={commissionPercentage}
              onChangeText={setCommissionPercentage}
              keyboardType="numeric"
              placeholder="Ej: 5"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Dropdown
              label="Tipo de propiedad:"
              value={propertyType}
              items={['Casa', 'Departamento', 'Terreno', 'Oficina', 'Local comercial', 'Otro']}
              onChange={setPropertyType}
            />
          </View>
          {propertyType === 'Otro' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Especificar:</Text>
              <TextInput
                style={styles.input}
                value={otherType}
                onChangeText={setOtherType}
                placeholder="Especificar tipo"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código Postal:</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
              placeholder="Ej: 12345"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Dropdown
              label="Estado:"
              value={state}
              items={estados}
              onChange={setState}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Municipio:</Text>
            <TextInput
              style={styles.input}
              value={municipality}
              onChangeText={setMunicipality}
              placeholder="Ingresa el municipio"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Colonia:</Text>
            <TextInput
              style={styles.input}
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Ingresa la colonia"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Calle:</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Ingresa la calle"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Características
        </Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Superficie (m²):</Text>
            <TextInput
              style={styles.input}
              value={landArea}
              onChangeText={setLandArea}
              keyboardType="numeric"
              placeholder="Ej: 200"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Construcción (m²):</Text>
            <TextInput
              style={styles.input}
              value={constructionArea}
              onChangeText={setConstructionArea}
              keyboardType="numeric"
              placeholder="Ej: 150"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cuartos:</Text>
            <TextInput
              style={styles.input}
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="numeric"
              placeholder="Ej: 3"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Baños:</Text>
            <TextInput
              style={styles.input}
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="numeric"
              placeholder="Ej: 2"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Medios baños:</Text>
            <TextInput
              style={styles.input}
              value={halfBathrooms}
              onChangeText={setHalfBathrooms}
              keyboardType="numeric"
              placeholder="Ej: 1"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Amenidades
        </Text>

        <TextInput
          style={styles.textArea}
          value={amenities}
          onChangeText={setAmenities}
          placeholder="Describe las amenidades de la propiedad"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <Text style={styles.sectionTitle}>
          Información Adicional
        </Text>

        <TextInput
          style={styles.textArea}
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          placeholder="Información adicional que deba saber el asesor"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <Text style={styles.sectionTitle}>
          Imágenes
        </Text>

        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImages}
        >
          {images.length === 0 ? (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
              <Text style={styles.uploadText}>Subir archivos</Text>
            </View>
          ) : (
            <ScrollView horizontal>
              {images.map((uri, index) => (
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
    marginTop: 16,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 8,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  dropdownInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dropdownInputDisabled: {
    color: COLORS.gray,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 12,
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

export default OwnerPropertyEditionScreen; 