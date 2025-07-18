import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { AgentFormData } from '../types/agent';

interface AgentFormContextType {
  formData: AgentFormData;
  updateFormData: (updates: Partial<AgentFormData>) => void;
  resetFormData: () => void;
  isFormComplete: () => boolean;
  isLoaded: boolean;
  saveBasicRegistrationData: (data: { name: string; email: string; phone: string }) => void;
}

const initialFormData: AgentFormData = {
  // Personal Information
  full_name: '',
  email: '',
  phone: '',
  
  // Location Information
  country: 'México',
  state: '',
  municipality: '',
  neighborhood: '',
  street: '',
  postal_code: '',
  
  // Professional Information
  experience_years: '',
  properties_sold: '',
  commission_percentage: 0,
  
  // Agency Information
  works_at_agency: false,
  agency_name: '',
  
  // Description
  description: '',
  
  // Subscription Information
  subscription_plan: undefined,
};

const AgentFormContext = createContext<AgentFormContextType | undefined>(undefined);

export const useAgentForm = () => {
  const context = useContext(AgentFormContext);
  if (context === undefined) {
    throw new Error('useAgentForm must be used within an AgentFormProvider');
  }
  return context;
};

interface AgentFormProviderProps {
  children: ReactNode;
}

export const AgentFormProvider: React.FC<AgentFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load form data from AsyncStorage on mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        console.log('🔄 Loading agent form data...');
        const savedData = await AsyncStorage.getItem('agentFormData');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('📱 Loaded agent form data from storage:', parsedData);
          setFormData(parsedData);
        } else {
          console.log('📱 No saved form data found, using initial form data');
        }
      } catch (error) {
        console.error('Error loading agent form data:', error);
      } finally {
        setIsLoaded(true);
        console.log('✅ Agent form data loading completed');
      }
    };

    loadFormData();
  }, []);

  // Save form data when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 App going to background, saving agent form data...');
        AsyncStorage.setItem('agentFormData', JSON.stringify(formData))
          .then(() => {
            console.log('✅ Agent form data saved on app state change');
          })
          .catch(error => {
            console.error('❌ Error saving agent form data on app state change:', error);
          });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [formData]);

  const updateFormData = async (updates: Partial<AgentFormData>) => {
    console.log('🔄 Updating agent form data:', updates);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updates,
      };
      console.log('📊 New agent form data state:', newData);
      
      // Save to AsyncStorage immediately
      AsyncStorage.setItem('agentFormData', JSON.stringify(newData))
        .then(() => {
          console.log('✅ Agent form data saved to AsyncStorage successfully');
        })
        .catch(error => {
          console.error('❌ Error saving agent form data to AsyncStorage:', error);
        });
      
      return newData;
    });
  };

  const saveBasicRegistrationData = (data: { name: string; email: string; phone: string }) => {
    console.log('💾 Saving basic registration data:', data);
    updateFormData({
      full_name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  const resetFormData = () => {
    console.log('🔄 Resetting agent form data');
    setFormData(initialFormData);
    AsyncStorage.removeItem('agentFormData')
      .then(() => {
        console.log('✅ Agent form data removed from AsyncStorage successfully');
      })
      .catch(error => {
        console.error('❌ Error removing agent form data from AsyncStorage:', error);
      });
  };

  const isFormComplete = (): boolean => {
    return !!(
      formData.full_name &&
      formData.email &&
      formData.phone &&
      formData.state &&
      formData.municipality &&
      formData.street &&
      formData.postal_code &&
      formData.commission_percentage > 0 &&
      formData.subscription_plan
    );
  };

  const value: AgentFormContextType = {
    formData,
    updateFormData,
    resetFormData,
    isFormComplete,
    isLoaded,
    saveBasicRegistrationData,
  };

  return (
    <AgentFormContext.Provider value={value}>
      {children}
    </AgentFormContext.Provider>
  );
}; 