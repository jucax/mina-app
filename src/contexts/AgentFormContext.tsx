import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { AgentFormData } from '../types/agent';
import { supabase } from '../services/supabase';

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get user-specific storage key
  const getStorageKey = (userId: string) => `agentFormData_${userId}`;

  // Load form data from AsyncStorage on mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('📱 No authenticated user, using initial form data');
          setFormData(initialFormData);
          setIsLoaded(true);
          return;
        }

        setCurrentUserId(user.id);
        const storageKey = getStorageKey(user.id);
        
        console.log('�� Loading agent form data for user:', user.id);
        const savedData = await AsyncStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('📱 Loaded agent form data from storage:', parsedData);
          setFormData(parsedData);
        } else {
          console.log('📱 No saved form data found, using initial form data');
          setFormData(initialFormData);
        }
      } catch (error) {
        console.error('Error loading agent form data:', error);
        setFormData(initialFormData);
      } finally {
        setIsLoaded(true);
        console.log('✅ Agent form data loading completed');
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
      const storageKey = getStorageKey(userId);
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📱 Loaded form data for user:', parsedData);
        setFormData(parsedData);
      } else {
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error loading form data for user:', error);
      setFormData(initialFormData);
    }
  };

  // Save form data when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if ((nextAppState === 'background' || nextAppState === 'inactive') && currentUserId) {
        console.log('📱 App going to background, saving agent form data...');
        const storageKey = getStorageKey(currentUserId);
        AsyncStorage.setItem(storageKey, JSON.stringify(formData))
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
  }, [formData, currentUserId]);

  const updateFormData = async (updates: Partial<AgentFormData>) => {
    console.log('🔄 Updating agent form data:', updates);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updates,
      };
      console.log('📊 New agent form data state:', newData);
      
      // Save to AsyncStorage immediately if user is authenticated
      if (currentUserId) {
        const storageKey = getStorageKey(currentUserId);
        AsyncStorage.setItem(storageKey, JSON.stringify(newData))
          .then(() => {
            console.log('✅ Agent form data saved to AsyncStorage successfully');
          })
          .catch(error => {
            console.error('❌ Error saving agent form data to AsyncStorage:', error);
          });
      }
      
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
    if (currentUserId) {
      const storageKey = getStorageKey(currentUserId);
      AsyncStorage.removeItem(storageKey)
        .then(() => {
          console.log('✅ Agent form data removed from AsyncStorage successfully');
        })
        .catch(error => {
          console.error('❌ Error removing agent form data from AsyncStorage:', error);
        });
    }
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
