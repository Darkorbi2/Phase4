import StatRow from '@/components/StatRow';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { TimeFilter } from '@/hooks/usePlayStats';
import { usePlayStats } from '@/hooks/usePlayStats';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TIME_FILTERS: TimeFilter[] = ['Week', 'Month', 'Year', 'All Time'];

export default function You() {
	const scheme = useColorScheme() ?? 'dark';
	const c = Colors[scheme];
	const [activeFilter, setActiveFilter] = useState<TimeFilter>('Month');
	const { stats } = usePlayStats(activeFilter);
	const [songCount, setSongCount] = useState<number | null>(null);

	useEffect(() => {
		async function loadSongCount() {
			const { status } = await MediaLibrary.getPermissionsAsync();
			if (status !== 'granted') return;

			const result = await MediaLibrary.getAssetsAsync({ mediaType: ['audio'], first: 1 });
			setSongCount(result.totalCount);
		}
		loadSongCount();
	}, []);

	return (
		<LinearGradient colors={['#0A1923', 'rgba(0,0,0,0.53)']} locations={[0.54, 0.87]} style={[styles.screen, { backgroundColor: c.background }]}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={[styles.pageTitle, { color: c.text }]}>YOU</Text>
						<Text style={[styles.pageSub, { color: c.muted }]}>
							{songCount !== null ? `${songCount.toLocaleString()} songs in your library` : 'Loading library...'}
						</Text>
					</View>
					<View style={[styles.avatar, { backgroundColor: c.card }]}>
						<Ionicons name='person' size={28} color={c.accent} />
					</View>
				</View>

				{/* Listening Overview */}
				<View style={[styles.card, { backgroundColor: c.card }]}>
					<Text style={[styles.sectionLabel, { color: c.muted }]}>LISTENING OVERVIEW</Text>

					<View style={[styles.filterRow, { backgroundColor: c.filterBg }]}>
						{TIME_FILTERS.map((f) => (
							<TouchableOpacity
								key={f}
								onPress={() => setActiveFilter(f)}
								style={[styles.filterTab, activeFilter === f && { backgroundColor: c.accent }]}
								activeOpacity={0.7}
							>
								<Text style={[styles.filterText, { color: activeFilter === f ? '#fff' : c.muted }]}>{f}</Text>
							</TouchableOpacity>
						))}
					</View>

					<View style={styles.overviewRow}>
						<View style={styles.overviewItem}>
							<Text style={[styles.overviewNumber, { color: c.text }]}>{stats.songsPlayed.toLocaleString()}</Text>
							<Text style={[styles.overviewLabel, { color: c.muted }]}>songs played</Text>
						</View>
						<View style={[styles.overviewDivider, { backgroundColor: c.divider }]} />
						<View style={styles.overviewItem}>
							<Text style={[styles.overviewNumber, { color: c.text }]}>{stats.hoursListened.toFixed(1)}h</Text>
							<Text style={[styles.overviewLabel, { color: c.muted }]}>listening time</Text>
						</View>
					</View>
				</View>

				{/* Top Picks */}
				<Text style={[styles.sectionTitle, { color: c.text }]}>Top Picks</Text>
				<View style={styles.topPicksRow}>
					<View style={[styles.topPickCard, { backgroundColor: c.card }]}>
						<View style={[styles.topPickArt, { backgroundColor: c.artBg }]}>
							<Ionicons name='musical-note' size={24} color={c.accent} />
						</View>
						<Text style={[styles.topPickType, { color: c.muted }]}>MOST PLAYED SONG</Text>
						<Text style={[styles.topPickTitle, { color: c.text }]} numberOfLines={2}>
							{stats.mostPlayedSong?.title ?? '-'}
						</Text>
						<Text style={[styles.topPickSub, { color: c.muted }]}>{stats.mostPlayedSong?.artist ?? 'No plays yet'}</Text>
						<View style={styles.topPickCountRow}>
							<Ionicons name='play-circle' size={13} color={c.accent} />
							<Text style={[styles.topPickCount, { color: c.accent }]}>{stats.mostPlayedSong ? ` ${stats.mostPlayedSong.count} plays` : ''}</Text>
						</View>
					</View>

					<View style={[styles.topPickCard, { backgroundColor: c.card }]}>
						<View style={[styles.topPickArt, { backgroundColor: c.artBg }]}>
							<Ionicons name='mic' size={24} color={c.accent2} />
						</View>
						<Text style={[styles.topPickType, { color: c.muted }]}>TOP ARTIST</Text>
						<Text style={[styles.topPickTitle, { color: c.text }]} numberOfLines={2}>
							{stats.topArtist?.name ?? '-'}
						</Text>
						<Text style={[styles.topPickSub, { color: c.muted }]}>{stats.topArtist ? `${stats.topArtist.plays} plays total` : 'No plays yet'}</Text>
						<View style={styles.topPickCountRow}>
							<Ionicons name='musical-notes' size={13} color={c.accent2} />
							<Text style={[styles.topPickCount, { color: c.accent2 }]}>{stats.topArtist ? ` ${stats.topArtist.songCount} songs` : ''}</Text>
						</View>
					</View>
				</View>

				{/* Activity Stats */}
				<Text style={[styles.sectionTitle, { color: c.text }]}>Activity</Text>
				<View style={[styles.card, { backgroundColor: c.card }]}>
					<StatRow
						icon='repeat'
						iconColor={c.accent}
						label='Most Replayed'
						value={stats.mostPlayedSong?.title ?? '-'}
						sub={stats.mostPlayedSong ? `replayed ${stats.mostPlayedSong.count} times` : 'No plays yet'}
						c={c}
					/>
					<View style={[styles.statDivider, { backgroundColor: c.divider }]} />
					<StatRow
						icon='calendar'
						iconColor={c.accent2}
						label='Most Active Day'
						value={stats.mostActiveDay?.day ?? '-'}
						sub={stats.mostActiveDay ? `avg ${stats.mostActiveDay.avgSongs} songs on ${stats.mostActiveDay.day}` : 'No plays yet'}
						c={c}
					/>
					<View style={[styles.statDivider, { backgroundColor: c.divider }]} />
					<StatRow
						icon='flame'
						iconColor='#FF6B6B'
						label='Longest Streak'
						value={stats.longestStreak ? `${stats.longestStreak.days} days` : '-'}
						sub={stats.longestStreak ? `${stats.longestStreak.start} - ${stats.longestStreak.end}` : 'No plays yet'}
						c={c}
					/>
					<View style={[styles.statDivider, { backgroundColor: c.divider }]} />
					<StatRow
						icon='time'
						iconColor={c.muted}
						label='Last Played'
						value={stats.lastPlayed?.title ?? '-'}
						sub={stats.lastPlayed ? `${stats.lastPlayed.timeAgo} · ${stats.lastPlayed.artist}` : 'Nothing played yet'}
						c={c}
					/>
				</View>

				<View style={styles.bottomPad} />
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 60
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24
	},
	pageTitle: {
		fontSize: 28,
		fontWeight: '700',
		letterSpacing: 2
	},
	pageSub: {
		fontSize: 13,
		marginTop: 2
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center'
	},
	card: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
		borderWidth: 0.75,
		borderColor: '#535151'
	},
	sectionLabel: {
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 1.2,
		marginBottom: 12
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12
	},
	filterRow: {
		flexDirection: 'row',
		borderRadius: 10,
		padding: 3,
		marginBottom: 20
	},
	filterTab: {
		flex: 1,
		paddingVertical: 7,
		borderRadius: 8,
		alignItems: 'center'
	},
	filterText: {
		fontSize: 12,
		fontWeight: '700'
	},
	overviewRow: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	overviewItem: {
		flex: 1,
		alignItems: 'center'
	},
	overviewNumber: {
		fontSize: 32,
		fontWeight: '700'
	},
	overviewLabel: {
		fontSize: 13,
		marginTop: 2
	},
	overviewDivider: {
		width: 1,
		height: 40,
		marginHorizontal: 8
	},
	topPicksRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 24
	},
	topPickCard: {
		flex: 1,
		borderRadius: 16,
		padding: 14,
		borderWidth: 0.75,
		borderColor: '#535151'
	},
	topPickArt: {
		width: 48,
		height: 48,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10
	},
	topPickType: {
		fontSize: 10,
		fontWeight: '600',
		letterSpacing: 0.8,
		marginBottom: 4
	},
	topPickTitle: {
		fontSize: 15,
		fontWeight: '700',
		lineHeight: 20
	},
	topPickSub: {
		fontSize: 12,
		marginTop: 2,
		marginBottom: 8
	},
	topPickCountRow: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	topPickCount: {
		fontSize: 12,
		fontWeight: '600'
	},
	statDivider: {
		height: 1
	},
	bottomPad: {
		height: 20
	}
});
