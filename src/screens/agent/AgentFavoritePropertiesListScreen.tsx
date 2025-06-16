import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Property {
  image: string;
  location: string;
  commission: string;
  type: string;
}

const AgentFavoritePropertiesListScreen = () => {
  const params = useLocalSearchParams();
  const allProperties: Property[] = params.properties ? JSON.parse(params.properties as string) : [];
  const favoriteIndices: number[] = params.favorites ? JSON.parse(params.favorites as string) : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const locations = ['All', ...new Set(allProperties.map(p => p.location))].sort();

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedLocation]);

  const applyFilters = () => {
    const query = searchQuery.toLowerCase();
    const filtered = allProperties
      .filter((_, index) => favoriteIndices.includes(index))
      .filter(property => {
        const location = property.location.toLowerCase();
        const matchesLocation = selectedLocation === 'All' || property.location === selectedLocation;
        const matchesQuery = location.includes(query);
        return matchesLocation && matchesQuery;
      });
    setFilteredProperties(filtered);
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => router.push({
        pathname: '/(agent)/home',
        params: { property: JSON.stringify(item) }
      })}
    >
      <Image source={item.image as any} style={styles.propertyImage} />
      <View style={styles.favoriteButton}>
        <Ionicons name="heart" size={28} color={COLORS.secondary} />
      </View>
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="heart" size={32} color={COLORS.secondary} />
              <Text style={styles.headerTitle}>Favoritos</Text>
            </View>
            <Text style={styles.headerSubtitle}>Ciudad de México</Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.searchContainer}>
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
      </View>

      <View style={styles.locationFilterContainer}>
        <Ionicons name="location" size={22} color={COLORS.secondary} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.locationButton,
                selectedLocation === location && styles.locationButtonActive
              ]}
              onPress={() => setSelectedLocation(location)}
            >
              <Text style={[
                styles.locationButtonText,
                selectedLocation === location && styles.locationButtonTextActive
              ]}>{location}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes propiedades favoritas.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.propertyList}
        />
      )}
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
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.padding.large,
    paddingTop: SIZES.padding.large,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 4,
  },
  headerTitleContainer: {
    marginLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.title,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerSubtitle: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.black,
    marginTop: 4,
  },
  logo: {
    height: 36,
    width: 100,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.margin.large,
  },
  searchInputContainer: {
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
  locationFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.margin.large,
  },
  locationScroll: {
    marginLeft: 4,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  locationButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  locationButtonText: {
    ...FONTS.regular,
    fontWeight: '600',
    color: COLORS.black,
  },
  locationButtonTextActive: {
    color: COLORS.white,
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
    fontWeight: 'bold',
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
});

export default AgentFavoritePropertiesListScreen; 