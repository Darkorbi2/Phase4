import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { isFavorite, loadFavorites, toggleFavorite, Song as FavSong } from '@/lib/favorites';
import { usePlayer } from '@/lib/PlayerContext';
import { Song } from '@/lib/useSongs';

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
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];
	const { songs: allSongs } = usePlayer();

	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [favorites, setFavorites] = useState<FavSong[]>([]);
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

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

	useEffect(() => {
		if (playlistId) loadPlaylist(playlistId);
	}, [playlistId]);

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
			if (found) setPlaylist({ ...found, tracks: found.tracks ?? [] });
		} catch (err) {
			console.log('Error loading playlist', err);
		}
	};

	const persistPlaylist = async (updated: Playlist) => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			const playlists: Playlist[] = saved ? JSON.parse(saved) : [];
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists.map((p) => (p.id === updated.id ? updated : p))));
			setPlaylist(updated);
		} catch (err) {
			console.log('Error saving playlist', err);
		}
	};

	const addSong = (song: Song) => {
		if (!playlist || playlist.tracks.some((t) => t.id === song.id)) return;
		const tracks = [...playlist.tracks, song];
		persistPlaylist({ ...playlist, tracks, songs: tracks.length });
	};

	const removeSong = (songId: string) => {
		if (!playlist) return;
		const tracks = playlist.tracks.filter((t) => t.id !== songId);
		persistPlaylist({ ...playlist, tracks, songs: tracks.length });
	};

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);
		const updated = await toggleFavorite(song as any);
		setFavorites(updated as any);
	};

	const filteredLibrary = allSongs.filter(
		(s) =>
			(s.title ?? s.filename ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
			(s.artist ?? '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (!playlist) {
		return (
			<LinearGradient colors={['#0A1923', 'rgba(0,0,0,0.53)']} locations={[0.54, 0.87]} style={[styles.screen, { backgroundColor: c.background }]}>
				<View style={styles.loadingContainer}>
					<Text style={[styles.pageSub, { color: c.muted }]}>Loading playlist...</Text>
				</View>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={['#0A1923', 'rgba(0,0,0,0.53)']} locations={[0.54, 0.87]} style={[styles.screen, { backgroundColor: c.background }]}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card }]} onPress={() => router.back()}>
						<Ionicons name='chevron-back' size={20} color={c.text} />
					</TouchableOpacity>

					<View style={{ flex: 1, marginHorizontal: 12 }}>
						<Text style={[styles.pageTitle, { color: c.text }]} numberOfLines={1}>
							{playlist.title}
						</Text>
						<Text style={[styles.pageSub, { color: c.muted }]}>
							{playlist.artist} · {playlist.year} · {playlist.tracks.length} songs
						</Text>
					</View>

					<TouchableOpacity
						style={[styles.iconBtn, { backgroundColor: c.accent }]}
						onPress={() => {
							setSearchQuery('');
							setAddModalVisible(true);
						}}
					>
						<Ionicons name='add' size={20} color='#fff' />
					</TouchableOpacity>
				</View>

				{/* Cover */}
				<View style={[styles.cover, { backgroundColor: playlist.accent }]} />

				{/* Tracks */}
				<Text style={[styles.sectionTitle, { color: c.text }]}>Tracks</Text>

				{playlist.tracks.length === 0 ? (
					<View style={[styles.card, { backgroundColor: c.card }]}>
						<View style={styles.emptyTracks}>
							<Ionicons name='musical-notes-outline' size={32} color={c.muted} />
							<Text style={[styles.pageSub, { color: c.muted }]}>No songs yet — tap + to add some</Text>
						</View>
					</View>
				) : (
					<View style={[styles.card, { backgroundColor: c.card }]}>
						{playlist.tracks.map((track, index) => (
							<View key={track.id}>
								{index > 0 && <View style={[styles.divider, { backgroundColor: c.divider }]} />}
								<View style={styles.trackRow}>
									<View style={[styles.trackAccent, { backgroundColor: track.accent }]} />

									<View style={{ flex: 1 }}>
										<Text style={[styles.trackTitle, { color: c.text }]} numberOfLines={1}>
											{track.title ?? track.filename}
										</Text>
										<Text style={[styles.trackMeta, { color: c.muted }]} numberOfLines={1}>
											{track.artist ?? 'Unknown Artist'}
										</Text>
									</View>

									<TouchableOpacity onPress={() => handleToggleFavorite(track)} hitSlop={8}>
										<Animated.View style={{ transform: [{ scale: getScale(track.id) }] }}>
											<Ionicons
												name={isFavorite(favorites, track.id) ? 'heart' : 'heart-outline'}
												size={18}
												color={isFavorite(favorites, track.id) ? '#FF4D4D' : c.muted}
												style={{ marginRight: 12 }}
											/>
										</Animated.View>
									</TouchableOpacity>

									<TouchableOpacity onPress={() => removeSong(track.id)} hitSlop={8}>
										<Ionicons name='remove-circle-outline' size={18} color='#FF4D4D' />
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* ADD SONGS MODAL */}
			<Modal visible={addModalVisible} animationType='slide' transparent>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalCard, { backgroundColor: c.filterBg }]}>
						<View style={styles.modalHeader}>
							<Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Add Songs</Text>
							<TouchableOpacity onPress={() => setAddModalVisible(false)}>
								<Ionicons name='close' size={22} color={c.muted} />
							</TouchableOpacity>
						</View>

						<View style={[styles.searchBar, { backgroundColor: c.card }]}>
							<Ionicons name='search' size={15} color={c.muted} />
							<TextInput
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholder='Search songs...'
								placeholderTextColor={c.muted}
								style={[styles.searchInput, { color: c.text }]}
							/>
						</View>

						{allSongs.length === 0 ? (
							<Text style={[styles.pageSub, { color: c.muted, textAlign: 'center', marginTop: 20 }]}>No songs in your library yet.</Text>
						) : (
							<FlatList
								data={filteredLibrary}
								keyExtractor={(item) => item.id}
								showsVerticalScrollIndicator={false}
								ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: c.divider }]} />}
								renderItem={({ item }) => {
									const added = playlist.tracks.some((t) => t.id === item.id);
									return (
										<TouchableOpacity style={styles.libRow} onPress={() => (added ? removeSong(item.id) : addSong(item))}>
											<View style={[styles.trackAccent, { backgroundColor: item.accent }]} />
											<View style={{ flex: 1 }}>
												<Text style={[styles.trackTitle, { color: c.text }]} numberOfLines={1}>
													{item.title ?? item.filename}
												</Text>
												<Text style={[styles.trackMeta, { color: c.muted }]} numberOfLines={1}>
													{item.artist ?? 'Unknown Artist'}
												</Text>
											</View>
											<Ionicons name={added ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={added ? c.accent : c.muted} />
										</TouchableOpacity>
									);
								}}
							/>
						)}
					</View>
				</View>
			</Modal>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120 },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24
	},
	iconBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center'
	},
	pageTitle: { fontSize: 22, fontWeight: '700', letterSpacing: 1 },
	pageSub: { fontSize: 13, marginTop: 2 },
	cover: { width: '100%', height: 180, borderRadius: 16, marginBottom: 24 },
	sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
	card: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
		borderWidth: 0.75,
		borderColor: '#535151'
	},
	divider: { height: 1, marginVertical: 2 },
	trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
	trackAccent: { width: 10, height: 38, borderRadius: 4, marginRight: 12 },
	trackTitle: { fontSize: 14, fontWeight: '600' },
	trackMeta: { fontSize: 12, marginTop: 2 },
	emptyTracks: { alignItems: 'center', gap: 10, paddingVertical: 8 },
	// Modal
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
	modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36, maxHeight: '80%' },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		marginBottom: 16,
		gap: 8,
		borderWidth: 0.75,
		borderColor: '#535151'
	},
	searchInput: { flex: 1, fontSize: 14 },
	libRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 12 }
});
