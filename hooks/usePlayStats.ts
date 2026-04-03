import { PlayStats } from '@/lib/types';
import { getPlayHistory } from '@/utils/playHistory';
import { useEffect, useState } from 'react';

export type TimeFilter = 'Week' | 'Month' | 'Year' | 'All Time';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const SECONDS_PER_HOUR = 3600;
const MINS_PER_HOUR = 60;
const MINS_PER_DAY = 1440;

export function usePlayStats(filter: TimeFilter) {
	const [stats, setStats] = useState<PlayStats>({
		songsPlayed: 0,
		hoursListened: 0,
		mostPlayedSong: null,
		topArtist: null,
		mostActiveDay: null,
		longestStreak: null,
		lastPlayed: null
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadStats() {
			setLoading(true);
			const allHistory = await getPlayHistory();

			// filter by time range
			let history = allHistory;
			if (filter !== 'All Time') {
				const now = Date.now();
				let cutoff = 0;
				if (filter === 'Week') cutoff = now - 7 * MS_PER_DAY;
				if (filter === 'Month') cutoff = now - 30 * MS_PER_DAY;
				if (filter === 'Year') cutoff = now - 365 * MS_PER_DAY;
				history = allHistory.filter((e) => e.playedAt >= cutoff);
			}

			if (history.length === 0) {
				setStats({
					songsPlayed: 0,
					hoursListened: 0,
					mostPlayedSong: null,
					topArtist: null,
					mostActiveDay: null,
					longestStreak: null,
					lastPlayed: null
				});
				setLoading(false);
				return;
			}

			// songs played and hours listened
			const songsPlayed = history.length;
			let totalSeconds = 0;
			for (const e of history) {
				totalSeconds += e.duration;
			}
			const hoursListened = totalSeconds / SECONDS_PER_HOUR;

			// most played song
			const songCounts: Record<string, { title: string; artist: string; count: number }> = {};
			for (const e of history) {
				if (!songCounts[e.songId]) {
					songCounts[e.songId] = { title: e.title, artist: e.artist, count: 0 };
				}
				songCounts[e.songId].count++;
			}
			let mostPlayedSong = null;
			for (const song of Object.values(songCounts)) {
				if (!mostPlayedSong || song.count > mostPlayedSong.count) {
					mostPlayedSong = song;
				}
			}

			// top artist
			const artistPlays: Record<string, number> = {};
			const artistSongs: Record<string, string[]> = {};
			for (const e of history) {
				if (!artistPlays[e.artist]) {
					artistPlays[e.artist] = 0;
					artistSongs[e.artist] = [];
				}
				artistPlays[e.artist]++;
				if (!artistSongs[e.artist].includes(e.songId)) {
					artistSongs[e.artist].push(e.songId);
				}
			}
			let topArtist = null;
			for (const name of Object.keys(artistPlays)) {
				if (!topArtist || artistPlays[name] > topArtist.plays) {
					topArtist = { name, plays: artistPlays[name], songCount: artistSongs[name].length };
				}
			}

			// most active day
			const dayCounts = [0, 0, 0, 0, 0, 0, 0];
			const uniqueDaysPerWeekday: string[][] = [[], [], [], [], [], [], []];
			for (const e of history) {
				const date = new Date(e.playedAt);
				const dayIndex = date.getDay();
				const dateString = date.toDateString();
				dayCounts[dayIndex]++;
				if (!uniqueDaysPerWeekday[dayIndex].includes(dateString)) {
					uniqueDaysPerWeekday[dayIndex].push(dateString);
				}
			}
			let topDayIndex = 0;
			for (let i = 1; i < 7; i++) {
				if (dayCounts[i] > dayCounts[topDayIndex]) topDayIndex = i;
			}
			const uniqueDayCount = uniqueDaysPerWeekday[topDayIndex].length;
			const avgSongs = uniqueDayCount > 0 ? Math.round(dayCounts[topDayIndex] / uniqueDayCount) : 0;
			const mostActiveDay = { day: DAYS[topDayIndex], avgSongs };

			// longest streak using all history
			const uniqueDates = [...new Set(allHistory.map((e) => new Date(e.playedAt).toDateString()))];
			uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

			let longestStreak = null;
			if (uniqueDates.length > 0) {
				let bestStreak = 1;
				let bestStart = uniqueDates[0];
				let bestEnd = uniqueDates[0];
				let currentStreak = 1;
				let currentStart = uniqueDates[0];

				for (let i = 1; i < uniqueDates.length; i++) {
					const prev = new Date(uniqueDates[i - 1]).getTime();
					const curr = new Date(uniqueDates[i]).getTime();
					const diffDays = (curr - prev) / MS_PER_DAY;

					if (diffDays === 1) {
						currentStreak++;
						if (currentStreak > bestStreak) {
							bestStreak = currentStreak;
							bestStart = currentStart;
							bestEnd = uniqueDates[i];
						}
					} else {
						currentStreak = 1;
						currentStart = uniqueDates[i];
					}
				}

				const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

				longestStreak = { days: bestStreak, start: formatDate(bestStart), end: formatDate(bestEnd) };
			}

			// last played
			let lastPlayed = null;
			if (history.length > 0) {
				const last = history[history.length - 1];
				const diffMs = Date.now() - last.playedAt;
				const diffMins = Math.floor(diffMs / (MINS_PER_HOUR * 1000));
				let timeAgo = '';
				if (diffMins < MINS_PER_HOUR) {
					timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
				} else if (diffMins < MINS_PER_DAY) {
					const hrs = Math.floor(diffMins / MINS_PER_HOUR);
					timeAgo = `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
				} else {
					const days = Math.floor(diffMins / MINS_PER_DAY);
					timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
				}
				lastPlayed = { title: last.title, artist: last.artist, timeAgo };
			}

			setStats({ songsPlayed, hoursListened, mostPlayedSong, topArtist, mostActiveDay, longestStreak, lastPlayed });
			setLoading(false);
		}
		loadStats();
	}, [filter]);

	return { stats, loading };
}
