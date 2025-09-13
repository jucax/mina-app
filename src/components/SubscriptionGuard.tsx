import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { shouldRedirectToSubscription, isLoading } = useSubscription();

  useEffect(() => {
    // Only redirect if we're not loading and should redirect
    if (!isLoading && shouldRedirectToSubscription) {
      console.log('🔄 Redirecting to subscription screen');
      router.replace('/(agent)/subscription');
    }
  }, [shouldRedirectToSubscription, isLoading]);

  // Don't render children if we're redirecting
  if (!isLoading && shouldRedirectToSubscription) {
    return null;
  }

  return <>{children}</>;
};
