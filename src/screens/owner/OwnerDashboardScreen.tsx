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
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../services/supabase';
import { PropertyService } from '../../services/propertyService';
import { ProposalService } from '../../services/proposalService';
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
  const [selectedLocation, setSelectedLocation] = useState('Cualquier lugar');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingProposalsCount, setPendingProposalsCount] = useState(0);

  // Fetch user profile function
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Current user (Owner):', user?.id);
      
      if (user) {
        // First check if user is an owner
        const { data: userAuth, error: userAuthError } = await supabase
          .from('user_auth')
          .select('user_type, owner_id')
          .eq('id', user.id)
          .single();

        if (userAuthError) {
          console.error('❌ Error fetching user auth (Owner):', userAuthError);
          return;
        }

        console.log('🔍 User auth data (Owner):', userAuth);

        if (userAuth?.user_type === 'owner' && userAuth?.owner_id) {
          // Fetch owner profile
          const { data: ownerProfile, error } = await supabase
            .from('owners')
            .select('id, full_name, avatar_url')
            .eq('id', userAuth.owner_id)
            .single();

          if (error) {
            console.error('❌ Error fetching owner profile (Owner):', error);
          } else {
            console.log('✅ Owner profile fetched successfully (Owner):', ownerProfile);
            console.log('🖼️ Avatar URL (Owner):', ownerProfile.avatar_url);
            setUserProfile(ownerProfile);
          }
        } else {
          console.log('⚠️ User is not an owner or owner_id not found (Owner)');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile (Owner):', error);
    }
  };

  // Fetch user profile and properties on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchProperties();
    fetchPendingProposalsCount();
  }, []);

  // Refresh user profile when screen comes into focus (e.g., returning from profile screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused - refreshing user profile...');
      fetchUserProfile();
    }, [])
  );

    // Refresh properties when screen comes into focus (e.g., returning from other screens)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused - refreshing properties list...');
      fetchProperties();
    }, [])
  );

const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userProperties = await PropertyService.getPropertiesByOwner(user.id);
      setProperties(userProperties);
      console.log('✅ Properties fetched successfully:', userProperties.length);
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProposalsCount = async () => {
    try {
      console.log('🔍 Fetching pending proposals count...');
      const proposals = await ProposalService.getProposalsForOwner();
      const pendingCount = proposals.filter(p => p.status === 'pending').length;
      console.log('✅ Pending proposals count:', pendingCount);
      setPendingProposalsCount(pendingCount);
    } catch (error) {
      console.error('❌ Error fetching pending proposals count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    await fetchPendingProposalsCount();
    setRefreshing(false);
  };

  // Log avatar URL when it changes
  useEffect(() => {
    if (userProfile?.avatar_url) {
      console.log('🧪 Final avatar URL to load (Owner):', userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  const locations = ['Cualquier lugar', ...new Set(properties.map(p => p.state))].sort((a, b) => {
    if (a === 'Cualquier lugar') return -1;
    if (b === 'Cualquier lugar') return 1;
    return a.localeCompare(b);
  });

  const filteredProperties = properties.filter(property => {
    const matchesLocation = selectedLocation === 'Cualquier lugar' || property.state === selectedLocation;
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
    return require('../../../assets/images/logo_login_screen.png');
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

  const renderPropertyCard = ({ item: property, index }: { item: Property; index: number }) => {
    // Check if the location text is too long
    const locationText = `${property.municipality}, ${property.state}`;
    const isLocationLong = locationText.length > 25; // Adjust threshold as needed
    
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => {
          if (property.id) {
            router.push({
              pathname: '/(owner)/property/[id]',
              params: { id: property.id }
            });
          }
        }}
      >
        <Image
          source={getPropertyImage(property)}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(index)}
        >
          <Ionicons
            name={favoriteIndices.has(index) ? "heart" : "heart-outline"}
            size={28}
            color={favoriteIndices.has(index) ? COLORS.secondary : COLORS.primary}
          />
        </TouchableOpacity>
        <View style={styles.propertyInfo}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={22} color={COLORS.secondary} />
            <View style={styles.locationTextContainer}>
              {isLocationLong ? (
                <View>
                  <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                    {property.municipality}
                  </Text>
                  <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                    {property.state}
                  </Text>
                </View>
              ) : (
                <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                  {property.municipality}, {property.state}
                </Text>
              )}
              <Text style={styles.propertyTypeText} numberOfLines={1} ellipsizeMode="tail">
                {property.property_type || 'Propiedad'} en {property.intent === 'sell' ? 'VENTA' : property.intent === 'rent' ? 'RENTA' : 'VENTA/RENTA'}
              </Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>{property.commission_percentage}%</Text>
            <Text style={styles.commissionLabel}>Comisión</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            onPress={() => router.push({ pathname: '/(owner)/notifications' })}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
            {pendingProposalsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {pendingProposalsCount > 99 ? '99+' : pendingProposalsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(owner)/profile')}
          >
            {userProfile?.avatar_url ? (
              <Image 
                source={{ uri: userProfile.avatar_url }}
                style={styles.profileImage}
                onError={() => setImageLoadError(true)}
              />
            ) : (
            <Image 
              source={require('../../../assets/images/icon.png')}
              style={styles.profileImage}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 60, // Ensure minimum height for the info container
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 6,
    flex: 1,
    marginRight: 8,
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
  commissionContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
    flexShrink: 0,
    marginLeft: 8,
  },
  commissionText: {
    ...FONTS.title,
    fontSize: 24, // Slightly smaller for better fit
  },
  commissionLabel: {
    fontSize: 12, // Smaller font for label
    color: 'rgba(0, 0, 0, 0.5)',
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
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 2,
  },
  notificationBadgeText: {
    ...FONTS.regular,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default OwnerDashboardScreen;
