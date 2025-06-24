import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../../components/PropertyCard';
import { favoritesService } from '../../services/databaseService';
import { PropertyWithFavorites } from '../../types/database';

const AgentPropertyList = () => {
  const [properties, setProperties] = useState<PropertyWithFavorites[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await favoritesService.getPropertiesWithFavorites();
      
      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error: any) {
      console.error('Error loading properties:', error);
      Alert.alert('Error', 'No se pudieron cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handlePropertyPress = (property: PropertyWithFavorites) => {
    // Navigate to property detail screen
    router.push({
      pathname: '/(owner)/property/[id]',
      params: { id: property.id }
    });
  };

  const handleFavoriteToggle = (propertyId: string, isFavorite: boolean) => {
    // Update the local state to reflect the favorite change
    setProperties(prevProperties =>
      prevProperties.map(property =>
        property.id === propertyId
          ? { ...property, is_favorite: isFavorite }
          : property
      )
    );
  };

  const renderProperty = ({ item }: { item: PropertyWithFavorites }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      showFavoriteButton={true}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No hay propiedades disponibles</Text>
      <Text style={styles.emptyStateSubtitle}>
        Las propiedades aparecerán aquí cuando estén disponibles
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Propiedades Disponibles</Text>
        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={() => router.push('/(agent)/home')}
        >
          <Ionicons name="heart" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  favoritesButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AgentPropertyList; 