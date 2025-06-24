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
import { propertyService } from '../../services/databaseService';
import { Property } from '../../types/database';
import { supabase } from '../../services/supabase';

const OwnerDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await propertyService.getPropertiesByOwner(user.id);
      
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

  const handlePropertyPress = (property: Property) => {
    // Navigate to property detail screen
    router.push({
      pathname: '/(owner)/property/[id]',
      params: { id: property.id }
    });
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      showFavoriteButton={false}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No tienes propiedades registradas</Text>
      <Text style={styles.emptyStateSubtitle}>
        Comienza agregando tu primera propiedad
      </Text>
      <TouchableOpacity
        style={styles.addPropertyButton}
        onPress={() => router.push('/(owner)/dashboard')}
      >
        <Text style={styles.addPropertyButtonText}>Agregar Propiedad</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Propiedades</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(owner)/dashboard')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
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
  title: {
    ...FONTS.title,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  addPropertyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPropertyButtonText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default OwnerDashboard; 