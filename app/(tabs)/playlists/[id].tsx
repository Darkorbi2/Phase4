import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { isFavorite, loadFavorites, toggleFavorite } from '@/lib/favorites';

const STORAGE_KEY = 'playlists_storage';

// ----------------------
// TYPE DEFINITIONS
// ----------------------
type Song = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	accent: string;
};

type Playlist = {
	id: string;
	title: string;
	artist: string;
	year: number;
	songs: number;
	accent: string;
	tracks: Song[];
};

export default function PlaylistDetails() {
	const params = useLocalSearchParams();
	const router = useRouter();

	const id = Array.isArray(params.id) ? params.id[0] : params.id;

	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [favorites, setFavorites] = useState<Song[]>([]);

	// Load playlist
	useEffect(() => {
		if (!id) return;
		loadPlaylist(id);
	}, [id]);

	// Load favorites
	useEffect(() => {
		loadFavorites().then(setFavorites);
	}, []);

	const loadPlaylist = async (playlistId: string) => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			if (!saved) return;

			const playlists: Playlist[] = JSON.parse(saved);
			const found = playlists.find((p) => p.id === playlistId);

			if (found) {
				setPlaylist({
					...found,
					tracks: found.tracks ?? []
				});
			} else {
				setPlaylist(null);
			}
		} catch (err) {
			console.log('Error loading playlist', err);
		}
	};

	const handleToggleFavorite = async (song: Song) => {
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

				<Text style={styles.headerTitle} numberOfLines={1}>
					{playlist.title}
				</Text>

				<View style={{ width: 34 }} />
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* COVER */}
				<View style={[styles.cover, { backgroundColor: playlist.accent }]} />

				{/* INFO */}
				<Text style={styles.playlistTitle}>{playlist.title}</Text>
				<Text style={styles.playlistMeta}>
					{playlist.artist} • {playlist.year} • {playlist.songs} songs
				</Text>

				{/* TRACK LIST */}
				<Text style={styles.sectionTitle}>Tracks</Text>

				{playlist.tracks.length === 0 ? (
					<Text style={styles.emptyText}>No tracks in this playlist yet.</Text>
				) : (
					playlist.tracks.map((track) => (
						<View key={track.id} style={styles.trackCard}>
							<View style={[styles.trackAccent, { backgroundColor: track.accent }]} />

							<View style={{ flex: 1 }}>
								<Text style={styles.trackTitle}>{track.title}</Text>
								<Text style={styles.trackMeta}>{track.artist}</Text>
							</View>

							{/* FAVORITE BUTTON */}
							<TouchableOpacity onPress={() => handleToggleFavorite(track)}>
								<Ionicons
									name={isFavorite(favorites, track.id) ? 'heart' : 'heart-outline'}
									size={20}
									color={isFavorite(favorites, track.id) ? '#FF4D4D' : '#8FA0B2'}
									style={{ marginRight: 12 }}
								/>
							</TouchableOpacity>

							<Text style={styles.trackDuration}>{track.duration}</Text>
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
}

// ----------------------
// STYLES
// ----------------------
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#07111B',
		paddingHorizontal: 16,
		paddingTop: 18
	},

	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 18
	},

	backBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: '#0B1622',
		alignItems: 'center',
		justifyContent: 'center'
	},

	headerTitle: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 14,
		maxWidth: '70%',
		textAlign: 'center'
	},

	cover: {
		width: '100%',
		height: 180,
		borderRadius: 16,
		marginBottom: 20
	},

	playlistTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700'
	},

	playlistMeta: {
		color: '#7D8A97',
		marginTop: 4,
		marginBottom: 20
	},

	sectionTitle: {
		color: '#DDE7F0',
		fontWeight: '700',
		fontSize: 16,
		marginBottom: 12
	},

	emptyText: {
		color: '#7D8A97',
		fontSize: 13,
		marginBottom: 12
	},

	trackCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#0C1824',
		padding: 12,
		borderRadius: 12,
		marginBottom: 10
	},

	trackAccent: {
		width: 10,
		height: 40,
		borderRadius: 4,
		marginRight: 12
	},

	trackTitle: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 14
	},

	trackMeta: {
		color: '#7D8A97',
		fontSize: 12,
		marginTop: 2
	},

	trackDuration: {
		color: '#8FA0B2',
		fontSize: 12
	},

	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#07111B'
	},

	loadingText: {
		color: '#7D8A97'
	}
});
