import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'play_history';

export type PlayEvent = {
	songId: string;
	title: string;
	artist: string;
	duration: number;
	playedAt: number;
};

export async function logPlay(event: PlayEvent): Promise<void> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		const history: PlayEvent[] = raw ? JSON.parse(raw) : [];
		history.push(event);
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
	} catch (e) {
		console.error('Failed to log play:', e);
	}
}

export async function getPlayHistory(): Promise<PlayEvent[]> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		console.error('Failed to get play history:', e);
		return [];
	}
}
