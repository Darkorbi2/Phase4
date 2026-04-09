import { useSongs } from '@/components/useSongs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useEffect } from 'react';
import { Button, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
	const { songs, hasPermission, loading, error, currentSong, requestPermission, loadSongs, addSong, removeSong, playSong, pauseSong } = useSongs();

	useEffect(() => {
		if (hasPermission === true) {
			loadSongs();
		}
	}, [hasPermission]);

	// this is just for testing, it seeds some play history data so we can see stats in
	// the "You" tab without having to play a bunch of songs first. Can be removed later.
	async function seedTestData() {
		const now = Date.now();
		const day = 24 * 60 * 60 * 1000;

		const testHistory = [
			{ songId: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, playedAt: now - 1 * day },
			{ songId: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, playedAt: now - 2 * day },
			{ songId: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, playedAt: now - 3 * day },
			{ songId: '2', title: 'Starboy', artist: 'The Weeknd', duration: 230, playedAt: now - 4 * day },
			{ songId: '3', title: 'Levitating', artist: 'Dua Lipa', duration: 204, playedAt: now - 5 * day },
			{ songId: '3', title: 'Levitating', artist: 'Dua Lipa', duration: 204, playedAt: now - 6 * day },
			{ songId: '4', title: 'Stay', artist: 'The Kid LAROI', duration: 141, playedAt: now - 7 * day }
		];

		await AsyncStorage.setItem('play_history', JSON.stringify(testHistory));
		console.log('Test data seeded!');
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>My Music App</Text>

			{hasPermission === null && <Text>Checking permissions...</Text>}

			{hasPermission === false && (
				<>
					<Text>No access to music library</Text>
					<Button title='Grant Permission' onPress={requestPermission} />
				</>
			)}

			{hasPermission === true && (
				<>
					<Button title={'pause song'} onPress={pauseSong} />
					<Button title='Seed Test Data' onPress={seedTestData} />

					{error && <Text style={styles.error}>{error}</Text>}

					<FlatList
						data={songs}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingTop: 20 }}
						renderItem={({ item }) => (
							<Pressable onPress={() => playSong(item)} style={styles.songCard}>
								<Image source={item.artwork ? { uri: item.artwork } : require('@/assets/images/react-logo.png')} style={styles.cover} />

								<View style={{ flex: 1 }}>
									<Text style={styles.songTitle}>{item.title ?? item.filename}</Text>
									<Text style={styles.songInfo}>{(item.artist ?? 'Unknown Artist') + ' ' + item.id}</Text>
								</View>

								<Text style={styles.playText}>{currentSong != null && currentSong.id === item.id ? '▶ Playing' : 'Play'}</Text>
							</Pressable>
						)}
					/>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff'
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20
	},
	songCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		marginBottom: 10,
		borderRadius: 12,
		backgroundColor: '#f3f3f3'
	},
	cover: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12
	},
	songTitle: {
		fontSize: 16,
		fontWeight: 'bold'
	},
	songInfo: {
		fontSize: 13,
		color: '#666',
		marginTop: 4
	},
	playText: {
		fontSize: 14,
		fontWeight: '600'
	},
	error: {
		marginTop: 10,
		color: 'red'
	}
});
