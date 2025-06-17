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

interface DocItem {
  label: string;
  checked: boolean;
}

const initialDocs: DocItem[] = [
  { label: 'Identificación Oficial', checked: false },
  { label: 'Constancia de situación fiscal actualizada', checked: false },
  { label: 'Comprobante de domicilio', checked: false },
  { label: 'Escritura de la propiedad', checked: false },
  { label: 'Ultima boleta predial', checked: false },
  { label: 'Ultima boleta de agua', checked: false },
  { label: 'Ultima boleta de luz', checked: false },
  { label: 'Consulta de folios', checked: false },
];

const PropertyDocumentationScreen = () => {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [comment, setComment] = useState('');

  const toggleDoc = (index: number) => {
    const newDocs = [...docs];
    newDocs[index].checked = !newDocs[index].checked;
    setDocs(newDocs);
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
          {docs.map((doc, index) => (
            <TouchableOpacity
              key={doc.label}
              style={styles.docItem}
              onPress={() => toggleDoc(index)}
            >
              <View style={[
                styles.checkbox,
                doc.checked && styles.checkboxSelected
              ]}>
                {doc.checked && (
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
          onPress={() => router.push('/(owner)/property/details')}
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