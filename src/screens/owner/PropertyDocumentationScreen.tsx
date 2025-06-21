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
import { usePropertyForm } from '../../contexts/PropertyFormContext';

const { width, height } = Dimensions.get('window');

interface DocItem {
  label: string;
  checked: boolean;
  key: keyof typeof initialDocs;
}

const initialDocs: Record<string, boolean> = {
  identification: false,
  tax_constancy: false,
  address_proof: false,
  deed: false,
  property_tax: false,
  water_bill: false,
  electricity_bill: false,
  folio_consultation: false,
};

const docLabels = [
  { label: 'Identificación Oficial', key: 'identification' as const },
  { label: 'Constancia de situación fiscal actualizada', key: 'tax_constancy' as const },
  { label: 'Comprobante de domicilio', key: 'address_proof' as const },
  { label: 'Escritura de la propiedad', key: 'deed' as const },
  { label: 'Ultima boleta predial', key: 'property_tax' as const },
  { label: 'Ultima boleta de agua', key: 'water_bill' as const },
  { label: 'Ultima boleta de luz', key: 'electricity_bill' as const },
  { label: 'Consulta de folios', key: 'folio_consultation' as const },
];

const PropertyDocumentationScreen = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [docs, setDocs] = useState(formData.documentation);
  const [comment, setComment] = useState(formData.documentation_comments);

  const toggleDoc = (key: keyof typeof docs) => {
    const newDocs = { ...docs, [key]: !docs[key] };
    setDocs(newDocs);
  };

  const handleContinue = () => {
    // Save to context
    updateFormData({
      documentation: docs,
      documentation_comments: comment,
    });
    router.push('/(owner)/property/details');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Cuentas con la
        </Text>
        <Text style={styles.subtitle}>
          siguiente documentación?
        </Text>

        <View style={styles.docsContainer}>
          {docLabels.map((doc) => (
            <TouchableOpacity
              key={doc.key}
              style={styles.docItem}
              onPress={() => toggleDoc(doc.key)}
            >
              <View style={[
                styles.checkbox,
                docs[doc.key] && styles.checkboxSelected
              ]}>
                {docs[doc.key] && (
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.docLabel}>{doc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Comentario:"
          placeholderTextColor={COLORS.gray}
          multiline
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
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
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    marginTop: 32,
  },
  title: {
    ...FONTS.title,
    fontSize: 36,
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
  },
  docsContainer: {
    width: '100%',
    marginTop: 32,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  docLabel: {
    ...FONTS.regular,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  commentInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    fontSize: 18,
    color: COLORS.black,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 18,
    width: width * 0.8,
    marginTop: 24,
    marginBottom: 32,
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

export default PropertyDocumentationScreen; 