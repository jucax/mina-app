import { Stack } from 'expo-router';
import { AgentFormProvider } from '../../src/contexts/AgentFormContext';
import { SubscriptionProvider } from '../../src/contexts/SubscriptionContext';

export default function AgentLayout() {
  return (
    <SubscriptionProvider>
      <AgentFormProvider>
        <Stack>
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="registration"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="agent-registration"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="subscription"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="subscription-status"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="payment"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="submission"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="property"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="proposal"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AgentFormProvider>
    </SubscriptionProvider>
  );
}
