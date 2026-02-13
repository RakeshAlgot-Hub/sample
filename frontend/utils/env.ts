// frontend/utils/env.ts
// Utility to get environment variables in Expo/React Native
import Constants from 'expo-constants';

export const getBackendApiUrl = () => {
  // Try to get from app.json extra, fallback to .env (web only), or default
  return (
    Constants.expoConfig?.extra?.BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    'http://localhost:8000'
  );
};
