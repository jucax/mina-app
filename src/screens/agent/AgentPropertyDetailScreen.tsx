import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Property {
  image: string;
  price?: string;
  location: string;
  commission: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  construction_area?: number;
  land_area?: number;
  total_area?: number;
  documentation_complete?: boolean;
  amenities?: string;
  description?: string;
}

const InfoIconText = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoIconContainer}>
    <Ionicons name={icon as any} size={32} color={COLORS.primary} />
    <Text style={[styles.infoIconText, { marginTop: 4 }]}>{label}</Text>
  </View>
);

const AreaInfo = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.areaInfoContainer}>
    <Text style={styles.areaInfoLabel}>{label}</Text>
    <Text style={styles.areaInfoValue}>{value}</Text>
  </View>
);

const AgentPropertyDetailScreen = () => {
  const params = useLocalSearchParams();
  const property: Property = params.property ? JSON.parse(params.property as string) : {
    image: require('../../../assets/images/property1.png'),
    price: '5,000,000',
    location: 'Benito Juárez, CDMX.',
    commission: '4%',
    type: 'Departamento',
    bedrooms: 2,
    bathrooms: 2,
    parking: 2,
    construction_area: 63,
    land_area: 63,
    total_area: 63,
    documentation_complete: true,
    amenities: 'Alberca con área de camastros, Gimnasio totalmente equipado, Salón de usos múltiples, Áreas verdes y jardines, Juegos infantiles, Terraza con asadores, Seguridad 24/7 y acceso controlado, Estacionamiento para visitas',
    description: 'La propiedad se encuentra en excelente estado, fue construida en 2015 y habitada por la familia durante los últimos 7 años. Se están vendiendo porque van a mudarse de ciudad por motivos laborales. Cuenta con cocina integral, clósets, persianas y minisplits, todo incluido en la venta. La casa fue remodelada recientemente en 2022, específicamente la cocina y los baños.',
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={property.image as any}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{property.price} mxn</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>{property.commission}</Text>
            <Text style={styles.commissionLabel}>comisión</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.typeContainer}>
            <View style={styles.typeDot} />
            <Text style={styles.typeText}>En venta {property.type}</Text>
          </View>

          <Text style={styles.sectionTitle}>INFORMACION DE LA PROPIEDAD</Text>

          <View style={styles.infoContainer}>
            <InfoIconText icon="bed" label={`${property.bedrooms} cuartos`} />
            <InfoIconText icon="water" label={`${property.bathrooms} baños`} />
            <InfoIconText icon="car" label={`${property.parking} estacionamientos`} />
          </View>

          <View style={styles.areaContainer}>
            <AreaInfo label="Construcción" value={`${property.construction_area}m²`} />
            <AreaInfo label="Terreno" value={`${property.land_area}m²`} />
            <AreaInfo label="Total" value={`${property.total_area}m²`} />
          </View>

          <View style={styles.documentationContainer}>
            <Text style={styles.documentationLabel}>Documentación:</Text>
            <View style={[
              styles.documentationStatus,
              { borderColor: property.documentation_complete ? COLORS.secondary : COLORS.black }
            ]}>
              <Text style={[
                styles.documentationStatusText,
                { color: property.documentation_complete ? COLORS.secondary : COLORS.black }
              ]}>
                {property.documentation_complete ? 'Completa' : 'Incompleta'}
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{property.amenities}</Text>
          <Text style={styles.descriptionText}>{property.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: 320,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceContainer: {
    position: 'absolute',
    left: 24,
    bottom: 32,
  },
  priceText: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  commissionContainer: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    alignItems: 'flex-end',
  },
  commissionText: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
  },
  commissionLabel: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginRight: 8,
  },
  typeText: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 22,
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoIconContainer: {
    alignItems: 'center',
  },
  infoIconText: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  areaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
  },
  areaInfoContainer: {
    alignItems: 'center',
  },
  areaInfoLabel: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  areaInfoValue: {
    ...FONTS.regular,
    fontWeight: '600',
    marginTop: 2,
  },
  documentationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  documentationLabel: {
    ...FONTS.regular,
    fontWeight: 'bold',
    marginRight: 12,
  },
  documentationStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  documentationStatusText: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  descriptionText: {
    ...FONTS.regular,
    color: COLORS.black,
    marginBottom: 16,
  },
});

export default AgentPropertyDetailScreen; 