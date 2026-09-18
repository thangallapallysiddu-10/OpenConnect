import { Redirect } from 'expo-router';

// Redirect `/rjs` to `/rjs/stations` so the intermediate Explore page is never shown.
export default function RjsRedirect() {
	return <Redirect href="/rjs/stations" />;
}
