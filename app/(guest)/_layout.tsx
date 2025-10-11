import { Stack } from 'expo-router';

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="properties" />
      <Stack.Screen name="property/[id]" />
    </Stack>
  );
}

