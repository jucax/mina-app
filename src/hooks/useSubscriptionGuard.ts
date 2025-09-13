import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSubscription } from '../contexts/SubscriptionContext';

export const useSubscriptionGuard = () => {
  const { 
    subscriptionValidity, 
    isLoading, 
    shouldRedirectToSubscription, 
    expirationMessage,
    refreshSubscription 
  } = useSubscription();

  const redirectToSubscription = () => {
    router.push('/(agent)/subscription');
  };

  // Convert subscription validity to the expected format
  const subscriptionStatus = subscriptionValidity ? {
    isActive: subscriptionValidity.is_valid,
    plan: subscriptionValidity.plan_type,
    startDate: null,
    endDate: subscriptionValidity.expires_at,
    daysRemaining: subscriptionValidity.days_remaining,
    status: subscriptionValidity.is_valid ? 'active' as const : 'expired' as const,
    message: expirationMessage
  } : null;

  return {
    subscriptionStatus,
    loading: isLoading,
    shouldRedirect: shouldRedirectToSubscription,
    redirectToSubscription,
    checkSubscription: refreshSubscription,
  };
};
