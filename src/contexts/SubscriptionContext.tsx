import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { SubscriptionService, SubscriptionValidity } from '../services/subscriptionService';
import { supabase } from '../services/supabase';

interface SubscriptionContextType {
  subscriptionValidity: SubscriptionValidity | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  shouldRedirectToSubscription: boolean;
  expirationMessage: string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionValidity, setSubscriptionValidity] = useState<SubscriptionValidity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirectToSubscription, setShouldRedirectToSubscription] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const pathname = usePathname();

  // Screens where we should NEVER check subscription status
  const skipSubscriptionCheckScreens = [
    '/(agent)/subscription',
    '/(agent)/payment',
    '/(agent)/registration',
    '/(agent)/agent-registration',
    '/(general)/login',
    '/(general)/register',
  ];

  // Screens where we SHOULD check subscription status
  const requireSubscriptionScreens = [
    '/(agent)/home',
    '/(agent)/notifications',
    '/(agent)/proposal',
    '/(agent)/proposal-response',
    '/(agent)/submission',
    '/(agent)/profile',
    '/(agent)/property',
  ];

  const shouldCheckSubscription = () => {
    console.log('🔍 DEBUG: Checking if should check subscription for pathname:', pathname);
    console.log('🔍 DEBUG: skipSubscriptionCheckScreens:', skipSubscriptionCheckScreens);
    console.log('🔍 DEBUG: requireSubscriptionScreens:', requireSubscriptionScreens);
    
    // Never check on subscription/payment/registration screens
    if (skipSubscriptionCheckScreens.some(screen => pathname?.includes(screen))) {
      console.log('🔍 DEBUG: Skipping subscription check - on skip screen');
      return false;
    }
    
    // Only check on screens that require subscription
    const shouldCheck = requireSubscriptionScreens.some(screen => pathname?.includes(screen));
    console.log('🔍 DEBUG: Should check subscription:', shouldCheck);
    return shouldCheck;
  };

  const refreshSubscription = async () => {
    // Don't check subscription on certain screens
    if (!shouldCheckSubscription()) {
      console.log('ℹ️ Skipping subscription check on current screen:', pathname);
      console.log('🔍 DEBUG: Not checking subscription - pathname not in requireSubscriptionScreens');
      setSubscriptionValidity(null);
      setShouldRedirectToSubscription(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Refreshing subscription status...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ℹ️ No user found, skipping subscription check');
        setSubscriptionValidity(null);
        setShouldRedirectToSubscription(false);
        return;
      }

      // Get user auth data to find agent_id
      const { data: userAuth, error: userAuthError } = await supabase
        .from('user_auth')
        .select('agent_id')
        .eq('id', user.id)
        .single();

      if (userAuthError || !userAuth?.agent_id) {
        console.log('ℹ️ User is not an agent, skipping subscription check');
        setSubscriptionValidity(null);
        setShouldRedirectToSubscription(false);
        return;
      }

      // Check if agent has ever had a subscription by checking agents table
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('current_plan_id, subscription_status, subscription_expires_at')
        .eq('id', userAuth.agent_id)
        .single();

      if (agentError) {
        console.log('ℹ️ Error fetching agent data, assuming no subscription needed');
        setSubscriptionValidity(null);
        setShouldRedirectToSubscription(false);
        return;
      }

      // If agent has never had a subscription, don't redirect
      if (!agentData?.current_plan_id) {
        console.log('ℹ️ Agent has never subscribed, not redirecting to subscription');
        setSubscriptionValidity({
          is_valid: false,
          plan_type: null,
          expires_at: null,
          days_remaining: 0
        });
        setShouldRedirectToSubscription(false);
        return;
      }

      // Check if subscription status is active
      console.log('🔍 DEBUG: Checking subscription_status:', agentData.subscription_status);
      if (agentData.subscription_status !== 'active') {
        console.log('ℹ️ Agent subscription status is not active:', agentData.subscription_status);
        console.log('🔍 DEBUG: Setting shouldRedirectToSubscription to TRUE');
        setSubscriptionValidity({
          is_valid: false,
          plan_type: agentData.current_plan_id,
          expires_at: agentData.subscription_expires_at,
          days_remaining: 0
        });
        setShouldRedirectToSubscription(true);
        return;
      }

      // Check if subscription is expired
      if (agentData.subscription_expires_at) {
        const now = new Date();
        const expiresAt = new Date(agentData.subscription_expires_at);
        const isNotExpired = expiresAt > now;
        const daysRemaining = isNotExpired ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

        if (isNotExpired) {
          console.log('✅ Agent has valid active subscription');
          console.log('🔍 DEBUG: Setting shouldRedirectToSubscription to FALSE');
          setSubscriptionValidity({
            is_valid: true,
            plan_type: agentData.current_plan_id,
            expires_at: agentData.subscription_expires_at,
            days_remaining: daysRemaining
          });
          setShouldRedirectToSubscription(false);
        } else {
          console.log('❌ Agent subscription has expired');
          console.log('🔍 DEBUG: Setting shouldRedirectToSubscription to TRUE');
          setSubscriptionValidity({
            is_valid: false,
            plan_type: agentData.current_plan_id,
            expires_at: agentData.subscription_expires_at,
            days_remaining: 0
          });
          setShouldRedirectToSubscription(true);
        }
        return;
      }

      // Fallback: use SubscriptionService for detailed check
      const validity = await SubscriptionService.checkSubscriptionValidity(userAuth.agent_id);
      setSubscriptionValidity(validity);
      setShouldRedirectToSubscription(!validity.is_valid);
      
      console.log('✅ Subscription status refreshed:', validity);
    } catch (error) {
      console.error('❌ Error refreshing subscription:', error);
      // Don't redirect to subscription on error, just show as invalid
      setSubscriptionValidity({
        is_valid: false,
        plan_type: null,
        expires_at: null,
        days_remaining: 0
      });
      setShouldRedirectToSubscription(false);
    } finally {
      setIsLoading(false);
      setHasCheckedOnce(true);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔄 User signed in, checking if subscription check is needed');
        if (shouldCheckSubscription()) {
          refreshSubscription();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔄 User signed out, clearing subscription status');
        setSubscriptionValidity(null);
        setShouldRedirectToSubscription(false);
        setHasCheckedOnce(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  // Check subscription when pathname changes (but only on relevant screens)
  useEffect(() => {
    if (shouldCheckSubscription() && !hasCheckedOnce) {
      refreshSubscription();
    } else if (!shouldCheckSubscription()) {
      // Clear subscription data when on subscription/payment screens
      setSubscriptionValidity(null);
      setShouldRedirectToSubscription(false);
      setIsLoading(false);
    }
  }, [pathname]);

  const expirationMessage = subscriptionValidity 
    ? SubscriptionService.getSubscriptionExpirationMessage(subscriptionValidity)
    : '';

  const value: SubscriptionContextType = {
    subscriptionValidity,
    isLoading,
    refreshSubscription,
    shouldRedirectToSubscription,
    expirationMessage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
