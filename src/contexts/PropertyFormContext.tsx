import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PropertyFormData } from '../types/property';

interface PropertyFormContextType {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  resetFormData: () => void;
  isFormComplete: () => boolean;
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

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
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
  };

  return (
    <PropertyFormContext.Provider value={value}>
      {children}
    </PropertyFormContext.Provider>
  );
}; 