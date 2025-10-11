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
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { PropertyService } from '../../services/propertyService';
import { Property as PropertyType } from '../../types/property';

const { width, height } = Dimensions.get('window');

const InfoIconText = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoIconContainer}>
    <Ionicons name={icon as any} size={32} color={COLORS.primary} />
    <Text style={[styles.infoIconText, { marginTop: 4 }]}>{label}</Text>
  </View>
);

const GuestPropertyDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propertyData, setPropertyData] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        if (id) {
          const data = await PropertyService.getPropertyById(id);
          setPropertyData(data);
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

  const handleContactOwner = () => {
    setShowLoginPrompt(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    router.push('/(general)/login');
  };

  const handleRegisterRedirect = () => {
    setShowLoginPrompt(false);
    router.push('/(general)/register');
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
    return require('../../../assets/images/logo_login_screen.png');
  };

  // Count how many documents are selected
  const getDocumentationStatus = () => {
    if (!(propertyData as any)?.documentation || typeof (propertyData as any).documentation !== 'object') {
      return { status: 'Parcial', isComplete: false };
    }
    
    const selectedDocs = Object.values((propertyData as any).documentation).filter(Boolean).length;
    
    if (selectedDocs > 3) {
      return { status: 'Completa', isComplete: true };
    } else if (selectedDocs > 0) {
      return { status: 'Parcial', isComplete: false };
    } else {
      return { status: 'Parcial', isComplete: false };
    }
  };
  
  const documentationInfo = getDocumentationStatus();
  const isDocumentationComplete = documentationInfo.isComplete;

  const propertyImages = propertyData.images && propertyData.images.length > 0
    ? propertyData.images
    : [require('../../../assets/images/logo_login_screen.png')];

  return (
    <View style={styles.container}>
      {/* Guest Banner at the very top */}
      <View style={styles.guestBannerTop}>
        <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
        <Text style={styles.guestBannerText}>
          Inicia sesión como Agente para contactar al propietario
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {/* Carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCarouselIndex(index);
            }}
            scrollEventThrottle={16}
            style={{ width: '100%', height: '100%' }}
          >
            {propertyImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                onPress={() => {
                  setModalImageIndex(idx);
                  setModalVisible(true);
                }}
                style={{ width, height: 320 }}
              >
                <Image
                  source={typeof img === 'string' ? { uri: img } : img}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Dots indicator */}
          {propertyImages.length > 1 && (
            <View style={styles.carouselDotsContainer}>
              {propertyImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.carouselDot,
                    carouselIndex === idx && styles.carouselDotActive
                  ]}
                />
              ))}
            </View>
          )}
          {/* Modal for full image view */}
          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <Image
                source={typeof propertyImages[modalImageIndex] === 'string' ? { uri: propertyImages[modalImageIndex] } : propertyImages[modalImageIndex]}
                style={styles.fullImage}
                resizeMode="contain"
              />
              {/* Left arrow */}
              {propertyImages.length > 1 && modalImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.arrowButton, { left: 10 }]}
                  onPress={() => setModalImageIndex(modalImageIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={40} color="#fff" />
                </TouchableOpacity>
              )}
              {/* Right arrow */}
              {propertyImages.length > 1 && modalImageIndex < propertyImages.length - 1 && (
                <TouchableOpacity
                  style={[styles.arrowButton, { right: 10 }]}
                  onPress={() => setModalImageIndex(modalImageIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={40} color="#fff" />
                </TouchableOpacity>
              )}
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={36} color="#fff" />
              </TouchableOpacity>
            </View>
          </Modal>
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
              <View>
                <Text style={styles.locationText}>{propertyData.municipality}</Text>
                <Text style={styles.locationText}>{propertyData.state}</Text>
              </View>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <View style={styles.commissionBg}>
              <Text style={styles.commissionText}>{propertyData.commission_percentage}%</Text>
              <Text style={styles.commissionLabel}>comisión</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.typeContainer}>
            <View style={styles.typeDot} />
            <Text style={styles.typeText}>
              En {propertyData.intent === 'sell' ? 'venta' : propertyData.intent === 'rent' ? 'renta' : 'venta/renta'} {propertyData.property_type}
            </Text>
          </View>

          <Text style={styles.sectionTitleSmall}>
            Información de la propiedad
          </Text>

          <View style={styles.infoContainer}>
            <InfoIconText icon="bed" label={`${propertyData.bedrooms || 0} cuartos`} />
            <InfoIconText icon="water" label={`${propertyData.bathrooms || 0} baños`} />
            <InfoIconText icon="water-outline" label={`${propertyData.half_bathrooms || 0} medios baños`} />
          </View>

          <View style={styles.areaContainer}>
            <View style={styles.areaInfoRow}>
              <View style={styles.areaInfoItem}>
                <Ionicons name="business" size={20} color={COLORS.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.areaInfoLabel}>Construcción</Text>
                <Text style={styles.areaInfoValue}>{propertyData.construction_area || 0}<Text style={styles.areaInfoUnit}> m²</Text></Text>
              </View>
              <View style={styles.areaInfoItem}>
                <Ionicons name="leaf" size={20} color={COLORS.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.areaInfoLabel}>Terreno</Text>
                <Text style={styles.areaInfoValue}>{propertyData.land_area || 0}<Text style={styles.areaInfoUnit}> m²</Text></Text>
              </View>
            </View>
            <View style={styles.areaInfoRow}>
              <View style={styles.areaInfoItem}>
                <Ionicons name="grid" size={20} color={COLORS.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.areaInfoLabel}>Total</Text>
                <Text style={styles.areaInfoValue}>{(propertyData.construction_area || 0) + (propertyData.land_area || 0)}<Text style={styles.areaInfoUnit}> m²</Text></Text>
              </View>
            </View>
          </View>

          <View style={styles.documentationContainer}>
            <Text style={styles.documentationLabel}>Documentación:</Text>
            <View style={[
              styles.documentationStatus,
              { borderColor: isDocumentationComplete ? COLORS.secondary : COLORS.gray }
            ]}>
              <Text style={[
                styles.documentationStatusText,
                { color: isDocumentationComplete ? COLORS.secondary : COLORS.gray }
              ]}>
                {documentationInfo.status}
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
          onPress={handleContactOwner}
        >
          <Ionicons name="mail" size={24} color={COLORS.white} />
          <Text style={styles.sendOfferButtonText}>Enviar Oferta</Text>
        </TouchableOpacity>
      </View>

      {/* Login Prompt Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLoginPrompt}
        onRequestClose={() => setShowLoginPrompt(false)}
      >
        <View style={styles.loginPromptContainer}>
          <View style={styles.loginPromptContent}>
            <Ionicons 
              name="briefcase" 
              size={48} 
              color={COLORS.secondary} 
              style={styles.loginPromptIcon}
            />
            <Text style={styles.loginPromptTitle}>
              Función para Agentes
            </Text>
            <Text style={styles.loginPromptMessage}>
              Para contactar propietarios y enviar propuestas, necesitas registrarte como Agente.
            </Text>
            
            <TouchableOpacity
              style={[styles.loginPromptButton, styles.loginPromptButtonPrimary]}
              onPress={handleLoginRedirect}
            >
              <Text style={styles.loginPromptButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.loginPromptButton, styles.loginPromptButtonSecondary]}
              onPress={handleRegisterRedirect}
            >
              <Text style={[styles.loginPromptButtonText, styles.loginPromptButtonTextSecondary]}>
                Crear Cuenta
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginPromptCancelButton}
              onPress={() => setShowLoginPrompt(false)}
            >
              <Text style={styles.loginPromptCancelText}>Continuar Explorando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  guestBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  guestBannerText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 8,
    flex: 1,
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
  commissionBg: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
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
  sectionTitleSmall: {
    ...FONTS.title,
    fontSize: 22,
    color: COLORS.black,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 26,
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
  areaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  areaInfoLabel: {
    ...FONTS.regular,
    fontWeight: 'bold',
    marginRight: 4,
  },
  areaInfoValue: {
    ...FONTS.regular,
    fontWeight: '600',
    marginRight: 2,
  },
  areaInfoUnit: {
    ...FONTS.regular,
    fontWeight: '400',
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 1,
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
    backgroundColor: COLORS.secondary,
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
  areaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 4,
  },
  carouselDotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: COLORS.white,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loginPromptContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
  },
  loginPromptIcon: {
    marginBottom: 16,
  },
  loginPromptTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptMessage: {
    ...FONTS.regular,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginPromptButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginPromptButtonPrimary: {
    backgroundColor: COLORS.secondary,
  },
  loginPromptButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  loginPromptButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  loginPromptButtonTextSecondary: {
    color: COLORS.secondary,
  },
  loginPromptCancelButton: {
    marginTop: 8,
  },
  loginPromptCancelText: {
    ...FONTS.regular,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    textDecorationLine: 'underline',
  },
});

export default GuestPropertyDetailScreen;
