import { Stack } from 'expo-router';

export default function GeneralLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
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
      <Stack.Screen
        name="agent-profile"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 