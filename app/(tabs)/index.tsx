import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayer } from '@/hooks/usePlayer';
import { loadFavorites } from '@/lib/favorites';
import { Song, useSongs } from '@/lib/useSongs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Home() {
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];
	const router = useRouter();

	const { songs, hasPermission, loading, loadSongs, requestPermission, pickSongs } = useSongs();
	const { setQueue, currentSong, isPlaying, togglePlay } = usePlayer();

	const [search, setSearch] = useState('');
	const [favorites, setFavorites] = useState<Song[]>([]);

	useEffect(() => {
		if (hasPermission) loadSongs();
	}, [hasPermission]);

	useFocusEffect(
		useCallback(() => {
			loadFavorites().then(setFavorites);
		}, [])
	);

	const openSettings = () => {
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:');
		} else {
			Linking.openSettings();
		}
	};

	const filtered = search.trim()
		? songs.filter(
				(s) => (s.title ?? s.filename).toLowerCase().includes(search.toLowerCase()) || (s.artist ?? '').toLowerCase().includes(search.toLowerCase())
			)
		: songs;

	const handlePlaySong = (song: Song, songList: Song[]) => {
		const idx = songList.findIndex((s) => s.id === song.id);
		setQueue(songList, idx >= 0 ? idx : 0);
		router.push('/(tabs)/currentSong');
	};

	if (!hasPermission && Platform.OS === 'android') {
		return (
			<LinearGradient colors={['#0A1923', '#050D14']} style={styles.screen}>
				<View style={styles.permissionState}>
					<Ionicons name='lock-closed-outline' size={48} color={c.muted} />
					<Text style={[styles.permissionText, { color: c.text }]}>Media access needed</Text>
					<Text style={[styles.permissionSub, { color: c.muted }]}>Allow access to your music library to get started</Text>
					<TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
						<Text style={styles.permissionBtnText}>Grant Permission</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={openSettings}>
						<Text style={[styles.settingsLink, { color: c.muted }]}>Already denied? Open Settings</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={['#0A1923', '#050D14']} style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
				{/* Search Bar */}
				<View style={styles.searchRow}>
					<View style={[styles.searchBar, { backgroundColor: '#1A2535' }]}>
						<Ionicons name='search-outline' size={18} color={c.muted} style={{ marginRight: 8 }} />
						<TextInput
							style={[styles.searchInput, { color: c.text }]}
							placeholder='Search songs or artists...'
							placeholderTextColor={c.muted}
							value={search}
							onChangeText={setSearch}
							returnKeyType='search'
						/>
						{search.length > 0 && (
							<TouchableOpacity onPress={() => setSearch('')}>
								<Ionicons name='close-circle' size={18} color={c.muted} />
							</TouchableOpacity>
						)}
					</View>

					{/* Import button — iOS only */}
					{Platform.OS === 'ios' && (
						<TouchableOpacity style={[styles.moreBtn, { backgroundColor: '#4FC3F7' }]} onPress={pickSongs}>
							<Ionicons name='add' size={20} color='#fff' />
						</TouchableOpacity>
					)}

					<TouchableOpacity style={[styles.moreBtn, { backgroundColor: '#1A2535' }]}>
						<Ionicons name='ellipsis-horizontal' size={18} color={c.text} />
					</TouchableOpacity>
				</View>

				{/* Latest Favourites */}
				{search.trim() === '' && favorites.length > 0 && (
					<>
						<View style={styles.sectionHeader}>
							<View style={styles.sectionLabelRow}>
								<View style={styles.accentLine} />
								<Text style={[styles.sectionLabel, { color: c.text }]}>LATEST FAVOURITES</Text>
							</View>
							<Text style={[styles.songCountText, { color: c.muted }]}>{favorites.length} songs</Text>
						</View>

						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favRow}>
							{favorites.map((song) => {
								const isCurrentSong = currentSong?.id === song.id;
								return (
									<TouchableOpacity key={song.id} style={styles.favCard} onPress={() => handlePlaySong(song, favorites)} activeOpacity={0.8}>
										<LinearGradient colors={[song.accent ?? '#4FC3F7', '#0A1923']} style={styles.favArt}>
											{isCurrentSong && isPlaying ? (
												<Ionicons name='pause' size={20} color='#fff' />
											) : (
												<Ionicons name='musical-note' size={20} color='rgba(255,255,255,0.7)' />
											)}
										</LinearGradient>
										<Text style={[styles.favTitle, { color: isCurrentSong ? '#4FC3F7' : c.text }]} numberOfLines={2}>
											{song.title ?? song.filename}
										</Text>
										<Text style={[styles.favArtist, { color: c.muted }]} numberOfLines={1}>
											{song.artist ?? 'Unknown'}
										</Text>
									</TouchableOpacity>
								);
							})}
						</ScrollView>
					</>
				)}

				{/* All Songs */}
				<View style={styles.sectionHeader}>
					<View style={styles.sectionLabelRow}>
						<View style={styles.accentLine} />
						<Text style={[styles.sectionLabel, { color: c.text }]}>{search.trim() ? 'RESULTS' : 'ALL SONGS'}</Text>
					</View>
					<Text style={[styles.songCountText, { color: c.muted }]}>
						{filtered.length} {filtered.length === 1 ? 'song' : 'songs'}
					</Text>
				</View>

				{/* iOS empty state */}
				{Platform.OS === 'ios' && songs.length === 0 && !loading && (
					<View style={styles.emptySearch}>
						<Ionicons name='musical-notes-outline' size={48} color={c.muted} />
						<Text style={[styles.emptyText, { color: c.muted }]}>No songs yet</Text>
						<TouchableOpacity style={styles.permissionBtn} onPress={pickSongs}>
							<Text style={styles.permissionBtnText}>Import Music</Text>
						</TouchableOpacity>
					</View>
				)}

				{loading ? (
					<ActivityIndicator color='#4FC3F7' style={{ marginTop: 40 }} />
				) : filtered.length === 0 && search.trim() ? (
					<View style={styles.emptySearch}>
						<Ionicons name='search-outline' size={40} color={c.muted} />
						<Text style={[styles.emptyText, { color: c.muted }]}>No songs found for "{search}"</Text>
					</View>
				) : (
					filtered.map((song) => {
						const isCurrentSong = currentSong?.id === song.id;
						return (
							<TouchableOpacity
								key={song.id}
								style={[styles.songRow, isCurrentSong && { backgroundColor: 'rgba(79,195,247,0.08)' }]}
								onPress={() => handlePlaySong(song, filtered)}
								activeOpacity={0.7}
							>
								<View style={[styles.songArt, { backgroundColor: song.accent ?? '#1A2535' }]}>
									{isCurrentSong && isPlaying ? (
										<Ionicons name='pause' size={16} color='#fff' />
									) : (
										<Ionicons name='musical-note' size={16} color='rgba(255,255,255,0.6)' />
									)}
								</View>

								<View style={styles.songInfo}>
									<Text style={[styles.songTitle, { color: isCurrentSong ? '#4FC3F7' : c.text }]} numberOfLines={1}>
										{song.title ?? song.filename}
									</Text>
									<Text style={[styles.songArtist, { color: c.muted }]} numberOfLines={1}>
										{song.artist ?? 'Unknown Artist'}
									</Text>
								</View>

								{song.duration != null && (
									<Text style={[styles.songDuration, { color: c.muted }]}>
										{Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, '0')}
									</Text>
								)}

								<Ionicons name='ellipsis-vertical' size={16} color={c.muted} />
							</TouchableOpacity>
						);
					})
				)}

				<View style={styles.bottomPad} />
			</ScrollView>

			{/* Mini Player */}
			{currentSong && (
				<TouchableOpacity
					style={[styles.miniPlayer, { backgroundColor: '#1A2535' }]}
					onPress={() => router.push('/(tabs)/currentSong')}
					activeOpacity={0.9}
				>
					<View style={[styles.miniArt, { backgroundColor: currentSong.accent ?? '#4FC3F7' }]}>
						<Ionicons name='musical-note' size={16} color='rgba(255,255,255,0.8)' />
					</View>
					<View style={styles.miniInfo}>
						<Text style={[styles.miniTitle, { color: c.text }]} numberOfLines={1}>
							{currentSong.title ?? currentSong.filename}
						</Text>
						<Text style={[styles.miniArtist, { color: c.muted }]} numberOfLines={1}>
							{currentSong.artist ?? 'Unknown Artist'}
						</Text>
					</View>
					<TouchableOpacity
						onPress={(e) => {
							e.stopPropagation();
							togglePlay();
						}}
						style={styles.miniPlay}
					>
						<Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color='#4FC3F7' />
					</TouchableOpacity>
				</TouchableOpacity>
			)}
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16 },
	permissionState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 32 },
	permissionText: { fontSize: 18, fontWeight: '700' },
	permissionSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
	permissionBtn: { backgroundColor: '#4FC3F7', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
	permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
	settingsLink: { fontSize: 13, marginTop: 4, textDecorationLine: 'underline' },
	searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
	searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 },
	searchInput: { flex: 1, fontSize: 15, padding: 0 },
	moreBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
	sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
	sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	accentLine: { width: 18, height: 2, backgroundColor: '#4FC3F7', borderRadius: 1 },
	sectionLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
	songCountText: { fontSize: 12 },
	favRow: { marginBottom: 28 },
	favCard: { width: 120, marginRight: 12 },
	favArt: { width: 120, height: 120, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
	favTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
	favArtist: { fontSize: 11, marginTop: 2 },
	emptySearch: { alignItems: 'center', paddingTop: 48, gap: 12 },
	emptyText: { fontSize: 14 },
	songRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, marginBottom: 2 },
	songArt: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	songInfo: { flex: 1 },
	songTitle: { fontSize: 14, fontWeight: '600' },
	songArtist: { fontSize: 12, marginTop: 2 },
	songDuration: { fontSize: 12 },
	miniPlayer: { position: 'absolute', bottom: 90, left: 16, right: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
	miniArt: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	miniInfo: { flex: 1 },
	miniTitle: { fontSize: 14, fontWeight: '600' },
	miniArtist: { fontSize: 12, marginTop: 1 },
	miniPlay: { padding: 4 },
	bottomPad: { height: 160 }
});
