import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Album = {
	id: string;
	title: string;
	accent: string;
};

const STORAGE_KEY = 'albums_storage';

const starterAlbums: Album[] = [
	{ id: '1', title: 'After Hours', accent: '#FFD400' },
	{ id: '2', title: 'Blonde', accent: '#5B2245' },
	{ id: '3', title: 'Dawn FM', accent: '#123BFF' },
	{ id: '4', title: 'Starboy', accent: '#1B1B52' }
];

export default function Albums() {
	const [albums, setAlbums] = useState<Album[]>(starterAlbums);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [albumName, setAlbumName] = useState('');

	useEffect(() => {
		loadAlbums();
	}, []);

	useEffect(() => {
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
	}, [albums]);

	const loadAlbums = async () => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			if (saved) {
				setAlbums(JSON.parse(saved));
			}
		} catch (error) {
			console.log('Failed to load albums', error);
		}
	};

	const isEditing = useMemo(() => !!editingId, [editingId]);

	const openAddModal = () => {
		setEditingId(null);
		setAlbumName('');
		setModalVisible(true);
	};

	const openEditModal = (album: Album) => {
		setEditingId(album.id);
		setAlbumName(album.title);
		setModalVisible(true);
	};

	const deleteAlbum = (id: string) => {
		Alert.alert('Delete Album', 'Are you sure you want to delete this album?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => setAlbums((prev) => prev.filter((album) => album.id !== id))
			}
		]);
	};

	const saveAlbum = () => {
		if (!albumName.trim()) return;

		if (editingId) {
			setAlbums((prev) => prev.map((album) => (album.id === editingId ? { ...album, title: albumName.trim() } : album)));
		} else {
			setAlbums((prev) => [
				{
					id: Date.now().toString(),
					title: albumName.trim(),
					accent: '#2D9CDB'
				},
				...prev
			]);
		}

		setModalVisible(false);
		setAlbumName('');
		setEditingId(null);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='chevron-back' size={18} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>ALBUMS</Text>
				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
				<TouchableOpacity style={styles.addCard} onPress={openAddModal}>
					<View style={styles.addThumb}>
						<Ionicons name='add-circle-outline' size={18} color='#8B8B8B' />
					</View>
					<Text style={styles.addText}>Add Album</Text>
				</TouchableOpacity>

				{albums.map((album) => (
					<TouchableOpacity key={album.id} style={styles.albumCard} onPress={() => openEditModal(album)} onLongPress={() => deleteAlbum(album.id)}>
						<View style={[styles.cover, { backgroundColor: album.accent }]} />
						<View style={{ flex: 1 }}>
							<Text style={styles.albumTitle}>{album.title}</Text>
							<Text style={styles.meta}>Tap to edit</Text>
						</View>
						<Ionicons name='create-outline' size={18} color='#8FA0B2' />
					</TouchableOpacity>
				))}
			</ScrollView>

			<Modal visible={modalVisible} transparent animationType='slide'>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>{isEditing ? 'Edit Album' : 'Create Album'}</Text>
						<TextInput value={albumName} onChangeText={setAlbumName} placeholder='Album name' placeholderTextColor='#7D8A97' style={styles.input} />

						<View style={styles.modalActions}>
							<TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.saveBtn} onPress={saveAlbum}>
								<Text style={styles.saveText}>{isEditing ? 'Save' : 'Add'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

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
	listContent: { paddingBottom: 40 },
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
	albumCard: {
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
	albumTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
	meta: { color: '#7D8A97', fontSize: 10, marginTop: 2 },
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
