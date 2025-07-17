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
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { PropertyService } from '../../services/propertyService';
import { ViewTrackingService } from '../../services/viewTrackingService';
import { ProposalService } from '../../services/proposalService';
import { Property as PropertyType } from '../../types/property';
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

const InfoIconText = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoIconContainer}>
    <Ionicons name={icon as any} size={32} color={COLORS.primary} />
    <Text style={[styles.infoIconText, { marginTop: 4 }]}>{label}</Text>
  </View>
);

const AreaInfo = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.areaInfoItem}>
    <Text style={styles.areaInfoLabel}>{label}</Text>
    <Text style={styles.areaInfoValue}>{value}</Text>
  </View>
);

const AgentPropertyDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propertyData, setPropertyData] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [proposalCount, setProposalCount] = useState(0);
  const [proposalCountLoading, setProposalCountLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

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

  useEffect(() => {
    // Fetch userType and userId if not already set
    const fetchUserTypeAndId = async () => {
      if (!userType || !userId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userAuth, error } = await supabase
              .from('user_auth')
              .select('user_type, agent_id')
              .eq('id', user.id)
              .single();
            if (!error && userAuth) {
              setUserType(userAuth.user_type);
              setUserId(userAuth.agent_id);
              console.log('Fetched userType:', userAuth.user_type, 'userId:', userAuth.agent_id);
            } else {
              console.error('Error fetching user_auth:', error);
            }
          }
        } catch (e) {
          console.error('Error fetching userType/userId:', e);
        }
      }
    };
    fetchUserTypeAndId();
  }, []);

  useEffect(() => {
    const incrementView = async () => {
      console.log('incrementView called. propertyData:', propertyData, 'userType:', userType, 'userId:', userId);
      if (propertyData && userType === 'agent' && propertyData.owner_id !== userId) {
        try {
          const oldViews = propertyData.views_count || 0;
          console.log(`Current views_count for property ${propertyData.id}:`, oldViews);
          const { data, error } = await supabase
            .from('properties')
            .update({ views_count: oldViews + 1 })
            .eq('id', propertyData.id)
            .select('views_count')
            .single();
          if (error) {
            console.error('Error incrementing property views:', error);
          } else {
            console.log(`views_count incremented for property ${propertyData.id}:`, data.views_count);
          }
        } catch (e) {
          console.error('Error incrementing property views:', e);
        }
      } else {
        console.log('Not incrementing view: propertyData:', propertyData, 'userType:', userType, 'userId:', userId);
      }
    };
    incrementView();
  }, [propertyData, userType, userId]);

  useEffect(() => {
    const fetchProposalCount = async () => {
      try {
        if (id) {
          const count = await ProposalService.getAgentProposalCountForProperty(id);
          setProposalCount(count);
        }
      } catch (error) {
        console.error('Error fetching proposal count:', error);
      } finally {
        setProposalCountLoading(false);
      }
    };

    fetchProposalCount();
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
    // Return a placeholder since users now select their own images
    return require('../../../assets/images/logo_login_screen.png');
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

  const isDocumentationComplete = (propertyData as any)?.documentation && typeof (propertyData as any).documentation === 'object'
    ? Object.values((propertyData as any).documentation).every(Boolean)
    : false;

  const propertyImages = propertyData.images && propertyData.images.length > 0
    ? propertyData.images
    : [require('../../../assets/images/logo_login_screen.png')];

  return (
    <View style={styles.container}>
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
          <View style={styles.centeredRow}>
            <InfoIconText icon="car" label={`0 estacionamientos`} />
            <InfoIconText icon="calendar" label={`Año: N/A`} />
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
                {isDocumentationComplete ? 'Completa' : 'Pendiente'}
              </Text>
            </View>
          </View>

          {propertyData.amenities && (
            <Text style={styles.descriptionText}>{propertyData.amenities}</Text>
          )}

          {propertyData.additional_info && (
            <Text style={styles.descriptionText}>{propertyData.additional_info}</Text>
          )}

          {/* Show proposal count */}
          <View style={styles.proposalCountContainer}>
            <Text style={styles.proposalCountText}>
              Propuestas enviadas: {proposalCount}/3
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {proposalCount >= 3 && (
          <TouchableOpacity
            style={styles.disabledSendOfferButton}
            disabled
          >
            <Text style={styles.disabledSendOfferButtonText}>Límite de Ofertas Alcanzado</Text>
          </TouchableOpacity>
        )}
        {proposalCount < 3 && (
          <TouchableOpacity
            style={styles.sendOfferButton}
            onPress={handleSendOffer}
          >
            <Ionicons name="mail" size={24} color={COLORS.white} />
            <Text style={styles.sendOfferButtonText}>Enviar Oferta</Text>
          </TouchableOpacity>
        )}
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
  disabledSendOfferButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendOfferButtonText: {
    ...FONTS.regular,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  proposalCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  proposalCountText: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 32,
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
});

export default AgentPropertyDetailScreen; 