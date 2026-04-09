import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isFavorite, Song as LibSong, loadFavorites, toggleFavorite } from '@/lib/favorites';
import { usePlayer } from '@/lib/PlayerContext';
import { Song } from '@/lib/useSongs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];

	const {
		songs = [],
		hasPermission,
		loading,
		error,
		currentSong,
		isPlaying,
		requestPermission,
		pickSongs,
		playSong,
		pauseSong,
		resumeSong,
		formatDuration
	} = usePlayer();

	const [favorites, setFavorites] = useState<LibSong[]>([]);

	const loadFavs = useCallback(async () => {
		const favs = await loadFavorites();
		setFavorites(favs ?? []);
	}, []);

	useEffect(() => {
		loadFavs();
	}, [loadFavs]);

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

	const toLibSong = (song: Song): LibSong => ({
		id: song.id,
		title: song.title ?? song.filename ?? 'Unknown',
		artist: song.artist ?? 'Unknown Artist',
		duration: song.duration != null ? formatDuration(song.duration) : '0:00',
		accent: song.accent
	});

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);
		await toggleFavorite(toLibSong(song));
		loadFavs();
	};

	const renderSong = ({ item }: { item: Song }) => (
		<Pressable onPress={() => playSong(item)} style={[styles.songCard, { backgroundColor: c.card }]}>
			<Image source={item.artwork ? { uri: item.artwork } : require('@/assets/images/react-logo.png')} style={styles.cover} />
			<View style={{ flex: 1 }}>
				<Text style={[styles.songTitle, { color: c.text }]} numberOfLines={1}>
					{item.title ?? item.filename ?? 'Unknown'}
				</Text>
				<Text style={[styles.songInfo, { color: c.muted }]} numberOfLines={1}>
					{item.artist ?? 'Unknown Artist'}
					{item.duration != null ? `  •  ${formatDuration(item.duration)}` : ''}
				</Text>
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
						color={isFavorite(favorites, item.id) ? '#FF4D4D' : c.muted}
					/>
				</Animated.View>
			</Pressable>

			<Ionicons name={currentSong?.id === item.id ? 'pause-circle' : 'play-circle'} size={28} color={currentSong?.id === item.id ? c.accent : c.muted} />
		</Pressable>
	);

	return (
		<LinearGradient colors={['#0A1923', 'rgba(0,0,0,0.53)']} locations={[0.54, 0.87]} style={[styles.screen, { backgroundColor: c.background }]}>
			<View style={styles.header}>
				<View>
					<Text style={[styles.pageTitle, { color: c.text }]}>MY MUSIC</Text>
					<Text style={[styles.pageSub, { color: c.muted }]}>{songs.length} songs</Text>
				</View>

				<View style={styles.headerActions}>
					{currentSong && (
						<TouchableOpacity onPress={isPlaying ? pauseSong : resumeSong} style={[styles.iconBtn, { backgroundColor: c.card }]}>
							<Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={c.accent} />
						</TouchableOpacity>
					)}

					{/* iOS: add music button | Android: handled automatically */}
					{Platform.OS === 'ios' && (
						<TouchableOpacity onPress={pickSongs} style={[styles.iconBtn, { backgroundColor: c.card }]}>
							<Ionicons name={loading ? 'hourglass-outline' : 'add'} size={20} color={c.accent} />
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Android permission prompt */}
			{Platform.OS === 'android' && hasPermission === false && (
				<View style={styles.permissionBox}>
					<Text style={[styles.permissionText, { color: c.muted }]}>No access to music library</Text>
					<TouchableOpacity onPress={requestPermission} style={[styles.permissionBtn, { backgroundColor: c.accent }]}>
						<Text style={styles.permissionBtnText}>Grant Permission</Text>
					</TouchableOpacity>
				</View>
			)}

			{Platform.OS === 'android' && hasPermission === null && <Text style={[styles.checking, { color: c.muted }]}>Checking permissions...</Text>}

			{error && <Text style={styles.error}>{error}</Text>}

			{/* Song list */}
			{songs.length === 0 && !loading ? (
				<View style={styles.empty}>
					<Ionicons name='musical-notes-outline' size={48} color={c.muted} />
					<Text style={[styles.emptyText, { color: c.muted }]}>
						{Platform.OS === 'ios' ? 'Tap + to add music from your Files' : 'No songs found'}
					</Text>
				</View>
			) : (
				<FlatList
					data={songs}
					keyExtractor={(item) => item.id}
					renderItem={renderSong}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 16
	},
	pageTitle: { fontSize: 28, fontWeight: '700', letterSpacing: 2 },
	pageSub: { fontSize: 13, marginTop: 2 },
	headerActions: { flexDirection: 'row', gap: 10 },
	iconBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center'
	},
	list: { paddingHorizontal: 20, paddingBottom: 120 },
	songCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		marginBottom: 10,
		borderRadius: 14,
		borderWidth: 0.75,
		borderColor: '#535151'
	},
	cover: { width: 46, height: 46, borderRadius: 8, marginRight: 12 },
	songTitle: { fontSize: 14, fontWeight: '600' },
	songInfo: { fontSize: 12, marginTop: 2 },
	permissionBox: { alignItems: 'center', marginTop: 40, gap: 12 },
	permissionText: { fontSize: 14 },
	permissionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
	permissionBtnText: { color: '#fff', fontWeight: '700' },
	checking: { textAlign: 'center', marginTop: 40 },
	error: { color: '#FF4D4D', textAlign: 'center', marginHorizontal: 20, marginTop: 8 },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
	emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }
});
