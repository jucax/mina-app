import { Stack } from 'expo-router';
import { AgentFormProvider } from '../../src/contexts/AgentFormContext';

export default function AgentLayout() {
  return (
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
      </Stack>
    </AgentFormProvider>
  );
} 