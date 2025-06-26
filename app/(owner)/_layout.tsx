import { Stack } from 'expo-router';
import { PropertyFormProvider } from '../../src/contexts/PropertyFormContext';

export default function OwnerLayout() {
  return (
    <PropertyFormProvider>
      <Stack>
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="intent"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="intent-selection"
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
          name="submission"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="dashboard"
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
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </PropertyFormProvider>
  );
} 