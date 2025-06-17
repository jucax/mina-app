import { Stack } from 'expo-router';

export default function PropertyLayout() {
  return (
    <Stack>
      <Stack.Screen name="type" options={{ headerShown: false }} />
      <Stack.Screen name="price" options={{ headerShown: false }} />
      <Stack.Screen name="documentation" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
      <Stack.Screen name="compensation" options={{ headerShown: false }} />
    </Stack>
  );
} 