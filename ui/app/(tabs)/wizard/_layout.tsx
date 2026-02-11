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
      <Stack.Screen name="floors" />
      <Stack.Screen name="share-types" />
      <Stack.Screen name="rooms" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
