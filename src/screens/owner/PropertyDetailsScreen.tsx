import React, { useState, useEffect } from 'react';
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
  Alert,
  Animated,
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

// Simple fallback mapping for common ZIP codes (in case APIs fail)
// REMOVED - No hardcoding of ZIP codes

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

// Calculate responsive grid
const calculateGridLayout = () => {
  const containerWidth = width - 48; // Account for padding
  const imageSize = 80;
  const margin = 4;
  const imagesPerRow = Math.floor((containerWidth - margin) / (imageSize + margin));
  return {
    imagesPerRow: Math.max(2, Math.min(4, imagesPerRow)), // Between 2-4 images per row
    imageSize,
    margin,
  };
};

const PropertyDetailsScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const gridLayout = calculateGridLayout();
  
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
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validation state
  const [showValidation, setShowValidation] = useState(false);
  // REMOVED: loading, addressFetched states - no longer needed

  // Update local state when formData changes (for data persistence)
  useEffect(() => {
    setCp(formData.postal_code);
    setMunicipio(formData.municipality);
    setCalle(formData.street);
    setSelectedPais(formData.country);
    setSelectedEstado(formData.state);
    setSelectedColonia(formData.neighborhood);
    setSuperficie(formData.land_area);
    setConstruccion(formData.construction_area);
    setCuartos(formData.bedrooms);
    setBanos(formData.bathrooms);
    setMediosBanos(formData.half_bathrooms);
    setAmenidades(formData.amenities);
    setInfoAdicional(formData.additional_info);
    setSelectedImages(formData.images);
  }, [formData]);

  // Get municipalities based on selected state
  const municipiosDisponibles = selectedEstado ? municipiosPorEstado[selectedEstado] || [] : [];

  // Function to fetch address data from COPOMEX API
  // REMOVED - No ZIP code auto-fill functionality

  // Function to get dynamic image suggestions based on property type
  const getImageSuggestions = () => {
    // Get property type from context or use a default
    const propertyType = formData.property_type || 'Casa';
    
    switch (propertyType) {
      case 'Terreno':
        return 'vista general, acceso, topografía, servicios cercanos, etc.';
      case 'Local':
        return 'fachada, interior, área de ventas, almacén, baños, etc.';
      case 'Oficina':
        return 'fachada, recepción, áreas de trabajo, salas de juntas, etc.';
      case 'Bodega':
        return 'fachada, interior, altura del techo, acceso vehicular, etc.';
      case 'Edificio':
        return 'fachada, lobby, áreas comunes, elevadores, escaleras, etc.';
      case 'Departamento':
        return 'fachada, sala, cocina, cuartos, baños, balcón, etc.';
      case 'Casa':
      default:
        return 'fachada, sala, cocina, cuartos, baños, jardín, etc.';
    }
  };

  // Validation function
  const validateFields = () => {
    const requiredFields = {
      cp: cp.trim(),
      municipio: municipio.trim(),
      calle: calle.trim(),
      selectedEstado: selectedEstado,
      selectedColonia: selectedColonia,
      superficie: superficie.trim(),
      construccion: construccion.trim(),
      cuartos: cuartos.trim(),
      banos: banos.trim(),
      mediosBanos: mediosBanos.trim(),
      amenidades: amenidades.trim(),
      images: selectedImages.length >= 5,
    };

    const missingFields = Object.entries(requiredFields).filter(([key, value]) => {
      if (key === 'images') return !value;
      return !value || value === '';
    });

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(([key]) => key),
    };
  };

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
      const newImages = result.assets.map(asset => asset.uri);
      
      // Check for duplicates by comparing URIs and file names
      const duplicates = newImages.filter(newUri => {
        const newFileName = newUri.split('/').pop()?.split('?')[0]; // Get filename without query params
        return selectedImages.some(existingUri => {
          const existingFileName = existingUri.split('/').pop()?.split('?')[0];
          return existingUri === newUri || existingFileName === newFileName;
        });
      });
      
      if (duplicates.length > 0) {
        Alert.alert(
          'Imagen Duplicada',
          'Has seleccionado una imagen que ya está incluida. Por favor, selecciona imágenes diferentes.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setShowDeleteIndex(null);
  };

  // Drag and drop functions
  const startDrag = (index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (index: number) => {
    if (isDragging && draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const endDrag = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Reorder the images
      const newImages = [...selectedImages];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);
      setSelectedImages(newImages);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleContinue = () => {
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

    // Check for duplicate images before continuing
    const imageNames = selectedImages.map(uri => uri.split('/').pop()?.split('?')[0]);
    const uniqueNames = new Set(imageNames);
    
    if (uniqueNames.size !== selectedImages.length) {
      Alert.alert(
        'Imágenes Duplicadas',
        'Hay imágenes duplicadas en tu selección. Por favor, elimina las duplicadas antes de continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

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

  // Helper function to get input style with validation
  const getInputStyle = (fieldName: string) => {
    const validation = validateFields();
    const isMissing = validation.missingFields.includes(fieldName);
    
    return [
      styles.input,
      showValidation && isMissing && styles.inputError
    ];
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
            <Text style={styles.inputLabel}>Código Postal: *</Text>
            <View style={styles.zipCodeContainer}>
              <TextInput
                style={getInputStyle('cp')}
                value={cp}
                onChangeText={setCp}
                keyboardType="numeric"
                placeholder="Ingresa código postal"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                maxLength={5}
              />
            </View>
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
              label="Estado: *"
              value={selectedEstado}
              items={estados}
              onChange={handleEstadoChange}
              style={[
                showValidation && !selectedEstado ? styles.dropdownMatchInput : null
              ]}
            />
          </View>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Alcaldía o municipio: *</Text>
            <TextInput
              style={getInputStyle('municipio')}
              value={municipio}
              onChangeText={setMunicipio}
              placeholder="Ingresa tu alcaldía o municipio"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <View style={styles.rowGap}>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Colonia: *</Text>
            <TextInput
              style={getInputStyle('selectedColonia')}
              value={selectedColonia || ''}
              onChangeText={setSelectedColonia}
              placeholder="Ingresa tu colonia"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Calle: *</Text>
            <TextInput
              style={getInputStyle('calle')}
              value={calle}
              onChangeText={setCalle}
              placeholder="Ingresa la calle"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>
          Características de la propiedad:
        </Text>

        <View style={styles.rowGap3}>
          <View style={styles.inputContainerTiny}>
            <Text style={styles.inputLabel}>Superficie: *</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[getInputStyle('superficie'), styles.inputWithUnitText]}
                value={superficie}
                onChangeText={setSuperficie}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
              {superficie.trim() !== '' && (
                <Text style={styles.unitText}>m²</Text>
              )}
            </View>
          </View>
          <View style={styles.inputContainerTiny}>
            <Text style={styles.inputLabel}>Construccion: *</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[getInputStyle('construccion'), styles.inputWithUnitText]}
                value={construccion}
                onChangeText={setConstruccion}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
              {construccion.trim() !== '' && (
                <Text style={styles.unitText}>m²</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rowGap3}>
          <View style={styles.inputContainerCuartos}>
            <Text style={styles.inputLabel}>Cuartos: *</Text>
            <TextInput
              style={getInputStyle('cuartos')}
              value={cuartos}
              onChangeText={setCuartos}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              maxLength={2}
            />
          </View>
          <View style={styles.inputContainerBanos}>
            <Text style={styles.inputLabel}>Baños: *</Text>
            <TextInput
              style={getInputStyle('banos')}
              value={banos}
              onChangeText={setBanos}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              maxLength={2}
            />
          </View>
          <View style={styles.inputContainerMediosBanos}>
            <Text style={styles.inputLabel}>Medios Baños: *</Text>
            <TextInput
              style={getInputStyle('mediosBanos')}
              value={mediosBanos}
              onChangeText={setMediosBanos}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              maxLength={2}
            />
          </View>
        </View>

        <Text style={styles.sectionTitleSmall}>
          ¿Cuenta con otros servicios?
        </Text>

        <TextInput
          style={getInputStyle('amenidades')}
          value={amenidades}
          onChangeText={setAmenidades}
          placeholder="Ej: Estacionamiento, seguridad 24/7, alberca, gimnasio, etc."
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
          placeholder="Respuesta abierta (opcional)"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          multiline
        />

        <Text style={styles.sectionTitleSmall}>
          📸 Sube imágenes de tu propiedad
        </Text>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>📋 Instrucciones importantes:</Text>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletIcon}>•</Text>
            <Text style={styles.bulletText}>Necesitamos un mínimo de 5 imágenes</Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletIcon}>•</Text>
            <Text style={styles.bulletText}>Más y mejores imágenes atraerán más agentes</Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletIcon}>•</Text>
            <Text style={styles.bulletText}>Intenta mostrar: {getImageSuggestions()}</Text>
          </View>
        </View>
        
        <Text style={styles.imageCountText}>
          {selectedImages.length}/5 imágenes (mínimo requerido)
        </Text>

        <View style={[
          styles.imageContainer,
          showValidation && selectedImages.length < 5 && styles.imageContainerError,
          { 
            minHeight: selectedImages.length > gridLayout.imagesPerRow ? 180 : 100,
            paddingHorizontal: (width - (gridLayout.imagesPerRow * (gridLayout.imageSize + gridLayout.margin) + gridLayout.margin)) / 2
          }
        ]}>
          {selectedImages.length === 0 ? (
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImages}
        >
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
              <Text style={styles.uploadText}>Subir archivos</Text>
            </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageGridContainer}>
              <View style={[
                styles.imageGrid,
                { 
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: selectedImages.length > gridLayout.imagesPerRow ? 180 : 100,
                }
              ]}>
              {selectedImages.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                    style={[
                      styles.uploadedImageWrapper,
                      draggedIndex === index && styles.draggedImage,
                      dragOverIndex === index && styles.dragOverImage,
                    ]}
                  activeOpacity={0.8}
                  onPress={() => setShowDeleteIndex(index)}
                    onLongPress={() => startDrag(index)}
                    onPressIn={() => handleDragOver(index)}
                    onPressOut={endDrag}
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
                    {draggedIndex === index && (
                      <View style={styles.dragIndicator}>
                        <Ionicons name="move" size={20} color={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                {/* Add more button */}
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={pickImages}
                >
                  <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.addMoreText}>Agregar más</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continuar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(owner)/home' as any)}
        >
          <Text style={styles.skipButtonText}>Agregar propiedad más tarde</Text>
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
    fontSize: Math.max(18, 16), // Responsive font size with minimum
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: Math.max(32, 24), // Responsive margin with minimum
    marginBottom: Math.max(16, 12), // Responsive margin with minimum
    lineHeight: Math.max(24, 20), // Ensure proper line height for larger fonts
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
    marginBottom: Math.max(16, 12), // Responsive margin with minimum
    gap: 16,
  },
  rowGap3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Math.max(16, 12), // Responsive margin with minimum
    gap: 4,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerSmall: {
    flex: 1,
    maxWidth: width * 0.45,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerTiny: {
    flex: 1,
    maxWidth: width * 0.45,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerTiny3: {
    flex: 1,
    maxWidth: width * 0.28,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerCuartos: {
    flex: 1,
    maxWidth: width * 0.20,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerBanos: {
    flex: 1,
    maxWidth: width * 0.20,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputContainerMediosBanos: {
    flex: 1,
    maxWidth: width * 0.30,
    marginBottom: Math.max(8, 4), // Add bottom margin for better spacing
  },
  inputLabel: {
    ...FONTS.regular,
    fontSize: Math.max(15, 12), // Responsive font size with minimum
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: Math.max(8, 4), // Responsive margin with minimum
    lineHeight: Math.max(20, 16), // Ensure proper line height for larger fonts
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: Math.max(6, 4), // Responsive padding
    fontSize: Math.max(14, 12), // Responsive font size
    color: COLORS.black,
    height: 38, // Original height - consistent with dropdowns
  },
  inputError: {
    borderColor: '#FF4444',
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    ...FONTS.regular,
    fontSize: Math.max(15, 12), // Responsive font size with minimum
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: Math.max(8, 4), // Responsive margin with minimum
    lineHeight: Math.max(20, 16), // Ensure proper line height for larger fonts
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38, // Match standard input height
  },
  dropdownInput: {
    flex: 1,
    padding: Math.max(6, 4), // Responsive padding
    fontSize: Math.max(14, 12), // Responsive font size
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
    padding: Math.max(8, 6), // Responsive padding
    fontSize: Math.max(14, 12), // Responsive font size
    color: COLORS.black,
    height: 100,
    textAlignVertical: 'top',
    minHeight: 100, // Ensure minimum height
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
  imageContainer: {
    width: '100%',
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginTop: 8,
    overflow: 'hidden',
  },
  imageGridContainer: {
    flex: 1,
    padding: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  imageGridMultiRow: {
    minHeight: 180, // Expand height for multiple rows
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
  imageCountText: {
    ...FONTS.regular,
    color: COLORS.white,
    marginTop: 8,
  },
  imageContainerError: {
    borderColor: '#FF4444',
  },
  draggedImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dragOverImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dragIndicator: {
    position: 'absolute',
    top: 40,
    left: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 4,
  },
  addMoreButton: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addMoreText: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  dropdownMatchInput: {
    borderColor: '#FF4444',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: Math.max(6, 4), // Match standard input padding
    paddingRight: 10, // Add some padding to the right for the unit
    height: 38, // Match standard input height
  },
  inputWithUnitText: {
    flex: 1,
    padding: 0, // Remove default padding
    fontSize: Math.max(14, 12), // Responsive font size
    color: COLORS.black,
    backgroundColor: 'transparent', // Remove background to show parent background
  },
  unitText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 4,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  instructionTitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    fontSize: 18,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  zipCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: Math.max(6, 4), // Match standard input padding
    height: 38, // Match standard input height
  },
  skipButton: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 12,
    alignItems: 'center',
    width: width * 0.8,
    alignSelf: 'center',
  },
  skipButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontSize: 16,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});

export default PropertyDetailsScreen; 