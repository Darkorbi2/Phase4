import {
	Montserrat_400Regular,
	Montserrat_500Medium,
	Montserrat_600SemiBold,
	Montserrat_700Bold,
	useFonts
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Apply Montserrat as the default font for every Text in the app.
// Individual components can still override fontFamily if they need a specific weight.
const defaults = (Text as any).defaultProps ?? {};
(Text as any).defaultProps = { ...defaults, style: [{ fontFamily: 'Montserrat_400Regular' }, defaults.style] };

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Montserrat_400Regular,
		Montserrat_500Medium,
		Montserrat_600SemiBold,
		Montserrat_700Bold
	});

	useEffect(() => {
		if (fontsLoaded) SplashScreen.hideAsync();
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	return <Stack screenOptions={{ headerShown: false }} />;
}
