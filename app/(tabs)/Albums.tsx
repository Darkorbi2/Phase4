import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const albums = [
	{ id: '1', title: 'Album Name', accent: '#FFD400' },
	{ id: '2', title: 'Album Name', accent: '#5B2245' },
	{ id: '3', title: 'Album Name', accent: '#123BFF' },
	{ id: '4', title: 'Album Name', accent: '#1B1B52' }
];

export default function Albums() {
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
				<TouchableOpacity style={styles.addCard}>
					<View style={styles.addThumb}>
						<Ionicons name='add-circle-outline' size={18} color='#8B8B8B' />
					</View>
					<Text style={styles.addText}>Add Album</Text>
				</TouchableOpacity>

				{albums.map((album) => (
					<TouchableOpacity key={album.id} style={styles.albumCard}>
						<View style={[styles.cover, { backgroundColor: album.accent }]} />
						<View>
							<Text style={styles.albumTitle}>{album.title}</Text>
							<Text style={styles.meta}>ARTIST NAME</Text>
							<Text style={styles.meta}>67 songs · 2026</Text>
						</View>
					</TouchableOpacity>
				))}

				<TouchableOpacity style={styles.editButton}>
					<Text style={styles.editText}>EDIT ALBUMS</Text>
				</TouchableOpacity>
			</ScrollView>

			<View style={styles.player}>
				<View style={styles.playerLeft}>
					<View style={styles.playerArt} />
					<View>
						<Text style={styles.playerSong}>SONG NAME</Text>
						<Text style={styles.playerArtist}>ARTIST NAME</Text>
					</View>
				</View>
				<View style={styles.playerControls}>
					<Ionicons name='play-back' size={16} color='#fff' />
					<View style={styles.pauseCircle}>
						<Ionicons name='pause' size={14} color='#fff' />
					</View>
					<Ionicons name='play-forward' size={16} color='#fff' />
				</View>
			</View>
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
	listContent: {
		paddingBottom: 110,
		gap: 12
	},
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
	editButton: {
		alignSelf: 'center',
		marginTop: 8,
		backgroundColor: '#1E2A36',
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 10
	},
	editText: { color: '#8FA0B2', fontSize: 11, fontWeight: '700' },
	player: {
		position: 'absolute',
		bottom: 14,
		left: 16,
		right: 16,
		backgroundColor: '#021E2C',
		borderRadius: 14,
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	playerLeft: { flexDirection: 'row', alignItems: 'center' },
	playerArt: {
		width: 30,
		height: 30,
		borderRadius: 6,
		backgroundColor: '#ffffff',
		marginRight: 10
	},
	playerSong: { color: '#fff', fontSize: 11, fontWeight: '700' },
	playerArtist: { color: '#8FA0B2', fontSize: 9 },
	playerControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	pauseCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#1E9BFF',
		alignItems: 'center',
		justifyContent: 'center'
	}
});
