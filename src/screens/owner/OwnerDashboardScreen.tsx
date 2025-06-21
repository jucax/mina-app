import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  ImageSourcePropType,
  FlatList,
  Modal,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { PropertyService } from '../../services/propertyService';
import { Property } from '../../types/property';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const OwnerDashboardScreen = () => {
  const [favoriteIndices, setFavoriteIndices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile and properties on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchProperties();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Current user (Owner):', user?.id);
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching user profile (Owner):', error);
        } else {
          console.log('✅ Profile fetched successfully (Owner):', profile);
          console.log('🖼️ Avatar URL (Owner):', profile.avatar_url);
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile (Owner):', error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await PropertyService.getUserProperties();
      setProperties(userProperties);
      console.log('✅ Properties fetched successfully:', userProperties.length);
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  // Log avatar URL when it changes
  useEffect(() => {
    if (userProfile?.avatar_url) {
      console.log('🧪 Final avatar URL to load (Owner):', userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  const locations = ['All', ...new Set(properties.map(p => p.state))].sort();

  const filteredProperties = properties.filter(property => {
    const matchesLocation = selectedLocation === 'All' || property.state === selectedLocation;
    const matchesQuery = searchQuery === '' || 
      property.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.street.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesQuery;
  });

  const toggleFavorite = (index: number) => {
    const newFavorites = new Set(favoriteIndices);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavoriteIndices(newFavorites);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: Property) => {
    if (property.images && property.images.length > 0) {
      return { uri: property.images[0] };
    }
    // Return a default image if no images are available
    return require('../../../assets/images/property1.png');
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

  const renderPropertyCard = ({ item: property, index }: { item: Property; index: number }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => router.push({
        pathname: '/(owner)/property/[id]',
        params: { id: property.id }
      })}
    >
      <Image
        source={getPropertyImage(property)}
        style={styles.propertyImage}
        resizeMode="cover"
      />
      <View style={styles.propertyInfo}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyType}>{property.property_type}</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(index)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={favoriteIndices.has(index) ? "heart" : "heart-outline"}
              size={24}
              color={favoriteIndices.has(index) ? COLORS.secondary : COLORS.gray}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.propertyLocation}>
          {property.municipality}, {property.state}
        </Text>
        
        <Text style={styles.propertyPrice}>
          {formatPrice(property.price)}
        </Text>
        
        <View style={styles.propertyStats}>
          <View style={styles.statItem}>
            <Ionicons name="bed-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{property.bedrooms || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{property.bathrooms || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="car-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>2</Text>
          </View>
        </View>
        
        <View style={styles.propertyStatus}>
          <View style={[
            styles.statusBadge,
            property.status === 'published' && styles.statusPublished,
            property.status === 'draft' && styles.statusDraft,
          ]}>
            <Text style={styles.statusText}>
              {property.status === 'published' ? 'Publicado' : 'Borrador'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            onPress={() => router.push({ pathname: '/(owner)/notifications' })}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(owner)/owner-profile')}
          >
            {userProfile?.avatar_url && !imageLoadError ? (
              <Image 
                source={{ uri: userProfile.avatar_url }} 
                style={styles.profileImage}
                onError={(error) => {
                  console.error('❌ Image loading error (Owner):', error.nativeEvent.error);
                  setImageLoadError(true);
                }}
                onLoad={() => console.log('✅ Image loaded successfully (Owner):', userProfile.avatar_url)}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={24} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar propiedades..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Propiedades</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(owner)/intent-selection')}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando propiedades...</Text>
          </View>
        ) : filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No tienes propiedades</Text>
            <Text style={styles.emptySubtitle}>
              Comienza agregando tu primera propiedad
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => router.push('/(owner)/intent-selection')}
            >
              <Text style={styles.addFirstButtonText}>Agregar Propiedad</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProperties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => (item.id || `property-${Math.random()}`)}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.secondary]}
                tintColor={COLORS.secondary}
              />
            }
          />
        )}
      </View>

      <LocationDropdown />
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
    paddingTop: SIZES.padding.large,
    height: 100,
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
    marginTop: 25,
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
    marginTop: 22,
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
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  profileImagePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.margin.medium,
  },
  searchBar: {
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
  sectionTitle: {
    ...FONTS.regular,
    fontSize: 18,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.black,
    marginBottom: 12,
  },
  emptySubtitle: {
    ...FONTS.regular,
    color: COLORS.gray,
    fontSize: 18,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  addFirstButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    color: COLORS.gray,
    fontSize: 18,
  },
  propertyCard: {
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
  },
  propertyImage: {
    height: 180,
    width: '100%',
  },
  propertyInfo: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyType: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  propertyLocation: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  propertyPrice: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.secondary,
  },
  propertyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...FONTS.regular,
    marginLeft: 8,
  },
  propertyStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  statusPublished: {
    backgroundColor: COLORS.secondary,
  },
  statusDraft: {
    backgroundColor: COLORS.gray,
  },
  statusText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.black,
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
});

export default OwnerDashboardScreen; 