import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../styles/globalStyles';
import { PropertyWithOwner, PropertyWithFavorites } from '../types/database';
import { favoritesService } from '../services/databaseService';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: PropertyWithOwner | PropertyWithFavorites;
  onPress?: () => void;
  showFavoriteButton?: boolean;
  onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  showFavoriteButton = false,
  onFavoriteToggle,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if property is favorited on mount
  useEffect(() => {
    if (showFavoriteButton) {
      checkFavoriteStatus();
    }
  }, [property.id, showFavoriteButton]);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await favoritesService.isFavorited(property.id, user.id);
      setIsFavorite(data || false);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!showFavoriteButton || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorite) {
        await favoritesService.removeFromFavorites(property.id, user.id);
        setIsFavorite(false);
        onFavoriteToggle?.(property.id, false);
      } else {
        await favoritesService.addToFavorites(property.id, user.id);
        setIsFavorite(true);
        onFavoriteToggle?.(property.id, true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeText = (type: string | null | undefined) => {
    if (!type) return 'Propiedad';
    
    const typeMap: { [key: string]: string } = {
      'casa': 'Casa',
      'departamento': 'Departamento',
      'terreno': 'Terreno',
      'oficina': 'Oficina',
      'local': 'Local Comercial',
    };
    return typeMap[type.toLowerCase()] || type;
  };

  const getIntentText = (intent: string | null | undefined) => {
    if (!intent) return 'Venta';
    return intent === 'venta' ? 'Venta' : 'Renta';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={
            property.images && property.images.length > 0
              ? { uri: property.images[0] }
              : require('../../assets/images/logo_login_screen.png')
          }
          style={styles.image}
          resizeMode="cover"
        />
        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
            disabled={loading}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.secondary : COLORS.white}
            />
          </TouchableOpacity>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.propertyType}>
            {getPropertyTypeText(property.property_type)}
          </Text>
          <Text style={styles.intent}>{getIntentText(property.intent)}</Text>
        </View>

        <Text style={styles.location}>
          {property.municipality}, {property.state}
        </Text>

        <View style={styles.details}>
          {property.bedrooms && (
            <View style={styles.detailItem}>
              <Ionicons name="bed" size={16} color={COLORS.gray} />
              <Text style={styles.detailText}>{property.bedrooms}</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.detailItem}>
              <Ionicons name="water" size={16} color={COLORS.gray} />
              <Text style={styles.detailText}>{property.bathrooms}</Text>
            </View>
          )}
          {property.parking_spaces && (
            <View style={styles.detailItem}>
              <Ionicons name="car" size={16} color={COLORS.gray} />
              <Text style={styles.detailText}>{property.parking_spaces}</Text>
            </View>
          )}
          {property.construction_area && (
            <View style={styles.detailItem}>
              <Ionicons name="resize" size={16} color={COLORS.gray} />
              <Text style={styles.detailText}>{property.construction_area}m²</Text>
            </View>
          )}
        </View>

        {property.description && (
          <Text style={styles.description} numberOfLines={2}>
            {property.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.commission}>
            Comisión: {property.commission_percentage}%
          </Text>
          {'owner' in property && property.owner && (
            <Text style={styles.owner}>
              {property.owner.full_name}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyType: {
    ...FONTS.title,
    fontSize: 18,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  intent: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  location: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  description: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commission: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  owner: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default PropertyCard; 