import { Song } from '@/components/useSongs';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type RepeatMode = 'off' | 'all' | 'one';

type PlayerContextType = {
	queue: Song[];
	currentSong: Song | null;
	isPlaying: boolean;
	isShuffle: boolean;
	repeatMode: RepeatMode;
	positionMs: number;
	durationMs: number;
	setQueue: (songs: Song[], startIndex?: number) => void;
	playSong: (song: Song) => void;
	togglePlay: () => void;
	skipNext: () => void;
	skipPrev: () => void;
	seekTo: (ms: number) => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const soundRef = useRef<Audio.Sound | null>(null);
	const queueRef = useRef<Song[]>([]);
	const indexRef = useRef(0);
	const repeatRef = useRef<RepeatMode>('off');
	const shuffleRef = useRef(false);

	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isShuffle, setIsShuffle] = useState(false);
	const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
	const [positionMs, setPositionMs] = useState(0);
	const [durationMs, setDurationMs] = useState(0);

	useEffect(() => {
		Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
			staysActiveInBackground: true,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: true
		});
	}, []);

	const loadAndPlay = useCallback(async (song: Song) => {
		if (soundRef.current) {
			await soundRef.current.unloadAsync();
			soundRef.current = null;
		}
		setPositionMs(0);
		setDurationMs(0);
		setCurrentSong(song);
		setIsPlaying(true);

		try {
			const { sound } = await Audio.Sound.createAsync({ uri: song.uri }, { shouldPlay: true }, (status: AVPlaybackStatus) => {
				if (!status.isLoaded) return;
				setPositionMs(status.positionMillis ?? 0);
				setDurationMs(status.durationMillis ?? 0);
				if (status.didJustFinish) {
					const q = queueRef.current;
					const idx = indexRef.current;
					const repeat = repeatRef.current;
					if (repeat === 'one') {
						loadAndPlay(q[idx]);
					} else {
						const next = idx + 1;
						if (next < q.length) {
							indexRef.current = next;
							loadAndPlay(q[next]);
						} else if (repeat === 'all' && q.length > 0) {
							indexRef.current = 0;
							loadAndPlay(q[0]);
						} else {
							setIsPlaying(false);
						}
					}
				}
			});
			soundRef.current = sound;
		} catch (e) {
			console.error('Error loading song:', e);
			setIsPlaying(false);
		}
	}, []);

	const setQueue = useCallback(
		(songs: Song[], startIndex = 0) => {
			queueRef.current = songs;
			indexRef.current = startIndex;
			if (songs.length > 0) loadAndPlay(songs[startIndex]);
		},
		[loadAndPlay]
	);

	const playSong = useCallback(
		(song: Song) => {
			const idx = queueRef.current.findIndex((s) => s.id === song.id);
			if (idx !== -1) {
				indexRef.current = idx;
			}
			loadAndPlay(song);
		},
		[loadAndPlay]
	);

	const togglePlay = useCallback(async () => {
		if (!soundRef.current) return;
		const status = await soundRef.current.getStatusAsync();
		if (!status.isLoaded) return;
		if (status.isPlaying) {
			await soundRef.current.pauseAsync();
			setIsPlaying(false);
		} else {
			await soundRef.current.playAsync();
			setIsPlaying(true);
		}
	}, []);

	const skipNext = useCallback(() => {
		const q = queueRef.current;
		if (q.length === 0) return;
		let next: number;
		if (shuffleRef.current) {
			next = Math.floor(Math.random() * q.length);
		} else {
			next = (indexRef.current + 1) % q.length;
		}
		indexRef.current = next;
		loadAndPlay(q[next]);
	}, [loadAndPlay]);

	const skipPrev = useCallback(() => {
		if (positionMs > 3000) {
			soundRef.current?.setPositionAsync(0);
			return;
		}
		const q = queueRef.current;
		if (q.length === 0) return;
		const prev = indexRef.current === 0 ? q.length - 1 : indexRef.current - 1;
		indexRef.current = prev;
		loadAndPlay(q[prev]);
	}, [positionMs, loadAndPlay]);

	const seekTo = useCallback(async (ms: number) => {
		await soundRef.current?.setPositionAsync(ms);
		setPositionMs(ms);
	}, []);

	const toggleShuffle = useCallback(() => {
		setIsShuffle((s) => {
			shuffleRef.current = !s;
			return !s;
		});
	}, []);

	const toggleRepeat = useCallback(() => {
		setRepeatMode((m) => {
			const next = m === 'off' ? 'all' : m === 'all' ? 'one' : 'off';
			repeatRef.current = next;
			return next;
		});
	}, []);

	return (
		<PlayerContext.Provider
			value={{
				queue: queueRef.current,
				currentSong,
				isPlaying,
				isShuffle,
				repeatMode,
				positionMs,
				durationMs,
				setQueue,
				playSong,
				togglePlay,
				skipNext,
				skipPrev,
				seekTo,
				toggleShuffle,
				toggleRepeat
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const ctx = useContext(PlayerContext);
	if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
	return ctx;
}
