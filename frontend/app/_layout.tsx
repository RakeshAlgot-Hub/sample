import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { fontFamilies } from '@/theme/fonts';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    const TextAny = Text as typeof Text & { defaultProps?: { style?: unknown } };
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [TextAny.defaultProps.style, { fontFamily: fontFamilies.regular }];

    const TextInputAny = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
    TextInputAny.defaultProps = TextInputAny.defaultProps || {};
    TextInputAny.defaultProps.style = [TextInputAny.defaultProps.style, { fontFamily: fontFamilies.regular }];
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
