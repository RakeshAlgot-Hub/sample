import { Stack } from 'expo-router';

export default function MemberLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="add" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}
