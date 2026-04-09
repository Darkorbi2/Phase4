import { isFavorite, loadFavorites, toggleFavorite } from '@/lib/favorites';
import { Song, useSongs } from '@/lib/useSongs';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Button, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
	const { songs = [], hasPermission, error, currentSong, requestPermission, loadSongs, playSong, pauseSong } = useSongs();

	const [favorites, setFavorites] = useState<Song[]>([]);

	// Reload favorites every time screen becomes active
	const loadFavs = useCallback(async () => {
		const favs = await loadFavorites();
		setFavorites(favs ?? []);
	}, []);

	useEffect(() => {
		loadFavs();
	}, [loadFavs]);

	useEffect(() => {
		if (hasPermission === true) loadSongs();
	}, [hasPermission, loadSongs]);

	// Heart animation
	const scales = useRef<{ [key: string]: Animated.Value }>({}).current;
	const getScale = (songId: string) => {
		if (!scales[songId]) scales[songId] = new Animated.Value(1);
		return scales[songId];
	};

	const animateHeart = (songId: string) => {
		const scale = getScale(songId);
		Animated.sequence([
			Animated.timing(scale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true })
		]).start();
	};

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);
		await toggleFavorite(song);
		loadFavs(); // refresh favorites
	};

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
					<Button title='Pause Song' onPress={pauseSong} />

					{error && <Text style={styles.error}>{error}</Text>}

					<FlatList
						data={songs}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingTop: 20 }}
						renderItem={({ item }) => (
							<Pressable onPress={() => playSong(item)} style={styles.songCard}>
								<Image source={item.artwork ? { uri: item.artwork } : require('@/assets/images/react-logo.png')} style={styles.cover} />

								<View style={{ flex: 1 }}>
									<Text style={styles.songTitle}>{item.title ?? item.filename ?? 'Unknown'}</Text>
									<Text style={styles.songInfo}>{`${item.artist ?? 'Unknown Artist'} • ${item.id}`}</Text>
								</View>

								<Pressable
									onPress={(e) => {
										e.stopPropagation();
										handleToggleFavorite(item);
									}}
									hitSlop={10}
									style={{ marginRight: 12 }}
								>
									<Animated.View style={{ transform: [{ scale: getScale(item.id) }] }}>
										<Ionicons
											name={isFavorite(favorites, item.id) ? 'heart' : 'heart-outline'}
											size={20}
											color={isFavorite(favorites, item.id) ? '#FF4D4D' : '#8FA0B2'}
										/>
									</Animated.View>
								</Pressable>

								<Text style={styles.playText}>{currentSong?.id === item.id ? '▶ Playing' : 'Play'}</Text>
							</Pressable>
						)}
					/>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: '#fff' },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
	songCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, borderRadius: 12, backgroundColor: '#f3f3f3' },
	cover: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
	songTitle: { fontSize: 16, fontWeight: 'bold' },
	songInfo: { fontSize: 13, color: '#666', marginTop: 4 },
	playText: { fontSize: 14, fontWeight: '600' },
	error: { marginTop: 10, color: 'red' }
});
