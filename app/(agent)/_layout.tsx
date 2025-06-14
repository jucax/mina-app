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
    </Stack>
  );
} 