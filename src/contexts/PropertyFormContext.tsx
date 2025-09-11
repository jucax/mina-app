import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { PropertyFormData } from '../types/property';
import { supabase } from '../services/supabase';

interface PropertyFormContextType {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  resetFormData: () => void;
  isFormComplete: () => boolean;
  isLoaded: boolean;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  getNextStep: () => string;
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

// Define the registration flow steps
const REGISTRATION_STEPS = [
  'intent',
  'price', 
  'type',
  'documentation',
  'details',
  'compensation'
];

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
  const [currentStep, setCurrentStepState] = useState<string>('intent');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get user-specific storage keys
  const getStorageKeys = (userId: string) => ({
    formData: `propertyFormData_${userId}`,
    progress: `propertyFormProgress_${userId}`
  });

  // Load form data and progress from AsyncStorage on mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('📱 No authenticated user, using initial form data');
          setFormData(initialFormData);
          setCurrentStepState('intent');
          setIsLoaded(true);
          return;
        }

        setCurrentUserId(user.id);
        const storageKeys = getStorageKeys(user.id);
        
        const [savedData, savedStep] = await Promise.all([
          AsyncStorage.getItem(storageKeys.formData),
          AsyncStorage.getItem(storageKeys.progress)
        ]);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('�� Loaded form data from storage:', parsedData);
          setFormData(parsedData);
        } else {
          setFormData(initialFormData);
        }
        
        if (savedStep) {
          const parsedStep = JSON.parse(savedStep);
          console.log('📱 Loaded progress from storage:', parsedStep);
          setCurrentStepState(parsedStep);
        } else {
          setCurrentStepState('intent');
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setFormData(initialFormData);
        setCurrentStepState('intent');
      } finally {
        setIsLoaded(true);
      }
    };

    loadFormData();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('🔄 Auth state changed, clearing form data');
        setFormData(initialFormData);
        setCurrentStepState('intent');
        setCurrentUserId(null);
        // Clear all form data from storage
        AsyncStorage.multiRemove([
          'agentFormData',
          'propertyFormData',
          'propertyFormProgress'
        ]).catch(error => {
          console.error('Error clearing form data on logout:', error);
        });
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔄 User signed in, loading form data for:', session.user.id);
        setCurrentUserId(session.user.id);
        // Load form data for the new user
        loadFormDataForUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFormDataForUser = async (userId: string) => {
    try {
      const storageKeys = getStorageKeys(userId);
      const [savedData, savedStep] = await Promise.all([
        AsyncStorage.getItem(storageKeys.formData),
        AsyncStorage.getItem(storageKeys.progress)
      ]);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📱 Loaded form data for user:', parsedData);
        setFormData(parsedData);
      } else {
        setFormData(initialFormData);
      }
      
      if (savedStep) {
        const parsedStep = JSON.parse(savedStep);
        console.log('📱 Loaded progress for user:', parsedStep);
        setCurrentStepState(parsedStep);
      } else {
        setCurrentStepState('intent');
      }
    } catch (error) {
      console.error('Error loading form data for user:', error);
      setFormData(initialFormData);
      setCurrentStepState('intent');
    }
  };

  // Save form data when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if ((nextAppState === 'background' || nextAppState === 'inactive') && currentUserId) {
        console.log('📱 App going to background, saving form data...');
        const storageKeys = getStorageKeys(currentUserId);
        AsyncStorage.setItem(storageKeys.formData, JSON.stringify(formData))
          .then(() => {
            console.log('✅ Form data saved on app state change');
          })
          .catch(error => {
            console.error('❌ Error saving form data on app state change:', error);
          });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [formData, currentUserId]);

  const updateFormData = async (updates: Partial<PropertyFormData>) => {
    console.log('🔄 Updating form data:', updates);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updates,
      };
      console.log('📊 New form data state:', newData);
      
      // Save to AsyncStorage immediately if user is authenticated
      if (currentUserId) {
        const storageKeys = getStorageKeys(currentUserId);
        AsyncStorage.setItem(storageKeys.formData, JSON.stringify(newData))
          .then(() => {
            console.log('✅ Form data saved to AsyncStorage successfully');
          })
          .catch(error => {
            console.error('❌ Error saving form data to AsyncStorage:', error);
          });
      }
      
      return newData;
    });
  };

  const setCurrentStep = async (step: string) => {
    console.log('🔄 Setting current step:', step);
    setCurrentStepState(step);
    // Save progress to AsyncStorage immediately if user is authenticated
    if (currentUserId) {
      const storageKeys = getStorageKeys(currentUserId);
      AsyncStorage.setItem(storageKeys.progress, JSON.stringify(step))
        .then(() => {
          console.log('✅ Progress saved to AsyncStorage successfully');
        })
        .catch(error => {
          console.error('❌ Error saving progress to AsyncStorage:', error);
        });
    }
  };

  const getNextStep = (): string => {
    const currentIndex = REGISTRATION_STEPS.indexOf(currentStep);
    if (currentIndex < REGISTRATION_STEPS.length - 1) {
      return REGISTRATION_STEPS[currentIndex + 1];
    }
    return currentStep; // Already at the end
  };

  const resetFormData = () => {
    console.log('🔄 Resetting form data');
    setFormData(initialFormData);
    setCurrentStepState('intent');
    if (currentUserId) {
      const storageKeys = getStorageKeys(currentUserId);
      Promise.all([
        AsyncStorage.removeItem(storageKeys.formData),
        AsyncStorage.removeItem(storageKeys.progress)
      ]).catch(error => console.error('Error removing form data:', error));
    }
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
    currentStep,
    setCurrentStep,
    getNextStep,
  };

  return (
    <PropertyFormContext.Provider value={value}>
      {children}
    </PropertyFormContext.Provider>
  );
};
