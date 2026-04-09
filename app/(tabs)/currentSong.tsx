import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayer } from '@/hooks/usePlayer';
import { isFavorite, loadFavorites, toggleFavorite } from '@/lib/favorites';
import { Song } from '@/lib/useSongs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function formatMs(ms: number): string {
	const totalSec = Math.floor(ms / 1000);
	const mins = Math.floor(totalSec / 60);
	const secs = totalSec % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CurrentSong() {
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];
	const router = useRouter();

	const { currentSong, isPlaying, isShuffle, repeatMode, positionMs, durationMs, togglePlay, skipNext, skipPrev, seekTo, toggleShuffle, toggleRepeat } =
		usePlayer();

	const [favorites, setFavorites] = useState<Song[]>([]);

	useFocusEffect(
		useCallback(() => {
			loadFavorites().then(setFavorites);
		}, [])
	);

	const handleToggleFavorite = async (song: Song) => {
		const updated = await toggleFavorite(song);
		setFavorites(updated);
	};

	const favorited = currentSong ? isFavorite(favorites, currentSong.id) : false;

	const progress = durationMs > 0 ? positionMs / durationMs : 0;
	const repeatColor = repeatMode === 'off' ? c.muted : repeatMode === 'one' ? '#FF6B6B' : '#4FC3F7';

	if (!currentSong) {
		return (
			<LinearGradient colors={['#0A1923', '#050D14']} style={styles.screen}>
				<View style={styles.emptyState}>
					<Ionicons name='musical-notes-outline' size={64} color={c.muted} />
					<Text style={[styles.emptyText, { color: c.muted }]}>Nothing playing</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={[styles.emptyBack, { color: '#4FC3F7' }]}>Go back</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={['#0A1923', '#050D14']} style={styles.screen}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
					<Ionicons name='chevron-back' size={24} color={c.text} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: c.text }]}>NOW PLAYING</Text>
				<TouchableOpacity style={styles.headerBtn}>
					<Ionicons name='ellipsis-horizontal' size={22} color={c.text} />
				</TouchableOpacity>
			</View>

			{/* Album Art */}
			<View style={styles.artContainer}>
				<LinearGradient colors={[currentSong.accent ?? '#4FC3F7', '#0A1923']} locations={[0, 1]} style={styles.albumArt}>
					<Ionicons name='musical-note' size={80} color='rgba(255,255,255,0.15)' />
				</LinearGradient>
			</View>

			{/* Song Info */}
			<View style={styles.infoRow}>
				<View style={{ flex: 1 }}>
					<Text style={[styles.songTitle, { color: c.text }]} numberOfLines={1}>
						{currentSong.title ?? currentSong.filename}
					</Text>
					<Text style={[styles.artistName, { color: c.muted }]} numberOfLines={1}>
						{currentSong.artist ?? 'Unknown Artist'}
					</Text>
				</View>
			</View>

			{/* Waveform + Add + Fav Row */}
			<View style={styles.waveRow}>
				<TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#1A2535' }]}>
					<Ionicons name='add' size={20} color={c.text} />
				</TouchableOpacity>

				<View style={styles.waveform}>
					{[14, 22, 30, 20, 36, 28, 24, 32, 18, 26, 34, 22, 28].map((h, i) => {
						const barProgress = (i + 1) / 13;
						const isActive = barProgress <= progress;
						return (
							<View
								key={i}
								style={[
									styles.waveBar,
									{
										height: h,
										backgroundColor: isActive ? '#4FC3F7' : 'rgba(79,195,247,0.25)'
									}
								]}
							/>
						);
					})}
				</View>

				<TouchableOpacity
					onPress={() => currentSong && handleToggleFavorite(currentSong)}
					style={[styles.roundBtn, { backgroundColor: favorited ? '#C0507A' : '#1A2535' }]}
				>
					<Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color='#fff' />
				</TouchableOpacity>
			</View>

			{/* Progress Bar */}
			<View style={styles.progressContainer}>
				<View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
					<View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: '#4FC3F7' }]} />
					<View style={[styles.progressThumb, { left: `${Math.min(progress * 100, 97)}%` as any, backgroundColor: '#fff' }]} />
				</View>
				<View style={styles.timesRow}>
					<Text style={[styles.timeText, { color: c.muted }]}>{formatMs(positionMs)}</Text>
					<Text style={[styles.timeText, { color: c.muted }]}>{formatMs(durationMs)}</Text>
				</View>
			</View>

			{/* Playback Controls */}
			<View style={styles.controls}>
				<TouchableOpacity onPress={toggleShuffle}>
					<Ionicons name='shuffle' size={24} color={isShuffle ? '#4FC3F7' : c.muted} />
				</TouchableOpacity>

				<TouchableOpacity onPress={skipPrev}>
					<Ionicons name='play-skip-back' size={28} color={c.text} />
				</TouchableOpacity>

				<TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
					<Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color='#fff' />
				</TouchableOpacity>

				<TouchableOpacity onPress={skipNext}>
					<Ionicons name='play-skip-forward' size={28} color={c.text} />
				</TouchableOpacity>

				<TouchableOpacity onPress={toggleRepeat}>
					<View style={{ alignItems: 'center' }}>
						<Ionicons name='repeat' size={24} color={repeatColor} />
						{repeatMode === 'one' && <View style={styles.repeatOneDot} />}
					</View>
				</TouchableOpacity>
			</View>

			{/* Bottom Actions */}
			<View style={styles.bottomActions}>
				<TouchableOpacity>
					<Ionicons name='share-social-outline' size={24} color='#4FC3F7' />
				</TouchableOpacity>
				<TouchableOpacity>
					<Ionicons name='musical-notes-outline' size={24} color='#4FC3F7' />
				</TouchableOpacity>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, paddingHorizontal: 24 },
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
	emptyText: { fontSize: 16 },
	emptyBack: { fontSize: 15, fontWeight: '600' },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: 28 },
	headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
	headerTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
	artContainer: { alignItems: 'center', marginBottom: 28 },
	albumArt: { width: '100%', aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
	infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
	songTitle: { fontSize: 26, fontWeight: '700' },
	artistName: { fontSize: 13, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
	waveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
	roundBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
	waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 40 },
	waveBar: { flex: 1, borderRadius: 2 },
	progressContainer: { marginBottom: 28 },
	progressTrack: { height: 4, borderRadius: 2, position: 'relative', marginBottom: 8 },
	progressFill: { height: '100%', borderRadius: 2 },
	progressThumb: { width: 14, height: 14, borderRadius: 7, position: 'absolute', top: -5, marginLeft: -7 },
	timesRow: { flexDirection: 'row', justifyContent: 'space-between' },
	timeText: { fontSize: 12 },
	controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, paddingHorizontal: 8 },
	playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4FC3F7', justifyContent: 'center', alignItems: 'center' },
	repeatOneDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B6B', marginTop: 2 },
	bottomActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }
});
