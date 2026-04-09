import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

function TabIcon({ name, color, focused, indicatorColor }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean; indicatorColor: string }) {
	return (
		<View style={{ alignItems: 'center' }}>
			{focused && (
				<View
					style={{
						position: 'absolute',
						top: -8,
						width: 32,
						height: 2,
						borderRadius: 2,
						backgroundColor: indicatorColor
					}}
				/>
			)}
			<Ionicons name={name} size={18} color={color} />
		</View>
	);
}

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? 'dark';
	const c = Colors[colorScheme];

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: c.accent,
				tabBarInactiveTintColor: c.tabIconDefault,
				tabBarStyle: {
					backgroundColor: colorScheme === 'dark' ? c.filterBg : c.card,
					borderTopWidth: 0,
					elevation: 0,
					height: 64,
					paddingTop: 4,
					position: 'absolute',
					marginHorizontal: 16,
					marginBottom: 24,
					borderRadius: 20
				},
				tabBarLabelStyle: {
					fontWeight: '700',
					fontSize: 12.5,
					lineHeight: 16
				},
				headerShown: false,
				tabBarButton: HapticTab
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color, focused }) => <TabIcon name='home' color={color} focused={focused} indicatorColor={c.accent} />
				}}
			/>

			<Tabs.Screen
				name='Favorites'
				options={{
					title: 'Favourites',
					tabBarIcon: ({ color, focused }) => (
						<TabIcon name='heart-outline' color={focused ? c.accent2 : color} focused={focused} indicatorColor={c.accent2} />
					)
				}}
			/>

			<Tabs.Screen
				name='You'
				options={{
					title: 'You',
					tabBarIcon: ({ color, focused }) => <TabIcon name='person-outline' color={color} focused={focused} indicatorColor={c.accent} />
				}}
			/>

			<Tabs.Screen
				name='playlists/index'
				options={{
					title: 'Playlists',
					tabBarIcon: ({ color, focused }) => <TabIcon name='musical-notes-outline' color={color} focused={focused} indicatorColor={c.accent} />
				}}
			/>

			{/* Hide nested routes from tab bar */}
			<Tabs.Screen name='playlists/[id]' options={{ href: null }} />
		</Tabs>
	);
}
