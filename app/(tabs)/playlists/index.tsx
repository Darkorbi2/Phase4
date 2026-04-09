import { playlists as starterPlaylists } from '@/app/data/playlists_storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

//import { useSongs } from '@/components/useSongs'; //replace Song Type with this
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

// Bumped to v2 to reset stale data with duplicate track IDs
const STORAGE_KEY = 'playlists_storage_v2';

export default function Playlists() {
	const router = useRouter();
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];

	const [playlists, setPlaylists] = useState<Playlist[]>(starterPlaylists);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editMode, setEditMode] = useState(false);

	const [playlistName, setPlaylistName] = useState('');
	const [artistName, setArtistName] = useState('');
	const [year, setYear] = useState('');
	const [songs, setSongs] = useState('');

	useEffect(() => {
		loadPlaylists();
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadPlaylists();
		}, [])
	);

	useEffect(() => {
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
	}, [playlists]);

	const loadPlaylists = async () => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			if (saved) setPlaylists(JSON.parse(saved));
		} catch (error) {
			console.log('Failed to load playlists', error);
		}
	};

	const isEditing = useMemo(() => !!editingId, [editingId]);

	const openAddModal = () => {
		setEditingId(null);
		setPlaylistName('');
		setArtistName('');
		setYear('');
		setSongs('');
		setModalVisible(true);
	};

	const openEditModal = (playlist: Playlist) => {
		setEditingId(playlist.id);
		setPlaylistName(playlist.title);
		setArtistName(playlist.artist);
		setYear(String(playlist.year));
		setSongs(String(playlist.songs));
		setModalVisible(true);
	};

	const deletePlaylist = (id: string) => {
		Alert.alert('Delete Playlist', 'Are you sure you want to delete this playlist?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => setPlaylists((prev) => prev.filter((p) => p.id !== id))
			}
		]);
	};

	const savePlaylist = () => {
		if (!playlistName.trim() || !artistName.trim() || !year.trim() || !songs.trim()) return;

		if (editingId) {
			setPlaylists((prev) =>
				prev.map((p) =>
					p.id === editingId
						? {
								...p,
								title: playlistName.trim(),
								artist: artistName.trim(),
								year: Number(year),
								songs: Number(songs)
							}
						: p
				)
			);
		} else {
			setPlaylists((prev) => [
				{
					id: Date.now().toString(),
					title: playlistName.trim(),
					artist: artistName.trim(),
					year: Number(year),
					songs: Number(songs),
					accent: '#2D9CDB',
					tracks: []
				},
				...prev
			]);
		}

		setModalVisible(false);
		setPlaylistName('');
		setArtistName('');
		setYear('');
		setSongs('');
		setEditingId(null);
	};

	return (
		<LinearGradient colors={['#0A1923', 'rgba(0,0,0,0.53)']} locations={[0.54, 0.87]} style={[styles.container, { backgroundColor: c.background }]}>
			<View style={styles.inner}>
				{/* HEADER */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.iconButton}>
						<Ionicons name='chevron-back' size={18} color='#fff' />
					</TouchableOpacity>

					<Text style={styles.headerTitle}>PLAYLISTS</Text>

					<TouchableOpacity style={styles.iconButton}>
						<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
					</TouchableOpacity>
				</View>

				{/* ADD BUTTON */}
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
					<TouchableOpacity style={styles.addCard} onPress={openAddModal}>
						<View style={styles.addThumb}>
							<Ionicons name='add-circle-outline' size={18} color='#8B8B8B' />
						</View>
						<Text style={styles.addText}>Add Playlist</Text>
					</TouchableOpacity>

					{/* PLAYLIST LIST */}
					{playlists.map((playlist) => (
						<View key={playlist.id} style={styles.playlistCard}>
							<TouchableOpacity
								style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
								onPress={() => {
									if (editMode) openEditModal(playlist);
									else router.push(`/playlists/${playlist.id}`);
								}}
							>
								<View style={[styles.cover, { backgroundColor: playlist.accent }]} />

								<View style={{ flex: 1 }}>
									<Text style={styles.playlistTitle}>{playlist.title}</Text>
									<Text style={styles.meta}>
										{playlist.artist} • {playlist.tracks.length} songs • {playlist.year}
									</Text>
								</View>
							</TouchableOpacity>

							{/* RIGHT ICONS */}
							<View style={styles.rightIcons}>
								{editMode ? (
									<>
										<TouchableOpacity onPress={() => openEditModal(playlist)}>
											<Ionicons name='create-outline' size={20} color='#8FA0B2' />
										</TouchableOpacity>

										<TouchableOpacity onPress={() => deletePlaylist(playlist.id)}>
											<Ionicons name='trash-outline' size={20} color='#FF4D4D' />
										</TouchableOpacity>
									</>
								) : (
									<Ionicons name='chevron-forward' size={18} color='#8FA0B2' />
								)}
							</View>
						</View>
					))}
				</ScrollView>

				{/* EDIT MODE BUTTON */}
				<TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
					<Text style={styles.editButtonText}>{editMode ? 'DONE' : 'EDIT PLAYLISTS'}</Text>
				</TouchableOpacity>
			</View>

			{/* MODAL */}
			<Modal visible={modalVisible} transparent animationType='slide'>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>{isEditing ? 'Edit Playlist' : 'Create Playlist'}</Text>

						<TextInput
							value={playlistName}
							onChangeText={setPlaylistName}
							placeholder='Playlist name'
							placeholderTextColor='#7D8A97'
							style={styles.input}
						/>

						<TextInput value={artistName} onChangeText={setArtistName} placeholder='Artist' placeholderTextColor='#7D8A97' style={styles.input} />

						<TextInput
							value={year}
							onChangeText={setYear}
							placeholder='Year'
							keyboardType='numeric'
							placeholderTextColor='#7D8A97'
							style={styles.input}
						/>

						<TextInput
							value={songs}
							onChangeText={setSongs}
							placeholder='Number of songs'
							keyboardType='numeric'
							placeholderTextColor='#7D8A97'
							style={styles.input}
						/>

						<View style={styles.modalActions}>
							<TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.saveBtn} onPress={savePlaylist}>
								<Text style={styles.saveText}>{isEditing ? 'Save' : 'Add'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	inner: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 60
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 18
	},
	iconButton: {
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
		letterSpacing: 1,
		fontSize: 12
	},
	listContent: { paddingBottom: 110 },
	addCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#0C1824',
		borderWidth: 1,
		borderColor: '#203040',
		borderRadius: 16,
		padding: 16,
		marginBottom: 12
	},
	addThumb: {
		width: 40,
		height: 40,
		borderRadius: 10,
		backgroundColor: '#2A2F36',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14
	},
	addText: { color: '#DDE7F0', fontWeight: '600' },
	playlistCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#0C1824',
		borderRadius: 16,
		padding: 12,
		marginBottom: 12
	},
	cover: {
		width: 42,
		height: 42,
		borderRadius: 10,
		marginRight: 12
	},
	playlistTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
	meta: { color: '#7D8A97', fontSize: 10, marginTop: 2 },

	rightIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14
	},

	editButton: {
		backgroundColor: '#0C1824',
		paddingVertical: 14,
		borderRadius: 14,
		alignItems: 'center',
		marginBottom: 110,
		borderWidth: 1,
		borderColor: '#203040'
	},
	editButtonText: {
		color: '#DDE7F0',
		fontWeight: '700',
		fontSize: 13,
		letterSpacing: 1
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		padding: 20
	},
	modalCard: {
		backgroundColor: '#0C1824',
		borderRadius: 18,
		padding: 20
	},
	modalTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 16
	},
	input: {
		backgroundColor: '#132231',
		color: '#fff',
		borderRadius: 12,
		padding: 14,
		marginBottom: 18
	},
	modalActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 12
	},
	cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
	cancelText: { color: '#8FA0B2' },
	saveBtn: {
		backgroundColor: '#1E9BFF',
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 10
	},
	saveText: { color: '#fff', fontWeight: '700' }
});
