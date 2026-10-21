import { Stack } from 'expo-router';

export default function PodcastsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0000' },
        animation: 'fade', // Change from 'slide_from_right' to 'fade'
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="player" />
      <Stack.Screen name="live-player" />
      <Stack.Screen name="live-all" />
      <Stack.Screen name="filtered-results" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="speaker/[id]" />
      <Stack.Screen name="report" />
      <Stack.Screen name="report-option" />
    </Stack>
  );
}
