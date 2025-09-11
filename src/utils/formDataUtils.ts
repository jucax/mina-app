import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all form data from AsyncStorage
 * This should be called when:
 * - User logs out
 * - User logs in (to clear previous user's data)
 * - User starts registration (to clear any existing data)
 */
export const clearAllFormData = async (): Promise<void> => {
  try {
    console.log('🔄 Clearing all form data...');
    await AsyncStorage.multiRemove([
      'agentFormData',
      'propertyFormData',
      'propertyFormProgress'
    ]);
    console.log('✅ All form data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing form data:', error);
    throw error;
  }
};

/**
 * Clear form data for a specific user
 * This creates user-specific storage keys
 */
export const clearUserFormData = async (userId: string): Promise<void> => {
  try {
    console.log(`🔄 Clearing form data for user: ${userId}`);
    await AsyncStorage.multiRemove([
      `agentFormData_${userId}`,
      `propertyFormData_${userId}`,
      `propertyFormProgress_${userId}`
    ]);
    console.log('✅ User form data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing user form data:', error);
    throw error;
  }
};

/**
 * Get user-specific storage key
 */
export const getUserStorageKey = (userId: string, formType: 'agent' | 'property' | 'progress'): string => {
  switch (formType) {
    case 'agent':
      return `agentFormData_${userId}`;
    case 'property':
      return `propertyFormData_${userId}`;
    case 'progress':
      return `propertyFormProgress_${userId}`;
    default:
      throw new Error('Invalid form type');
  }
};
