
import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { fontFamilies } from '@/theme/fonts';
import { useStore } from '@/store/useStore';

export default function RootLayout() {

  useFrameworkReady();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, initializeAuth } = useStore();

  useEffect(() => {
    initializeAuth();
    // Set default font family for all Text/TextInput
    const TextAny = Text as typeof Text & { defaultProps?: { style?: unknown } };
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [TextAny.defaultProps.style, { fontFamily: fontFamilies.regular }];

    const TextInputAny = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
    TextInputAny.defaultProps = TextInputAny.defaultProps || {};
    TextInputAny.defaultProps.style = [TextInputAny.defaultProps.style, { fontFamily: fontFamilies.regular }];
  }, []);

  useEffect(() => {
    // Debug log for navigation issues
    console.log('NAV DEBUG', { isAuthenticated, isLoading, pathname });
    // If not authenticated and not on /login or /signup, redirect to login
    const allowedAuthRoutes = [
      '/(auth)/login',
      '/(auth)/signup',
      '/login',
      '/signup',
    ];
    if (!isLoading && !isAuthenticated && !allowedAuthRoutes.includes(pathname)) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
import 'react-native-reanimated';
