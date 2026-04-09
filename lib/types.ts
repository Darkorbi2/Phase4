export type Song = {
	id: string;
	filename: string;
	uri: string;
	duration?: number;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string | null;
};

export type PlayStats = {
	songsPlayed: number;
	hoursListened: number;
	mostPlayedSong: { title: string; artist: string; count: number } | null;
	topArtist: { name: string; plays: number; songCount: number } | null;
	mostActiveDay: { day: string; avgSongs: number } | null;
	longestStreak: { days: number; start: string; end: string } | null;
	lastPlayed: { title: string; artist: string; timeAgo: string } | null;
};
