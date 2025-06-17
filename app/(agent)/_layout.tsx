import { Stack } from 'expo-router';

export default function AgentLayout() {
  return (
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
        name="submission"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 