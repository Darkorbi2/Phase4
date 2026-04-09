import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Song } from '@/components/useSongs';
import { isFavorite, loadFavorites, toggleFavorite } from '@/lib/favorites';

const STORAGE_KEY = 'playlists_storage_v2';

type Playlist = {
	id: string;
	title: string;
	artist: string;
	year: number;
	songs: number;
	accent: string;
	tracks: Song[];
};

// -----------------------------
// WRAPPER COMPONENT (remount fix)
// -----------------------------
export default function PlaylistWrapper() {
	const params = useLocalSearchParams();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;

	return <PlaylistDetailsScreen key={id} playlistId={id as string} />;
}

// -----------------------------
// REAL SCREEN COMPONENT
// -----------------------------
function PlaylistDetailsScreen({ playlistId }: { playlistId: string }) {
	const router = useRouter();

	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [favorites, setFavorites] = useState<Song[]>([]);

	// Per-song animation storage
	const scales = useRef<{ [key: string]: Animated.Value }>({}).current;

	const getScale = (songId: string) => {
		if (!scales[songId]) {
			scales[songId] = new Animated.Value(1);
		}
		return scales[songId];
	};

	const animateHeart = (songId: string) => {
		const scale = getScale(songId);
		Animated.sequence([
			Animated.timing(scale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true })
		]).start();
	};

	// Load playlist
	useEffect(() => {
		if (!playlistId) return;
		loadPlaylist(playlistId);
	}, [playlistId]);

	// Reload favorites every time screen becomes active
	useFocusEffect(
		useCallback(() => {
			loadFavorites().then(setFavorites);
		}, [])
	);

	const loadPlaylist = async (id: string) => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			if (!saved) return;

			const playlists: Playlist[] = JSON.parse(saved);
			const found = playlists.find((p) => p.id === id);

			if (found) {
				setPlaylist({
					...found,
					tracks: found.tracks ?? []
				});
			}
		} catch (err) {
			console.log('Error loading playlist', err);
		}
	};

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);

		const updated = await toggleFavorite(song);
		setFavorites(updated);
	};

	if (!playlist) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading playlist...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
					<Ionicons name='chevron-back' size={20} color='#fff' />
				</TouchableOpacity>

				<Text style={styles.headerTitle}>{playlist.title}</Text>

				<View style={{ width: 34 }} />
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={[styles.cover, { backgroundColor: playlist.accent }]} />

				<Text style={styles.playlistTitle}>{playlist.title}</Text>
				<Text style={styles.playlistMeta}>
					{playlist.artist} • {playlist.year} • {playlist.songs} songs
				</Text>

				<Text style={styles.sectionTitle}>Tracks</Text>

				{playlist.tracks.map((track: Song) => (
					<View key={track.id} style={styles.trackCard}>
						<View style={[styles.trackAccent, { backgroundColor: track.accent }]} />

						<View style={{ flex: 1 }}>
							<Text style={styles.trackTitle}>{track.title}</Text>
							<Text style={styles.trackMeta}>{track.artist}</Text>
						</View>

						<TouchableOpacity onPress={() => handleToggleFavorite(track)}>
							<Animated.View style={{ transform: [{ scale: getScale(track.id) }] }}>
								<Ionicons
									name={isFavorite(favorites, track.id) ? 'heart' : 'heart-outline'}
									size={20}
									color={isFavorite(favorites, track.id) ? '#FF4D4D' : '#8FA0B2'}
									style={{ marginRight: 12 }}
								/>
							</Animated.View>
						</TouchableOpacity>

						<Text style={styles.trackDuration}>{track.duration}</Text>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#07111B', paddingHorizontal: 16, paddingTop: 18 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
	backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0B1622', alignItems: 'center', justifyContent: 'center' },
	headerTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
	cover: { width: '100%', height: 180, borderRadius: 16, marginBottom: 20 },
	playlistTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
	playlistMeta: { color: '#7D8A97', marginTop: 4, marginBottom: 20 },
	sectionTitle: { color: '#DDE7F0', fontWeight: '700', fontSize: 16, marginBottom: 12 },
	trackCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0C1824', padding: 12, borderRadius: 12, marginBottom: 10 },
	trackAccent: { width: 10, height: 40, borderRadius: 4, marginRight: 12 },
	trackTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
	trackMeta: { color: '#7D8A97', fontSize: 12 },
	trackDuration: { color: '#8FA0B2', fontSize: 12 },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07111B' },
	loadingText: { color: '#7D8A97' }
});
