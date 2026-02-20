import { Stack } from 'expo-router';

export default function PropertyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-property" />
      <Stack.Screen name="buildings" />
      <Stack.Screen name="rooms" />
      <Stack.Screen name="add-room" />
    </Stack>
  );
}
