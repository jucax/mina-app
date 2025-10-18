import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StripeProvider } from '@stripe/stripe-react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

// Import your Stripe publishable key - USING THE CORRECT KEY
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RfA9XP9pd8KcDEZ9XRY9LsNJQ3FzHme04UT4gRuDxlBwQ9CS92EWC4LRRd31JFP0eNhPeG3fgCNyxpvCr1ec3we007K2I69lE';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(general)" options={{ headerShown: false }} />
          <Stack.Screen name="(guest)" options={{ headerShown: false }} />
          <Stack.Screen name="(owner)" options={{ headerShown: false }} />
          <Stack.Screen name="(agent)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </StripeProvider>
  );
}
