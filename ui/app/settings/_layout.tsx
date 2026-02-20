import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
      <Stack.Screen name="properties" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="import-export" />
      <Stack.Screen name="help-security" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
