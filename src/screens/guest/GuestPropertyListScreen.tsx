import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

interface Property {
  id: string;
  owner_id: string;
  intent: 'sell' | 'rent';
  timeline: string;
  price: number;
  property_type: string;
  documentation: string;
  country: string;
  state: string;
  municipality: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  construction_area?: number;
  land_area?: number;
  images: string[];
  commission_percentage: number;
  description?: string;
  status: 'active' | 'published' | 'inactive' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
}

const GuestPropertyListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Cualquier lugar');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedCommission, setSelectedCommission] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptType, setLoginPromptType] = useState<'agent' | 'owner'>('agent');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch properties from database
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔍 Guest fetching properties from database...');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching published properties:', error);
      } else {
        console.log('✅ Published properties fetched successfully:', data?.length || 0);
        setProperties(data || []);
      }
    } catch (error) {
      console.error('❌ Error in fetchProperties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Build locations array with states only
  const locations = ['Cualquier lugar', ...new Set(properties.map(p => p.state))].sort((a, b) => {
    if (a === 'Cualquier lugar') return -1;
    if (b === 'Cualquier lugar') return 1;
    return a.localeCompare(b);
  });
  const propertyTypes = ['All', ...new Set(properties.map(p => p.property_type))].sort();
  const commissionPercentages = ['All', ...new Set(properties.map(p => `${p.commission_percentage}%`))].sort();

  const filteredProperties = properties.filter(property => {
    const matchesLocation = selectedLocation === 'Cualquier lugar' || property.state === selectedLocation;
    const matchesQuery = searchQuery === '' || 
      property.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.property_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedPropertyType === 'All' || property.property_type === selectedPropertyType;
    const matchesCommission = selectedCommission === 'All' || `${property.commission_percentage}%` === selectedCommission;

    return matchesLocation && matchesQuery && matchesType && matchesCommission;
  });

  const handlePropertyPress = (propertyId: string) => {
    // For now, just navigate to a guest property detail view
    // You can create a guest-specific detail screen later
    router.push({
      pathname: '/(guest)/property/[id]',
      params: { id: propertyId }
    });
  };

  const handleAddPropertyPress = () => {
    setLoginPromptType('owner');
    setShowLoginPrompt(true);
  };

  const handleContactOwnerPress = () => {
    setLoginPromptType('agent');
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

  const renderPropertyItem = ({ item, index }: { item: Property; index: number }) => {
    const neighborhood = item.neighborhood || '';
    const municipality = item.municipality || '';
    let propertyLocation = '';
    
    if (neighborhood && municipality) {
      propertyLocation = `${neighborhood}, ${municipality}`;
    } else if (municipality) {
      propertyLocation = municipality;
    } else if (neighborhood) {
      propertyLocation = neighborhood;
    } else {
      propertyLocation = 'Sin especificar';
    }
    
    const propertyImage = item.images && item.images.length > 0 
      ? { uri: item.images[0] } 
      : require('../../../assets/images/logo_login_screen.png');

    return (
      <Pressable
        style={styles.propertyCard}
        onPress={() => handlePropertyPress(item.id)}
      >
        <Image
          source={propertyImage}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleContactOwnerPress}
        >
          <Ionicons
            name="heart-outline"
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        {isTablet ? (
          <>
            {/* Left Bottom Corner - Location Info (iPad only) */}
            <View style={styles.leftInfoBox}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color={COLORS.secondary} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                    {propertyLocation}
                  </Text>
                  <Text style={styles.propertyTypeText} numberOfLines={1} ellipsizeMode="tail">
                    {item.property_type || 'Propiedad'} en {item.intent === 'sell' ? 'VENTA' : 'RENTA'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Bottom Corner - Commission (iPad only) */}
            <View style={styles.rightInfoBox}>
              <Text style={styles.commissionText}>{item.commission_percentage}%</Text>
              <Text style={styles.commissionLabel}>Comision</Text>
            </View>
          </>
        ) : (
          /* Original single info bar for phone */
          <View style={styles.propertyInfo}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                  {propertyLocation}
                </Text>
                <Text style={styles.propertyTypeText} numberOfLines={1} ellipsizeMode="tail">
                  {item.property_type || 'Propiedad'} en {item.intent === 'sell' ? 'VENTA' : 'RENTA'}
                </Text>
              </View>
            </View>
            <View style={styles.commissionContainer}>
              <Text style={styles.commissionText}>{item.commission_percentage}%</Text>
              <Text style={styles.commissionLabel}>Comision</Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  const LocationDropdown = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLocationDropdown}
      onRequestClose={() => setShowLocationDropdown(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar ubicación</Text>
            <TouchableOpacity onPress={() => setShowLocationDropdown(false)}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={locations}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedLocation(item);
                  setShowLocationDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tipo de propiedad:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtonsContainer}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedPropertyType === type && styles.filterButtonActive
                ]}
                onPress={() => setSelectedPropertyType(type)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedPropertyType === type && styles.filterButtonTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.modalTitle}>Comisión:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtonsContainer}>
            {commissionPercentages.map((commission) => (
              <TouchableOpacity
                key={commission}
                style={[
                  styles.filterButton,
                  selectedCommission === commission && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCommission(commission)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCommission === commission && styles.filterButtonTextActive
                ]}>{commission}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LoginPromptModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showLoginPrompt}
      onRequestClose={() => setShowLoginPrompt(false)}
    >
      <View style={styles.loginPromptContainer}>
        <View style={styles.loginPromptContent}>
          <Ionicons 
            name={loginPromptType === 'agent' ? 'briefcase' : 'home'} 
            size={48} 
            color={COLORS.secondary} 
            style={styles.loginPromptIcon}
          />
          <Text style={styles.loginPromptTitle}>
            {loginPromptType === 'agent' 
              ? 'Función para Agentes' 
              : 'Función para Propietarios'}
          </Text>
          <Text style={styles.loginPromptMessage}>
            {loginPromptType === 'agent'
              ? 'Para contactar propietarios y enviar propuestas, necesitas registrarte como Agente.'
              : 'Para publicar propiedades, necesitas registrarte como Propietario.'}
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
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.locationDropdownButton}
            onPress={() => setShowLocationDropdown(true)}
          >
            <Ionicons name="location" size={22} color={COLORS.secondary} />
            <Text style={styles.locationDropdownText}>{selectedLocation}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddPropertyPress}
          >
            <Ionicons name="add-circle" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(general)/login')}
          >
            <Ionicons name="log-in-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={28} color={COLORS.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Búsqueda"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Guest Banner */}
      <View style={styles.guestBanner}>
        <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
        <Text style={styles.guestBannerText}>
          Explorando como invitado. Inicia sesión para acceder a todas las funciones.
        </Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Cargando propiedades...</Text>
        </View>
      ) : filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedLocation !== 'Cualquier lugar' || selectedPropertyType !== 'All' || selectedCommission !== 'All'
              ? 'No se encontraron propiedades con los filtros aplicados.'
              : 'No hay propiedades disponibles en este momento.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.propertyList}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}

      <LocationDropdown />
      <FilterModal />
      <LoginPromptModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingTop: 50,
    paddingBottom: 20,
    minHeight: 120,
  },
  searchContainer: {
    flex: 1,
  },
  locationDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 8,
    backgroundColor: COLORS.white,
    marginTop: 15,
  },
  locationDropdownText: {
    ...FONTS.regular,
    fontWeight: '600',
    color: COLORS.black,
    marginHorizontal: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.margin.medium,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...FONTS.regular,
    fontSize: 22,
    color: COLORS.black,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: 12,
    marginTop: SIZES.margin.medium,
    marginHorizontal: SIZES.margin.large,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  guestBannerText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 8,
    flex: 1,
  },
  propertyList: {
    padding: 16,
  },
  propertyCard: {
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftInfoBox: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: '70%',
    minWidth: 350,
  },
  rightInfoBox: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    minWidth: 80,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 6,
    flex: 1,
  },
  locationText: {
    ...FONTS.regular,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
  },
  propertyTypeText: {
    ...FONTS.regular,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 2,
  },
  commissionText: {
    ...FONTS.title,
    fontSize: 28,
  },
  commissionLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  propertyInfo: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  commissionContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
    flexShrink: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 12,
  },
  filterButtonsContainer: {
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterButtonText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  applyButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 48,
    alignSelf: 'center',
  },
  applyButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownItemText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.black,
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

export default GuestPropertyListScreen;

