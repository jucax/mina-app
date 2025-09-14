import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { PropertyService } from '../../services/propertyService';
import { Property as PropertyType } from '../../types/property';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [propertyData, setPropertyData] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

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

    // Refresh property data when screen comes into focus (e.g., returning from edit screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 OwnerPropertyDetailScreen focused - refreshing property data...');
      if (id) {
        const fetchPropertyData = async () => {
          try {
            const data = await PropertyService.getPropertyById(id);
            setPropertyData(data);
            console.log('✅ Property data refreshed successfully');
          } catch (error) {
            console.error('❌ Error refreshing property data:', error);
          }
        };
        fetchPropertyData();
      }
    }, [id])
  );

const handleToggleStatus = async () => {
    if (!propertyData?.id) return;

    const newStatus = propertyData.status === 'published' ? 'inactive' : 'published';
    const statusText = newStatus === 'published' ? 'publicar' : 'pausar';
    
    Alert.alert(
      'Confirmar acción',
      `¿Estás seguro de que quieres ${statusText} esta publicación?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpdatingStatus(true);
            try {
              await PropertyService.updateProperty(propertyData.id!, { status: newStatus });
              
              // Refresh property data
              const updatedData = await PropertyService.getPropertyById(propertyData.id!);
              setPropertyData(updatedData);
              
              Alert.alert(
                'Éxito',
                `La publicación ha sido ${statusText === 'publicar' ? 'publicada' : 'pausada'} correctamente.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error updating property status:', error);
              Alert.alert(
                'Error',
                `No se pudo ${statusText} la publicación. Por favor, intenta de nuevo.`,
                [{ text: 'OK' }]
              );
            } finally {
              setUpdatingStatus(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteProperty = async () => {
    if (!propertyData?.id) return;

    Alert.alert(
      'Eliminar Publicación',
      '¿Estás seguro de que quieres eliminar permanentemente esta publicación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingProperty(true);
            try {
              console.log('🗑️ Attempting to delete property with ID:', propertyData.id);
              
              // Call the delete function
              await PropertyService.deleteProperty(propertyData.id!);
              
              console.log('✅ Property deleted successfully');
              
              Alert.alert(
                'Publicación Eliminada',
                'La publicación ha sido eliminada correctamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('🔄 Navigating back to dashboard');
                      router.replace('/(owner)/dashboard' as any);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('❌ Error deleting property:', error);
              Alert.alert(
                'Error',
                `No se pudo eliminar la publicación. Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                [{ text: 'OK' }]
              );
            } finally {
              setDeletingProperty(false);
            }
          }
        }
      ]
    );
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

  const propertyImages = propertyData.images && propertyData.images.length > 0
    ? propertyData.images
    : [require('../../../assets/images/logo_login_screen.png')];

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

  return (
    <View style={styles.container}>
      <ScrollView>
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
            style={styles.propertyImage}
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
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </View>
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
            <Text style={styles.commissionValue}>{propertyData.commission_percentage}%</Text>
            <Text style={styles.commissionLabel}>comisión</Text>
            </View>
          </View>
        </View>

        <View style={styles.typeContainer}>
          <View style={styles.typeDot} />
          <Text style={styles.typeText}>
            En {propertyData.intent === 'sell' ? 'venta' : propertyData.intent === 'rent' ? 'renta' : 'venta/renta'} {propertyData.property_type}
          </Text>
        </View>

        <View style={styles.countersContainer}>
          <CounterInfo
            icon="eye"
            label="Vistas"
            count={propertyData.views_count || 0}
          />
          <CounterInfo
            icon="gift"
            label="Ofertas"
            count={propertyData.offers_count || 0}
          />
        </View>

        <Text style={styles.sectionTitleSmall}>
          Información de la propiedad
        </Text>

        <View style={styles.infoIconsContainer}>
          <InfoIconText icon="bed" label={`${propertyData.bedrooms || 0} cuartos`} />
          <InfoIconText icon="water" label={`${propertyData.bathrooms || 0} baños`} />
          <InfoIconText icon="water-outline" label={`${propertyData.half_bathrooms || 0} medios baños`} />
        </View>

        <View style={styles.areaInfoContainer}>
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
          <Text style={styles.descriptionText}>
            {propertyData.amenities}
          </Text>
        )}

        {propertyData.additional_info && (
          <Text style={styles.descriptionText}>
            {propertyData.additional_info}
          </Text>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (propertyData.id) {
              router.push({
                pathname: '/(owner)/property/[id]/edit',
                params: { id: propertyData.id }
              });
            }
          }}
        >
          <Ionicons name="create" size={24} color={COLORS.white} />
          <Text style={styles.editButtonText}>Editar Publicación</Text>
        </TouchableOpacity>

        {/* Action Buttons Container */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              propertyData?.status === 'inactive' ? styles.activateButton : styles.pauseButton
            ]}
            onPress={handleToggleStatus}
            disabled={updatingStatus}
          >
            <Ionicons 
              name={propertyData?.status === 'inactive' ? 'play' : 'pause'} 
              size={24} 
              color={COLORS.white} 
            />
            <Text style={styles.statusButtonText}>
              {updatingStatus 
                ? 'Actualizando...' 
                : propertyData?.status === 'inactive' 
                  ? 'Activar' 
                  : 'Pausar'
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.deleteButton]}
            onPress={handleDeleteProperty}
            disabled={deletingProperty}
          >
            <Ionicons 
              name="trash" 
              size={24} 
              color={COLORS.white} 
            />
            <Text style={styles.statusButtonText}>
              {deletingProperty ? 'Eliminando...' : 'Eliminar'}
            </Text>
          </TouchableOpacity>
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
  commissionBg: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 20,
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
    minWidth: 120,
    justifyContent: 'center',
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
  areaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 4,
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
    marginBottom: 16,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  pauseButton: {
    backgroundColor: '#FF6B35', // Orange for pause
  },
  activateButton: {
    backgroundColor: '#4CAF50', // Green for activate
  },
  deleteButton: {
    backgroundColor: '#F44336', // Red for delete
  },
  statusButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
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
  carouselDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: COLORS.secondary,
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
    resizeMode: 'contain',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

export default OwnerPropertyDetailScreen;
