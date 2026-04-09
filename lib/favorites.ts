import AsyncStorage from '@react-native-async-storage/async-storage';

import { Song } from '@/components/useSongs';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';

const STORAGE_KEY = 'favorites_storage';

// Load all favorites
export const loadFavorites = async (): Promise<Song[]> => {
	try {
		const saved = await AsyncStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch (err) {
		console.log('Error loading favorites:', err);
		return [];
	}
};

// Toggle favorite on/off
export const toggleFavorite = async (song: Song): Promise<Song[]> => {
	try {
		const favorites = await loadFavorites();

		const exists = favorites.some((s) => s.id === song.id);

		let updated;

		if (exists) {
			updated = favorites.filter((s) => s.id !== song.id);
		} else {
			updated = [...favorites, song];
		}

		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

		return updated;
	} catch (err) {
		console.log('Error toggling favorite:', err);
		return [];
	}
};

// Check if a song is favorited
export const isFavorite = (favorites: Song[], songId: string): boolean => {
	return favorites.some((s) => s.id === songId);
};

export function modifyFavorites() {
	const [favorites, setFavorites] = useState<Song[]>([]);

	useFocusEffect(
		useCallback(() => {
			loadFavorites().then(setFavorites);
		}, [])
	);

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

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);
		const updated = await toggleFavorite(song);
		setFavorites(updated);
	};
	return {
		favorites,
		animateHeart,
		handleToggleFavorite,
		getScale,
		setFavorites
	};
}
