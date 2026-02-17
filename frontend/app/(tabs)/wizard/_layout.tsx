import { Stack } from 'expo-router';

export default function WizardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="property-details" />
      <Stack.Screen name="buildings" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
