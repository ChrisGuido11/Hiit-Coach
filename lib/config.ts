import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API URL - The Expo app communicates with the backend server
// On web (Expo web), use relative paths
// On native, use the explicit API URL from config or fallback to dev URL
const getApiUrl = (): string => {
  // Check for explicit config first
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl) return configUrl;
  
  // For web platform, use relative URLs
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  
  // For native platforms in development, we'll use web-based auth
  // The app will run on the web for now until proper mobile auth is implemented
  return '';
};

export const API_URL = getApiUrl();

export const COLORS = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#141414',
  cardForeground: '#fafafa',
  primary: '#ccff00',
  primaryForeground: '#000000',
  secondary: '#262626',
  secondaryForeground: '#fafafa',
  muted: '#262626',
  mutedForeground: '#a3a3a3',
  border: '#333333',
  destructive: '#ef4444',
};

export const FONTS = {
  display: 'System',
  sans: 'System',
};
