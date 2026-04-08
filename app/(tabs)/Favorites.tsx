import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const favoriteSongs = [
	{ id: '1', title: 'Song Name', color: '#8A1C6B' },
	{ id: '2', title: 'Song Name', color: '#C9B38A' },
	{ id: '3', title: 'Song Name', color: '#6A40D8' },
	{ id: '4', title: 'Song Name', color: '#0B5D3B' },
	{ id: '5', title: 'Song Name', color: '#B9A441' },
	{ id: '6', title: 'Song Name', color: '#B8F1FF' }
];

export default function FavoritesScreen() {
	const { width, height } = useWindowDimensions();
	const isSmall = width < 380;
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.topRow}>
				<View style={styles.searchBar}>
					<Ionicons name='search' size={16} color='#7D8A97' />
					<TextInput placeholder='Search Favorites' placeholderTextColor='#7D8A97' style={styles.searchInput} />
				</View>
				<TouchableOpacity style={styles.menuBtn}>
					<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
				</TouchableOpacity>
			</View>

			<View style={styles.headerRow}>
				<View style={styles.headerAccent} />
				<Text style={[styles.headerTitle, { fontSize: isSmall ? 22 : 28 }]}>FAVORITES</Text>
				<Text style={styles.songCount}>1,738 songs</Text>
			</View>

			<View style={styles.actionRow}>
				<TouchableOpacity style={styles.primaryBtn}>
					<Ionicons name='play' size={12} color='#5ED4FF' />
					<Text style={styles.primaryText}>PLAY ALL</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.secondaryBtn, { paddingHorizontal: isSmall ? 8 : 12 }]}>
					<Ionicons name='shuffle' size={12} color='#7D8A97' />
					<Text style={styles.secondaryText}>SHUFFLE</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.secondaryBtn, { paddingHorizontal: isSmall ? 8 : 12 }]}>
					<Ionicons name='repeat' size={12} color='#7D8A97' />
					<Text style={styles.secondaryText}>REPEAT</Text>
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: height * 0.18 }]}>
				{favoriteSongs.map((song, index) => (
					<TouchableOpacity key={song.id} style={[styles.songRow, index === 0 && styles.activeSongRow, { gap: isSmall ? 6 : 10 }]}>
						<Text style={styles.index}>{index + 1}</Text>
						<View style={[styles.artwork, { backgroundColor: song.color }]} />
						<View style={styles.songInfo}>
							<Text style={styles.songTitle}>{song.title}</Text>
							<Text style={styles.artist}>ARTIST NAME</Text>
						</View>
						<Text style={styles.duration}>4:20</Text>
						<Ionicons name='heart' size={14} color='#FF5CB8' />
					</TouchableOpacity>
				))}
			</ScrollView>

			<View style={styles.player}>
				<View style={styles.playerLeft}>
					<View style={styles.playerArt} />
					<View>
						<Text style={styles.playerSong}>SONG NAME</Text>
						<Text style={styles.playerArtist}>Artist Name</Text>
					</View>
				</View>
				<View style={styles.controls}>
					<Ionicons name='play-back' size={14} color='#fff' />
					<View style={styles.pauseBtn}>
						<Ionicons name='pause' size={12} color='#fff' />
					</View>
					<Ionicons name='play-forward' size={14} color='#fff' />
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#07111B', padding: 16 },
	topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
	searchBar: {
		flex: 1,
		height: 42,
		borderRadius: 22,
		backgroundColor: '#081722',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		marginRight: 10
	},
	searchInput: { color: '#fff', marginLeft: 8, flex: 1 },
	menuBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#081722', alignItems: 'center', justifyContent: 'center' },
	headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
	headerAccent: { width: 22, height: 4, borderRadius: 2, backgroundColor: '#5ED4FF', marginRight: 10 },
	headerTitle: { color: '#BFCAD5', fontWeight: '800', fontSize: 28, flex: 1 },
	songCount: { color: '#7D8A97', fontSize: 11 },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
	primaryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#123040',
		borderWidth: 1,
		borderColor: '#2E5A70',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8
	},
	primaryText: { color: '#5ED4FF', fontSize: 10, fontWeight: '700', marginLeft: 4 },
	secondaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#101A24', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
	secondaryText: { color: '#7D8A97', fontSize: 10, fontWeight: '700', marginLeft: 4 },
	list: { paddingBottom: 120 },
	songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
	activeSongRow: { borderWidth: 1, borderColor: '#2E9BFF', borderRadius: 12, paddingHorizontal: 8 },
	index: { color: '#7D8A97', width: 20, fontSize: 10 },
	artwork: { width: 28, height: 28, borderRadius: 6, marginRight: 10 },
	songInfo: { flex: 1 },
	songTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
	artist: { color: '#7D8A97', fontSize: 9 },
	duration: { color: '#7D8A97', fontSize: 10, marginRight: 10 },
	player: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 64,
		backgroundColor: '#032033',
		borderRadius: 14,
		padding: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	playerLeft: { flexDirection: 'row', alignItems: 'center' },
	playerArt: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#fff', marginRight: 8 },
	playerSong: { color: '#fff', fontSize: 10, fontWeight: '700' },
	playerArtist: { color: '#A0AFBD', fontSize: 9 },
	controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	pauseBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1E9BFF', alignItems: 'center', justifyContent: 'center' },
	bottomNav: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 56,
		backgroundColor: '#020A10',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	navItem: { alignItems: 'center' },
	activeNav: { color: '#FF5CB8', fontSize: 9, marginTop: 2, fontWeight: '700' },
	navText: { color: '#fff', fontSize: 9, marginTop: 2, fontWeight: '700' }
});
