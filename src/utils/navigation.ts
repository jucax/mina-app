import { router } from 'expo-router';

/**
 * Safely navigates back to the previous screen.
 * If there's no previous screen (e.g., opened via deep link), navigates to a fallback screen.
 * @param fallbackRoute - The route to navigate to if there's no previous screen
 */
export const safeGoBack = (fallbackRoute: string = '/(general)/login') => {
  try {
    router.back();
  } catch (error) {
    // If there's no previous screen (e.g., opened via deep link), go to fallback
    router.replace(fallbackRoute as any);
  }
};

/**
 * Safely navigates back with a specific fallback based on user type
 * @param userType - 'owner' or 'agent' to determine appropriate fallback
 */
export const safeGoBackWithUserType = (userType?: 'owner' | 'agent') => {
  const fallbackRoute = userType 
    ? `/(${userType})/home` 
    : '/(general)/login';
  
  safeGoBack(fallbackRoute);
}; 