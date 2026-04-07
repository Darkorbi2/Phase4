import { Song, useSongs } from '@/components/useSongs';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const [favoriteSongs, setSongs] = useState<Song[]>([]);

export default function Favorites() {
	const { songs, hasPermission, loading, error, currentSong, requestPermission, loadSongs, addSong, removeSong, playSong, pauseSong } = useSongs();

	return (
		<View>
			<FlatList
				data={songs}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingTop: 20 }}
				renderItem={({ item }) => (
					<Pressable onPress={() => playSong(item)} style={styles.songCard}>
						<Image source={item.artwork ? { uri: item.artwork } : require('@/assets/images/react-logo.png')} style={styles.cover} />

						<View style={{ flex: 1 }}>
							<Text style={styles.songTitle}>{item.title ?? item.filename}</Text>
							<Text style={styles.songInfo}>{(item.artist ?? 'Unknown Artist') + ' ' + item.id}</Text>
						</View>

						<Text style={styles.playText}>{currentSong != null && currentSong.id === item.id ? '▶ Playing' : 'Play'}</Text>
					</Pressable>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff'
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20
	},
	songCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		marginBottom: 10,
		borderRadius: 12,
		backgroundColor: '#f3f3f3'
	},
	cover: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12
	},
	songTitle: {
		fontSize: 16,
		fontWeight: 'bold'
	},
	songInfo: {
		fontSize: 13,
		color: '#666',
		marginTop: 4
	},
	playText: {
		fontSize: 14,
		fontWeight: '600'
	},
	error: {
		marginTop: 10,
		color: 'red'
	}
});
