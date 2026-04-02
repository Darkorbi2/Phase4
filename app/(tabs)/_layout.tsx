import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				tabBarInactiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#6B7280',
				tabBarStyle: {
					backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
					borderTopColor: colorScheme === 'dark' ? '#1F2937' : '#E5E7EB'
				},
				headerShown: false,
				tabBarButton: HapticTab
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <Ionicons name='home' size={24} color={color} />
				}}
			/>

			<Tabs.Screen
				name='Favorites'
				options={{
					title: 'Favorites',
					tabBarIcon: ({ color, focused }) => <Ionicons name='heart' size={24} color={focused ? Colors[colorScheme ?? 'light'].accent2 : color} />
				}}
			/>

			<Tabs.Screen
				name='Discover'
				options={{
					title: 'Discover',
					tabBarIcon: ({ color }) => <Ionicons name='briefcase' size={24} color={color} />
				}}
			/>

			<Tabs.Screen
				name='You'
				options={{
					title: 'You',
					tabBarIcon: ({ color }) => <Ionicons name='person-circle-outline' size={24} color={color} />
				}}
			/>
		</Tabs>
	);
}
