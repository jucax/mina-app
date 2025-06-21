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

const { width, height } = Dimensions.get('window');

interface Property {
  image: string;
  commission: string;
  location: string;
  type: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const AgentPropertyListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedCommission, setSelectedCommission] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [favoriteIndices, setFavoriteIndices] = useState<Set<number>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔍 Current user:', user?.id);
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('❌ Error fetching user profile:', error);
          } else {
            console.log('✅ Profile fetched successfully:', profile);
            console.log('🖼️ Avatar URL:', profile.avatar_url);
            
            // Test if the image URL is accessible
            if (profile.avatar_url) {
              try {
                const response = await fetch(profile.avatar_url, { method: 'HEAD' });
                console.log('🖼️ Image URL status:', response.status, response.ok ? '✅ Accessible' : '❌ Not accessible');
              } catch (fetchError) {
                console.error('❌ Error testing image URL:', fetchError);
              }
            }
            
            setUserProfile(profile);
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

  const allProperties: Property[] = [
    {
      image: require('../../../assets/images/property1.png'),
      commission: '4%',
      location: 'Benito Juárez, CDMX.',
      type: 'Departamento',
    },
    {
      image: require('../../../assets/images/property2.png'),
      commission: '3%',
      location: 'San Juan de Aragón, CDMX.',
      type: 'Casa',
    },
    {
      image: require('../../../assets/images/property3.png'),
      commission: '6%',
      location: 'Vallejo, CDMX.',
      type: 'Terreno',
    },
    {
      image: require('../../../assets/images/property4.png'),
      commission: '5%',
      location: 'Polanco, CDMX.',
      type: 'Oficina',
    },
    {
      image: require('../../../assets/images/property5.png'),
      commission: '4%',
      location: 'Coyoacán, CDMX.',
      type: 'Local',
    },
    {
      image: require('../../../assets/images/property6.png'),
      commission: '7%',
      location: 'Santa Fe, CDMX.',
      type: 'Bodega',
    },
    {
      image: require('../../../assets/images/property1.png'),
      commission: '4%',
      location: 'Benito Juárez, CDMX.',
      type: 'Edificio',
    },
  ];

  const locations = ['All', ...new Set(allProperties.map(p => p.location))].sort();
  const propertyTypes = ['All', 'Casa', 'Departamento', 'Terreno', 'Oficina', 'Local', 'Bodega', 'Edificio'];
  const commissionPercentages = ['All', '3%', '5%', '6%'];

  const filteredProperties = allProperties.filter(property => {
    const matchesLocation = selectedLocation === 'All' || property.location === selectedLocation;
    const matchesQuery = searchQuery === '' || property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedPropertyType === 'All' || property.type === selectedPropertyType;
    const matchesCommission = selectedCommission === 'All' || property.commission === selectedCommission;

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
    const originalIndex = allProperties.indexOf(item);
    return (
      <Pressable
        style={styles.propertyCard}
        onPress={() => router.push({
          pathname: '/(agent)/property/[id]',
          params: { 
            id: originalIndex.toString(),
            property: JSON.stringify(item)
          }
        })}
      >
        <Image source={item.image as any} style={styles.propertyImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(originalIndex)}
        >
          <Ionicons
            name={favoriteIndices.has(originalIndex) ? 'heart' : 'heart-outline'}
            size={28}
            color={favoriteIndices.has(originalIndex) ? COLORS.secondary : COLORS.primary}
          />
        </TouchableOpacity>
        <View style={styles.propertyInfo}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={22} color={COLORS.secondary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>{item.location}</Text>
              <Text style={styles.propertyTypeText}>Departamento en VENTA</Text>
            </View>
          </View>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>{item.commission}</Text>
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
            onPress={() => router.push('/(owner)/notifications')}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(general)/agent-profile')}
          >
            {userProfile?.avatar_url && !imageLoadError ? (
              <Image 
                source={{ uri: userProfile.avatar_url }} 
                style={styles.profileImage}
                onError={(error) => {
                  console.error('❌ Image loading error:', error.nativeEvent.error);
                  setImageLoadError(true);
                }}
                onLoad={() => console.log('✅ Image loaded successfully:', userProfile.avatar_url)}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={20} color={COLORS.secondary} />
              </View>
            )}
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

      {filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron propiedades.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.propertyList}
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
});

export default AgentPropertyListScreen; 