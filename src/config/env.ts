import Constants from 'expo-constants';

const expoExtra = (Constants.expoConfig as any)?.extra || {};

export const STRIPE_PUBLISHABLE_KEY: string =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  expoExtra.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  '';

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  expoExtra.EXPO_PUBLIC_API_BASE_URL ||
  'https://mina-app-ten.vercel.app/api';

export const IS_STRIPE_LIVE: boolean = STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_');


