import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyFormData } from '../types/property';

interface PropertyFormContextType {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  resetFormData: () => void;
  isFormComplete: () => boolean;
  isLoaded: boolean;
}

const initialFormData: PropertyFormData = {
  // Intent and Timeline
  intent: null,
  timeline: null,
  
  // Price
  price: '',
  
  // Property Type
  property_type: null,
  other_type: '',
  
  // Documentation
  documentation: {
    identification: false,
    tax_constancy: false,
    address_proof: false,
    deed: false,
    property_tax: false,
    water_bill: false,
    electricity_bill: false,
    folio_consultation: false,
  },
  documentation_comments: '',
  
  // Location Details
  country: 'México',
  state: null,
  municipality: '',
  neighborhood: null,
  street: '',
  postal_code: '',
  
  // Property Characteristics
  land_area: '',
  construction_area: '',
  bedrooms: '',
  bathrooms: '',
  half_bathrooms: '',
  amenities: '',
  additional_info: '',
  
  // Images
  images: [],
  
  // Commission
  commission_percentage: null,
};

const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

export const usePropertyForm = () => {
  const context = useContext(PropertyFormContext);
  if (context === undefined) {
    throw new Error('usePropertyForm must be used within a PropertyFormProvider');
  }
  return context;
};

interface PropertyFormProviderProps {
  children: ReactNode;
}

export const PropertyFormProvider: React.FC<PropertyFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load form data from AsyncStorage on mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('propertyFormData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('📱 Loaded form data from storage:', parsedData);
          setFormData(parsedData);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFormData();
  }, []);

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    console.log('🔄 Updating form data:', updates);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updates,
      };
      console.log('📊 New form data state:', newData);
      
      // Save to AsyncStorage
      AsyncStorage.setItem('propertyFormData', JSON.stringify(newData))
        .catch(error => console.error('Error saving form data:', error));
      
      return newData;
    });
  };

  const resetFormData = () => {
    console.log('🔄 Resetting form data');
    setFormData(initialFormData);
    AsyncStorage.removeItem('propertyFormData')
      .catch(error => console.error('Error removing form data:', error));
  };

  const isFormComplete = (): boolean => {
    return !!(
      formData.intent &&
      formData.timeline &&
      formData.price &&
      formData.property_type &&
      formData.state &&
      formData.municipality &&
      formData.street &&
      formData.postal_code &&
      formData.commission_percentage
    );
  };

  const value: PropertyFormContextType = {
    formData,
    updateFormData,
    resetFormData,
    isFormComplete,
    isLoaded,
  };

  return (
    <PropertyFormContext.Provider value={value}>
      {children}
    </PropertyFormContext.Provider>
  );
}; 