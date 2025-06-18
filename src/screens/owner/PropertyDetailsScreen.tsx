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
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface DropdownProps {
  label: string;
  value: string | null;
  items: string[];
  onChange: (value: string) => void;
}

const Dropdown = ({ label, value, items, onChange }: DropdownProps) => (
  <View style={styles.dropdownContainer}>
    <Text style={styles.dropdownLabel}>{label}</Text>
    <View style={styles.dropdown}>
      <TextInput
        style={styles.dropdownInput}
        value={value || 'Selecciona'}
        editable={false}
      />
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          // TODO: Implement dropdown selection
        }}
      >
        <Ionicons name="chevron-down" size={24} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  </View>
);

const PropertyDetailsScreen = () => {
  const [cp, setCp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [calle, setCalle] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [construccion, setConstruccion] = useState('');
  const [cuartos, setCuartos] = useState('');
  const [banos, setBanos] = useState('');
  const [mediosBanos, setMediosBanos] = useState('');
  const [amenidades, setAmenidades] = useState('');
  const [infoAdicional, setInfoAdicional] = useState('');
  const [selectedPais, setSelectedPais] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [selectedColonia, setSelectedColonia] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

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
            <Text style={styles.inputLabel}>País:</Text>
            <TextInput
              style={styles.input}
              value={selectedPais || ''}
              editable={false}
              placeholder="México"
            />
          </View>
        </View>

        <View style={styles.rowGap}>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Estado:</Text>
            <TextInput
              style={styles.input}
              value={selectedEstado || ''}
              editable={false}
              placeholder="CDMX"
            />
          </View>
          <View style={styles.inputContainerSmall}>
            <Text style={styles.inputLabel}>Alcaldia o municipio</Text>
            <TextInput
              style={styles.input}
              value={municipio}
              onChangeText={setMunicipio}
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
          onPress={() => router.push('/(owner)/property/compensation')}
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
});

export default PropertyDetailsScreen; 