import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type Song = {
	id: string;
	filename: string;
	uri: string;
	duration?: number;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string | null;
	accent: string;
};

const IOS_SONGS_KEY = 'ios_songs_v1';

const ACCENT_COLORS = ['#8A1C6B', '#C9B38A', '#6A40D8', '#0B5D3B', '#B9A441', '#1B4D3E', '#5B2245', '#4A90E2', '#9B51E0', '#F2994A', '#2D9CDB', '#EB5757'];

const accentForId = (id: string) => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
	return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

export function useSongs() {
	const [songs, setSongs] = useState<Song[]>([]);
	const [hasPermission, setHasPermission] = useState<boolean | null>(Platform.OS === 'ios' ? true : null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackPosition, setPlaybackPosition] = useState(0);
	const [playbackDuration, setPlaybackDuration] = useState(0);

	useEffect(() => {
		Audio.setAudioModeAsync({
			playsInSilentModeIOS: true,
			staysActiveInBackground: true,
			shouldDuckAndroid: true
		});

		if (Platform.OS === 'ios') {
			loadPersistedSongs();
		} else {
			requestPermission();
		}
	}, []);

	useEffect(() => {
		return () => {
			sound?.unloadAsync();
		};
	}, [sound]);

	// iOS: load songs
	const loadPersistedSongs = async () => {
		try {
			const saved = await AsyncStorage.getItem(IOS_SONGS_KEY);
			if (saved) setSongs(JSON.parse(saved));
		} catch (err) {
			console.error('Failed to load persisted songs:', err);
		}
	};

	// iOS only: pick songs using document picker and persist in app storage
	const pickSongs = async () => {
		if (Platform.OS !== 'ios') return;

		try {
			setLoading(true);
			setError(null);

			const result = await DocumentPicker.getDocumentAsync({
				type: 'audio/*',
				multiple: true,
				copyToCacheDirectory: false
			});

			if (result.canceled) return;

			const musicDir = new Directory(Paths.document, 'music');
			musicDir.create({ intermediates: true, idempotent: true });

			const existing = await AsyncStorage.getItem(IOS_SONGS_KEY);
			const current: Song[] = existing ? JSON.parse(existing) : [];
			const newSongs: Song[] = [];

			for (const asset of result.assets) {
				const alreadyAdded = current.some((s) => s.filename === asset.name);
				if (alreadyAdded) continue;

				// Copy to app document directory for persistent access
				const srcFile = new File(asset.uri);
				srcFile.copy(musicDir);
				const destFile = new File(musicDir, asset.name);
				const destUri = destFile.uri;

				// Measure duration
				let duration: number | undefined;
				try {
					const { sound: tmp, status } = await Audio.Sound.createAsync({ uri: destUri }, { shouldPlay: false });
					if (status.isLoaded && status.durationMillis) {
						duration = status.durationMillis / 1000;
					}
					await tmp.unloadAsync();
				} catch {}

				// Not sure if there's a better way to extract title/artist from filename, but this works for "Artist - Title.ext"
				const nameWithoutExt = asset.name.replace(/\.[^/.]+$/, '');
				const parts = nameWithoutExt.split(' - ');
				const title = parts.length > 1 ? parts[1].trim() : nameWithoutExt;
				const artist = parts.length > 1 ? parts[0].trim() : 'Unknown Artist';

				newSongs.push({
					id: destUri,
					filename: asset.name,
					uri: destUri,
					title,
					artist,
					duration,
					artwork: null,
					accent: accentForId(destUri)
				});
			}

			const updated = [...current, ...newSongs];
			setSongs(updated);
			await AsyncStorage.setItem(IOS_SONGS_KEY, JSON.stringify(updated));
		} catch (err: any) {
			console.error('Failed to pick songs:', err);
			setError(err?.message ?? 'Failed to import songs');
		} finally {
			setLoading(false);
		}
	};

	const removePersistedSong = async (songId: string) => {
		try {
			const fileToDelete = new File(songId);
			if (fileToDelete.exists) fileToDelete.delete();
			const updated = songs.filter((s) => s.id !== songId);
			setSongs(updated);
			await AsyncStorage.setItem(IOS_SONGS_KEY, JSON.stringify(updated));
		} catch (err) {
			console.error('Failed to remove song:', err);
		}
	};

	// Android: request permissions and load songs from media library
	const requestPermission = async () => {
		try {
			setError(null);

			const available = await MediaLibrary.isAvailableAsync();
			if (!available) {
				setHasPermission(false);
				setError('Media library is not available on this device.');
				return;
			}

			const existing = await MediaLibrary.getPermissionsAsync();
			if (existing.status === 'granted') {
				setHasPermission(true);
				return;
			}

			const result = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
			setHasPermission(result.status === 'granted');

			if (result.status !== 'granted') {
				setError('Permission was denied.');
			}
		} catch (err: any) {
			console.error('Permission request failed:', err);
			setHasPermission(false);
			setError(err?.message ?? 'Unknown error requesting permissions');
		}
	};

	const loadSongs = useCallback(async () => {
		if (!hasPermission) return;

		try {
			setLoading(true);
			setError(null);

			let allAssets: MediaLibrary.Asset[] = [];
			let after: string | undefined;
			let hasNextPage = true;

			while (hasNextPage) {
				const media = await MediaLibrary.getAssetsAsync({
					mediaType: ['audio'],
					first: 100,
					after,
					sortBy: [['creationTime', false]]
				});
				allAssets = allAssets.concat(media.assets);
				after = media.endCursor;
				hasNextPage = media.hasNextPage;
			}

			// Show songs immediately, parsing "Artist - Title" from filename as fallback
			const basic: Song[] = allAssets.map((asset) => {
				const nameWithoutExt = asset.filename.replace(/\.[^/.]+$/, '');
				const parts = nameWithoutExt.split(' - ');
				const parsedTitle = parts.length > 1 ? parts[1].trim() : nameWithoutExt;
				const parsedArtist = parts.length > 1 ? parts[0].trim() : 'Unknown Artist';
				return {
					id: asset.id,
					filename: asset.filename,
					uri: asset.uri,
					duration: asset.duration,
					title: parsedTitle,
					artist: parsedArtist,
					album: 'Unknown Album',
					artwork: null,
					accent: accentForId(asset.id)
				};
			});
			setSongs(basic);
			setLoading(false);

			// Override with real metadata where available
			for (let i = 0; i < allAssets.length; i++) {
				const info = await MediaLibrary.getAssetInfoAsync(allAssets[i]);
				const exif = (info.exif ?? {}) as any;

				basic[i].title = exif.title || basic[i].title;
				basic[i].artist = exif.artist || basic[i].artist;
				basic[i].album = exif.album || basic[i].album;
			}

			setSongs([...basic]);
		} catch (err: any) {
			console.error('Failed to load songs:', err);
			setError(err?.message ?? 'Failed to load songs');
		} finally {
			setLoading(false);
		}
	}, [hasPermission]);

	useEffect(() => {
		if (Platform.OS === 'android' && hasPermission === true) {
			loadSongs();
		}
	}, [hasPermission, loadSongs]);

	const playSong = async (song: Song) => {
		try {
			if (sound) await sound.unloadAsync();
			setPlaybackPosition(0);
			setPlaybackDuration(0);
			const { sound: newSound } = await Audio.Sound.createAsync({ uri: song.uri }, { shouldPlay: true });
			newSound.setOnPlaybackStatusUpdate((status) => {
				if (!status.isLoaded) return;
				setPlaybackPosition(status.positionMillis ?? 0);
				setPlaybackDuration(status.durationMillis ?? 0);
				if (status.didJustFinish) {
					setIsPlaying(false);
					setPlaybackPosition(0);
				}
			});
			setSound(newSound);
			setCurrentSong(song);
			setIsPlaying(true);
		} catch (err) {
			console.error('Error playing song:', err);
		}
	};

	const pauseSong = async () => {
		try {
			if (sound) await sound.pauseAsync();
			setIsPlaying(false);
		} catch (err) {
			console.error('Error pausing song:', err);
		}
	};

	const resumeSong = async () => {
		try {
			if (sound) await sound.playAsync();
			setIsPlaying(true);
		} catch (err) {
			console.error('Error resuming song:', err);
		}
	};

	const playNext = async () => {
		if (!currentSong || songs.length === 0) return;
		const idx = songs.findIndex((s) => s.id === currentSong.id);
		const next = songs[(idx + 1) % songs.length];
		if (next) await playSong(next);
	};

	const playPrevious = async () => {
		if (!currentSong || songs.length === 0) return;
		const idx = songs.findIndex((s) => s.id === currentSong.id);
		const prev = songs[(idx - 1 + songs.length) % songs.length];
		if (prev) await playSong(prev);
	};

	const formatDuration = (seconds: number) => {
		const total = Math.round(seconds);
		return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
	};

	return {
		songs,
		hasPermission,
		loading,
		error,
		currentSong,
		requestPermission,
		loadSongs,
		pickSongs,
		removePersistedSong,
		isPlaying,
		playbackPosition,
		playbackDuration,
		playSong,
		pauseSong,
		resumeSong,
		playNext,
		playPrevious,
		formatDuration
	};
}
