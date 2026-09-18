import { Stack } from 'expo-router';

export default function LiveStationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Live Stations' }} />
      <Stack.Screen name="local-files" options={{ title: 'Local Files' }} />
      <Stack.Screen name="stations" options={{ title: 'Stations' }} />
    </Stack>
  );
}