import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'favorites_storage';

export type Song = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	accent: string;
};

export const loadFavorites = async (): Promise<Song[]> => {
	try {
		const saved = await AsyncStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch (err) {
		console.log('Error loading favorites:', err);
		return [];
	}
};

export const toggleFavorite = async (song: Song): Promise<Song[]> => {
	try {
		const favorites = await loadFavorites();
		const exists = favorites.some((s) => s.id === song.id);
		const updated = exists
			? favorites.filter((s) => s.id !== song.id)
			: [...favorites, song];
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch (err) {
		console.log('Error toggling favorite:', err);
		return [];
	}
};

export const isFavorite = (favorites: Song[], songId: string): boolean => {
	return favorites.some((s) => s.id === songId);
};
