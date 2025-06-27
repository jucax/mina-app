import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { PropertyService } from '../../services/propertyService';
import { ViewTrackingService } from '../../services/viewTrackingService';
import { Property as PropertyType } from '../../types/property';

const { width } = Dimensions.get('window');

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propertyData, setPropertyData] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        if (id) {
          const data = await PropertyService.getPropertyById(id);
          setPropertyData(data);
          
          // Record the view when agent opens the property
          await ViewTrackingService.recordPropertyView(id);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: PropertyType) => {
    if (property.images && property.images.length > 0) {
      return { uri: property.images[0] };
    }
    return require('../../../assets/images/property1.png');
  };

  const handleSendOffer = () => {
    if (propertyData.id) {
      router.push({
        pathname: '/(agent)/proposal',
        params: { 
          propertyId: propertyData.id,
          propertyData: JSON.stringify(propertyData)
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={getPropertyImage(propertyData)}
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
            <Text style={styles.priceText}>{formatPrice(propertyData.price)}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.locationText}>
                {propertyData.municipality}, {propertyData.state}
              </Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>{propertyData.commission_percentage}%</Text>
            <Text style={styles.commissionLabel}>comisión</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.typeContainer}>
            <View style={styles.typeDot} />
            <Text style={styles.typeText}>
              En {propertyData.intent === 'sell' ? 'venta' : propertyData.intent === 'rent' ? 'renta' : 'venta/renta'} {propertyData.property_type}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>INFORMACION DE LA PROPIEDAD</Text>

          <View style={styles.infoContainer}>
            <InfoIconText icon="bed" label={`${propertyData.bedrooms || 0} cuartos`} />
            <InfoIconText icon="water" label={`${propertyData.bathrooms || 0} baños`} />
            <InfoIconText icon="car" label="2 estacionamientos" />
          </View>

          <View style={styles.areaContainer}>
            <AreaInfo label="Construcción" value={`${propertyData.construction_area || 0}m²`} />
            <AreaInfo label="Terreno" value={`${propertyData.land_area || 0}m²`} />
            <AreaInfo label="Total" value={`${(propertyData.construction_area || 0) + (propertyData.land_area || 0)}m²`} />
          </View>

          <View style={styles.documentationContainer}>
            <Text style={styles.documentationLabel}>Documentación:</Text>
            <View style={[
              styles.documentationStatus,
              { borderColor: COLORS.gray }
            ]}>
              <Text style={[
                styles.documentationStatusText,
                { color: COLORS.gray }
              ]}>
                Pendiente
              </Text>
            </View>
          </View>

          {propertyData.amenities && (
            <Text style={styles.descriptionText}>{propertyData.amenities}</Text>
          )}

          {propertyData.additional_info && (
            <Text style={styles.descriptionText}>{propertyData.additional_info}</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendOfferButton}
          onPress={handleSendOffer}
        >
          <Ionicons name="mail" size={24} color={COLORS.white} />
          <Text style={styles.sendOfferButtonText}>Enviar Oferta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.black,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  sendOfferButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sendOfferButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default AgentPropertyDetailScreen; 