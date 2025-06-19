import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Property {
  image: ImageSourcePropType;
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

const OwnerDashboardScreen = () => {
  const [favoriteIndices, setFavoriteIndices] = useState<Set<number>>(new Set());
  const [ownerProperties] = useState<Property[]>([
    {
      image: require('../../../assets/images/property1.png'),
      commission: '4',
      location: 'Benito Juárez, cdmx.',
      price: '5,000,000',
      type: 'Departamento',
      views: 156,
      offers: 3,
      bedrooms: 2,
      bathrooms: 2,
      parking: 2,
      construction_area: 63,
      land_area: 63,
      total_area: 63,
      documentation_complete: true,
      amenities: 'Alberca con área de camastros, Gimnasio totalmente equipado, Salón de usos múltiples, Áreas verdes y jardines, Juegos infantiles, Terraza con asadores, Seguridad 24/7 y acceso controlado, Estacionamiento para visitas',
      description: 'La propiedad se encuentra en excelente estado, fue construida en 2015 y habitada por la familia durante los últimos 7 años. Se están vendiendo porque van a mudarse de ciudad por motivos laborales. Cuenta con cocina integral, clósets, persianas y minisplits, todo incluido en la venta. La casa fue remodelada recientemente en 2022, específicamente la cocina y los baños.',
    },
  ]);

  const toggleFavorite = (index: number) => {
    const newFavorites = new Set(favoriteIndices);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavoriteIndices(newFavorites);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.searchLabel}>Búsqueda actual</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={22} color={COLORS.secondary} />
              <Text style={styles.locationText}>Benito Juárez, cdmx.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push({ pathname: '/(owner)/notifications' })}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Búsqueda"
            placeholderTextColor={COLORS.gray}
            editable={false}
          />
          <Ionicons name="search" size={28} color={COLORS.secondary} style={styles.searchIcon} />
        </View>

        <Text style={styles.sectionTitle}>Mis propiedades:</Text>

        {ownerProperties.length === 0 ? (
          <Text style={styles.emptyText}>No se encontraron propiedades.</Text>
        ) : (
          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() => router.push({
              pathname: '/(owner)/property/[id]',
              params: { 
                id: '1',
                property: JSON.stringify(ownerProperties[0])
              }
            })}
          >
            <Image
              source={ownerProperties[0].image}
              style={styles.propertyImage}
            />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(0)}
            >
              <Ionicons
                name={favoriteIndices.has(0) ? 'heart' : 'heart-outline'}
                size={28}
                color={favoriteIndices.has(0) ? COLORS.secondary : COLORS.primary}
              />
            </TouchableOpacity>
            <View style={styles.propertyInfo}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={22} color={COLORS.secondary} />
                <View>
                  <Text style={styles.propertyLocation}>{ownerProperties[0].location}</Text>
                  <Text style={styles.propertyType}>Departamento en VENTA</Text>
                </View>
              </View>
              <View style={styles.commissionInfo}>
                <Text style={styles.commissionValue}>{ownerProperties[0].commission}%</Text>
                <Text style={styles.commissionLabel}>Comision</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addPropertyButton}
          onPress={() => router.push('/(owner)/intent')}
        >
          <View style={styles.addPropertyIcon}>
            <Ionicons name="add" size={36} color={COLORS.secondary} />
          </View>
          <Text style={styles.addPropertyText}>Publicar otra propiedad</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 24,
  },
  searchLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...FONTS.regular,
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 12,
    fontSize: 22,
    color: COLORS.gray,
    paddingLeft: 48,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    top: 22,
    zIndex: 1,
  },
  sectionTitle: {
    ...FONTS.regular,
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  emptyText: {
    ...FONTS.regular,
    color: COLORS.gray,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
  propertyCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
  },
  propertyImage: {
    height: 180,
    width: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 8,
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyLocation: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  propertyType: {
    ...FONTS.regular,
    fontWeight: 'bold',
  },
  commissionInfo: {
    alignItems: 'flex-end',
  },
  commissionValue: {
    ...FONTS.title,
    fontSize: 28,
    color: COLORS.secondary,
  },
  commissionLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  addPropertyButton: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 32,
  },
  addPropertyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPropertyText: {
    ...FONTS.regular,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
});

export default OwnerDashboardScreen; 