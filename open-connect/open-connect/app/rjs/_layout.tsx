import { Stack } from 'expo-router';

export default function RjsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'RJS' }} />
      <Stack.Screen name="album-details" options={{ title: 'Album Details' }} />
      <Stack.Screen name="artist" options={{ title: 'Artist' }} />
      <Stack.Screen name="genre" options={{ title: 'Genre' }} />
      <Stack.Screen name="live-event" options={{ title: 'Live Event' }} />
      <Stack.Screen name="live-player" options={{ title: 'Live Player' }} />
      <Stack.Screen name="live-radio" options={{ title: 'Live Radio' }} />
      <Stack.Screen name="player" options={{ title: 'Player' }} />
      <Stack.Screen name="search" options={{ title: 'Search' }} />
      <Stack.Screen name="stations" options={{ title: 'Stations' }} />
      <Stack.Screen name="topsingers" options={{ title: 'Top Singers' }} />
    </Stack>
  );
}