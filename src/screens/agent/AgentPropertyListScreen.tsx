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
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES, commonStyles } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { ProposalService } from '../../services/proposalService';

const { width, height } = Dimensions.get('window');

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
  status: 'active' | 'inactive' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const AgentPropertyListScreen = () => {
  console.log('🚀 AgentPropertyListScreen component rendered');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedCommission, setSelectedCommission] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [favoriteIndices, setFavoriteIndices] = useState<Set<number>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responseProposalsCount, setResponseProposalsCount] = useState(0);

  // Fetch properties from database
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching properties from database...');
      
      // First, let's check if there are any properties at all (bypass RLS for debugging)
      const { data: allProperties, error: allPropertiesError } = await supabase
        .from('properties')
        .select('*')
        .limit(5);

      console.log('🔍 All properties test:', allProperties?.length || 0, 'properties found');
      if (allPropertiesError) {
        console.error('❌ Error fetching all properties:', allPropertiesError);
      } else if (allProperties && allProperties.length > 0) {
        console.log('📋 Sample property:', allProperties[0]);
      }
      
      // Check if current user has user_auth record
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userAuth, error: userAuthError } = await supabase
          .from('user_auth')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('🔍 User auth record:', userAuth);
        if (userAuthError) {
          console.error('❌ Error fetching user auth:', userAuthError);
        }
      }
      
      // Try fetching properties without status filter first
      const { data: propertiesWithoutStatus, error: propertiesWithoutStatusError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 Properties without status filter:', propertiesWithoutStatus?.length || 0, 'properties found');
      if (propertiesWithoutStatusError) {
        console.error('❌ Error fetching properties without status filter:', propertiesWithoutStatusError);
      }
      
      // Now fetch active properties
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching active properties:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // If there's an RLS error, let's try a different approach
        if (error.message?.includes('policy') || error.message?.includes('permission')) {
          console.log('🚨 RLS Policy issue detected. Trying alternative approach...');
          
          // Try using the properties from the "all properties" query if they exist
          if (allProperties && allProperties.length > 0) {
            const activeProperties = allProperties.filter(p => p.status === 'active');
            console.log('✅ Using filtered properties from bypass query:', activeProperties.length);
            setProperties(activeProperties);
            return;
          }
        }
      } else {
        console.log('✅ Active properties fetched successfully:', data?.length || 0);
        console.log('📋 Properties data:', data);
        setProperties(data || []);
      }
    } catch (error) {
      console.error('❌ Error in fetchProperties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch properties from database
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔍 Current user:', user?.id);
        
        if (user) {
          // First check if user is an agent
          const { data: userAuth, error: userAuthError } = await supabase
            .from('user_auth')
            .select('user_type, agent_id')
            .eq('id', user.id)
            .single();

          if (userAuthError) {
            console.error('❌ Error fetching user auth:', userAuthError);
            return;
          }

          console.log('🔍 User auth data:', userAuth);

          if (userAuth?.user_type === 'agent' && userAuth?.agent_id) {
            // Fetch agent profile
            const { data: agentProfile, error } = await supabase
              .from('agents')
              .select('id, full_name, avatar_url')
              .eq('id', userAuth.agent_id)
              .single();

            if (error) {
              console.error('❌ Error fetching agent profile:', error);
            } else {
              console.log('✅ Agent profile fetched successfully:', agentProfile);
              console.log('🖼️ Avatar URL:', agentProfile.avatar_url);
              
              // Test if the image URL is accessible
              if (agentProfile.avatar_url) {
                try {
                  const response = await fetch(agentProfile.avatar_url, { method: 'HEAD' });
                  console.log('🖼️ Image URL status:', response.status, response.ok ? '✅ Accessible' : '❌ Not accessible');
                } catch (fetchError) {
                  console.error('❌ Error testing image URL:', fetchError);
                }
              }
              
              setUserProfile(agentProfile);
            }
          } else {
            console.log('⚠️ User is not an agent or agent_id not found');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Log avatar URL when it changes
  useEffect(() => {
    if (userProfile?.avatar_url) {
      console.log('🧪 Final avatar URL to load (Agent):', userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  // Fetch agent proposal responses
  const fetchResponseProposalsCount = async () => {
    try {
      const proposals = await ProposalService.getProposalsByAgent();
      const count = proposals.filter(p => p.status !== 'pending').length;
      setResponseProposalsCount(count);
    } catch (error) {
      console.error('❌ Error fetching agent proposal responses:', error);
    }
  };

  useEffect(() => {
    fetchResponseProposalsCount();
  }, []);

  const locations = ['All', ...new Set(properties.map(p => `${p.neighborhood}, ${p.municipality}`))].sort();
  const propertyTypes = ['All', ...new Set(properties.map(p => p.property_type))].sort();
  const commissionPercentages = ['All', ...new Set(properties.map(p => `${p.commission_percentage}%`))].sort();

  const filteredProperties = properties.filter(property => {
    const propertyLocation = `${property.neighborhood}, ${property.municipality}`;
    const matchesLocation = selectedLocation === 'All' || propertyLocation === selectedLocation;
    const matchesQuery = searchQuery === '' || 
      propertyLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.property_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedPropertyType === 'All' || property.property_type === selectedPropertyType;
    const matchesCommission = selectedCommission === 'All' || `${property.commission_percentage}%` === selectedCommission;

    return matchesLocation && matchesQuery && matchesType && matchesCommission;
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

  const renderPropertyItem = ({ item, index }: { item: Property; index: number }) => {
    // Fix location display to show actual data
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
      : require('../../../assets/images/property1.png');

    return (
      <Pressable
        style={styles.propertyCard}
        onPress={() => router.push({
          pathname: '/(agent)/property/[id]',
          params: { 
            id: item.id
          }
        })}
      >
        <Image source={propertyImage} style={styles.propertyImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(index)}
        >
          <Ionicons
            name={favoriteIndices.has(index) ? 'heart' : 'heart-outline'}
            size={28}
            color={favoriteIndices.has(index) ? COLORS.secondary : COLORS.primary}
          />
        </TouchableOpacity>
        <View style={styles.propertyInfo}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={22} color={COLORS.secondary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>{propertyLocation}</Text>
              <Text style={styles.propertyTypeText}>
                {item.property_type || 'Propiedad'} en {item.intent === 'sell' ? 'VENTA' : 'RENTA'}
              </Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>{item.commission_percentage}%</Text>
            <Text style={styles.commissionLabel}>Comision</Text>
          </View>
        </View>
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
            onPress={() => router.push('/(agent)/notifications')}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
            {responseProposalsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {responseProposalsCount > 99 ? '99+' : responseProposalsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(agent)/profile')}
          >
            <Image 
              source={require('../../../assets/images/icon.png')}
              style={styles.profileImage}
            />
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

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Cargando propiedades...</Text>
        </View>
      ) : filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedLocation !== 'All' || selectedPropertyType !== 'All' || selectedCommission !== 'All'
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
  searchLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 6,
  },
  locationText: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  propertyTypeText: {
    ...FONTS.regular,
  },
  commissionContainer: {
    alignItems: 'flex-end',
  },
  commissionText: {
    ...FONTS.title,
    fontSize: 28,
  },
  commissionLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default AgentPropertyListScreen; 