import { useSongs } from '@/components/useSongs';
import { modifyFavorites } from '@/lib/favorites';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function FavoritesScreen() {
	const { favorites, handleToggleFavorite, getScale } = modifyFavorites();
	const { width, height } = useWindowDimensions();
	const isSmall = width < 380;
	const [search, setSearch] = useState('');

	const { playSong, pauseSong, currentSong } = useSongs();

	const filtered = favorites.filter(
		(s) => (s.title ?? '').toLowerCase().includes(search.toLowerCase()) || (s.artist ?? '').toLowerCase().includes(search.toLowerCase())
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.inner}>
				<View style={styles.topRow}>
					<View style={styles.searchBar}>
						<Ionicons name='search' size={16} color='#7D8A97' />
						<TextInput
							placeholder='Search Favorites'
							placeholderTextColor='#7D8A97'
							style={styles.searchInput}
							value={search}
							onChangeText={setSearch}
						/>
					</View>
					<TouchableOpacity style={styles.menuBtn}>
						<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
					</TouchableOpacity>
				</View>

				<View style={styles.headerRow}>
					<View style={styles.headerAccent} />
					<Text style={[styles.headerTitle, { fontSize: isSmall ? 22 : 28 }]}>FAVORITES</Text>
					<Text style={styles.songCount}>{favorites.length} songs</Text>
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

				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: height * 0.18 }}>
					{filtered.length === 0 ? (
						<Text style={styles.emptyText}>{search ? 'No results found.' : 'No favorite songs yet.'}</Text>
					) : (
						filtered.map((song, index) => (
							<TouchableOpacity
								key={song.id}
								style={[styles.songRow, index === 0 && styles.activeSongRow, { gap: isSmall ? 6 : 10 }]}
								onPress={() => playSong(song)} // Play song when row is pressed
							>
								<Text style={styles.index}>{index + 1}</Text>
								<View style={[styles.artwork, { backgroundColor: song.accent }]} />
								<View style={styles.songInfo}>
									<Text style={styles.songTitle}>{song.title}</Text>
									<Text style={styles.artist}>{song.artist}</Text>
								</View>
								<Text style={styles.duration}>{song.duration}</Text>
								<TouchableOpacity onPress={() => handleToggleFavorite(song)}>
									<Animated.View style={{ transform: [{ scale: getScale(song.id) }] }}>
										<Ionicons name='heart' size={14} color='#FF5CB8' />
									</Animated.View>
								</TouchableOpacity>
								{currentSong?.id === song.id && <Text style={{ color: '#5ED4FF', marginLeft: 8 }}>▶ Playing</Text>}
							</TouchableOpacity>
						))
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#07111B' },
	inner: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
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
	headerTitle: { color: '#BFCAD5', fontWeight: '800', flex: 1 },
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
	emptyText: { color: '#7D8A97', marginTop: 40, textAlign: 'center' },
	songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
	activeSongRow: { borderWidth: 1, borderColor: '#2E9BFF', borderRadius: 12, paddingHorizontal: 8 },
	index: { color: '#7D8A97', width: 20, fontSize: 10 },
	artwork: { width: 28, height: 28, borderRadius: 6, marginRight: 10 },
	songInfo: { flex: 1 },
	songTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
	artist: { color: '#7D8A97', fontSize: 9 },
	duration: { color: '#7D8A97', fontSize: 10, marginRight: 10 }
});
