import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Property {
  image: string;
  commission: string;
  location: string;
  price: string;
  type: string;
  views: number;
  offers: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  construction_area: number;
  land_area: number;
  total_area: number;
  documentation_complete: boolean;
  amenities: string;
  description: string;
}

const InfoIconText = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoIconContainer}>
    <Ionicons name={icon as any} size={32} color={COLORS.primary} />
    <Text style={styles.infoIconText}>{label}</Text>
  </View>
);

const AreaInfo = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.areaInfoContainer}>
    <Text style={styles.areaInfoLabel}>{label}</Text>
    <Text style={styles.areaInfoValue}>{value}</Text>
  </View>
);

const CounterInfo = ({ icon, label, count }: { icon: string; label: string; count: number }) => (
  <View style={styles.counterContainer}>
    <Ionicons name={icon as any} color={COLORS.secondary} size={24} />
    <View style={styles.counterTextContainer}>
      <Text style={styles.counterValue}>{count}</Text>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  </View>
);

const OwnerPropertyDetailScreen = () => {
  const { property } = useLocalSearchParams<{ property: string }>();
  const propertyData: Property = JSON.parse(property);

  useEffect(() => {
    // Set dynamic header title based on property type and location
    const title = `${propertyData.type} en ${propertyData.location}`;
    // Note: We'll handle the title display in the component itself
  }, [propertyData]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/images/property1.png')}
            style={styles.propertyImage}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{propertyData.price} mxn</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.locationText}>{propertyData.location}</Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionValue}>{propertyData.commission}%</Text>
            <Text style={styles.commissionLabel}>comisión</Text>
          </View>
        </View>

        <View style={styles.typeContainer}>
          <View style={styles.typeDot} />
          <Text style={styles.typeText}>
            En venta {propertyData.type}
          </Text>
        </View>

        <View style={styles.countersContainer}>
          <CounterInfo
            icon="eye"
            label="Vistas"
            count={propertyData.views}
          />
          <CounterInfo
            icon="gift"
            label="Ofertas"
            count={propertyData.offers}
          />
        </View>

        <Text style={styles.sectionTitle}>
          INFORMACION DE LA PROPIEDAD
        </Text>

        <View style={styles.infoIconsContainer}>
          <InfoIconText icon="bed" label={`${propertyData.bedrooms} cuartos`} />
          <InfoIconText icon="water" label={`${propertyData.bathrooms} baños`} />
          <InfoIconText icon="car" label={`${propertyData.parking} estacionamientos`} />
        </View>

        <View style={styles.areaInfoContainer}>
          <AreaInfo label="Construcción" value={`${propertyData.construction_area}m²`} />
          <AreaInfo label="Terreno" value={`${propertyData.land_area}m²`} />
          <AreaInfo label="Total" value={`${propertyData.total_area}m²`} />
        </View>

        <View style={styles.documentationContainer}>
          <Text style={styles.documentationLabel}>Documentación:</Text>
          <View style={[
            styles.documentationStatus,
            { borderColor: propertyData.documentation_complete ? COLORS.secondary : COLORS.gray }
          ]}>
            <Text style={[
              styles.documentationStatusText,
              { color: propertyData.documentation_complete ? COLORS.secondary : COLORS.gray }
            ]}>
              {propertyData.documentation_complete ? 'Completa' : 'Incompleta'}
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          {propertyData.amenities}
        </Text>

        <Text style={styles.descriptionText}>
          {propertyData.description}
        </Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            // TODO: Navigate to edit property screen
          }}
        >
          <Ionicons name="create" size={24} color={COLORS.white} />
          <Text style={styles.editButtonText}>Editar Publicación</Text>
        </TouchableOpacity>
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
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 16,
  },
  backButtonCircle: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
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
  commissionValue: {
    ...FONTS.title,
    fontSize: 32,
    color: COLORS.secondary,
  },
  commissionLabel: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
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
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  counterTextContainer: {
    marginLeft: 8,
  },
  counterValue: {
    ...FONTS.title,
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterLabel: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
  },
  sectionTitle: {
    ...FONTS.title,
    fontSize: 22,
    letterSpacing: 1.2,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  infoIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 18,
  },
  infoIconContainer: {
    alignItems: 'center',
  },
  infoIconText: {
    ...FONTS.regular,
    fontWeight: '600',
    marginTop: 4,
  },
  areaInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    marginTop: 18,
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
    paddingHorizontal: 24,
    marginTop: 24,
  },
  documentationLabel: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  documentationStatus: {
    marginLeft: 12,
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
    color: COLORS.gray,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default OwnerPropertyDetailScreen; 